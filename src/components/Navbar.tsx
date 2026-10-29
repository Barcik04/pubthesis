import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../photos/home.png"; 
import user from "../photos/user.png"; 



function Navbar() {
  return (
    <header className="navbar">
      <Link to="/start" className="navbar-logo">
        <img src={logo} alt="Logo aplikacji" />
      </Link>

      <nav className="navbar-links">
        <Link to="/signin">Zaloguj się</Link>
        <Link to="/signup">Zarejestruj się</Link>
      </nav>

      <div className="right-navbar">
        <Link to="/user" className="navbar-logo">
          <img src={user} alt="Profil użytkownika" />
        </Link>
      </div>


    </header>
  );
}

export default Navbar;
