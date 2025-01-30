import React, { useState } from "react";
import axios from "axios";
import "./AddProductsForm.css";

const AddProductsForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    unitPrice: "",
    category: "",
    size: "",
    quantity: "",
    image_path: null, // Base64 image string
  });

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for size and price fields
    if (name === "size" || name === "unitPrice") {
      const regex = /^[0-9]*\.?[0-9]*$/; // Matches numbers with an optional decimal point
      if (!regex.test(value)) {
        return; // Ignore invalid input
      }
    }

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
    if (
      !formData.productName ||
      !formData.productDescription ||
      !formData.unitPrice ||
      !formData.category ||
      !formData.size ||
      !formData.quantity ||
      !formData.image_path
    ) {
      setShowErrorModal(true); // Show error modal if any field is missing
      return;
    }
  
    try {
      setIsSubmitting(true);
  
      // Prepare JSON payload
      const payload = {
        productName: formData.productName,
        productDescription: formData.productDescription,
        size: formData.size,
        category: formData.category,
        unitPrice: parseFloat(formData.unitPrice), // Ensure it's a number
        quantity: parseInt(formData.quantity), // Ensure it's an integer
        image: formData.image_path, // Base64 string
      };
  
      // Send POST request to the API
      const response = await axios.post(
        "https://vms-production.up.railway.app/products/products",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Product added:", response.data); // Log successful response
  
      // Pass the new product back to the Products component
      onClose(response.data); // Pass the newly added product to the parent
  
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
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
        <h2>Add Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-scroll-container">
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
              <label>Size</label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="Enter size"
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter product quantity"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                <option value="Men's Leather Shoes">Men's Leather Shoes</option>
                <option value="Women's Leather Shoes">Women's Leather Shoes</option>
                <option value="Girl's Leather Shoes">Girl's Leather Shoes</option>
                <option value="Boy's Leather Shoes">Boy's Leather Shoes</option>
              </select>
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

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Product"}
            </button>
          </div>
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

export default AddProductsForm;
