import { create } from "zustand";

export interface download {
  download_id: number;
  filesize: number;
  transfered: number;
  transfer_rate: number;
  percentage: number;
  comment: string;
}

export interface LoadingState {
  addBuildLoading: boolean;
  pakLoading: boolean;
  friendLoading: boolean;
  serversLoading: boolean;
  pakProgress: download;
  buildDownloadLoading: boolean;
  buildDownloadProgress: download;
  setBuildLoading: (state: boolean) => void;
  setPakLoading: (state: boolean) => void;
  setFriendLoading: (state: boolean) => void;
  setServersLoading: (state: boolean) => void;
  setPakProgress: (state: download) => void;
  setBuildDownloadLoading: (state: boolean) => void;
  setBuildDownloadProgress: (state: download) => void;
}

const useLoading = create<LoadingState>((set) => ({
  addBuildLoading: false,
  pakLoading: false,
  friendLoading: false,
  serversLoading: false,
  pakProgress: {
    download_id: 0,
    filesize: 0,
    transfered: 0,
    transfer_rate: 0,
    percentage: 1,
    comment: "",
  },
  buildDownloadLoading: false,
  buildDownloadProgress: {
    download_id: 0,
    filesize: 0,
    transfered: 0,
    transfer_rate: 0,
    percentage: 0.1,
    comment: "",
  },
  setBuildLoading: (state) => {
    set({ addBuildLoading: state });
  },
  setPakLoading: (state) => {
    set({ pakLoading: state });
  },
  setFriendLoading(state) {
    set({ friendLoading: state });
  },
  setServersLoading(state) {
    set({ serversLoading: state });
  },
  setPakProgress(state) {
    set({ pakProgress: state });
  },
  setBuildDownloadLoading(state) {
    set({ buildDownloadLoading: state });
  },
  setBuildDownloadProgress(state) {
    set({ buildDownloadProgress: state });
  },
}));

export default useLoading;
