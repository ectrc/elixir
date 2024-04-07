import React from "react";

type DefaultInputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type CustomInputProps = {
  state: [string, React.Dispatch<React.SetStateAction<string>>];
};

type InputProps = DefaultInputProps | CustomInputProps;

const DefaultInput = (props: InputProps) => {
  if ("state" in props) {
    const [value, setValue] = props.state;
    props = { ...props, value, onChange: (e) => setValue(e.target.value) };
  }

  return <input {...props}></input>;
};

const CodeInput = (props: InputProps) => {
  return <input className="code" {...props}></input>;
};

export default DefaultInput;
export { CodeInput };
