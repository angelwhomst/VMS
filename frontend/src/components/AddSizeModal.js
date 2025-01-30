import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddSizeModal.css";

const AddSizeModal = ({ productName, productDescription, unitPrice, category, imagePath, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    size: '',
    quantity: '',  
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    console.log("Modal opened with the following props:");
    console.log("Product Name:", productName);
    console.log("Product Description:", productDescription);
    console.log("Unit Price:", unitPrice);
    console.log("Category:", category);
    console.log("image_path:", imagePath);

    axios
      .get("/ims/products_details", { params: { productName } })
      .then((response) => {
        console.log("Fetched product details:", response.data);
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
        console.error("Error fetching product details:", errorMessage);
    });
    

  }, [productName]);

  const validateForm = () => {
    const errors = {};
    if (!formData.size) errors.size = "Size is required.";
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0)
      errors.quantity = "Quantity should be a positive number.";

    console.log("Validation errors:", errors);
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, Value: ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    console.log("Saving form data:", formData);
    setLoading(true);
    setError(null);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        productName,
        productDescription,
        size: formData.size,
        category,
        unitPrice: parseFloat(unitPrice),
        quantity: parseInt(formData.quantity, 10),  // Ensure it's passed as a number
        image_path: imagePath 
      };

      console.log("Payload to send:", payload);

      const response = await axios.post("http://127.0.0.1:8001/products/products_AddSize", payload);
      console.log("Server response:", response.data.message);

      onSave(formData);
      setFormData({ size: '', quantity: '' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addproduct-modal-overlay">
      <div className="addproduct-modal-content">
        <button className="addproduct-close-btn" onClick={onClose}>X</button>
        <h2 className="addproduct-h2">Add Size</h2>
        {error && <p className="error-message">{error}</p>}
        
        <form>
          <div className="addproduct-form-group">
            <label>Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
            />
            {formErrors.size && <p className="error-message">{formErrors.size}</p>}
          </div>
          <div className="addproduct-form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
            {formErrors.quantity && <p className="error-message">{formErrors.quantity}</p>}
          </div>
          <button
            type="button"
            className="addsize-submit-btn"
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

export default AddSizeModal;
