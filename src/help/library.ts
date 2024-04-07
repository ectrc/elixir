import { invoke } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { isDev, pakBase } from "src/api/endpoints";
import { createExchangeCode } from "src/api/auth";
import { getFileSizes } from "src/api/files";

import useAuth from "src/state/auth";
import useBuilds, { IBuild } from "src/state/builds";
import useLoading from "src/state/loading";
import useToaster from "src/state/toaster";

import { KNOWN_FILE_HASHES_256 } from "src/static/config";
//
const addBuildToState = async () => {
  const buildState = useBuilds.getState();
  const toaster = useToaster.getState();
  const loading = useLoading.getState();

  const selectedPath = await open({ directory: true, multiple: false });
  if (!selectedPath) return;

  if (buildState.builds.has(selectedPath.toString())) {
    return toaster.add({
      id: "build-exists",
      message: "Build already exists in your library.",
      type: "error",
    });
  }

  loading.setBuildLoading(true);

  const splash = `${selectedPath}\\FortniteGame\\Content\\Splash\\Splash.bmp`;
  const exe = `${selectedPath}\\FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe`;

  const hash = (await invoke("calculate_sha256_of_file", {
    filePath: exe,
  }).catch(() => undefined)) as string | undefined;

  if (hash === undefined) {
    loading.setBuildLoading(false);
    toaster.add({
      id: "error-sha256",
      message: "Fortnite files do not exist",
      type: "error",
    });
    return;
  }

  const splashExists = await invoke("check_file_exists", { path: splash });

  const verified = KNOWN_FILE_HASHES_256[hash];
  const data: IBuild = !verified
    ? {
        splash: splashExists ? convertFileSrc(splash) : "Unknown Splash",
        path: selectedPath.toString(),
        version: "?",
        real: "Unknown Version",
        verified: false,
        open: false,
        loading: false,
      }
    : {
        splash: splashExists ? convertFileSrc(splash) : "Unknown Splash",
        path: selectedPath.toString(),
        version: verified.version,
        real: verified.release,
        verified: true,
        open: false,
        loading: false,
      };

  buildState.add(selectedPath.toString(), data);
  loading.setBuildLoading(false);
};

const downloadPak = async (
  fileName: string,
  path: string
): Promise<boolean> => {
  const downloadRes = await invoke("download_paks", {
    baseUrl: pakBase,
    fileName: fileName,
    path: path,
  });

  console.log(downloadRes, "download res", path, fileName, pakBase);

  return downloadRes as boolean;
};

const checkLatestPak = async (folderPath: string): Promise<boolean> => {
  const loading = useLoading.getState();
  const toaster = useToaster.getState();
  loading.setPakLoading(true);

  const requiredFiles: Record<string, boolean> = {
    "pakchunk9000-WindowsClient.sig": false,
    "pakchunk9000-WindowsClient.pak": false,
  };

  const exists = await invoke("check_game_exists", {
    path: folderPath,
  }).catch(() => false);

  if (!exists) {
    toaster.add({
      id: "check game fails",
      message: "Game does not exist.",
      type: "error",
    });
    return false;
  }

  const fileSizes = await getFileSizes();
  if (!fileSizes.success) {
    toaster.add({
      id: "check game fails",
      message: "Failed to get file sizes.",
      type: "error",
    });
    return false;
  }

  for await (const [fileName] of Object.entries(requiredFiles)) {
    let fileExists = await invoke("check_pak_exists", {
      path: folderPath,
      fileName: fileName,
    }).catch(() => false);

    if (!fileExists) {
      console.log("file does not exist", fileName);
      const okay = await downloadPak(
        fileName,
        `${folderPath}\\FortniteGame\\Content\\Paks\\${fileName}`
      );
      if (!okay) {
        toaster.add({
          id: "check game fails",
          message: `Failed to download pak: ${fileName}`,
          type: "error",
        });
        return false;
      }

      requiredFiles[fileName] = true;
      continue;
    }

    const localFileSize = parseInt(
      (await invoke("get_file_size", {
        path: `${folderPath}\\FortniteGame\\Content\\Paks\\${fileName}`,
      }).catch(() => "0")) as string
    );

    if (localFileSize === fileSizes.data["pak/" + fileName]) {
      requiredFiles[fileName] = true;
      continue;
    }

    const okay = await downloadPak(
      fileName,
      `${folderPath}\\FortniteGame\\Content\\Paks\\${fileName}`
    );
    if (!okay) {
      toaster.add({
        id: "check game fails",
        message: `Failed to download pak: ${fileName}`,
        type: "error",
      });
      return false;
    }

    requiredFiles[fileName] = true;
  }

  loading.setPakLoading(false);

  return true;
};

const launchBuild = async (selectedPath: string) => {
  const authState = useAuth.getState();
  const toaster = useToaster.getState();

  const path = selectedPath.replace("/", "\\");
  const access_token = localStorage.getItem("auth.token");

  const exists = (await invoke("check_game_exists", {
    path: path,
  }).catch(() => false)) as boolean;
  if (!exists) {
    toaster.add({
      id: "check game fails",
      message: "Game does not exist.",
      type: "error",
    });
    return;
  }

  const exchangeCodeReq = await createExchangeCode(access_token || "");
  if (exchangeCodeReq.success === false) {
    authState.logout();
    return;
  }
  if (!isDev) {
    const latestPak = await checkLatestPak(path).catch(() => false);
    if (!latestPak) return;

    await invoke("download_build_file", {
      url: "https://builds.elixirfn.com/versions/eac.rar",
      path: `${path}\\eac.rar`,
    });

    await invoke("eccentric_unrar_method", {
      rarPath: `${path}\\eac.rar`,
    });
  }

  await invoke("start_elixir", {
    folderPath: path,
    exchangeCode: exchangeCodeReq?.data?.code,
    isDev: isDev,
  });
};

export { addBuildToState as handleAddBuild, launchBuild as handleStart };
