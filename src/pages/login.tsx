import { open } from "@tauri-apps/api/shell";
import { getDiscordUri } from "src/api/auth";

import { DiscordButton } from "src/core/button";

import "src/styles/pages/login.css";

const LoginPage = () => {
  const handleGetCode = async () => {
    const uri = await getDiscordUri();
    if (!uri) return;

    open(uri.data);
  };

  return (
    <section className="login">
      <div>
        <h3>Welcome to Elixir!</h3>
        <p>Relive the glory days of Fortnite</p>
      </div>
      <div className="dialog">
        <DiscordButton onClick={handleGetCode}>
          Login with Discord
        </DiscordButton>
      </div>
    </section>
  );
};

export default LoginPage;
