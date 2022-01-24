import { ChangeEvent, FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "../components/LayoutComponent/Layout";
import { Page, useNavigation } from "../utils/hooks/useNavigation";
import "../styles/SearchPage.styles.scss";
import { ReactComponent as ArrowIcon } from "../assets/icons/arrow_left.svg";
import { useHistory } from "react-router";
import { useAxios } from "../utils/AxiosUtil";
import {
  addBuddy,
  fetchAllUsers,
  getFriendRequestStatus,
} from "../utils/user/User.util";
import { BUDDY_REQUEST, User } from "../utils/user/User.types";
import { useRecoilValue } from "recoil";
import { userState } from "../utils/user/User.state";
import { Link } from "react-router-dom";

const SearchPage: FC<{}> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { axios } = useAxios();
  const user = useRecoilValue(userState);
  const { currentLocation, onLocationChange } = useNavigation();
  const [searchValue, setSearchValue] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (axios) {
        const allUsers = await fetchAllUsers(axios);
        if (allUsers) {
          setUsers(allUsers);
        }
      }
    };
    fetchUsers();
  }, [axios]);

  const handleAddBuddy = async (buddyId: string) => {
    await addBuddy(axios, { userId: user.id, buddyId });
  };

  const renderButton = (userId: string) => {
    const status: BUDDY_REQUEST = getFriendRequestStatus(user, userId);
    if (status === BUDDY_REQUEST.PENDING) {
      return (
        <button className="button-inactive">
          {t("general.pages.search.added")}
        </button>
      );
    }

    return (
      <button className="button-active" onClick={() => handleAddBuddy(userId)}>
        {t("general.pages.search.add")}
      </button>
    );
  };

  return (
    <Layout
      navigationElements={Object.entries(Page).map((page) => ({
        title: page[1],
      }))}
      changeLocation={onLocationChange}
      currentLocation={currentLocation}
      header={{
        leftIconButton: {
          value: <ArrowIcon />,
          onClick: () => {
            history.goBack();
          },
        },
        title: t("general.pages.profile.searchFriends"),
      }}
    >
      <div className="search-page">
        <div className="search-page-search">
          <div className="search-page-search-input">
            <span className="search-page-search-input-icon"></span>
            <input
              className="search-page-search-input-element"
              placeholder={t("general.pages.search.findNameOrEmail")}
              value={searchValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchValue(e.target.value)
              }
              autoFocus
            />
          </div>
          <div className="search-page-search-results">
            {searchValue.length > 0 &&
              users
                ?.filter((result) => {
                  return (
                    result.email.toLowerCase().includes(searchValue) ||
                    result.firstName.toLowerCase().includes(searchValue) ||
                    result.lastName.toLowerCase().includes(searchValue)
                  );
                })
                ?.map((result) => (
                  <Link
                    key={result.id}
                    to={`/user/${result.id}`}
                    className="search-page-search-results-item"
                  >
                    <p>{result.email}</p>
                    {renderButton(result.id)}
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
