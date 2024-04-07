import React, { useEffect } from "react";
import useNews from "src/state/news";

import * as Hi from "react-icons/hi";
import "src/styles/pages/home.css";

const HomePage = () => {
  const news = useNews();

  useEffect(() => {
    news.fnitems.length <= 0 && !news.fetchedFnOnce && news.fetchFn();
    news.launcheritems.length <= 0 &&
      !news.fetchedLauncherOnce &&
      news.fetchLauncher();
  }, []);

  return (
    <section className="home">
      <header>
        <h2>News</h2>
        <p>Latest announcements and updates from us.</p>
      </header>
      <div className="news">
        <FortniteNews />
      </div>
      <ElixirNews />
    </section>
  );
};

const FortniteNews = () => {
  const news = useNews();
  if (news.fnitems.length <= 0) return null;

  return news.fnitems.map((item) => {
    return (
      <div className="news-card" key={item.title}>
        <img src={item.image} alt="" />
        <div className="content">
          <h3>{item.title}</h3>
          <span>{item.body}</span>
        </div>
      </div>
    );
  });
};

const ElixirNews = () => {
  const news = useNews();
  if (news.launcheritems.length <= 0) return null;

  return news.launcheritems.map((item) => {
    const Icon = Hi[item.icon] as React.FC;
    return (
      <div className="info-card" key={item.title}>
        <div className={`icon-container ${item.colouredIcon ? "cool" : ""}`}>
          {<Icon />}
        </div>
        <h4>{item.title}</h4>
        <p>{item.body}</p>
      </div>
    );
  });
};

export default HomePage;
