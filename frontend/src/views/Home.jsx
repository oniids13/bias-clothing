import Display from "../sections/Display";
import Gallery from "../sections/Gallery";

const Home = () => {
  return (
    <>
      <Display title="Fresh Prints" endpoint="new" />
      <Display title="Featured Tees" endpoint="featured" />
      <Gallery />
    </>
  );
};

export default Home;
