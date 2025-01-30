import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Products.css";
import AddProductsForm from "./AddProductsForm";
import EditProductForm from "./EditProductForm";
import EditDescription from "./EditDescription";

const Products = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState({
    women: [],
    men: [],
    girls: [],
    boys: [],
  });

  useEffect(() => {
    fetchWomenProducts();
  
  }, []);

  const fetchWomenProducts = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8001/products/products/Womens-Leather-Shoes"
      );
      console.log("Fetched women's products response:", response.data);

      const womenProducts = response.data || [];
      setProducts((prevState) => ({
        ...prevState,
        women: womenProducts.map((product) => {
          const imageURL = product.image_path;
          return {
            ...product,
            imageURL: `http://127.0.0.1:8001/${imageURL}`,
          };
        }),
      }));
    } catch (error) {
      console.error("Error fetching women's products:", error);
    }
  };

  // Repeat the fetch logic for men's, girls', and boys' products (omitted for brevity)
  useEffect(() => {
    console.log("Fetching men's products...");
    fetchmenProducts();
  }, []);
  const fetchmenProducts = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8001/products/products/mens-Leather-Shoes"
      );
      console.log("Fetched men's products response:", response.data);
      const menProducts = response.data || [];
      setProducts((prevState) => ({
        ...prevState,
        men: menProducts.map((product) => {
          const imageURL = product.image_path;
          return {
            ...product,
            imageURL: `http://127.0.0.1:8001/${imageURL}`,
          };
        }),
      }));
    } catch (error) {
      console.error("Error fetching men's products:", error);
    }
  };
  useEffect(() => {
    console.log("Fetching girls's products...");
    fetchgirlsProducts();
  }, []);
  const fetchgirlsProducts = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8001/products/products/girls-Leather-Shoes"
      );
      console.log("Fetched girls's products response:", response.data);
      const girlsProducts = response.data || [];
      setProducts((prevState) => ({
        ...prevState,
        girls: girlsProducts.map((product) => {
          const imageURL = product.image_path;
          return {
            ...product,
            imageURL: `http://127.0.0.1:8001/${imageURL}`,
          };
        }),
      }));
    } catch (error) {
      console.error("Error fetching girl's products:", error);
    }
  };
  useEffect(() => {
    console.log("Fetching boy's products...");
    fetchboysProducts();
  }, []);
  const fetchboysProducts = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8001/products/products/boys-Leather-Shoes"
      );
      console.log("Fetched boy's products response:", response.data);
      const boysProducts = response.data || [];
      setProducts((prevState) => ({
        ...prevState,
        boys: boysProducts.map((product) => {
          const imageURL = product.image_path;
          return {
            ...product,
            imageURL: `http://127.0.0.1:8001/${imageURL}`,
          };
        }),
      }));
    } catch (error) {
      console.error("Error fetching boy's products:", error);
    }
  };


  const openAddModal = () => {
    console.log("Opening Add Product modal");
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    console.log("Closing Add Product modal");
    setIsAddModalOpen(false);
  };

  const openEditModal = (product, index, category) => {
    console.log("Opening Edit Product modal for:", { product, index, category });
    setSelectedProduct({
      product,
      index,
      category,
      imageURL: product.imageURL,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    console.log("Closing Edit Product modal");
    setIsEditModalOpen(false);
  };

  const openDescriptionModal = (product, index, category) => {
    console.log("Opening Edit Description modal for:", { product, index, category });
    setSelectedProduct({
      product,
      index,
      category,
      imageURL: product.imageURL,
    });
    setIsDescriptionModalOpen(true);
  };

  const closeDescriptionModal = () => {
    console.log("Closing Edit Description modal");
    setIsDescriptionModalOpen(false);
  };

  const addProduct = (newProduct) => {
    console.log("Adding new product:", newProduct);

    // Ensure the new product has a valid image URL
    const productWithImage = {
      ...newProduct,
      imageURL: newProduct.image_path || "http://127.0.0.1:8001/placeholder.png",
    };

    // Filter only required fields
    const productWithRequiredFields = {
      productName: productWithImage.productName,
      productDescription: productWithImage.productDescription,
      category: productWithImage.category,
      unitPrice: productWithImage.unitPrice,
      imageURL: productWithImage.imageURL, // Ensure imageURL is included
    };

    setProducts((prevState) => ({
      ...prevState,
      [newProduct.category]: [...prevState[newProduct.category], productWithRequiredFields],
    }));
  };

  const editProduct = (updatedProduct, category, index) => {
    console.log("Editing product:", { updatedProduct, category, index });

    // Filter only required fields
    const updatedProductWithRequiredFields = {
      productName: updatedProduct.productName,
      productDescription: updatedProduct.productDescription,
      category: updatedProduct.category,
      unitPrice: updatedProduct.unitPrice,
      imageURL: updatedProduct.imageURL,  // Ensure imageURL is passed
    };

    const updatedProducts = [...products[category]];
    updatedProducts[index] = updatedProductWithRequiredFields;

    setProducts((prevState) => ({
      ...prevState,
      [category]: updatedProducts,
    }));
  };

  const editDescription = (updatedDescription, category, index) => {
    console.log("Editing description:", { updatedDescription, category, index });

    const updatedProduct = { ...products[category][index], productDescription: updatedDescription };
    const updatedProducts = [...products[category]];
    updatedProducts[index] = updatedProduct;

    setProducts((prevState) => ({
      ...prevState,
      [category]: updatedProducts,
    }));
  };

  const renderProductCards = (category) => {
    const displayedNames = new Set();

    return products[category].map((product, index) => {
      if (displayedNames.has(product.productName)) {
        return null; // Skip the product if it has been displayed already
      }

      displayedNames.add(product.productName); // Mark this product as displayed

      return (
        <div className="product-card" key={index}>
          <img
            src={product.imageURL || "placeholder.png"}  // Default to placeholder if no imageURL
            alt={product.productName}
            className="product-image"
            onClick={() => openEditModal(product, index, category)}  // Open the edit modal when card is clicked
          />
          <div className="product-details">
            <h4>{product.productName}</h4>
          </div>
          <button
            className="edit-btn"
            onClick={() => openDescriptionModal(product, index, category)}  // Open the description modal when edit button is clicked
          >
            Edit 
          </button>
        </div>
      );
    });
  };
  const getTotalUniqueProducts = () => {
    const allProducts = [
      ...products.women,
      ...products.men,
      ...products.girls,
      ...products.boys,
    ];
    const uniqueProducts = new Set(allProducts.map((product) => product.productName));
    return uniqueProducts.size;
  };
  return (
    
    <div className="products-container">
      <div className="dashboard">
        {/* Total Number of Unique Products */}
        <div className="category-box">
          <h2>{getTotalUniqueProducts()}</h2>
          <p>Total Products</p>
        </div>

        {/* Total Products per Category */}
        {["women", "men", "girls", "boys"].map((category) => (
           <div key={category} className="category-box">
           {/* Count unique products within each category, considering product name and size */}
           <h2>
             {new Set(
               products[category].map((product) => `${product.productName}-${product.size}`)
             ).size}
           </h2>
           <p>{category.charAt(0).toUpperCase() + category.slice(1)}</p>
         </div>
        ))}
      </div>

      <button className="add-product-btn" onClick={openAddModal}>
        Add Product
      </button>

      {isAddModalOpen && <AddProductsForm onClose={closeAddModal} addProduct={addProduct} />}

      {isEditModalOpen && selectedProduct && (
        <EditProductForm
          onClose={closeEditModal}
          product={selectedProduct.product}
          index={selectedProduct.index}
          editProduct={editProduct}
          category={selectedProduct.category}
        />
      )}

      {isDescriptionModalOpen && selectedProduct && (
        <EditDescription
          onClose={closeDescriptionModal}
          product={selectedProduct.product}
          index={selectedProduct.index}
          editDescription={editDescription}
          category={selectedProduct.category}
        />
      )}

      <div className="products-list">
        {["women", "men", "girls", "boys"].map((category) => (
          <div key={category}>
            <h3>{category.toUpperCase()}</h3>
            <div className="products-grid">
              {renderProductCards(category)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;