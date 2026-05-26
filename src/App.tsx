import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Start from "./pages/Start";
import User from "./pages/User";
import CreateListing from "./pages/CreateListing";



import Navbar from "./components/Navbar";


function App() {


  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/start" element={<Start />} />
        <Route path="/user" element={<User />} />
        <Route path="/create-listing" element={<CreateListing />} />
      </Routes>
    </>
  );
}

export default App;