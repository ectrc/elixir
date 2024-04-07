import { getPublicPlayer, postAddFriend } from "src/api/friends";
import { randomUsername } from "./random";
import useModals from "src/state/modal";
import useToaster from "src/state/toaster";
import useAuth from "src/state/auth";
import useFriends from "src/state/friends";

const showAddFriendModal = () => {
  const { add, getInputValue, remove } = useModals.getState();
  const { add: addToast } = useToaster.getState();
  const auth = useAuth.getState();

  add({
    id: "add-friend",
    title: "Add a friend",
    message: "Enter your friend's username below to add them as a friend.",
    inputs: {
      username: {
        id: "username",
        value: "",
        placeholder: randomUsername(),
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
        text: "Add Friend",
        type: "primary",
        submittable: true,
      },
    ],
    submit: async () => {
      const username = getInputValue("add-friend", "username");
      if (!username)
        return addToast({
          id: "add-friend-error-username",
          message: "Please enter a non-empty username.",
          type: "error",
        });

      const player = await getPublicPlayer(username);
      if (!player.success)
        return addToast({
          id: "add-friend-error-player",
          message: `Could not find a player with username ${username}.`,
          type: "error",
        });

      const friend = await postAddFriend(auth.user.AccountID, player.data.id);
      if (!friend.success)
        return addToast({
          id: "add-friend-error-friend",
          message: `Could not add ${username} as a friend.`,
          type: "error",
        });

      console.log(friend.data);

      addToast({
        id: "add-friend-success",
        message: `Successfully added ${username} as a friend.`,
        type: "success",
      });

      useFriends.getState().fetch();
      remove("add-friend");
    },
  });
};

export { showAddFriendModal };
