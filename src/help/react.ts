import { useEffect, useState } from "react";

const awaitUseState = <T>(fn: Promise<T>) => {
  const [state, setState] = useState<T | null>(null);
  useEffect(() => {
    fn.then((res) => setState(res));
  }, []);
  return state;
};

export default awaitUseState;
