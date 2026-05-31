import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Start from "./pages/Start";
import User from "./pages/User";
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";


import Navbar from "./components/Navbar";
import ListingPage from "./pages/ListingPage";


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
        <Route path="/update-listing/:productId" element={<UpdateListing />} />
        <Route path="/listing-page/:productId" element={<ListingPage />} />
      </Routes>
    </>
  );
}

export default App;