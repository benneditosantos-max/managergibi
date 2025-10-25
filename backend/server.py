from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import jwt
from passlib.context import CryptContext
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-here-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_TIME_MINUTES = 30 * 24 * 60  # 30 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class UserRole(str, Enum):
    ADMIN = "admin"
    HELPER = "helper" 
    CLIENT = "client"

class JobStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class JobType(str, Enum):
    REGULAR = "regular"
    DEEP = "deep"
    MOVE_IN_OUT = "move_in_out"
    OFFICE = "office"
    AIRBNB = "airbnb"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    hourly_rate: Optional[float] = None  # For helpers
    availability: Optional[str] = None  # For helpers
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    hourly_rate: Optional[float] = None
    availability: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: str
    notes: Optional[str] = None
    total_spent: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: str
    notes: Optional[str] = None

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    client_name: str
    address: str
    date: datetime
    duration_hours: float
    job_type: JobType
    price_charged: float
    helper_id: Optional[str] = None
    helper_name: Optional[str] = None
    status: JobStatus = JobStatus.SCHEDULED
    actual_duration: Optional[float] = None
    helper_payment: Optional[float] = None
    operational_cost: Optional[float] = None
    subcontract_cost: Optional[float] = None
    net_profit: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobCreate(BaseModel):
    client_id: str
    date: datetime
    duration_hours: float
    job_type: JobType
    price_charged: float
    helper_id: Optional[str] = None
    notes: Optional[str] = None

class JobUpdate(BaseModel):
    status: Optional[JobStatus] = None
    actual_duration: Optional[float] = None
    helper_payment: Optional[float] = None
    operational_cost: Optional[float] = None
    subcontract_cost: Optional[float] = None
    notes: Optional[str] = None

