import {
  postCreateServer,
  postDeleteServer,
  postEditServer,
} from "src/api/developer";
import useAuth from "src/state/auth";
import useModals from "src/state/modal";
import useToaster from "src/state/toaster";

const showAddCustomIdServerModal = () => {
  const { add, getInputValue, remove } = useModals.getState();
  const { add: addToast } = useToaster.getState();
  const auth = useAuth.getState();

  if (!auth.user) return;
  if (auth.user.Role < 20) return;

  add({
    id: "add-custom-server",
    title: "start a custom server",
    message: "enter a custom ID to start a server on the backend",
    inputs: {
      custom_id: {
        id: "custom_id",
        value: "",
        placeholder: "sessionId",
      },
      playlist: {
        id: "playlist",
        value: "Playlist_DefaultSolo",
        placeholder: "Playlist_DefaultSolo",
      },
      region: {
        id: "region",
        value: "EU",
        placeholder: "EU",
      },
    },
    buttons: [
      {
        id: "cancel",
        text: "Cancel",
        type: "secondary",
        submittable: false,
      },
      {
        id: "add",
        text: "create server",
        type: "primary",
        submittable: true,
      },
    ],
    submit: async () => {
      const id = getInputValue("add-custom-server", "custom_id");
      const playlist = getInputValue("add-custom-server", "playlist");
      const region = getInputValue("add-custom-server", "region");
      if (!id || !playlist || !region)
        return addToast({
          id: "add-friend-error-username",
          message: "Please enter a non-empty inputs.",
          type: "error",
        });

      const res = await postCreateServer(id, playlist, region);
      if (!res.success)
        return addToast({
          id: "add-friend-error-username",
          message: "idk",
          type: "error",
        });

      addToast({
        id: "add-friend-success",
        message: "Successfully created server with id: " + id + ".",
        type: "success",
      });

      remove("add-custom-server");
    },
  });
};

const showEditCustomIdServerModal = () => {
  const { add, getInputValue, remove } = useModals.getState();
  const { add: addToast } = useToaster.getState();
  const auth = useAuth.getState();

  if (!auth.user) return;
  if (auth.user.Role < 20) return;

  add({
    id: "edit-custom-server",
    title: "start a custom server",
    message: "enter a custom ID to start a server on the backend",
    inputs: {
      custom_id: {
        id: "custom_id",
        value: "",
        placeholder: "sessionId",
      },
      state: {
        id: "state",
        value: "AVAILABLE",
        placeholder: "AVAILABLE",
      },
    },
    buttons: [
      {
        id: "cancel",
        text: "Cancel",
        type: "secondary",
        submittable: false,
      },
      {
        id: "add",
        text: "edit server",
        type: "primary",
        submittable: true,
      },
    ],
    submit: async () => {
      const id = getInputValue("edit-custom-server", "custom_id");
      const state = getInputValue("edit-custom-server", "state");
      if (!id || !state)
        return addToast({
          id: "edit-friend-error-username",
          message: "Please enter a non-empty inputs",
          type: "error",
        });

      const res = await postEditServer(id, state);
      if (!res.success)
        return addToast({
          id: "edit-friend-error-username",
          message: "idk",
          type: "error",
        });

      addToast({
        id: "edit-friend-success",
        message: "Successfully edited server with id: " + id + ".",
        type: "success",
      });

      remove("edit-custom-server");
    },
  });
};

const showDeleteCustomIdServerModal = () => {
  const { add, getInputValue, remove } = useModals.getState();
  const { add: addToast } = useToaster.getState();
  const auth = useAuth.getState();

  if (!auth.user) return;
  if (auth.user.Role < 20) return;

  add({
    id: "delete-custom-server",
    title: "start a custom server",
    message: "enter a custom ID to start a server on the backend",
    inputs: {
      custom_id: {
        id: "swessionId",
        value: "",
        placeholder: "sessionId",
      },
    },
    buttons: [
      {
        id: "cancel",
        text: "Cancel",
        type: "secondary",
        submittable: false,
      },
      {
        id: "add",
        text: "edit server",
        type: "primary",
        submittable: true,
      },
    ],
    submit: async () => {
      const id = getInputValue("delete-custom-server", "custom_id");
      if (!id)
        return addToast({
          id: "edit-friend-error-username",
          message: "Please enter a non-empty inputs",
          type: "error",
        });

      const res = await postDeleteServer(id);
      if (!res.success)
        return addToast({
          id: "delete-friend-error-username",
          message: "idk",
          type: "error",
        });

      addToast({
        id: "delete-friend-success",
        message: "Successfully edited server with id: " + id + ".",
        type: "success",
      });

      remove("delete-custom-server");
    },
  });
};

export {
  showAddCustomIdServerModal,
  showEditCustomIdServerModal,
  showDeleteCustomIdServerModal,
};
