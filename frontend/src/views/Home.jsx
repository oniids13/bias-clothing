import Display from "../sections/Display";
import Gallery from "../sections/Gallery";
import Contact from "../sections/Contact";

const Home = () => {
  return (
    <>
      <Display title="Fresh Prints" endpoint="new" />
      <Display title="Featured Tees" endpoint="featured" />
      <Gallery />
      <Contact />
    </>
  );
};

export default Home;
