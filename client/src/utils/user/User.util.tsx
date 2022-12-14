import { AxiosInstance } from "axios";
import { ResponseTypes } from "../AxiosUtil";
import { Buddy, BuddyType, User, UserRole } from "./User.types";

/**
 * Helper function to create an empty user for modification
 * @returns an instance of user {@link User}
 * @author Domenico Ferrari
 */
export const createEmptyUser = (): User => {
  return {
    photo: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    lat: "",
    long: "",
    role: UserRole.USER,
    posts: [],
    diets: [],
    intolerances: [],
    types: [],
    cuisines: [],
    favoriteRestaurants: [],
    visitedRestaurants: [],
    subscribedRestaurants: [],
    buddies: [],
  };
};

/**
 * API method to create a new user {@link User}
 * @param axios
 * @returns boolean for either successful creation or failed one
 * @author Domenico Ferrari
 */
export const createNewUser = async (
  axios: AxiosInstance,
  newUser: User
): Promise<ResponseTypes> => {
  return axios
    .post("/user/", newUser)
    .then((response) => response.data)
    .catch(() => {
      console.error("Error while creating a new user!");
    });
};

/**
 * API method to load an {@link User} by its id
 *
 * @param userId The id of the {@link User} to fetch
 * @param axios The axios instance
 * @returns Either the loaded user or undefined in case of an error
 * @author Fadel Kaadan
 */
export const loadSingleUser = async (
  userId: string,
  axios: AxiosInstance
): Promise<User> => {
  return axios
    .get("/user/id/", { params: { userId: userId } })
    .then((resp) => resp.data)
    .catch((exc) => console.error("Error during user load!", exc));
};

/**
 * API method to load a list of {@link User} by its id
 *
 * @param userId The id of the current{@link User}
 * @param axios The axios instance
 * @returns Either a list of friends or or an empty array
 * @author Minh
 */
export const loadFriends = async (
  axios: AxiosInstance,
  userId: string
): Promise<User[]> => {
  return axios
    .get("/user/friends", { params: { userId: userId } })
    .then((resp) => resp.data)
    .catch((exc) => {
      console.error("Error during user load!", exc);
      return [];
    });
};

/**
 * API method to load a list of {@link User}
 *
 * @param matchId The id of the match
 * @param axios The axios instance
 * @returns Either a list of friends or or an empty array
 * @author Minh
 */
export const loadUsersForMultiMatchId = async (
  axios: AxiosInstance,
  matchId: string
): Promise<User[]> => {
  return axios
    .get("/user/multimatch", { params: { matchId: matchId } })
    .then((resp) => resp.data)
    .catch((exc) => {
      console.error("Error during user load!", exc);
      return [];
    });
};

/*
 * API method to create a new user {@link User}
 * @param axios
 * @returns boolean for either successful creation or failed one
 * @author Domenico Ferrari
 */
export const updateUser = async (
  axios: AxiosInstance,
  updatedUser: User
): Promise<boolean> =>
  axios
    .post("user/update/", updatedUser)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error while updating user!");
      console.log(error);
    });

/**
 * API method to load all {@link User}
 *
 * @param axios The axios instance
 * @returns Either all users or undefined in case of an error
 * @author Fadel Kaadan
 */
export const fetchAllUsers = async (axios: AxiosInstance): Promise<User[]> => {
  return axios
    .get("/user/all/")
    .then((resp) => resp.data)
    .catch((exc) => console.error("Error fetching all users!", exc));
};

/**
 * API method to a buddy to {@link User}
 *
 * @param axios The axios instance
 * @returns Either the updated user or undefined in case of an error
 * @author Fadel Kaadan
 */
export const addBuddy = async (
  axios: AxiosInstance,
  bodyRequest: { userId: string; buddyId: string }
): Promise<boolean> => {
  return axios
    .post("/user/buddy/", bodyRequest)
    .then((resp) => resp.data)
    .catch((exc) => console.error("Error while adding a buddy!", exc));
};

/**
 * API method to a buddy to {@link User}
 *
 * @param axios The axios instance
 * @returns Either the updated user or undefined in case of an error
 * @author Fadel Kaadan
 */
export const removeBuddy = async (
  axios: AxiosInstance,
  bodyRequest: { userId: string; buddyId: string }
): Promise<boolean> => {
  return axios
    .post("/user/buddy/remove", bodyRequest)
    .then((resp) => {
      console.log(resp);
      return resp.data;
    })
    .catch((exc) => console.error("Error while removing a buddy!", exc));
};
/**
 * API method to accept a buddy to {@link User}
 *
 * @param axios The axios instance
 * @returns Either the updated user or undefined in case of an error
 * @author Minh
 */
export const acceptBuddy = async (
  axios: AxiosInstance,
  userId: string,
  buddyId: string
): Promise<boolean> => {
  return axios
    .post("/user/buddy/accept", {
      userId: userId,
      buddyId: buddyId,
    })
    .then((resp) => resp.data)
    .catch((exc) => console.error("Error while removing a buddy!", exc));
};
/**
 * Helper method to get friend request status
 *
 * @param user current user {@link User}
 * @param buddyId buddy id
 * @returns friend request status
 * @author Fadel Kaadan
 */
export const getFriendRequestStatus = (
  user: User,
  buddyId: string
): BuddyType | undefined => {
  const buddy: Buddy | undefined = user.buddies.find(
    (buddy) => buddy.buddyId === buddyId
  );

  return buddy ? BuddyType[buddy.buddyType] : undefined;
};
