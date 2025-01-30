import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Admin.css"; // Make sure you style the modal here

const Admin = ({ onClose }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogoutClick = () => {
    setShowConfirmModal(true); // Show the confirmation modal
  };

  const handleConfirmLogout = () => {
    setShowConfirmModal(false);
    navigate("/landing"); // Navigate to the landing page
  };

  const handleCancelLogout = () => {
    setShowConfirmModal(false); // Hide the confirmation modal
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="modal-header">
          <h2>Admin</h2>
        </div>
        <div className="modal-body">
          {/* Predefined values in text boxes */}
          <div className="form-group">
            <label htmlFor="companyName">Company Name</label>
            <input
              type="text"
              id="companyName"
              defaultValue="SOLEOPS SUPPLIERS"
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellerName">Seller Name</label>
            <input
              type="text"
              id="sellerName"
              defaultValue="John Doe"
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="sellerContact">Seller Contact Number</label>
            <input
              type="text"
              id="sellerContact"
              defaultValue="+1-800-123-4567"
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              defaultValue="1234 Business Blvd, City, Country"
              disabled
            />
          </div>

          {/* Log Out Button */}
          <div className="form-group">
            <button className="logout-btn" onClick={handleLogoutClick}>
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-content">
            <p>Are you sure you want to log out?</p>
            <div className="confirm-buttons">
              <button className="yes-btn" onClick={handleConfirmLogout}>
                Yes
              </button>
              <button className="no-btn" onClick={handleCancelLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
