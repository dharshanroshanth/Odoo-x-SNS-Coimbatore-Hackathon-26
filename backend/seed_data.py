import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sample cities data
cities_data = [
    {"id": str(uuid.uuid4()), "name": "Paris", "country": "France", "cost_index": 7.5, "popularity": 95, "description": "City of lights and romance", "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"},
    {"id": str(uuid.uuid4()), "name": "Tokyo", "country": "Japan", "cost_index": 8.0, "popularity": 90, "description": "Modern metropolis meets tradition", "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"},
    {"id": str(uuid.uuid4()), "name": "New York", "country": "USA", "cost_index": 9.0, "popularity": 92, "description": "The city that never sleeps", "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9"},
    {"id": str(uuid.uuid4()), "name": "London", "country": "UK", "cost_index": 8.5, "popularity": 88, "description": "Historic capital with modern flair", "image_url": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"},
    {"id": str(uuid.uuid4()), "name": "Dubai", "country": "UAE", "cost_index": 7.0, "popularity": 85, "description": "Luxury and innovation", "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c"},
    {"id": str(uuid.uuid4()), "name": "Barcelona", "country": "Spain", "cost_index": 6.0, "popularity": 87, "description": "Art, architecture, and beaches", "image_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded"},
    {"id": str(uuid.uuid4()), "name": "Bali", "country": "Indonesia", "cost_index": 4.0, "popularity": 89, "description": "Tropical paradise", "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4"},
    {"id": str(uuid.uuid4()), "name": "Rome", "country": "Italy", "cost_index": 6.5, "popularity": 91, "description": "Ancient history and culture", "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5"},
    {"id": str(uuid.uuid4()), "name": "Sydney", "country": "Australia", "cost_index": 7.5, "popularity": 84, "description": "Harbor city with iconic landmarks", "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9"},
    {"id": str(uuid.uuid4()), "name": "Singapore", "country": "Singapore", "cost_index": 7.8, "popularity": 86, "description": "Garden city of the future", "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd"},
    {"id": str(uuid.uuid4()), "name": "Bangkok", "country": "Thailand", "cost_index": 3.5, "popularity": 88, "description": "Street food and temples", "image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365"},
    {"id": str(uuid.uuid4()), "name": "Istanbul", "country": "Turkey", "cost_index": 5.0, "popularity": 82, "description": "Where East meets West", "image_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200"},
    {"id": str(uuid.uuid4()), "name": "Amsterdam", "country": "Netherlands", "cost_index": 7.2, "popularity": 83, "description": "Canals and culture", "image_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017"},
    {"id": str(uuid.uuid4()), "name": "Prague", "country": "Czech Republic", "cost_index": 5.5, "popularity": 81, "description": "Fairy tale city", "image_url": "https://images.unsplash.com/photo-1541849546-216549ae216d"},
    {"id": str(uuid.uuid4()), "name": "Santorini", "country": "Greece", "cost_index": 6.8, "popularity": 90, "description": "White and blue paradise", "image_url": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e"},
]

# Sample activities for each city
activities_templates = {
    "Paris": [
        {"name": "Eiffel Tower Visit", "category": "sightseeing", "duration": 3, "estimated_cost": 30, "description": "Visit the iconic iron tower"},
        {"name": "Louvre Museum Tour", "category": "culture", "duration": 4, "estimated_cost": 20, "description": "World's largest art museum"},
        {"name": "Seine River Cruise", "category": "sightseeing", "duration": 2, "estimated_cost": 15, "description": "Romantic boat ride"},
        {"name": "French Cooking Class", "category": "food", "duration": 3, "estimated_cost": 80, "description": "Learn to cook French cuisine"},
        {"name": "Montmartre Walking Tour", "category": "culture", "duration": 3, "estimated_cost": 25, "description": "Explore artistic neighborhood"},
    ],
    "Tokyo": [
        {"name": "Tokyo Skytree", "category": "sightseeing", "duration": 2, "estimated_cost": 25, "description": "Tallest structure in Japan"},
        {"name": "Tsukiji Fish Market", "category": "food", "duration": 2, "estimated_cost": 40, "description": "Fresh sushi breakfast"},
        {"name": "Shibuya Crossing Experience", "category": "sightseeing", "duration": 1, "estimated_cost": 0, "description": "World's busiest crossing"},
        {"name": "Traditional Tea Ceremony", "category": "culture", "duration": 2, "estimated_cost": 50, "description": "Japanese tea ritual"},
        {"name": "Akihabara Gaming Tour", "category": "shopping", "duration": 3, "estimated_cost": 30, "description": "Electronics and anime district"},
    ],
    "New York": [
        {"name": "Statue of Liberty", "category": "sightseeing", "duration": 4, "estimated_cost": 25, "description": "Iconic American symbol"},
        {"name": "Central Park Bike Tour", "category": "adventure", "duration": 3, "estimated_cost": 35, "description": "Explore the urban oasis"},
        {"name": "Broadway Show", "category": "culture", "duration": 3, "estimated_cost": 120, "description": "World-class theater"},
        {"name": "Times Square Night Walk", "category": "sightseeing", "duration": 2, "estimated_cost": 0, "description": "Bright lights and energy"},
        {"name": "9/11 Memorial Visit", "category": "culture", "duration": 2, "estimated_cost": 0, "description": "Tribute to history"},
    ],
    "London": [
        {"name": "Big Ben & Parliament", "category": "sightseeing", "duration": 2, "estimated_cost": 15, "description": "Iconic landmarks"},
        {"name": "British Museum Tour", "category": "culture", "duration": 3, "estimated_cost": 0, "description": "World history collection"},
        {"name": "London Eye Ride", "category": "sightseeing", "duration": 1, "estimated_cost": 35, "description": "Panoramic city views"},
        {"name": "Afternoon Tea Experience", "category": "food", "duration": 2, "estimated_cost": 45, "description": "Traditional English tea"},
        {"name": "West End Theatre", "category": "culture", "duration": 3, "estimated_cost": 80, "description": "Musical or play"},
    ],
    "Dubai": [
        {"name": "Burj Khalifa Observatory", "category": "sightseeing", "duration": 2, "estimated_cost": 40, "description": "World's tallest building"},
        {"name": "Desert Safari", "category": "adventure", "duration": 6, "estimated_cost": 70, "description": "Dune bashing and BBQ"},
        {"name": "Dubai Mall Shopping", "category": "shopping", "duration": 4, "estimated_cost": 50, "description": "Luxury shopping experience"},
        {"name": "Gold Souk Visit", "category": "shopping", "duration": 2, "estimated_cost": 0, "description": "Traditional gold market"},
        {"name": "Marina Dhow Cruise", "category": "sightseeing", "duration": 2, "estimated_cost": 30, "description": "Traditional boat dinner"},
    ],
    "Barcelona": [
        {"name": "Sagrada Familia Tour", "category": "culture", "duration": 2, "estimated_cost": 30, "description": "Gaudí's masterpiece"},
        {"name": "Park Güell Visit", "category": "sightseeing", "duration": 2, "estimated_cost": 10, "description": "Colorful park by Gaudí"},
        {"name": "Beach Day at Barceloneta", "category": "adventure", "duration": 4, "estimated_cost": 15, "description": "Mediterranean beach"},
        {"name": "Tapas Food Tour", "category": "food", "duration": 3, "estimated_cost": 60, "description": "Spanish small plates"},
        {"name": "Las Ramblas Walk", "category": "sightseeing", "duration": 2, "estimated_cost": 0, "description": "Famous street promenade"},
    ],
    "Bali": [
        {"name": "Ubud Rice Terraces", "category": "sightseeing", "duration": 3, "estimated_cost": 5, "description": "Stunning green landscapes"},
        {"name": "Beach Club Day Pass", "category": "adventure", "duration": 6, "estimated_cost": 40, "description": "Luxury beach experience"},
        {"name": "Balinese Cooking Class", "category": "food", "duration": 4, "estimated_cost": 35, "description": "Learn local cuisine"},
        {"name": "Temple Tour", "category": "culture", "duration": 4, "estimated_cost": 20, "description": "Sacred Hindu temples"},
        {"name": "Sunrise Volcano Trek", "category": "adventure", "duration": 8, "estimated_cost": 50, "description": "Mount Batur hike"},
    ],
    "Rome": [
        {"name": "Colosseum Tour", "category": "culture", "duration": 3, "estimated_cost": 25, "description": "Ancient Roman arena"},
        {"name": "Vatican Museums", "category": "culture", "duration": 4, "estimated_cost": 20, "description": "Sistine Chapel included"},
        {"name": "Trevi Fountain Visit", "category": "sightseeing", "duration": 1, "estimated_cost": 0, "description": "Toss a coin for luck"},
        {"name": "Roman Food Tour", "category": "food", "duration": 3, "estimated_cost": 70, "description": "Pasta and gelato"},
        {"name": "Vespa Tour", "category": "adventure", "duration": 3, "estimated_cost": 90, "description": "Ride through Rome"},
    ],
}

async def seed_database():
    print("Starting database seeding...")
    
    # Clear existing data
    await db.cities.delete_many({})
    await db.activity_templates.delete_many({})
    
    # Insert cities
    await db.cities.insert_many(cities_data)
    print(f"Inserted {len(cities_data)} cities")
    
    # Insert activities
    activity_count = 0
    for city_data in cities_data:
        city_name = city_data['name']
        if city_name in activities_templates:
            activities = []
            for activity in activities_templates[city_name]:
                activities.append({
                    "id": str(uuid.uuid4()),
                    "city_id": city_data['id'],
                    **activity
                })
            await db.activity_templates.insert_many(activities)
            activity_count += len(activities)
    
    print(f"Inserted {activity_count} activity templates")
    print("Database seeding completed!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
