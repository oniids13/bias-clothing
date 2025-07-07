import Button from "./Button";

const LogoCover = () => {
  return (
    <div className="logo-cover">
      <img
        src="/src/images/bias_cover.jpg"
        alt="logo cover"
        className="h-100 w-full object-fill"
      />
      <Button />
    </div>
  );
};

export default LogoCover;
