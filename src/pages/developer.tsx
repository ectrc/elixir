import { showAddFriendModal } from "src/help/modals";
import {
  showAddCustomIdServerModal,
  showDeleteCustomIdServerModal,
  showEditCustomIdServerModal,
} from "src/help/developer";
import { postDeleteAllServers } from "src/api/developer";
import useToaster from "src/state/toaster";

import DefaultButton, { DiscordButton, SnazzyButton } from "src/core/button";
import LoadingIcon from "src/core/loading";

import "src/styles/pages/developer.css";
import { isDev } from "src/api/endpoints";

const DeveloperPage = () => {
  const toaster = useToaster();

  const handleDeleteAllServers = async () => {
    const res = await postDeleteAllServers();
    if (!res.success)
      return toaster.add({
        id: "delete-friend-error-username",
        message: "idk",
        type: "error",
      });

    toaster.add({
      id: "delete-friend-success",
      message: "deleted all servers",
      type: "success",
    });
  };

  return (
    <main>
      <main>
        <div className="ui-row">
          <div className="loading-icon-test">
            <p>
              Current Mode:{" "}
              {isDev ? "dev mode (localhost)" : "prod mode (prod.elxirfn.com)"}
            </p>
          </div>
        </div>

        <div className="ui-row">
          <div className="loading-icon-test">
            <p>loading icon</p>
            <LoadingIcon />
          </div>

          <div className="loading-icon-test">
            <SnazzyButton>snazzy button</SnazzyButton>
            <DefaultButton>default button</DefaultButton>
            <DiscordButton>discord button</DiscordButton>
          </div>
        </div>

        <div className="ui-row">
          <DefaultButton onClick={showAddFriendModal}>
            open friend modal
          </DefaultButton>
        </div>

        <h2>Server Control</h2>

        <div className="ui-row">
          <DefaultButton onClick={showAddCustomIdServerModal}>
            new server
          </DefaultButton>

          <DefaultButton onClick={showEditCustomIdServerModal}>
            set server status
          </DefaultButton>

          <DefaultButton onClick={showDeleteCustomIdServerModal}>
            delete single server
          </DefaultButton>

          <DefaultButton onClick={handleDeleteAllServers}>
            delete all servers
          </DefaultButton>
        </div>
      </main>
    </main>
  );
};

export default DeveloperPage;
