import { invoke } from "@tauri-apps/api";

import useBuilds from "src/state/builds";
import useLoading from "src/state/loading";
import useToaster from "src/state/toaster";

const handleDownload = async (downloadUrl: string, buildVersion: string) => {
  const build = useBuilds.getState();
  const toaster = useToaster.getState();
  const loading = useLoading.getState();

  if (!build.downloadPath) {
    return toaster.add({
      id: "no build path",
      message: "Hmm, select a download path in the settings first",
      type: "error",
    });
  }

  loading.setBuildDownloadLoading(true);

  await invoke("download_build_file", {
    url: downloadUrl,
    path: `${build.downloadPath}/${buildVersion}.rar`,
  }).catch((err: string) => {
    loading.setBuildDownloadLoading(false);
    return toaster.add({
      id: "build error",
      message: err,
      type: "error",
    });
  });
  loading.setBuildDownloadLoading(false);
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export { handleDownload, formatBytes };
