import Display from "../sections/Display";

const Home = () => {
  return (
    <>
      <Display title="Fresh Prints" endpoint="new" />
      <Display title="Featured Tees" endpoint="featured" />
    </>
  );
};

export default Home;
