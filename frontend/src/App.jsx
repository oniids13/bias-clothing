import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="wrapper">
      <Header user={user} setUser={setUser} />
      <div className="main">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default App;
