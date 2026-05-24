import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../photos/home.png"; 

type Props = {
  onToggleSidebar: () => void;
};

function Navbar({ onToggleSidebar }: Props) {
  return (
    <header className="navbar">
      <Link to="/start" className="navbar-logo">
        <img src={logo} alt="Application logo" />
      </Link>

      <nav className="navbar-links">
        <Link to="/signin">Sign in</Link>
        <Link to="/signup">Sign up</Link>
      </nav>

      <button 
        type="button" 
        className="navbar-menu-button" 
        onClick={onToggleSidebar}
      >
      </button>
    </header>
  );
}

export default Navbar;
