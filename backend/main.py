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
import requests
import httpx


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

async def get_current_ip():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get('https://api.ipify.org?format=json')
            ip_data = response.json()
            return ip_data.get('ip')
    except httpx.RequestError as e:
        print(f"Error fetching IP: {e}")
        return None

async def update_firewall_rule(current_ip):
    webhook_url = 'https://0d152165-a384-45db-be15-cdf5ef189153.webhook.sea.azure-automation.net/webhooks?token=ryufougkn8Iw6xNFKWFC%2fAKFnauE3Qifjv8Tlkynrhs%3d'
    data = {
        'sqlServerName': 'ims-vms.database.windows.net',
        'resourceGroupName': 'YourResourceGroup',
        'ipAddress': current_ip
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=data)
            if response.status_code == 200:
                print("Firewall rule updated successfully")
            else:
                print(f"Failed to update firewall rule: {response.status_code}")
    except httpx.RequestError as e:
        print(f"Error while sending request to webhook: {e}")

@app.on_event("startup")
async def on_startup():
    current_ip = await get_current_ip()
    if current_ip:
        await update_firewall_rule(current_ip)
    else:
        print("Could not retrieve current IP address.")

@app.post("/update-firewall-rule")
async def trigger_update():
    current_ip = await get_current_ip()
    if current_ip:
        await update_firewall_rule(current_ip)
        return {"status": "Firewall rule update triggered"}
    else:
        return {"status": "Failed to retrieve current IP"}

# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
