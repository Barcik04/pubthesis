import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Start from "./pages/start";

import Navbar from "./components/Navbar";


function App() {
  const handleToggleSidebar = () => {
    console.log("Sidebar toggle");
  };

  return (
    <>
      <Navbar onToggleSidebar={handleToggleSidebar} />

      <Routes>
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/start" element={<Start />} />
      </Routes>
    </>
  );
}

export default App;