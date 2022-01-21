import Layout from "../components/LayoutComponent/Layout";
import List from "../components/List/List";
import { ReactComponent as ArrowIcon } from "../assets/icons/arrow_left.svg";
import { dummyData } from "../components/List/List.types";
import { Page, useNavigation } from "../utils/hooks/useNavigation";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

const FollowersPage: React.FC<{}> = () => {
  const { currentLocation, onLocationChange } = useNavigation();
  const history = useHistory();
  const { t } = useTranslation();

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
        title: t("general.pages.profile.followers"),
      }}
    >
      <List
        onDeleteItem={() => {}}
        deleteBtnLabel="Unfollow"
        data={dummyData}
        column="name"
      />
    </Layout>
  );
};

export default FollowersPage;
