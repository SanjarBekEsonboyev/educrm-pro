import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); // {type, data, student?}
  return <ModalContext.Provider value={{ modal, setModal }}>{children}</ModalContext.Provider>;
}

export const useModal = () => useContext(ModalContext);
