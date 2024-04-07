import { useEffect } from "react";
import useAuth from "src/state/auth";

import {
  NoRoute,
  ProtectedRoute,
  ProtectedRouteUserLevel,
} from "src/core/route";
import Frame from "src/frame/frame";
import Donate from "src/core/donate";
import Toaster from "src/frame/toaster";

import HomePage from "src/pages/home";
import LibraryPage from "src/pages/library";
import HealthPage from "src/pages/health";
import SettingsPage from "src/pages/settings";
import DownloadPage from "./pages/download";
import DeveloperPage from "./pages/developer";
import StoreFront from "./pages/storefront";

import "src/styles/core.css";
import { getBuilds } from "./api/builds";

const App = () => {
  const auth = useAuth();
  auth.init();

  const handleHashChange = () => {
    const code = window.location.hash.slice(1);
    auth.login(code);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("contextmenu", handleContextMenu);
    getBuilds();
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <Frame>
      <Toaster />
      <Donate />
      <ProtectedRoute path="/" children={<HomePage />} />
      <ProtectedRoute path="/library" children={<LibraryPage />} />
      <ProtectedRoute path="/storefront" children={<StoreFront />} />
      <ProtectedRoute path="/status" children={<HealthPage />} />
      <ProtectedRoute path="/settings" children={<SettingsPage />} />
      <ProtectedRoute path="/download" children={<DownloadPage />} />
      <ProtectedRouteUserLevel
        level={20}
        path="/developer"
        children={<DeveloperPage />}
      />
      <NoRoute />
    </Frame>
  );
};

export default App;
