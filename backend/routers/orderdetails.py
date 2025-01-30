from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List
import database  
import logging

# Create a response model for the order details
class OrderDetails(BaseModel):
    orderID: Optional[int] = None
    productID: int
    productName: str
    quantity: int
    warehouseID: int
    vendorID: int
    vendorName: Optional[str] = "Not provided"
    customerFirstName: Optional[str] = "Not provided"
    customerLastName: Optional[str] = "Not provided"
    orderDate: Optional[datetime] = None
    expectedDate: Optional[datetime] = None
    userID: int

class PurchaseOrder(BaseModel):
    orderID: int
    orderDate: datetime
    expectedDate: datetime
    orderStatus: str
    statusDate: datetime


class OrderSummary(BaseModel):
    orderID: int
    productName: str
    size: str
    category: str
    quantity: int
    totalPrice: float
    customerName: str
    warehouseAddress: str
    image_path: str

# Create a router for order details
router = APIRouter()

def parse_datetime(date_str):
    """Convert string timestamp to datetime format for SQL Server."""
    if isinstance(date_str, str):
        try:
            return datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')  # Standard format
        except ValueError:
            try:
                return datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S.%f')  # Handles milliseconds
            except ValueError:
                return datetime.strptime(date_str, '%Y-%m-%d')  # Handles date only
    return date_str  # If already datetime, return as-is


@router.post("/orders", response_model=OrderDetails)
async def display_order(payload: dict):
    conn = None
    try:
        # Log the incoming payload for debugging purposes
        print("Received Payload:", payload)

        # Validate required fields
        required_fields = ["productName", "productDescription", "size", "color", "category", "quantity", "warehouseID", "vendorID", "userID"]
        missing_fields = [field for field in required_fields if field not in payload]
        if missing_fields:
            raise HTTPException(
                status_code=400, detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # correct data types
        payload["quantity"] = int(payload["quantity"])
        payload["vendorID"] = int(payload["vendorID"])
        payload["userID"] = int(payload["userID"])

        # Establish database connection
        conn = await database.get_db_connection()
        cursor = await conn.cursor()

        # Check if the product exists in the Products table
        product_query = """
        SELECT productID FROM Products 
        WHERE productName = ? AND productDescription = ? AND size = ? AND color = ? AND category = ?
        """
        await cursor.execute(
            product_query,
            (payload["productName"], payload["productDescription"], payload["size"], payload["color"], payload["category"])
        )
        product_result = await cursor.fetchone()
        if not product_result:
            raise HTTPException(status_code=404, detail="Product not found.")

        product_id = product_result[0] 

        # Create OrderDetails instance
        order_details = OrderDetails(
            productID=product_id,
            productName=payload.get("productName"),
            quantity=payload.get("quantity"),
            warehouseID=payload.get("warehouseID"),
            vendorID=payload.get("vendorID"),
            userID=payload.get("userID"),
            vendorName=payload.get("vendorName", "Not provided"),
            orderDate=payload.get("orderDate"),
            expectedDate=payload.get("expectedDate"),
        )

        # Fetch vendorName if available
        await cursor.execute("SELECT TOP 1 vendorName FROM vendors WHERE vendorID = ? AND isActive = 1", 
                             (payload["vendorID"],))
        vendor_result = await cursor.fetchone()
        vendor_name = vendor_result[0] if vendor_result else "Vendor not found or inactive"

        # Convert orderDate and expectedDate to proper formats
        order_date = parse_datetime(payload.get("orderDate"))
        expected_date = parse_datetime(payload.get("expectedDate"))
        status_date = parse_datetime(datetime.utcnow())

        # Ensure customer exists
        await cursor.execute("SELECT customerID FROM Customers WHERE customerID = ?", (payload["userID"],))
        customer_record = await cursor.fetchone()
        if not customer_record:
            await cursor.execute(
                """
                INSERT INTO Customers (customerName, customerWarehouseName, customerAddress)
                VALUES (?, ?, ?)
                """,
                (
                    payload.get("userName", "Unknown"),
                    payload.get("warehouseName", "Unknown Warehouse"),
                    payload.get("warehouseAddress", "Unknown Address"),
                ),
            )
            await conn.commit()
            customer_id = payload["userID"]
        else:
            customer_id = customer_record[0]

        # Insert into purchaseOrders table
        await cursor.execute(
            """
            INSERT INTO purchaseOrders (vendorID, customerID, orderDate, orderStatus, statusDate)
            OUTPUT inserted.orderID
            VALUES ( ?, ?, ?, ?, ?)
            """,
            (
                payload["vendorID"],
                customer_id,
                order_date.strftime('%Y-%m-%d') if order_date else None,
                "Pending",
                status_date,
            ),
        )
        vms_order_id = await cursor.fetchone()
        if not vms_order_id:
            raise HTTPException(status_code=400, detail="Failed to create purchase order.")

        vms_order_id = vms_order_id[0]

        # Insert into purchaseOrderDetails table
        await cursor.execute(
            """
            INSERT INTO purchaseOrderDetails (orderID, productID, orderQuantity, expectedDate)
            VALUES (?, ?, ?, ?)
            """,
            (
                vms_order_id,
                product_id,
                payload["quantity"],
                expected_date.strftime('%Y-%m-%d') if expected_date else None,
            ),
        )
        await conn.commit()

        # Close cursor and connection
        await cursor.close()
        await conn.close()

        return OrderDetails(
            productID=product_id,
            productName=payload["productName"],
            quantity=payload["quantity"],
            warehouseID=payload["warehouseID"],
            vendorID=payload["vendorID"],
            userID=payload["userID"],
            vendorName=vendor_name,
            orderDate=order_date.strftime('%Y-%m-%d'),
            expectedDate=expected_date.strftime('%Y-%m-%d') if expected_date else None,
        )

    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing the order: {str(e)}")
    finally:
        if conn:
            await conn.close()

@router.get("/order-details/orders", response_model=List[OrderSummary])
async def get_order_details():
    conn = None
    try:
        # Establish database connection
        conn = await database.get_db_connection()
        cursor = await conn.cursor()

        # Query to fetch required fields, including TotalPrice, CustomerName, WarehouseAddress, and ImagePath
        query = """
        SELECT 
            po.orderID,  -- Include orderID
            p.productName, 
            p.size, 
            p.category, 
            pod.orderQuantity AS quantity,
            (p.unitPrice * pod.orderQuantity) AS totalPrice,
            c.customerName,
            c.customerAddress AS warehouseAddress,
            p.image_path  -- Include imagePath from the Products table
        FROM 
            purchaseOrderDetails pod
        JOIN 
            Products p ON pod.productID = p.productID
        JOIN 
            purchaseOrders po ON pod.orderID = po.orderID
        JOIN 
            Customers c ON po.customerID = c.customerID
        WHERE
            po.orderStatus = 'Pending'  -- Filter orders by 'Pending' status
		order by po.orderDate desc
        """
        await cursor.execute(query)
        results = await cursor.fetchall()

        # Format results into response model
        order_summaries = [
            OrderSummary(
                orderID=row[0],  # Map orderID
                productName=row[1],
                size=row[2],
                category=row[3],
                quantity=row[4],
                totalPrice=row[5],
                customerName=row[6],
                warehouseAddress=row[7],
                image_path=row[8]  # Map imagePath
            )
            for row in results
        ]

        # Close cursor and connection
        await cursor.close()
        await conn.close()

        return order_summaries

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching order details: {str(e)}")
    finally:
        if conn:
            await conn.close()
