import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../photos/home.png"; 
import user from "../photos/user.png"; 



function Navbar() {
  return (
    <header className="navbar">
      <Link to="/start" className="navbar-logo">
        <img src={logo} alt="Application logo" />
      </Link>

      <nav className="navbar-links">
        <Link to="/signin">Sign in</Link>
        <Link to="/signup">Sign up</Link>
      </nav>

      <div className="right-navbar">
        <Link to="/user" className="navbar-logo">
          <img src={user} alt="Application logo" />
        </Link>
      </div>


    </header>
  );
}

export default Navbar;
