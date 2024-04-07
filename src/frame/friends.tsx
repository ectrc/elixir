import React, { useState, useEffect, useRef } from "react";
import { showAddFriendModal } from "src/help/modals";
import useFriends, { FriendsState } from "src/state/friends";
import useAuth from "src/state/auth";
import useLoading from "src/state/loading";

import LoadingIcon from "src/core/loading";

import { HiUserAdd } from "react-icons/hi";
import "src/styles/friends.css";

const FriendsMenu = () => {
  const friends = useFriends();
  const auth = useAuth();
  const loading = useLoading();

  const [atBottom, setAtBottom] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const scrollRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    friends.people.length <= 0 && !friends.fetchedOnce && friends.fetch();
  }, [friends]);

  const handleOnScroll = (e: React.UIEvent<HTMLUListElement, UIEvent>) => {
    const target = e.target as HTMLUListElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    setAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
    setAtTop(scrollTop <= 50);
  };

  return (
    <div className="friends">
      <section className="user">
        <div className="avatar">
          <img
            src={`https://fortnite-api.com/images/cosmetics/br/${auth.character.templateId
              .split(":")[1]
              .replace("_Elixir", "")}/icon.png`}
            alt=""
          />
        </div>
        <div className="info">
          <span className="display">{auth.user.DisplayName}</span>
          <small className="status">Online</small>
        </div>
      </section>

      <div className="tab-header">
        <span>FRIENDS ({friends.people.length})</span>
      </div>

      <div
        className={`friends-container ${atBottom ? "bottom" : ""} ${
          atTop ? "top" : ""
        }`}
      >
        <ul ref={scrollRef} onScroll={handleOnScroll} className="friend-list">
          {friends.people.length > 0 &&
            friends.people.map((friend) => (
              <Friend {...friend} key={friend.displayName} />
            ))}
          {loading.friendLoading ? (
            <LoadingIcon />
          ) : (
            <>
              {friends.people.length === 0 && (
                <li className="no-friend">
                  <span className="info">
                    You don't have any friends yet, add some in-game!
                  </span>
                </li>
              )}
            </>
          )}
          <div className="add" onClick={showAddFriendModal}>
            <HiUserAdd />
          </div>
        </ul>
      </div>
    </div>
  );
};

const Friend = (props: FriendsState["people"][0]) => {
  return (
    <li className="friend">
      <div className="avatar">
        <img
          src={`https://builds.elixirfn.com/cid/${
            props.activeCharacterTemplateId.split(":")[1]
          }.png`}
          alt=""
        />
      </div>
      <div className="info">
        <span className="display">{props.displayName}</span>
      </div>
    </li>
  );
};

export default FriendsMenu;
