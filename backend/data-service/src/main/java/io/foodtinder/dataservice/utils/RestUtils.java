
package io.foodtinder.dataservice.utils;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import io.foodtinder.dataservice.constants.Category;
import io.foodtinder.dataservice.constants.MealArea;
import io.foodtinder.dataservice.model.GeoLocation;
import io.foodtinder.dataservice.model.Meal;
import io.foodtinder.dataservice.model.requests.MealWrapper;
import io.foodtinder.dataservice.model.requests.google.GoogleMapsResponseWrapper;
import io.foodtinder.dataservice.repositories.MealRepository;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

@Slf4j
@Service
public class RestUtils {

    private WebClient mealServiceWebClient;

    private WebClient mapsServiceWebClient;

    @Autowired
    private MealRepository mealrepository;

    @PostConstruct
    public void init() {
        log.info("Setting up the meal Db service webclient instance");
        mealServiceWebClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create().followRedirect(true)))
                .baseUrl("www.themealdb.com").filter(logRequest()) // here is the
                                                                   // magic
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT,
                        "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Safari/537.36")
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)).build())
                .build();

        if (mealrepository.findAll().size() <= 0) {
            log.info("No meals in DB yet, initializing repository...");
            fetchAllMealsForAllCategories();
            fetchAllMealsForAllAreas();
        }
        mapsServiceWebClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create().followRedirect(true)))
                .baseUrl("https://maps.googleapis.com").filter(logRequest()) // here is
                                                                             // the
                // magic
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.USER_AGENT,
                        "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Safari/537.36")
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)).build())
                .build();
    }

    /**
     * Fetch random meal from mealDB API By: Domenico Ferrari, Minh Vu Nguyen
     */
    public void fetchRandomMealBody() {
        log.info("start call themealdb.com to fetch a random meal");
        MealWrapper response = mealServiceWebClient.get().uri("/api/json/v1/1/random.php")
                .accept(MediaType.APPLICATION_JSON).retrieve().bodyToMono(MealWrapper.class).block();

        log.info("{}", response);
    }

    /**
     * Fetch meals from MealDB by ingredient
     * 
     * @param ingredient - a string representing the main ingredient
     * @return a MealWrapper containing said meals By: Domenico Ferrari, Minh Vu
     *         Nguyen
     * 
     */
    public MealWrapper fetchMealsByIngredient(String ingredient) {
        log.info("start call themealdb.com to fetch meals by ingredient: {}", ingredient);
        return mealServiceWebClient.get().uri("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + ingredient)
                .accept(MediaType.APPLICATION_JSON).retrieve().bodyToMono(MealWrapper.class).block();
    }

    /**
     * API to fetch all meals for all categories and save them to the repository
     */
    public void fetchAllMealsForAllCategories() {
        log.info("Start fetching all meals for all categories");

        List<Meal> allFetchedMeals = new ArrayList<>();
        for (Category category : Category.values()) {
            log.info("Fetching all meals for category: {}", category);
            MealWrapper mealsForCategory = mealServiceWebClient.get()
                    .uri("https://www.themealdb.com/api/json/v1/1/filter.php?c=" + category)
                    .accept(MediaType.APPLICATION_JSON).retrieve().bodyToMono(MealWrapper.class).block();
            log.info("Result for {}: {}", category, mealsForCategory);
            log.info("About to save meals to repository");

            for (Meal meal : mealsForCategory.getMeals()) {

                meal.setStrCategory(category);
                allFetchedMeals.add(meal);
            }
            log.info("Finished saving all meals");
        }

        mealrepository.saveAll(allFetchedMeals);
        log.info("Finished saving all meals");
    }

    public void fetchAllMealsForAllAreas() {
        log.info("Start fetching all meals for all categories");

        List<Meal> allFetchedMeals = new ArrayList<>();
        for (MealArea area : MealArea.values()) {
            log.info("Fetching all meals for area: {}", area);
            MealWrapper mealsForArea = mealServiceWebClient.get()
                    .uri("https://www.themealdb.com/api/json/v1/1/filter.php?a=" + area)
                    .accept(MediaType.APPLICATION_JSON).retrieve().bodyToMono(MealWrapper.class).block();
            log.info("Result for {}: {}", area, mealsForArea);
            log.info("About to save meals to repository");

            for (Meal meal : mealsForArea.getMeals()) {

                meal.setStrArea(area);
                allFetchedMeals.add(meal);
            }
        }
        mealrepository.saveAll(allFetchedMeals);
        log.info("Finished saving all meals");

    }

    public GoogleMapsResponseWrapper findRestaurants(GeoLocation location, String userLang, String keyword) {
        log.info("Start fetching all restaurants for keywords");

        return mapsServiceWebClient.get()
                .uri(uriBuilder -> uriBuilder.path("/maps/api/place/nearbysearch/json")
                        .queryParam("location", location.getLatitude() + "," + location.getLongitude())
                        .queryParam("radius", 1500)
                        .queryParam("language", userLang)
                        .queryParam("keyword", keyword)
                        .queryParam("type", "restaurant")
                        .queryParam("key", "AIzaSyAJt9waW0hVfZ5bSufYZEGGPNYn6zAviq8")
                        .build())
                .retrieve()
                .onStatus(status -> status.value() == HttpStatus.NOT_FOUND.value(),
                        response -> Mono.empty())
                .bodyToMono(GoogleMapsResponseWrapper.class).block();
    }

    // This method returns filter function which will log request data
    private static ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            log.info("Request: {} {}", clientRequest.method(), clientRequest.url());
            clientRequest.headers().forEach((name, values) -> values.forEach(value -> log.info("{}={}", name, value)));
            return Mono.just(clientRequest);
        });
    }

}