import { useEffect } from "react";

import { app } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { isDev } from "src/api/endpoints";
import { listen } from "@tauri-apps/api/event";

import awaitUseState from "src/help/react";
import useAuth from "src/state/auth";
import useLoading, { download } from "src/state/loading";

import Menu from "src/frame/menu";
import FriendsMenu from "src/frame/friends";
import LoginPage from "src/pages/login";
import Route from "src/core/route";
import Modals from "src/core/modals";

import { BsFillDropletFill } from "react-icons/bs";
import { HiX, HiMinus } from "react-icons/hi";
import "src/styles/frame.css";

const Frame = (props: { children: React.ReactNode }) => {
  const auth = useAuth();
  const loading = useLoading();
  const version = awaitUseState(app.getVersion());

  useEffect(() => {
    listen("DOWNLOAD_PROGRESS_PAK", (e) => {
      let data = e.payload as download | null;
      if (data === null) {
        return;
      }
      loading.setPakProgress(data);
    });

    listen("DOWNLOAD_FINISHED_PAK", (_) => {
      loading.setPakProgress({
        download_id: 0,
        filesize: 0,
        transfered: 0,
        transfer_rate: 0,
        percentage: 0,
        comment: "",
      });
    });

    listen("DOWNLOAD_PROGRESS", (e) => {
      let data = e.payload as download | null;
      if (data === null) {
        return;
      }
      loading.setBuildDownloadProgress(data);
    });

    listen("DOWNLOAD_FINISHED", (_) => {
      loading.setBuildDownloadProgress({
        download_id: 0,
        filesize: 0,
        transfered: 0,
        transfer_rate: 0,
        percentage: 0,
        comment: "",
      });
    });
  }, []);

  return (
    <div className="tauri-frame">
      <div data-tauri-drag-region className="dragbar">
        <div data-tauri-drag-region className="icon">
          <BsFillDropletFill data-tauri-drag-region />
        </div>
        <div className="spacer"></div>
        <button onClick={() => appWindow.minimize()}>
          <HiMinus />
        </button>
        <button onClick={() => appWindow.close()}>
          <HiX />
        </button>
      </div>
      <Modals />
      {auth.token != "" && (
        <div className="main-frame">
          <Menu />
          <div className="content">
            <div className="inner">{props.children}</div>
            <FriendsMenu />
          </div>
        </div>
      )}
      <Route path="/login" children={<LoginPage />} />

      <div className="credits">
        {isDev ? "dev" : "prod"} release {version}
      </div>
    </div>
  );
};

export default Frame;
