from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    additional_info: Optional[str] = None

# Trip Models
class TripCreate(BaseModel):
    name: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    cover_photo: Optional[str] = None

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    cover_photo: Optional[str] = None
    status: str = "upcoming"  # upcoming, ongoing, completed
    is_public: bool = False
    public_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TripUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    cover_photo: Optional[str] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None

# Stop Models (Cities in a trip)
class StopCreate(BaseModel):
    trip_id: str
    city_id: str
    start_date: str
    end_date: str
    order: int

class Stop(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    city_id: str
    city_name: str
    country: str
    start_date: str
    end_date: str
    order: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# City Models
class City(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    country: str
    cost_index: float  # 1-10 scale
    popularity: int  # 1-100 scale
    description: Optional[str] = None
    image_url: Optional[str] = None

# Activity Models
class ActivityTemplate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    city_id: str
    name: str
    description: Optional[str] = None
    category: str  # sightseeing, food, adventure, culture, shopping, nightlife
    duration: int  # in hours
    estimated_cost: float
    image_url: Optional[str] = None

class TripActivityCreate(BaseModel):
    stop_id: str
    activity_template_id: str
    date: str
    time: Optional[str] = None
    custom_cost: Optional[float] = None

class TripActivity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    stop_id: str
    activity_template_id: str
    activity_name: str
    activity_description: Optional[str] = None
    category: str
    duration: int
    date: str
    time: Optional[str] = None
    cost: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Expense Models
class ExpenseCreate(BaseModel):
    trip_id: str
    category: str  # transport, accommodation, food, activities, other
    amount: float
    description: Optional[str] = None
    date: str

class Expense(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    category: str
    amount: float
    description: Optional[str] = None
    date: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Community Post Models
class PostCreate(BaseModel):
    title: str
    content: str
    trip_id: Optional[str] = None

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    title: str
    content: str
    trip_id: Optional[str] = None
    likes: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== AUTH UTILITIES ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert datetime strings back to datetime objects
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.model_dump()
    del user_dict['password']
    
    user = User(**user_dict)
    user_doc = user.model_dump()
    user_doc['password'] = hashed_password
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"sub": user.id})
    
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Convert datetime string back
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password' and k != '_id'})
    token = create_access_token({"sub": user.id})
    
    return {"token": token, "user": user}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/auth/profile", response_model=User)
async def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"id": current_user.id}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password": 0})
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    
    return User(**updated_user)

# ==================== TRIP ROUTES ====================

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip_data: TripCreate, current_user: User = Depends(get_current_user)):
    trip = Trip(**trip_data.model_dump(), user_id=current_user.id)
    trip_doc = trip.model_dump()
    trip_doc['created_at'] = trip_doc['created_at'].isoformat()
    
    await db.trips.insert_one(trip_doc)
    return trip

@api_router.get("/trips", response_model=List[Trip])
async def get_trips(current_user: User = Depends(get_current_user)):
    trips = await db.trips.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for trip in trips:
        if isinstance(trip.get('created_at'), str):
            trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    return trips

