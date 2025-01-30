import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        backgroundImage: "url('/BG.png')", // Path relative to the 'public' folder
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "50px", // Add padding for spacing
      }}
    >
      <div style={{ textAlign: "left" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#000" }}>
          Stylish Shoes For You
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#000", maxWidth: "400px", margin: "20px 0" }}>
          Step into the perfect pair of black shoes. Designed for style and comfort.
        </p>
        <button
          onClick={handleLoginClick}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            backgroundColor: "#ff7e5f",
            color: "#000",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            fontWeight: "bold",
            width: "200px",
            height: "50px",
          }}
        >
          LOG IN
        </button>
      </div>
    </div>
  );
}

export default LandingPage;