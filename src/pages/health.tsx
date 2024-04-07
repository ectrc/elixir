import { useEffect } from "react";
import moment from "moment";

import useHealth, { GameServer } from "src/state/health";
import useLoading from "src/state/loading";

import "src/styles/pages/health.css";
import LoadingIcon from "src/core/loading";
import playlist from "src/static/playlist";

const HealthPage = () => {
  const health = useHealth();
  const loading = useLoading();

  useEffect(() => {
    loading.setServersLoading(true);
    health.fetch();
    loading.setServersLoading(false);
  }, []);

  return (
    <div className="health">
      {loading.serversLoading && <LoadingIcon />}

      {Object.values(health.servers).map((server, i) => (
        <Server server={server} key={server.sessionId} index={i} />
      ))}

      {Object.values(health.servers).length === 0 &&
        !loading.serversLoading && (
          <div className="no-info">
            <header>
              <h2>No Servers Found</h2>
              <p>
                We couldn't find any available servers. Keep an eye out as some
                may become available soon!
              </p>
            </header>
          </div>
        )}
    </div>
  );
};

const Server = (props: { server: GameServer; index: number }) => {
  const friendlyPlaylist =
    playlist[props.server.playlist as keyof typeof playlist] !== undefined
      ? playlist[props.server.playlist as keyof typeof playlist]
      : "";

  return (
    <div className="metric">
      <header>
        <h2>
          {props.server.region} {friendlyPlaylist.toUpperCase()} #
          {props.index + 1}
        </h2>
        <div className="tags">
          <span
            className={`tag ${
              props.server.state === "AVAILABLE" ? "colourful" : "smol"
            }`}
          >
            {props.server.state === "AVAILABLE"
              ? "JOINABLE"
              : props.server.state === "WAITING_FOR_PORT"
              ? "WAITING FOR BIND"
              : "CLOSED"}
          </span>
          <span className="tag smol">{props.server.players} Players</span>
          <span className="tag smol">{props.server.sessionId}</span>
        </div>
      </header>

      <div className="progress">
        <span className="value">
          {props.server.startedAt === ""
            ? "Starting"
            : "Started " +
              moment(moment.now()).from(props.server.startedAt, true) +
              " ago"}
        </span>
        <div className="bar">
          <div
            className="value"
            style={{
              width: `${1 / ((props.server.players / 100) * 100)}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
