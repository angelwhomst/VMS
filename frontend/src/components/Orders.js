import React, { useState, useEffect } from "react";
import "./Orders.css";
import { FaBox, FaShoppingCart, FaShippingFast, FaTruck, FaBan, FaCheckCircle, FaClipboardCheck } from "react-icons/fa";

// Utility function to send status updates to the backend
const sendOrderStatusUpdate = async (orderID, status) => {
  try {
    const response = await fetch(`https://vms-production.up.railway.app/orders/vms/orders/${orderID}/confirm`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderStatus: status }),
    });
    if (!response.ok) {
      throw new Error("Failed to update order status");
    }
    const data = await response.json();
    console.log(`Order ID ${orderID} status updated to: ${status}`);
    return data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

const sendOrderToShipped = async (orderID, setShippedOrders, setToShipOrders, toShipOrders) => {
  try {
    const response = await fetch(`https://vms-production.up.railway.app/orders/vms/orders/${orderID}/toship`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderStatus: "Shipped" }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order status to Shipped");
    }

    const data = await response.json();
    console.log(`Order ID ${orderID} status updated to: Shipped`);

    // After updating, move the order to 'Shipped' in UI state
    setShippedOrders((prev) => [...prev, ...toShipOrders.filter(order => order.id === orderID)]);
    setToShipOrders((prev) => prev.filter(order => order.id !== orderID));

    return data;
  } catch (error) {
    console.error("Error updating order status to Shipped:", error);
    throw error;
  }
};
// Add a function to move an order to 'Delivered'
const sendOrderToDelivered = async (orderID, setDeliveredOrders, setShippedOrders, shippedOrders) => {
  try {
    const response = await fetch(`https://vms-production.up.railway.app/orders/vms/orders/${orderID}/Delivered`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderStatus: "Delivered" }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order status to Delivered");
    }

    const data = await response.json();
    console.log(`Order ID ${orderID} status updated to: Delivered`);

    // After updating, move the order to 'Delivered' in UI state
    setDeliveredOrders((prev) => [...prev, ...shippedOrders.filter(order => order.id === orderID)]);
    setShippedOrders((prev) => prev.filter(order => order.id !== orderID));

    return data;
  } catch (error) {
    console.error("Error updating order status to Delivered:", error);
    throw error;
  }
};

// Add a function to move an order to 'Complete'
const sendOrderToComplete = async (orderID, setCompletedOrders, setDeliveredOrders, deliveredOrders) => {
  try {
    const response = await fetch(`https://vms-production.up.railway.app/orders/vms/orders/${orderID}/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderStatus: "Completed" }),
    });

    if (!response.ok) {
      throw new Error("Failed to update order status to Completed");
    }

    const data = await response.json();
    console.log(`Order ID ${orderID} status updated to: Completed`);

    // After updating, move the order to 'Completed' in UI state
    setCompletedOrders((prev) => [...prev, ...deliveredOrders.filter(order => order.id === orderID)]);
    setDeliveredOrders((prev) => prev.filter(order => order.id !== orderID));

    return data;
  } catch (error) {
    console.error("Error updating order status to Completed:", error);
    throw error;
  }
};

const Orders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [ToShipOrders, setToShipOrders] = useState([]);
  const [shippedOrders, setShippedOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("https://vms-production.up.railway.app/vms/order-details/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
  
        // Debugging: Log the entire API response to check if image_path is available
        console.log("API Response:", data);
  
        const formattedData = data.map((item) => ({
          id: item.orderID,
          productName: item.productName,
          category: item.category,
          size: item.size,
          quantity: item.quantity,
          customerName: item.customerName,
          address: item.warehouseAddress,
          total: `₱${item.totalPrice.toFixed(2)}`, // Format price
          image: item.image_path ? `https://vms-production.up.railway.app/${item.image_path.replace("\\", "/")}` : "https://vms-production.up.railway.app", // Make sure it’s a valid URL
        }));
        setPendingOrders(formattedData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);
  
  
