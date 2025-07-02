import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

const Footer = () => {
  return (
    <footer className="bg-black min-h-20 p-5 text-white">
      <div className="flex flex-col items-center gap-3 h-full md:grid md:grid-cols-3 md:items-center md:gap-0">
        <div className="socials flex gap-4">
          <FacebookIcon />
          <InstagramIcon />
          <XIcon />
        </div>
        <p className="text-center text-sm md:text-base order-2 md:order-none ">
          &copy; {new Date().getFullYear()} Bias Clothing. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
