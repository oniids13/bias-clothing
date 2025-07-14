import Display from "../sections/Display";

const Shop = () => {
  return (
    <>
      <Display title="All Products" endpoint="active" />
      <Display title="Out of Stock" endpoint="inactive" />
    </>
  );
};

export default Shop;
