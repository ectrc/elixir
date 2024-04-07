import { useRef, useState } from "react";

import { handleAddBuild, handleStart } from "src/help/library";

import useBuilds, { IBuild } from "src/state/builds";
import useLoading from "src/state/loading";

import LoadingIcon from "src/core/loading";
import DownloadProgress from "src/core/downloadProgress";

import { HiPlus } from "react-icons/hi";
import { FaPlay } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { BsFillDropletFill } from "react-icons/bs";
import "src/styles/pages/library.css";

const mapToEntires = <K, V>(m: Map<K, V>) => {
  const entries: [K, V][] = [];
  for (const [key, value] of m) {
    entries.push([key, value]);
  }
  return entries;
};

const LibraryPage = () => {
  const buildState = useBuilds();
  const loadingState = useLoading();

  const [filter, setFilter] = useState("verified" as "verified" | "imported");

  const verifiedBuilds = mapToEntires(buildState.builds).filter(
    ([, build]) => build.verified
  );

  const importedBuilds = mapToEntires(buildState.builds).filter(
    ([, build]) => !build.verified
  );

  const filteredBuilds =
    filter === "verified" ? verifiedBuilds : importedBuilds;

  return (
    <section className="library">
      <div className="lib-nav">
        <button
          className={`item ${filter == "verified" && "active"}`}
          onClick={() => setFilter("verified")}
        >
          Verified Builds ({verifiedBuilds.length})
        </button>
        <button
          className={`item ${filter == "imported" && "active"}`}
          onClick={() => setFilter("imported")}
        >
          Imported Builds ({importedBuilds.length})
        </button>

        <button
          className="item left"
          onClick={() => {
            loadingState.addBuildLoading ? null : handleAddBuild();
          }}
        >
          {loadingState.addBuildLoading ? (
            <LoadingIcon />
          ) : (
            <>
              <HiPlus />
              Add
            </>
          )}
        </button>
      </div>

      <div className="lib-content">
        {filteredBuilds.map(([key, build], index) => (
          <Build key={key} {...build} idx={index} />
        ))}

        {filteredBuilds.length === 0 && (
          <div className="build fake" key="no-build" onClick={handleAddBuild}>
            <div>
              <div className="thumbnail">
                {loadingState.addBuildLoading ? (
                  <div className="fake lds-ring">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                ) : (
                  <div className="fake">
                    <HiPlus />
                  </div>
                )}
              </div>
              <span className="title">Add Build</span>
              <p>Import a new installation</p>
            </div>
            <div className="come">
              <FaPlay />
            </div>
            <div className="come-delete">
              <MdDelete />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const Build = (props: IBuild & { idx: number }) => {
  const buildState = useBuilds();
  const loadingState = useLoading();

  const radialProgressRef = useRef<HTMLDivElement | null>(null);

  const setProgress = (progress: number) => {
    if (radialProgressRef.current) {
      const value = `${progress}%`;
      radialProgressRef.current.style.setProperty("--progress", value);
      radialProgressRef.current.innerHTML = value;
      radialProgressRef.current.setAttribute("aria-valuenow", value);
    }
  };

  return (
    <div
      className={`${loadingState.pakLoading ? "build pak-download" : "build"}`}
      style={{
        animationDelay: `${props.idx * 50}ms`,
      }}
    >
      <div
        onClick={() =>
          loadingState.pakLoading === true
            ? console.log("pak is downloading")
            : handleStart(props.path)
        }
      >
        <div className="thumbnail">
          {props.splash === "Unknown Splash" ? (
            <div className="fake">
              <BsFillDropletFill className="svg" />
            </div>
          ) : (
            <div className="container-blurr-img">
              {loadingState.pakLoading ? (
                <>
                  {setProgress(loadingState.pakProgress.percentage)}
                  <div className="progress-container">
                    <DownloadProgress radialProgressRef={radialProgressRef} />
                  </div>
                </>
              ) : null}
              <img
                className={`${loadingState.pakLoading ? "splash-logo" : ""}`}
                src={props.splash}
                alt="thumbnail"
              />
            </div>
          )}
        </div>
        <span className="title">
          Season {props.version.split(".")[0]}
          <small>{props.verified ? "Verified" : "Imported"}</small>
        </span>
        <p>{props.real}</p>
      </div>
      <div
        className="come"
        onClick={() =>
          loadingState.pakLoading === true
            ? console.log("pak is downloading")
            : handleStart(props.path)
        }
      >
        <FaPlay />
      </div>
      {loadingState.pakLoading === true ? null : (
        <div
          className="come-delete"
          onClick={() => buildState.remove(props.path)}
        >
          <MdDelete />
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
