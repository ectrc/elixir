import { useEffect } from "react";
import useStorefront from "src/state/storefront";

const StoreFront: React.FC = () => {
  const storefrontState = useStorefront();

  console.log(storefrontState.storefront);

  useEffect(() => {
    storefrontState.storefront.storefronts.length <= 0 &&
      !storefrontState.fetchedOnce &&
      storefrontState.fetch();
  }, []);

  return (
    <div>
      <h1>Item Shop</h1>
    </div>
  );
};

export default StoreFront;