@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    trip = await db.trips.find_one({"id": trip_id, "user_id": current_user.id}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if isinstance(trip.get('created_at'), str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    return Trip(**trip)

@api_router.put("/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, trip_data: TripUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in trip_data.model_dump().items() if v is not None}
    if update_dict:
        result = await db.trips.update_one(
            {"id": trip_id, "user_id": current_user.id},
            {"$set": update_dict}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Trip not found")
    
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if isinstance(trip.get('created_at'), str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    return Trip(**trip)

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    result = await db.trips.delete_one({"id": trip_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Delete related data
    await db.stops.delete_many({"trip_id": trip_id})
    await db.trip_activities.delete_many({"trip_id": trip_id})
    await db.expenses.delete_many({"trip_id": trip_id})
    
    return {"message": "Trip deleted successfully"}

@api_router.post("/trips/{trip_id}/publish")
async def publish_trip(trip_id: str, current_user: User = Depends(get_current_user)):
    public_url = str(uuid.uuid4())
    result = await db.trips.update_one(
        {"id": trip_id, "user_id": current_user.id},
        {"$set": {"is_public": True, "public_url": public_url}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"public_url": public_url}

@api_router.get("/public/trips/{public_url}")
async def get_public_trip(public_url: str):
    trip = await db.trips.find_one({"public_url": public_url, "is_public": True}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    if isinstance(trip.get('created_at'), str):
        trip['created_at'] = datetime.fromisoformat(trip['created_at'])
    
    # Get stops and activities
    stops = await db.stops.find({"trip_id": trip['id']}, {"_id": 0}).sort("order", 1).to_list(1000)
    activities = await db.trip_activities.find({"trip_id": trip['id']}, {"_id": 0}).to_list(1000)
    
    return {"trip": trip, "stops": stops, "activities": activities}

# ==================== STOP ROUTES ====================

@api_router.post("/stops", response_model=Stop)
async def create_stop(stop_data: StopCreate, current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = await db.trips.find_one({"id": stop_data.trip_id, "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get city info
    city = await db.cities.find_one({"id": stop_data.city_id}, {"_id": 0})
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    
    stop = Stop(
        **stop_data.model_dump(),
        city_name=city['name'],
        country=city['country']
    )
    stop_doc = stop.model_dump()
    stop_doc['created_at'] = stop_doc['created_at'].isoformat()
    
    await db.stops.insert_one(stop_doc)
    return stop

@api_router.get("/trips/{trip_id}/stops", response_model=List[Stop])
async def get_stops(trip_id: str, current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = await db.trips.find_one({"id": trip_id, "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    stops = await db.stops.find({"trip_id": trip_id}, {"_id": 0}).sort("order", 1).to_list(1000)
    for stop in stops:
        if isinstance(stop.get('created_at'), str):
            stop['created_at'] = datetime.fromisoformat(stop['created_at'])
    return stops

@api_router.delete("/stops/{stop_id}")
async def delete_stop(stop_id: str, current_user: User = Depends(get_current_user)):
    stop = await db.stops.find_one({"id": stop_id}, {"_id": 0})
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    # Verify trip ownership
    trip = await db.trips.find_one({"id": stop['trip_id'], "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.stops.delete_one({"id": stop_id})
    await db.trip_activities.delete_many({"stop_id": stop_id})
    
    return {"message": "Stop deleted successfully"}

# ==================== CITY ROUTES ====================

@api_router.get("/cities", response_model=List[City])
async def search_cities(search: Optional[str] = None, country: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"country": {"$regex": search, "$options": "i"}}
        ]
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    
    cities = await db.cities.find(query, {"_id": 0}).sort("popularity", -1).to_list(100)
    return cities

@api_router.get("/cities/{city_id}", response_model=City)
async def get_city(city_id: str):
    city = await db.cities.find_one({"id": city_id}, {"_id": 0})
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return City(**city)

# ==================== ACTIVITY ROUTES ====================

@api_router.get("/cities/{city_id}/activities", response_model=List[ActivityTemplate])
async def get_city_activities(
    city_id: str,
    category: Optional[str] = None,
    max_cost: Optional[float] = None
):
    query = {"city_id": city_id}
    if category:
        query["category"] = category
    if max_cost:
        query["estimated_cost"] = {"$lte": max_cost}
    
    activities = await db.activity_templates.find(query, {"_id": 0}).to_list(1000)
    return activities

@api_router.post("/trip-activities", response_model=TripActivity)
async def add_trip_activity(activity_data: TripActivityCreate, current_user: User = Depends(get_current_user)):
    # Get stop and verify ownership
    stop = await db.stops.find_one({"id": activity_data.stop_id}, {"_id": 0})
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    trip = await db.trips.find_one({"id": stop['trip_id'], "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get activity template
    template = await db.activity_templates.find_one({"id": activity_data.activity_template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    trip_activity = TripActivity(
        trip_id=stop['trip_id'],
        stop_id=activity_data.stop_id,
        activity_template_id=activity_data.activity_template_id,
        activity_name=template['name'],
        activity_description=template.get('description'),
        category=template['category'],
        duration=template['duration'],
        date=activity_data.date,
        time=activity_data.time,
        cost=activity_data.custom_cost if activity_data.custom_cost else template['estimated_cost']
    )
    
    activity_doc = trip_activity.model_dump()
    activity_doc['created_at'] = activity_doc['created_at'].isoformat()
    
    await db.trip_activities.insert_one(activity_doc)
    return trip_activity

@api_router.get("/trips/{trip_id}/activities", response_model=List[TripActivity])
async def get_trip_activities(trip_id: str, current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = await db.trips.find_one({"id": trip_id, "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    activities = await db.trip_activities.find({"trip_id": trip_id}, {"_id": 0}).to_list(1000)
    for activity in activities:
        if isinstance(activity.get('created_at'), str):
            activity['created_at'] = datetime.fromisoformat(activity['created_at'])
    return activities

@api_router.delete("/trip-activities/{activity_id}")
async def delete_trip_activity(activity_id: str, current_user: User = Depends(get_current_user)):
    activity = await db.trip_activities.find_one({"id": activity_id}, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Verify trip ownership
    trip = await db.trips.find_one({"id": activity['trip_id'], "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.trip_activities.delete_one({"id": activity_id})
    return {"message": "Activity deleted successfully"}

# ==================== EXPENSE ROUTES ====================

@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = await db.trips.find_one({"id": expense_data.trip_id, "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    expense = Expense(**expense_data.model_dump())
    expense_doc = expense.model_dump()
    expense_doc['created_at'] = expense_doc['created_at'].isoformat()
    
    await db.expenses.insert_one(expense_doc)
    return expense

@api_router.get("/trips/{trip_id}/expenses", response_model=List[Expense])
async def get_trip_expenses(trip_id: str, current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = await db.trips.find_one({"id": trip_id, "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    expenses = await db.expenses.find({"trip_id": trip_id}, {"_id": 0}).to_list(1000)
    for expense in expenses:
        if isinstance(expense.get('created_at'), str):
            expense['created_at'] = datetime.fromisoformat(expense['created_at'])
    return expenses

@api_router.get("/trips/{trip_id}/budget")
async def get_trip_budget(trip_id: str, current_user: User = Depends(get_current_user)):
    # Verify trip ownership
    trip = await db.trips.find_one({"id": trip_id, "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Get all activities cost
    activities = await db.trip_activities.find({"trip_id": trip_id}, {"_id": 0}).to_list(1000)
    activities_cost = sum(a['cost'] for a in activities)
    
    # Get all expenses
    expenses = await db.expenses.find({"trip_id": trip_id}, {"_id": 0}).to_list(1000)
    
    # Calculate breakdown
    breakdown = {
        "transport": sum(e['amount'] for e in expenses if e['category'] == 'transport'),
        "accommodation": sum(e['amount'] for e in expenses if e['category'] == 'accommodation'),
        "food": sum(e['amount'] for e in expenses if e['category'] == 'food'),
        "activities": activities_cost + sum(e['amount'] for e in expenses if e['category'] == 'activities'),
        "other": sum(e['amount'] for e in expenses if e['category'] == 'other')
    }
    
    total = sum(breakdown.values())
    
    return {
        "total": total,
        "breakdown": breakdown,
        "activities_count": len(activities),
        "expenses_count": len(expenses)
    }

# ==================== COMMUNITY ROUTES ====================

@api_router.post("/posts", response_model=Post)
async def create_post(post_data: PostCreate, current_user: User = Depends(get_current_user)):
    post = Post(
        **post_data.model_dump(),
        user_id=current_user.id,
        user_name=f"{current_user.first_name} {current_user.last_name}"
    )
    post_doc = post.model_dump()
    post_doc['created_at'] = post_doc['created_at'].isoformat()
    
    await db.posts.insert_one(post_doc)
    return post

@api_router.get("/posts", response_model=List[Post])
async def get_posts(limit: int = 50):
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    return posts

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user: User = Depends(get_current_user)):
    result = await db.posts.update_one({"id": post_id}, {"$inc": {"likes": 1}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post liked"}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users_count = await db.users.count_documents({})
    trips_count = await db.trips.count_documents({})
    activities_count = await db.trip_activities.count_documents({})
    posts_count = await db.posts.count_documents({})
    
    # Top cities
    pipeline = [
        {"$group": {"_id": "$city_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_cities = await db.stops.aggregate(pipeline).to_list(10)
    
    return {
        "users_count": users_count,
        "trips_count": trips_count,
        "activities_count": activities_count,
        "posts_count": posts_count,
        "top_cities": top_cities
    }

# ==================== BASIC ROUTE ====================

@api_router.get("/")
async def root():
    return {"message": "GlobeTrotter API v1.0"}

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