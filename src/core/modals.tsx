import useModals, { Modal as IModel, ModalState } from "src/state/modal";

import { HiX } from "react-icons/hi";
import "src/styles/modals.css";

const Modals = () => {
  const m = useModals();

  return (
    <div className="modals">
      {m.modals.map((toast) => (
        <Modal key={toast.id} modal={toast} state={m} />
      ))}
    </div>
  );
};

type ModalProps = {
  modal: IModel;
  state: ModalState;
};

const Modal = (props: ModalProps) => {
  const handleClose = () => {
    props.state.remove(props.modal.id);
  };

  const inputs = Object.entries(props.modal.inputs).map(([key, value]) => {
    return (
      <div className="input" key={key}>
        <label>{key}</label>
        <input
          type="text"
          value={value.value}
          onChange={(e) =>
            props.state.setInputValue(props.modal.id, key, e.target.value)
          }
          placeholder={value.placeholder}
        />
      </div>
    );
  });

  const buttons = props.modal.buttons?.map((button) => {
    return (
      <button
        key={button.text}
        className={button.type}
        onClick={button.submittable ? props.modal.submit : handleClose}
      >
        {button.text}
      </button>
    );
  });

  return (
    <div className="modal">
      <div className="close" onClick={handleClose}>
        <HiX />
      </div>

      <header>
        <h3>{props.modal.title}</h3>
        <p>{props.modal.message}</p>
      </header>

      <div className="body">{inputs}</div>
      <footer>{buttons}</footer>
    </div>
  );
};

export default Modals;
