import { useKeycloak } from "@react-keycloak/web";
import {
  createRef,
  FC,
  RefObject,
  Suspense,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import TinderCard from "react-tinder-card";
import { useRecoilState, useRecoilValue } from "recoil";
import { ReactComponent as ArrowIcon } from "../assets/icons/arrow_left.svg";
import { ReactComponent as DislikeIcon } from "../assets/icons/dislike.svg";
import { ReactComponent as EatableHart } from "../assets/icons/eatableHeart.svg";
import { ReactComponent as GroupAddIcon } from "../assets/icons/groupadd.svg";
import { ReactComponent as LikeIcon } from "../assets/icons/like.svg";
import { ReactComponent as ResetIcon } from "../assets/icons/reset.svg";
import { ReactComponent as SettingIcon } from "../assets/icons/settings.svg";
import { ReactComponent as WaitIcon } from "../assets/icons/wait.svg";
import ButtonComponent from "../components/ButtonComponent/ButtonComponent";
import Layout from "../components/LayoutComponent/Layout";
import ModalComponent from "../components/ModalComponent/ModalComponent";
import "../styles/MatchingPage.styles.scss";
import { useAxios } from "../utils/AxiosUtil";
import useGeoLocation from "../utils/hooks/useGeoLocation";
import { Page, useNavigation } from "../utils/hooks/useNavigation";
import { currentMatchState } from "../utils/match/Match.state";
import { Match } from "../utils/match/Match.types";
import {
  createEmptyMatch,
  matchRestaurants,
  postNewMatch,
  updateMatch,
} from "../utils/match/Match.Utils";
import { randomMealsState } from "../utils/meal/Meal.state";
import { Meal } from "../utils/meal/Meal.types";
import { fetchRandomMeals } from "../utils/meal/Meal.utils";
import {
  currentMultiMatchState,
  getUserForMultiMatch,
} from "../utils/multimatch/MultiMatch.state";
import { MultiUserMatch } from "../utils/multimatch/MultiMatch.types";
import { userState } from "../utils/user/User.state";
import { User } from "../utils/user/User.types";

interface MatchingPageProps {}

enum MatchType {
  SINGLE_MATCH,
  MULTI_MATCH,
}

const MatchingPage: FC<MatchingPageProps> = () => {
  const navProps = useNavigation(Page.MATCHING);
  const [currentMatch, setCurrentMatch] =
    useRecoilState<Match>(currentMatchState);
  const currentMultiMatch = useRecoilValue<MultiUserMatch | null>(
    currentMultiMatchState
  );
  const { t } = useTranslation();
  const user = useRecoilValue(userState);
  const [mealsToSwipe, setMealsToSwipe] =
    useRecoilState<Meal[]>(randomMealsState);
  const [currentIndex, setCurrentIndex] = useState(mealsToSwipe.length - 1);
  const currentIndexRef = useRef(currentIndex);
  const canGoBack = currentIndex < mealsToSwipe.length - 1;
  const canSwipe = currentIndex >= 0;
  const [disableGoBack, setdisableGoBack] = useState(false);
  const history = useHistory();
  const [showLoadingMatchModal, setShowLoadingMatchModal] =
    useState<MatchType>();
  const location = useGeoLocation();
  const { axios } = useAxios();
  const multiUserList = useRecoilValue<User[]>(getUserForMultiMatch);
  const { keycloak } = useKeycloak();
  const [showPopUp, setShowPopUp] = useState(false);
  const childRefs: RefObject<any>[] = useMemo(
    () =>
      Array(mealsToSwipe.length)
        .fill(0)
        .map(() => createRef()),
    [mealsToSwipe.length]
  );
  /**
   * updates current index, and ref for index
   * @param val index
   * @author Minh
   */
  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  // set last direction and decrease current index
  const swiped = (direction: "left" | "right", meal: Meal, index: number) => {
    switch (direction) {
      case "left":
        setCurrentMatch((lastMatchState) => ({
          ...lastMatchState,
          unMatchedMeals: [...lastMatchState.unMatchedMeals, meal],
        }));
        break;
      case "right":
        setCurrentMatch((lastMatchState) => ({
          ...lastMatchState,
          matchedMeals: [...lastMatchState.matchedMeals, meal],
        }));
        break;
      default:
    }
    setdisableGoBack(false);
    updateCurrentIndex(index - 1);
    if (index === 0) {
      setShowLoadingMatchModal(
        currentMultiMatchState ? MatchType.MULTI_MATCH : MatchType.SINGLE_MATCH
      );

      let updateMatchPromise: Promise<Match>;
      if (user?.id) {
        updateMatchPromise = updateMatch(axios, currentMatch, location);
      } else {
        updateMatchPromise = matchRestaurants(axios, currentMatch, location);
      }
      updateMatchPromise.then((resultMatch) => {
        if (!resultMatch) {
          setShowLoadingMatchModal(undefined);

          return;
        }
        setCurrentMatch(resultMatch);
        setTimeout(() => {
          history.push(`/matching/result/${resultMatch.id}`);
          setShowLoadingMatchModal(undefined);
        }, 1000);
      });
    }
  };

  /**
   * handles meals, that are out of frame
   * @param idx
   * @author Minh
   */
  const outOfFrame = (idx: number) => {
    // handle the case in which go back is pressed before card goes outOfFrame
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
    // TODO: when quickly swipe and restore multiple times the same card,
    // it happens multiple outOfFrame events are queued and the card disappear
    // during latest swipes. Only the last outOfFrame event should be considered valid
  };

  /**
   * handler if programatically swiped
   * @param dir direction to swipe: either left or right
   * @author Minh
   */
  const swipe = async (dir: "left" | "right") => {
    if (canSwipe && currentIndex < mealsToSwipe.length) {
      await childRefs[currentIndex].current.swipe(dir); // Swipe the card!
    }
  };

  // increase current index and show card
  const goBack = async () => {
    if (!canGoBack) return;
    const newIndex = currentIndex + 1;
    updateCurrentIndex(newIndex);
    setCurrentMatch({
      ...currentMatch,
      unMatchedMeals: currentMatch.unMatchedMeals.filter(
        (_, index) => index !== newIndex
      ),
      matchedMeals: currentMatch.matchedMeals.filter(
        (_, index) => index !== newIndex
      ),
    });
    setdisableGoBack(true);
    await childRefs[newIndex].current.restoreCard();
  };

  /**
   * resets meals and currentmatch
   * @author Minh
   */
  const handleRematch = (): void => {
    if (axios && user?.id) {
      fetchRandomMeals(
        axios,
        parseInt(process.env.REACT_APP_DEFAULT_MEAL_COUNT || "15")
      ).then(setMealsToSwipe);
      postNewMatch(axios, createEmptyMatch(user?.id)).then((res) => {
        if (res) {
          updateCurrentIndex(mealsToSwipe.length - 1);
          setCurrentMatch(res);
        }
      });
    }
  };

  return (
    <Layout
      {...navProps}
      className="matching-page"
      header={{
        leftIconButton: {
          value: <ArrowIcon />,
          onClick: () => {
            /**TODO where to go ? */
          },
        },
        title: t("general.pages.matching"),
      }}
    >
      <Suspense
        fallback={
          <div>{/** TODO implement loading component */}Loading...</div>
        }
      >
        {currentMultiMatch &&
        showLoadingMatchModal === MatchType.MULTI_MATCH ? (
          <div className={"multi-user-match-wait-screen"}>
            <p className={"multi-user-match-wait-screen__top-big"}>
              {t("match.multi-user.wait.top-text")}
            </p>
            <WaitIcon />
            <p className={"multi-user-match-wait-screen__top-big"}>
              {t("match.multi-user.wait.center-text")}
            </p>
            {multiUserList.map((friend) => (
              <p key={friend.username}>{friend.username}</p>
            ))}
            <ButtonComponent
              value={t("match.buttons.rematch")}
              onClick={() => handleRematch()}
            />
          </div>
        ) : (
          <div className="matching-page__content-wrapper">
            <div className="swipeable-card-container">
              {mealsToSwipe.map((meal, index) => (
                <TinderCard
                  ref={childRefs[index]}
                  key={meal.idMeal}
                  onSwipe={(dir) =>
                    swiped(dir as "left" | "right", meal, index)
                  }
                  preventSwipe={["up", "down"]}
                  onCardLeftScreen={() => outOfFrame(index)}
                  className="container"
                >
                  <img src={meal.strMealThumb} alt={meal.strMeal} />
                  <div className="progressBar">
                    <div
                      className="progressBarStyle"
                      style={{
                        width:
                          (((15 - currentIndex) / 15) * 100).toFixed(0) + "%",
                      }}
                    >
                      <span className="progressBarText">
                        {(((15 - currentIndex) / 15) * 100).toFixed(0) + "%"}
                      </span>
                    </div>
                  </div>
                </TinderCard>
              ))}
            </div>

            <div className="matching-buttons">
              <span className="button-small">
                <SettingIcon className="button-small-style" />
              </span>
              <span onClick={() => swipe("left")} className="button-big">
                <DislikeIcon className="button-center" />
              </span>
              <span
                onClick={() => !disableGoBack && goBack()}
                className="button-small"
              >
                <ResetIcon className="button-small-style" />
              </span>
              <span onClick={() => swipe("right")} className="button-big">
                <LikeIcon className="button-center" />
              </span>
              <span className="button-small">
                <GroupAddIcon
                  className="button-small-style"
                  onClick={() =>
                    currentMultiMatch
                      ? history.push("/matching/addfriends")
                      : keycloak.login()
                  }
                />
                {multiUserList.length > 0 && (
                  <span className="friend-badge">{multiUserList.length}</span>
                )}
              </span>
            </div>
            {showLoadingMatchModal === MatchType.SINGLE_MATCH && (
              <ModalComponent className="matching-loading">
                {/** TODO implement image and translations */}
                <p>{t("match.loading.top")}</p>
                <p>{t("match.loading.center")}</p>
                <EatableHart />
                <p>{t("match.loading.bottom")}</p>
              </ModalComponent>
            )}
            {showPopUp && <ModalComponent></ModalComponent>}
          </div>
        )}
      </Suspense>
    </Layout>
  );
};

export default MatchingPage;
