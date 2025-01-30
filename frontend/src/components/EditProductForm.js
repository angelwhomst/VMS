import React, { useState, useEffect } from 'react';
import './EditProductForm.css';
import EditSizeModal from './EditSizeModal';
import AddSizeModal from './AddSizeModal';

const EditProductForm = ({ product, category, onClose }) => {
  const [productData, setProductData] = useState(product);
  const [size, setSize] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [selectedSizeDetails, setSelectedSizeDetails] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddSizeModalOpen, setAddSizeModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Ensure category is part of the productData state
  useEffect(() => {
    if (product) {
      setProductData({
        ...product,
        category: category,
      });
    }
  }, [product, category]);

  // Fetch sizes based on category
  useEffect(() => {
    if (productData) {
      const fetchSize = async () => {
        try {
          const categoryParam = productData.category;
          const url = `http://127.0.0.1:8001/products/products/sizes?productName=${encodeURIComponent(productData.productName)}&unitPrice=${productData.unitPrice}&productDescription=${encodeURIComponent(productData.productDescription)}&category=${encodeURIComponent(categoryParam)}`;

          console.log(`[Fetch Sizes] URL: ${url}`);

          const response = await fetch(url);
          console.log(`[Fetch Sizes] Response Status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`[Fetch Sizes] Response Data:`, data);

            // Check if the returned data is in the expected format
            if (Array.isArray(data.size)) {
              setSize(data.size);

              // Log current stock of each size fetched
              data.size.forEach((sizeItem) => {
                console.log(`[Fetch Sizes] Current Stock for Size ${sizeItem.size}:`, sizeItem.currentStock || 'Not available');
              });
            } else {
              console.warn(`[Fetch Sizes] Invalid data format received. Expected 'size' to be an array.`);
              setSize([]);
              setError("Invalid size data received.");
            }
          } else {
            console.error(`[Fetch Sizes] Failed with status: ${response.status}`);
            setSize([]);
            setError("Failed to fetch product size.");
          }
        } catch (error) {
          console.error(`[Fetch Sizes] Error:`, error);
          setSize([]);
          setError("An error occurred while fetching product size.");
        }
      };
      fetchSize();
    }
  }, [productData]);

  // Fetch size variants based on category
  useEffect(() => {
    if (productData) {
      const fetchSizeVariants = async () => {
        try {
          const categoryParam = productData.category;
          const url = `http://127.0.0.1:8001/products/products/size_variants?productName=${encodeURIComponent(productData.productName)}&unitPrice=${productData.unitPrice}&productDescription=${encodeURIComponent(productData.productDescription || '')}&category=${encodeURIComponent(categoryParam)}`;

          console.log(`[Fetch Size Variants] URL: ${url}`);

          const response = await fetch(url);
          console.log(`[Fetch Size Variants] Response Status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`[Fetch Size Variants] Response Data:`, data);

            if (Array.isArray(data)) {
              setSizeVariants(data);
            } else {
              console.warn(`[Fetch Size Variants] Invalid data format received. Expected data to be an array.`);
              setSizeVariants([]);
            }
          } else {
            console.error(`[Fetch Size Variants] Failed with status: ${response.status}`);
            setSizeVariants([]);
          }
        } catch (error) {
          console.error(`[Fetch Size Variants] Error:`, error);
          setSizeVariants([]);
        }
      };
      fetchSizeVariants();
    }
  }, [productData]);

  const handleSizeClick = (selectedSize) => {
    console.log("[Handle Size Click] Selected Size:", selectedSize);
    setProductData((prevData) => ({
      ...prevData,
      selectedSize,
    }));

    const sizeDetails = size.find((item) => item.size === selectedSize.size);
    setSelectedSizeDetails(sizeDetails || null);

    // Log the current stock of the selected size
    if (sizeDetails) {
      console.log(`[Handle Size Click] Current Stock for Selected Size ${sizeDetails.size}:`, sizeDetails.currentStock || 'Not available');
    }
  };

  const handleDeleteSize = async (sizeToDelete) => {
    if (!sizeToDelete) {
      console.error("No size selected for deletion.");
      return;
    }
  
    console.log("[Handle Delete Size] Deleting Size:", sizeToDelete);
  
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/products/products/sizes/soft-delete?productName=${encodeURIComponent(productData.productName)}&unitPrice=${encodeURIComponent(productData.unitPrice)}&category=${encodeURIComponent(productData.category)}&size=${encodeURIComponent(sizeToDelete.size)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.ok) {
        console.log("[Handle Delete Size] Successfully deleted size:", sizeToDelete);
        // Update the local state to reflect the deletion
        const updatedSize = size.filter((sizeItem) => sizeItem.size !== sizeToDelete.size);
        setSize(updatedSize);
        setSelectedSizeDetails(null);
      } else {
        const errorData = await response.json();
        console.error("[Handle Delete Size] Failed to delete size:", errorData.detail || "Unknown error");
        alert(`Failed to delete size: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[Handle Delete Size] Error occurred:", error);
      alert("An error occurred while attempting to delete the size. Please try again.");
    }
  };
  

  const handleSaveSize = (updatedSizeDetails) => {
    console.log("[Handle Save Size] Saving Updated Size Details:", updatedSizeDetails);
    const updatedSize = size.map((sizeItem) =>
      sizeItem.size === selectedSizeDetails.size ? { ...sizeItem, ...updatedSizeDetails } : sizeItem
    );
    setSize(updatedSize);
    setSelectedSizeDetails(updatedSizeDetails);
  };

  const handleAddSize = () => {
    console.log("[Handle Add Size] Opening Add Size Modal");
    setAddSizeModalOpen(true);
  };

  return (
    <div className="edit-product-form">
      {/* Close Button */}
      <button className="Editp-close-button" onClick={onClose}>x</button>

      <div className="scrollable-container">
        {/* Photo Section */}
        <div className="photo-section">
          <div className="photo-placeholder">
            {productData.imageURL ? (
              <img src={productData.imageURL} alt={productData.productName} />
            ) : (
              'No Photo Available'
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="details-section">
          <div className="details">
            <p><strong>PRODUCT NAME:</strong> {productData.productName}</p>
            <p><strong>DESCRIPTION:</strong> {productData.productDescription}</p>
            <p><strong>PRICE:</strong> {productData.unitPrice}</p>
          </div>
        </div>

        {/* Size Section */}
        <div className="size-options">
          {size.length === 0 ? (
            <p>No sizes available</p>
          ) : (
            size.map((sizeItem, index) => (
              <button key={index} className="size-button" onClick={() => handleSizeClick(sizeItem)}>
                {sizeItem.size}
              </button>
            ))
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="actions-section">
          <button className="action-button save-button" onClick={() => setEditModalOpen(true)}>EDIT</button>
          <button className="action-button delete-button" onClick={() => handleDeleteSize(selectedSizeDetails)}>DELETE</button>
          <button className="action-button add-size-button" onClick={handleAddSize}>ADD SIZE</button>
        </div>

        {/* Size Information */}
        {selectedSizeDetails && (
          <div className="size-details">
            <h4>Selected Size Details</h4>
            <p><strong>Quantity:</strong> {selectedSizeDetails.currentStock}</p>
          </div>
        )}

        {/* Table Section */}
        <div className="table-section">
          <h3>Size Information</h3>
          <table className="size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Barcode</th>
                <th>Product Code</th>
              </tr>
            </thead>
            <tbody>
              {sizeVariants.length > 0 ? (
                sizeVariants.map((variant, index) => (
                  <tr key={index}>
                    <td>{variant.size}</td>
                    <td>{variant.barcode || 'N/A'}</td>
                    <td>{variant.productCode || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">Loading size variants...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Edit Size Modal */}
      {isEditModalOpen && selectedSizeDetails && (
        <EditSizeModal
          selectedSize={selectedSizeDetails}
          productName={productData.productName}
          productDescription={productData.productDescription}
          unitPrice={productData.unitPrice}
          category={productData.category}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveSize}
        />
      )}

      {/* Add Size Modal */}
      {isAddSizeModalOpen && (
        <AddSizeModal
          onClose={() => {
            console.log("[Handle Add Size] Closing Add Size Modal");
            setAddSizeModalOpen(false);
          }}
          onSave={(newSize) => {
            console.log("[Handle Add Size] Saving New Size:", newSize);
            setSize((prevSize) => [...prevSize, newSize]);
            setAddSizeModalOpen(false);
          }}
          productName={productData.productName}
          productDescription={productData.productDescription}
          unitPrice={productData.unitPrice}
          category={productData.category}
          imagePath={productData.image_path} 
        />
      )}
    </div>
  );
};

export default EditProductForm;