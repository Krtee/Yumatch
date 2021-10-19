import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Switch } from "react-router-dom";

const App = () => {
  //const { initialized, keycloak } = useKeycloak();
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          {/**initialized && keycloak && keycloak.authenticated ? (
            <h2>{t("test")}</h2>
          ) : (
            () => keycloak.login()
          )*/}
          <h2>{t("test")}</h2>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

export default App;
