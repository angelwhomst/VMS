import React, { useState } from "react";
import axios from "axios";
import "./EditSizeModal.css";

const EditSizeModal = ({ selectedSize, productName, productDescription, unitPrice, category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    size: selectedSize.size,
    threshold: selectedSize.threshold,
    reorderLevel: selectedSize.reorderQuantity,
    maxQuantity: selectedSize.maxQuantity,
    minQuantity: selectedSize.minQuantity,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare the payload for the API request
      const payload = {
        productName,
        productDescription,
        size: selectedSize.size,
        category,
        unitPrice,
        newSize: formData.size,
        minStockLevel: parseInt(formData.minQuantity),
        maxStockLevel: parseInt(formData.maxQuantity),
        reorderLevel: parseInt(formData.reorderLevel),
        threshold: parseInt(formData.threshold),
      };

      // Send a PUT request to the backend API
      const response = await axios.put("/ims/products/update", payload);

      // Handle successful update
      console.log(response.data.message);
      onSave(formData); // Update parent state if needed
      onClose();
    } catch (err) {
      console.error("Error updating product:", err.response?.data?.detail || err.message);
      setError(err.response?.data?.detail || "An error occurred while updating the product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editsize-modal-overlay">
      <div className="editsize-modal-content">
        <button className="editsize-close-btn" onClick={onClose}>
          X
        </button>
        <h2 className="editsize-h2">Edit Size</h2>
        {error && <p className="error-message">{error}</p>}
        <form>
          <div className="editsize-form-group">
            <label>Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            className="editsize-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSizeModal;