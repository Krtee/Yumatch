import { RecoilState, atom } from "recoil";
import {
  User,
  UserRole,
  INTOLERANCES,
  DIETS,
  TYPES,
  CUISINES,
} from "./User.types";

export const userState: RecoilState<User> = atom<User>({
  key: "currentUser",
  default: {
    id: "",
    photo: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    role: UserRole.USER,
    token: "",
    city: "",
    lat: "",
    long: "",
    bio: "",
    posts: [],
    diets: [] as DIETS[],
    intolerances: [] as INTOLERANCES[],
    types: [] as TYPES[],
    cuisines: [] as CUISINES[],
    favoriteRestaurants: [],
    visitedRestaurants: [],
    subscribedRestaurants: [],
    buddies: [],
  },
});
