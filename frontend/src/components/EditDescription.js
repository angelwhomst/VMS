import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditDescription.css";

const EditDescription = ({ onClose, productData }) => {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    unitPrice: "",
    image_path: null, // Base64 image string
  });

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when editing an existing product
  useEffect(() => {
    if (productData) {
      setFormData({
        productName: productData.productName || "",
        productDescription: productData.productDescription || "",
        unitPrice: productData.unitPrice || "",
        image_path: productData.image_path || null,
      });
    }
  }, [productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevState) => ({ ...prevState, image_path: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.productName || !formData.productDescription || !formData.unitPrice || !formData.image_path) {
      setShowErrorModal(true); // Show error modal if any field is missing
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare JSON payload
      const payload = {
        productName: formData.productName,
        productDescription: formData.productDescription,
        unitPrice: parseFloat(formData.unitPrice), // Ensure it's a number
        image: formData.image_path, // Base64 string
      };

      const apiUrl = productData ? `http://127.0.0.1:8001/products/products/${productData.id}` : "http://127.0.0.1:8001/products/products";

      // Send POST request to the API (UPDATE for editing or POST for new)
      const response = await axios({
        method: productData ? "PUT" : "POST", // Use PUT if editing, POST if adding
        url: apiUrl,
        data: payload,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Product added/updated:", response.data); // Log successful response
      onClose(); // Close the form
    } catch (error) {
      console.error("Error adding/updating product:", error);
      alert("Failed to add/update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Edit Product Description</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={handleChange}
              placeholder="Enter product description"
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="text"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div className="image-placeholder">
                {formData.image_path ? (
                  <img
                    src={formData.image_path}
                    alt="Product"
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                  />
                ) : (
                  <p>Upload Image</p>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Product"}
          </button>
        </form>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="addproduct-modal-overlay">
          <div className="addproduct-modal-content">
            <h2>Missing Fields</h2>
            <p>All fields are required. Please fill in all the fields.</p>
            <button className="addproduct-submit-btn" onClick={closeErrorModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDescription;