# New models for subcontracting system
class Subcontractor(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    commission_rate: float = Field(ge=0, le=100)  # Percentage (0-100)
    specialties: Optional[List[str]] = None
    active: bool = Field(default=True)
    total_jobs: int = Field(default=0)
    total_revenue: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubcontractorCreate(BaseModel):
    name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    commission_rate: float = Field(ge=0, le=100)
    specialties: Optional[List[str]] = None

# Route optimization model (mocked)
class Route(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime
    helper_id: str
    jobs: List[str]  # Job IDs
    total_distance_miles: float
    total_travel_time_minutes: int
    fuel_cost: float
    optimized: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Notification model (mocked)
class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # 'job_reminder', 'job_complete', 'payment_due', etc.
    read: bool = Field(default=False)
    sent_via: str = Field(default="in_app")  # 'in_app', 'email', 'sms'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardStats(BaseModel):
    total_jobs_today: int
    total_jobs_week: int
    total_jobs_month: int
    total_revenue: float
    total_costs: float
    net_profit: float
    active_helpers: int
    total_clients: int

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRATION_TIME_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user is None:
        raise credentials_exception
    
    # Convert timestamp back from ISO string
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Convert ISO strings back to datetime objects from MongoDB"""
    datetime_fields = ['created_at', 'updated_at', 'date']
    for field in datetime_fields:
        if field in item and isinstance(item[field], str):
            try:
                item[field] = datetime.fromisoformat(item[field])
            except ValueError:
                pass  # Skip if not a valid ISO string
    return item

# Authentication routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.model_dump()
    del user_dict['password']
    user_obj = User(**user_dict)
    
    # Prepare for MongoDB
    doc = prepare_for_mongo(user_obj.model_dump())
    doc['hashed_password'] = hashed_password
    
    await db.users.insert_one(doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_obj.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user.get('hashed_password', '')):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Parse datetime fields
    user = parse_from_mongo(user)
    user_obj = User(**user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_obj.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj
    }

# Dashboard routes
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    # Convert dates to ISO strings for MongoDB queries
    today_str = today.isoformat()
    week_start_str = week_start.isoformat()
    month_start_str = month_start.isoformat()
    
    # Get jobs counts
    jobs_today = await db.jobs.count_documents({
        "date": {"$gte": f"{today_str}T00:00:00", "$lt": f"{today_str}T23:59:59"}
    })
    
    jobs_week = await db.jobs.count_documents({
        "date": {"$gte": f"{week_start_str}T00:00:00"}
    })
    
    jobs_month = await db.jobs.count_documents({
        "date": {"$gte": f"{month_start_str}T00:00:00"}
    })
    
    # Get financial data
    all_jobs = await db.jobs.find({}, {"_id": 0}).to_list(None)
    
    total_revenue = sum(job.get('price_charged', 0) or 0 for job in all_jobs)
    total_costs = sum(
        ((job.get('helper_payment') or 0) + 
         (job.get('operational_cost') or 0) + 
         (job.get('subcontract_cost') or 0)) 
        for job in all_jobs
    )
    net_profit = total_revenue - total_costs
    
    # Get counts
    active_helpers = await db.users.count_documents({"role": "helper"})
    total_clients = await db.clients.count_documents({})
    
    return DashboardStats(
        total_jobs_today=jobs_today,
        total_jobs_week=jobs_week,
        total_jobs_month=jobs_month,
        total_revenue=total_revenue,
        total_costs=total_costs,
        net_profit=net_profit,
        active_helpers=active_helpers,
        total_clients=total_clients
    )

# Job routes
@api_router.post("/jobs", response_model=Job)
async def create_job(job_data: JobCreate, current_user: User = Depends(get_current_user)):
    # Get client info
    client = await db.clients.find_one({"id": job_data.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get helper info if specified
    helper_name = None
    if job_data.helper_id:
        helper = await db.users.find_one({"id": job_data.helper_id, "role": "helper"}, {"_id": 0})
        if helper:
            helper_name = helper.get('name')
    
    # Create job
    job_dict = job_data.model_dump()
    job_dict['client_name'] = client['name']
    job_dict['address'] = client['address']
    job_dict['helper_name'] = helper_name
    
    job_obj = Job(**job_dict)
    
    # Prepare for MongoDB
    doc = prepare_for_mongo(job_obj.model_dump())
    
    await db.jobs.insert_one(doc)
    return job_obj

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(current_user: User = Depends(get_current_user)):
    query = {}
    if current_user.role == UserRole.HELPER:
        query["helper_id"] = current_user.id
    
    jobs = await db.jobs.find(query, {"_id": 0}).to_list(None)
    
    # Parse datetime fields
    for job in jobs:
        job = parse_from_mongo(job)
    
    return [Job(**job) for job in jobs]

@api_router.put("/jobs/{job_id}")
async def update_job(job_id: str, job_update: JobUpdate, current_user: User = Depends(get_current_user)):
    # Find job
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check permissions
    if current_user.role == UserRole.HELPER and job.get('helper_id') != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this job")
    
    # Prepare update data
    update_data = prepare_for_mongo(job_update.model_dump(exclude_unset=True))
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    # Calculate net profit if costs are updated
    if any(key in update_data for key in ['helper_payment', 'operational_cost', 'subcontract_cost']):
        price_charged = job.get('price_charged', 0) or 0
        helper_payment = update_data.get('helper_payment', job.get('helper_payment') or 0) or 0
        operational_cost = update_data.get('operational_cost', job.get('operational_cost') or 0) or 0
        subcontract_cost = update_data.get('subcontract_cost', job.get('subcontract_cost') or 0) or 0
        
        update_data['net_profit'] = price_charged - (helper_payment + operational_cost + subcontract_cost)
    
    await db.jobs.update_one({"id": job_id}, {"$set": update_data})
    
    return {"message": "Job updated successfully"}

# Client routes
@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    client_obj = Client(**client_data.model_dump())
    
    # Prepare for MongoDB
    doc = prepare_for_mongo(client_obj.model_dump())
    
    await db.clients.insert_one(doc)
    return client_obj

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: User = Depends(get_current_user)):
    clients = await db.clients.find({}, {"_id": 0}).to_list(None)
    
    # Parse datetime fields
    for client in clients:
        client = parse_from_mongo(client)
    
    return [Client(**client) for client in clients]

# Helper routes
@api_router.get("/helpers", response_model=List[User])
async def get_helpers(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    helpers = await db.users.find({"role": "helper"}, {"_id": 0, "hashed_password": 0}).to_list(None)
    
    # Parse datetime fields
    for helper in helpers:
        helper = parse_from_mongo(helper)
    
    return [User(**helper) for helper in helpers]

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Gabi Cleaning Manager API"}

@api_router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()