//Confirmed Orders Display on To Ship
  useEffect(() => {
    const fetchConfirmedOrders = async () => {
      try {
        const response = await fetch("https://vms-production.up.railway.app/orders/confirmed/orders");
        if (!response.ok) throw new Error("Failed to fetch 'To Ship' orders");
        const data = await response.json();

        const formattedToShipOrders = data.map((item) => ({
          id: item.orderID,
          productName: item.productName,
          size: item.size,
          category: item.category,
          quantity: item.quantity,
          total: `$${item.totalPrice.toFixed(2)}`, // Format price
          customerName: item.customerName,
          address: item.warehouseAddress,
          image: item.image_path ? `https://vms-production.up.railway.app/${item.image_path.replace("\\", "/")}` : "https://vms-production.up.railway.app", // Make sure it’s a valid URL
        }));

        setToShipOrders(formattedToShipOrders);
      } catch (error) {
        console.error("Error fetching 'Confirmed' orders:", error);
      }
    };
    fetchConfirmedOrders();
  }, []);

  useEffect(() => {
    const fetchShippedOrders = async () => {
      try {
        const response = await fetch("https://vms-production.up.railway.app/orders/toship/orders");
        if (!response.ok) throw new Error("Failed to fetch 'Shipped' orders");
        const data = await response.json();
  
        const formattedShippedOrders = data.map((item) => ({
          id: item.orderID,
          productName: item.productName,
          size: item.size,
          category: item.category,
          quantity: item.quantity,
          total: `$${item.totalPrice.toFixed(2)}`, // Format price
          customerName: item.customerName,
          address: item.warehouseAddress,
          image: item.image_path ? `https://vms-production.up.railway.app/${item.image_path.replace("\\", "/")}` : "https://vms-production.up.railway.app", // Make sure it’s a valid URL
        }));
  
        setShippedOrders(formattedShippedOrders);
      } catch (error) {
        console.error("Error fetching 'Shipped' orders:", error);
      }
    };
    fetchShippedOrders();
  }, []);

  useEffect(() => {
    const fetchdeliveredOrders = async () => {
      try {
        const response = await fetch("https://vms-production.up.railway.app/orders/vms/orders/delivered");
        if (!response.ok) throw new Error("Failed to fetch 'Delivered' orders");
        const data = await response.json();
  
        const formattedDeliveredOrders = data.map((item) => ({
          id: item.orderID,
          productName: item.productName,
          size: item.size,
          category: item.category,
          quantity: item.quantity,
          total: `$${item.totalPrice.toFixed(2)}`, // Format price
          customerName: item.customerName,
          address: item.warehouseAddress,
          image: item.image_path ? `https://vms-production.up.railway.app/${item.image_path.replace("\\", "/")}` : "https://vms-production.up.railway.app", // Make sure it’s a valid URL
        }));
  
        setDeliveredOrders(formattedDeliveredOrders);
      } catch (error) {
        console.error("Error fetching 'Delivered' orders:", error);
      }
    };
    fetchdeliveredOrders();
  }, []);
  
  useEffect(() => {
    const CompletedOrders = async () => {
      try {
        const response = await fetch("https://vms-production.up.railway.app/orders/vms/orders/Completed");
        if (!response.ok) throw new Error("Failed to fetch 'Completed' orders");
        const data = await response.json();
  
        const formattedcompletedOrders = data.map((item) => ({
          id: item.orderID,
          productName: item.productName,
          size: item.size,
          category: item.category,
          quantity: item.quantity,
          total: `$${item.totalPrice.toFixed(2)}`, 
          customerName: item.customerName,
          address: item.warehouseAddress,
          image: item.image_path ? `https://vms-production.up.railway.app/${item.image_path.replace("\\", "/")}` : "https://vms-production.up.railway.app", // Make sure it’s a valid URL
        }));
  
        setCompletedOrders(formattedcompletedOrders);
      } catch (error) {
        console.error("Error fetching 'Completed' orders:", error);
      }
    };
  
    CompletedOrders(); // Call the function
  }, []);  
  
  const approveOrder = async (order) => {
    try {
      console.log(`Approving order with ID: ${order.id}`);
      const response = await sendOrderStatusUpdate(order.id, "Confirmed");

      setToShipOrders((prev) => [...prev, order]);
      setPendingOrders((prev) => prev.filter((item) => item.id !== order.id));

      console.log("Order confirmed:", response);
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const rejectOrder = async (order) => {
    try {
      console.log(`Rejecting order with ID: ${order.id}`);
      const response = await sendOrderStatusUpdate(order.id, "Rejected");

      setRejectedOrders((prev) => [...prev, order]);
      setPendingOrders((prev) => prev.filter((item) => item.id !== order.id));

      console.log("Order rejected:", response);
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const cardData = [
    { title: "Total Orders", count: pendingOrders.length + ToShipOrders.length + shippedOrders.length + rejectedOrders.length + deliveredOrders.length + completedOrders.length, icon: <FaBox /> },
    { title: "Pending", count: pendingOrders.length, icon: <FaShoppingCart /> },
    { title: "To Ship", count: ToShipOrders.length, icon: <FaShippingFast /> },
    { title: "Shipped", count: shippedOrders.length, icon: <FaTruck /> },
    { title: "Rejected", count: rejectedOrders.length, icon: <FaBan /> },
    { title: "Delivered", count: deliveredOrders.length, icon: <FaCheckCircle /> },
    { title: "Completed", count: completedOrders.length, icon: <FaClipboardCheck /> },
  ];

  return (
    <div className="history-container">
      <div className="cards-container">
        {cardData.map((card, index) => (
          <div className="card" key={index}>
            <div className="card-content">
              <div className="card-number">{card.count}</div>
              <div className="card-icon">{card.icon}</div>
            </div>
            <div className="card-title">{card.title}</div>
          </div>
        ))}
      </div>

      <div className="orders-lists">
  {/* Pending Orders */}
  <div className="orders-section">
    <h3>Pending Orders</h3>
    <div className="scrollable-list">
      {pendingOrders.map((order) => {
        // Debugging: Log the image URL to the console
        console.log("Order Image Path:", order.image);  // Log the image path here

        return (
          <div className="order-item" key={order.id}>
            <div className="order-photo">
              {/* Display product image */}
              <img
                src={order.image}
                alt={order.productName}
                className="product-image"
                style={{ width: "150px", height: "150px", objectFit: "cover" }} // Optional styling
              />
            </div>
            <div className="order-details">
              <h4>{order.productName}</h4>
              <p>Category: {order.category}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Price: {order.total}</p>
            </div>
            <div className="order-actions">
              <button className="approve-btn" onClick={() => approveOrder(order)}>
                Approve
              </button>
              <button className="reject-btn" onClick={() => rejectOrder(order)}>
                Reject
              </button>
            </div>
          </div>
        );
})}
    </div>
  </div>



        {/* To Ship Orders */}
        <div className="orders-section">
          <h3>To Ship Orders</h3>
          <div className="scrollable-list">
            {ToShipOrders.map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-photo">
                  <img src={order.image} alt={order.productName} className="product-image" />
                </div>
                <div className="order-details">
                  <h4>{order.productName}</h4>
                  <p>Category: {order.category}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: {order.total}</p>
                </div>
                <div className="order-actions">
                  <button className="ship-btn" onClick={() => sendOrderToShipped(order.id, setShippedOrders, setToShipOrders, ToShipOrders)}>
                    Ship
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipped Orders */}
        <div className="orders-section">
          <h3>Shipped Orders</h3>
          <div className="scrollable-list">
            {shippedOrders.map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-photo">
                  <img src={order.image} alt={order.productName} className="product-image" />
                </div>
                <div className="order-details">
                  <h4>{order.productName}</h4>
                  <p>Category: {order.category}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: {order.total}</p>
                </div>
                <div className="order-actions">
                  <button className="deliver-btn" onClick={() => sendOrderToDelivered(order.id, setDeliveredOrders, setShippedOrders, shippedOrders)}>
                    Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="orders-section">
          <h3>Delivered Orders</h3>
          <div className="scrollable-list">
            {deliveredOrders.map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-photo">
                  <img src={order.image} alt={order.productName} className="product-image" />
                </div>
                <div className="order-details">
                  <h4>{order.productName}</h4>
                  <p>Category: {order.category}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: {order.total}</p>
                </div>
                <div className="order-actions">
                  <button className="complete-btn" onClick={() => sendOrderToComplete(order.id, setCompletedOrders, setDeliveredOrders, deliveredOrders)}>
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Orders */}
        <div className="orders-section">
          <h3>Completed Orders</h3>
          <div className="scrollable-list">
            {completedOrders.map((order) => (
              <div className="order-item" key={order.id}>
                <div className="order-photo">
                  <img src={order.image} alt={order.productName} className="product-image" />
                </div>
                <div className="order-details">
                  <h4>{order.productName}</h4>
                  <p>Category: {order.category}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: {order.total}</p>
                </div>
                <div className="order-actions">
                  <span className="completed-status">Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
