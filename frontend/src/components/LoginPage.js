import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Include your CSS for styling

function LoginPage() {
  const navigate = useNavigate(); // Hook to programmatically navigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Check your username or password.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token); // Store JWT in localStorage
      navigate("/dashboard"); // Navigate to the Dashboard route
    } catch (error) {
      console.error("Error during login:", error);
      alert(error.message); // Show error message to user
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form>
          <div className="textbox">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="textbox">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="button" className="login-btn" onClick={handleLogin}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
