import { formatBytes, handleDownload } from "src/help/download";

import useLoading from "src/state/loading";

import { FaDownload } from "react-icons/fa6";
import "src/styles/pages/download.css";

const DownloadPage = () => {
  const builds = [
    {
      build: "11.31",
      cl: "11.31-CL-N/A",
      release_date: "15-10-2019",
      download: "https://builds.elixirfn.com/versions/11.31.rar",
    },
  ];

  return (
    <div className="download">
      {builds.map((build, index) => (
        <>
          <Download build={build} key={index} />
        </>
      ))}
    </div>
  );
};

type Download = {
  build: string;
  cl: string;
  release_date: string;
  download: string;
};

const Download = (props: { build: Download }) => {
  const loadingState = useLoading();

  console.log(loadingState.buildDownloadProgress.transfered);

  return (
    <>
      <div
        className={
          loadingState.buildDownloadLoading === true
            ? "dl-container download-build"
            : "dl-container"
        }
        //className="dl-container"
        onClick={() =>
          loadingState.buildDownloadLoading === true
            ? console.log("build already downloading")
            : handleDownload(props.build.download, props.build.build)
        }
      >
        <div className="logo">
          <img
            src={"https://bucket.retrac.site/Fortnite_F_lettermark_logo.png"}
            alt="logo"
          />
          <div className="info">
            <h2>Fortnite {props.build.build}</h2>
            <p>{props.build.cl}</p>
          </div>
        </div>
        <div className="download-build">
          <div className="item">
            <FaDownload />
          </div>
        </div>
      </div>
      {loadingState.buildDownloadLoading === true ? (
        <div className="progress">
          <div className="bar">
            <div
              className="value"
              style={{
                width: `${loadingState.buildDownloadProgress.percentage}%`,
              }}
            ></div>
          </div>
          <div className="details">
            <h4>{`${formatBytes(
              loadingState.buildDownloadProgress.transfered
            )} / ${formatBytes(
              loadingState.buildDownloadProgress.filesize
            )} (${formatBytes(
              loadingState.buildDownloadProgress.transfer_rate
            )}/s)`}</h4>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default DownloadPage;
