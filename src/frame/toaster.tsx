import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import useToaster, { Toast as IToast, ToasterState } from "src/state/toaster";

import "src/styles/toaster.css";

const Toaster = () => {
  const t = useToaster();

  return ReactDOM.createPortal(
    t.toasts.map((toast) => <Toast key={toast.id} toast={toast} toaster={t} />),
    document.getElementById("toaster") as HTMLElement
  );
};

type ToastProps = {
  toast: IToast;
  toaster: ToasterState;
};

const Toast = (props: ToastProps) => {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      // props.toaster.remove(props.toast.id);
      setRemoved(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (removed) {
      const timer = setTimeout(() => {
        props.toaster.remove(props.toast.id);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [removed]);

  return (
    <div className={`toast ${props.toast.type} ${removed ? "removeme" : ""}`}>
      <div className="toast-content">
        <p>{props.toast.message}</p>
      </div>
    </div>
  );
};

export default Toaster;
