import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Products from "./components/Products";
import Orders from "./components/Orders";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard"; // Import the Dashboard component

function App() {
  const [data, setData] = useState(null);

  // Fetching data from the server on component mount
  useEffect(() => {
    fetch("http://localhost:8001/api/data") 
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <Router>
      <AppRoutes data={data} />
    </Router>
  );
}

const AppRoutes = ({ data }) => {
  const location = useLocation();

  return (
    <>
      {/* Only render NavBar if the current path is NOT the LandingPage or LoginPage */}
      {location.pathname !== "/" && location.pathname !== "/login" && <NavBar />}

      <Routes>
        {/* Define Routes for LandingPage, LoginPage, Products, Orders, Dashboard */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products" element={<Products data={data} />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
};

export default App;
