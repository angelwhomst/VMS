import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-main">
      {/* Dashboard Summary Section */}
      <section className="dashboard-summary">
        <div className="dashboard-card">
          <h2 className="dashboard-summary-card-title">Orders</h2>
          <p>150</p>
        </div>
        <div className="dashboard-card">
          <h2 className="dashboard-summary-card-title">Delivered</h2>
          <p>120</p>
        </div>
        <div className="dashboard-card">
          <h2 className="dashboard-summary-card-title">Total Stocks Available</h2>
          <p>500</p>
        </div>
        <div className="dashboard-card">
          <h2 className="dashboard-summary-card-title">Revenue</h2>
          <p>$10,000</p>
        </div>
      </section>

     
    </div>
  );
};

export default Dashboard;