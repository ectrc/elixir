import React from "react";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const DefaultButton = (props: ButtonProps) => {
  return (
    <button className="button dull" {...props}>
      {props.children}
    </button>
  );
};

const SnazzyButton = (props: ButtonProps) => {
  return (
    <button className="button" {...props}>
      {props.children}
    </button>
  );
};

const DiscordButton = (props: ButtonProps) => {
  return (
    <button className="button discord width" {...props}>
      {props.children}
    </button>
  );
};

const HiddenButton = (props: ButtonProps) => {
  return (
    <button className="button dull hidden" {...props}>
      {props.children}
    </button>
  );
};

export default DefaultButton;
export { SnazzyButton, HiddenButton, DiscordButton };
