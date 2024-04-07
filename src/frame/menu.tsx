import { open } from "@tauri-apps/api/shell";
import usePath from "src/state/path";
import useAuth from "src/state/auth";

import { IconType } from "react-icons";
import {
  HiLibrary,
  HiViewGrid,
  HiSortAscending,
  HiCog,
  HiFolderDownload,
  HiTerminal,
  HiShoppingCart,
} from "react-icons/hi";

import "src/styles/menu.css";
import { isDev } from "src/api/endpoints";

const Menu = () => {
  const auth = useAuth();

  return (
    <div className="menu">
      <Item Icon={HiLibrary} label="Home" path="/" />
      <Item Icon={HiViewGrid} label="Library" path="/library" />
      <Item Icon={HiShoppingCart} label="Item Shop" path="/storefront" />
      <Item Icon={HiFolderDownload} label="Downloads" path="/download" />
      <Item Icon={HiSortAscending} label="Servers" path="/status" />

      {(auth.user?.Role > 20 || isDev) && (
        <Item Icon={HiTerminal} label="Developer" path="/developer" />
      )}

      <div className="spacer" />
      <button
        onClick={() => open("https://discord.gg/elixirsupport")}
        className="item"
      >
        Help Needed?
      </button>
      <Item Icon={HiCog} label="Settings" path="/settings" />
    </div>
  );
};

interface ItemProps {
  Icon: IconType;
  label: string;
  path: string;
}

export const Item = ({ Icon, label, path }: ItemProps) => {
  const p = usePath();
  const className = p.path === path ? "item active" : "item";

  const handleClick = () => {
    p.set(path);
  };

  return (
    <button className={className} onClick={handleClick}>
      <Icon />
      {label}
    </button>
  );
};

export default Menu;
