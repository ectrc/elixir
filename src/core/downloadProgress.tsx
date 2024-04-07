import { LegacyRef } from "react";

const DownloadProgress = (props: {
  radialProgressRef: LegacyRef<HTMLDivElement>;
}) => {
  return (
    <div
      className="RadialProgress"
      role="progressbar"
      ref={props.radialProgressRef}
      aria-valuemin={0}
      aria-valuemax={100}
    ></div>
  );
};

export default DownloadProgress;
