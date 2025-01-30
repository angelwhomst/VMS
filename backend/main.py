from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.vendor import router as vendor_router
from routers.products import router as products_router
from routers.orderdetails import router as orderdetails_router
from routers.orders import router as orders_router
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
import uvicorn

# Load environment variables
load_dotenv()

# Get host and port from environment variables or set defaults
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 8001))

# Initialize the FastAPI application
app = FastAPI()

# Serve static files for image uploads
app.mount("/images_upload", StaticFiles(directory="images_upload"), name="images")

# Add CORS middleware to allow requests from the React frontend (localhost:3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include the authentication router
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Include the vendor router
app.include_router(vendor_router, prefix="/vendors", tags=["Vendor Management"])

# Include the product router
app.include_router(products_router, prefix="/products", tags=["Product Management"])

# Include the order details router
app.include_router(orderdetails_router, prefix='/vms', tags=["Order Details"])

# Include the orders router
app.include_router(orders_router, prefix='/orders', tags=["Orders"])

# Add an API endpoint to serve some data (to match the React fetch URL)
@app.get("/api/data")
async def get_data():
    return {"data": "Sample data from FastAPI backend!"}

# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
