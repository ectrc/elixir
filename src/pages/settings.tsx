import { open } from "@tauri-apps/api/dialog";
import useAuth from "src/state/auth";
import useBuilds from "src/state/builds";

import DefaultButton from "src/core/button";

import { HiFolderOpen, HiUser } from "react-icons/hi";
import "src/styles/pages/settings.css";

const SettingsPage = () => {
  const auth = useAuth();
  const builds = useBuilds();

  const handleChangePath = async () => {
    const selectedPath = await open({ directory: true, multiple: false });
    if (!selectedPath) return;

    builds.setDownloadPath(selectedPath.toString());
  };

  return (
    <div className="settings">
      <div className="info">
        <div className="avatar">
          <HiUser />
        </div>
        <div className="data">
          <div className="name">
            <h2>{auth.user.DisplayName}</h2>
            {/* <span className="colour">TIER 2 DONATOR</span> */}
          </div>
          <p className="smol">{auth.user.AccountID}</p>
        </div>
        <DefaultButton
          style={{
            marginLeft: "auto",
          }}
          onClick={() => auth.logout()}
        >
          Log Out
        </DefaultButton>
      </div>
      <div className="info">
        <div className="avatar">
          <HiFolderOpen />
        </div>
        <div className="data">
          <h2>Download Path</h2>
          <p className="smol">
            {builds.downloadPath
              ? builds.downloadPath
              : "No default download path chosen!"}
          </p>
        </div>
        <DefaultButton
          style={{
            marginLeft: "auto",
          }}
          onClick={handleChangePath}
        >
          Change
        </DefaultButton>
      </div>
    </div>
  );
};

export default SettingsPage;
