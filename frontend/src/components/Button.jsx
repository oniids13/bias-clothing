import { useNavigate } from "react-router-dom";

const Button = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/shop");
  };

  return (
    <button
      className="btn-cover bg-red-500 text-white hover:bg-red-400 hover:text-black"
      onClick={handleClick}
    >
      Shop Now
    </button>
  );
};

export default Button;
