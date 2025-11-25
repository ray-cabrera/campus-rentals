import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models import User, Item, Rental, Message, Rating, Transaction, RentalStatus
from .utils.auth import get_password_hash
from .utils.qr_code import generate_rental_qr_codes

# Sample images (placeholder base64)
CAMERA_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif'%3ECamera%3C/text%3E%3C/svg%3E"
DRILL_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif'%3EPower Drill%3C/text%3E%3C/svg%3E"
DRESS_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif'%3EEvening Gown%3C/text%3E%3C/svg%3E"
CONSOLE_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif'%3EPlayStation%3C/text%3E%3C/svg%3E"
BIKE_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif'%3EMountain Bike%3C/text%3E%3C/svg%3E"


def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded!")
        db.close()
        return

    print("Seeding database with Princeton student data...")

    # Create users (passwords truncated to 72 bytes for bcrypt)
    users_data = [
        {
            "email": "emily.chen@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "Emily Chen",
            "college": "Butler College",
            "phone": "(609) 555-0101",
            "bio": "Engineering major, love photography and outdoor adventures!",
            "total_earnings": 1250.50
        },
        {
            "email": "marcus.johnson@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "Marcus Johnson",
            "college": "Whitman College",
            "phone": "(609) 555-0102",
            "bio": "CS major and DIY enthusiast. Happy to share my tools!",
            "total_earnings": 875.25
        },
        {
            "email": "sarah.williams@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "Sarah Williams",
            "college": "First Campus Center",
            "phone": "(609) 555-0103",
            "bio": "Fashion lover! Renting out formal wear for events.",
            "total_earnings": 650.00
        },
        {
            "email": "alex.patel@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "Alex Patel",
            "college": "Rockefeller College",
            "phone": "(609) 555-0104",
            "bio": "Gamer and tech enthusiast. Have lots of gear to share!",
            "total_earnings": 425.75
        },
        {
            "email": "olivia.martinez@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "Olivia Martinez",
            "college": "Mathey College",
            "phone": "(609) 555-0105",
            "bio": "Love camping and outdoor sports. Let's share equipment!",
            "total_earnings": 890.00
        },
        {
            "email": "james.kim@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "James Kim",
            "college": "Forbes College",
            "phone": "(609) 555-0106",
            "bio": "Music production student with quality audio equipment.",
            "total_earnings": 1100.00
        },
        {
            "email": "demo@princeton.edu",
            "password": "demo123"[:72],
            "full_name": "Demo User",
            "college": "Wilson College",
            "phone": "(609) 555-0199",
            "bio": "Demo account for testing the platform!",
            "total_earnings": 0.0
        }
    ]

    users = []
    for user_data in users_data:
        password = user_data.pop("password")
        user = User(
            **user_data,
            hashed_password=get_password_hash(password),
            is_verified=True,
            rating=4.5 + (len(users) * 0.1),  # Ratings between 4.5-5.0
            total_ratings=5 + len(users)
        )
        db.add(user)
        users.append(user)

    db.commit()
    print(f"Created {len(users)} users")

    # Create items
    items_data = [
        {
            "title": "Canon EOS 80D DSLR Camera",
            "description": "Professional DSLR camera with 24.2MP sensor, perfect for photography assignments or personal projects. Includes 18-55mm lens, battery, and charger.",
            "category": "Electronics",
            "daily_rate": 8.0,
            "weekly_rate": 15.0,
            "security_deposit": 50.0,
            "location": "Butler College",
            "images": json.dumps([CAMERA_IMAGE]),
            "owner_id": 1,
            "total_rentals": 12,
            "rating": 4.9
        },
        {
            "title": "DeWalt Power Drill Set",
            "description": "Complete cordless drill set with multiple bits and carrying case. Perfect for dorm room projects and furniture assembly.",
            "category": "Tools",
            "daily_rate": 5.0,
            "weekly_rate": 7.0,
            "security_deposit": 30.0,
            "location": "Whitman College",
            "images": json.dumps([DRILL_IMAGE]),
            "owner_id": 2,
            "total_rentals": 8,
            "rating": 4.8
        },
        {
            "title": "Black Evening Gown - Size 6",
            "description": "Elegant black formal dress, perfect for formals, galas, or special events. Dry cleaned after each rental.",
            "category": "Fashion",
            "daily_rate": 4.0,
            "weekly_rate": 6.0,
            "security_deposit": 25.0,
            "location": "First Campus Center",
            "images": json.dumps([DRESS_IMAGE]),
            "owner_id": 3,
            "total_rentals": 15,
            "rating": 5.0
        },
        {
            "title": "PlayStation 5 Console + Controllers",
            "description": "PS5 with 2 controllers and popular games. Great for gaming nights with friends!",
            "category": "Electronics",
            "daily_rate": 2.0,
            "weekly_rate": 12.0,
            "security_deposit": 100.0,
            "location": "Rockefeller College",
            "images": json.dumps([CONSOLE_IMAGE]),
            "owner_id": 4,
            "total_rentals": 6,
            "rating": 4.7
        },
        {
            "title": "Mountain Bike - Trek Marlin 7",
            "description": "Quality mountain bike perfect for campus rides or weekend trails. Includes helmet and lock.",
            "category": "Transportation",
            "daily_rate": 5.0,
            "weekly_rate": 10.0,
            "security_deposit": 75.0,
            "location": "Firestone Library",
            "images": json.dumps([BIKE_IMAGE]),
            "owner_id": 1,
            "total_rentals": 10,
            "rating": 4.6
        },
        {
            "title": "4-Person Camping Tent",
            "description": "Spacious camping tent for outdoor adventures. Easy setup, waterproof, perfect for Princeton outdoor club trips.",
            "category": "Outdoor",
            "daily_rate": 3.0,
            "weekly_rate": 18.0,
            "security_deposit": 40.0,
            "location": "Mathey College",
            "images": json.dumps([CAMERA_IMAGE]),
            "owner_id": 5,
            "total_rentals": 7,
            "rating": 4.9
        },
        {
            "title": "JBL PartyBox Bluetooth Speaker",
            "description": "Powerful Bluetooth speaker system perfect for parties and events. Battery-powered, can last 12+ hours.",
            "category": "Party Supplies",
            "daily_rate": 1.0,
            "weekly_rate": 9.0,
            "security_deposit": 50.0,
            "location": "Wilson College",
            "images": json.dumps([CONSOLE_IMAGE]),
            "owner_id": 4,
            "is_available": False,
            "total_rentals": 20,
            "rating": 5.0
        },
        {
            "title": "Epson HD Projector + Screen",
            "description": "HD projector with portable screen for presentations or movie nights. HDMI compatible.",
            "category": "Electronics",
            "daily_rate": 1.0,
            "weekly_rate": 14.0,
            "security_deposit": 60.0,
            "location": "Friend Center",
            "images": json.dumps([CAMERA_IMAGE]),
            "owner_id": 6,
            "total_rentals": 9,
            "rating": 4.8
        },
        {
            "title": "Fender Acoustic Guitar",
            "description": "Beautiful acoustic guitar in excellent condition. Includes case and extra strings. Perfect for practicing or performances.",
            "category": "Music",
            "daily_rate": 6.0,
            "weekly_rate": 8.0,
            "security_deposit": 45.0,
            "location": "Forbes College",
            "images": json.dumps([DRILL_IMAGE]),
            "owner_id": 6,
            "total_rentals": 11,
            "rating": 4.8
        },
        {
            "title": "MacBook Pro M1 - 16GB RAM",
            "description": "2021 MacBook Pro with M1 chip, perfect for intensive projects, video editing, or coding. Includes charger.",
            "category": "Electronics",
            "daily_rate": 1.0,
            "weekly_rate": 20.0,
            "security_deposit": 200.0,
            "location": "E-Quad Engineering",
            "images": json.dumps([CONSOLE_IMAGE]),
            "owner_id": 1,
            "total_rentals": 5,
            "rating": 5.0
        },
        {
            "title": "Burton Snowboard with Bindings",
            "description": "Quality snowboard perfect for winter break trips. Size medium, great condition.",
            "category": "Sports",
            "daily_rate": 4.0,
            "weekly_rate": 25.0,
            "security_deposit": 80.0,
            "location": "Forbes College",
            "images": json.dumps([BIKE_IMAGE]),
            "owner_id": 5,
            "total_rentals": 8,
            "rating": 4.9
        },
        {
            "title": "Loaded Longboard - Cruiser",
            "description": "Smooth riding longboard perfect for campus commute. Very stable and fun to ride!",
            "category": "Transportation",
            "daily_rate": 3.0,
            "weekly_rate": 6.0,
            "security_deposit": 35.0,
            "location": "Pyne Hall",
            "images": json.dumps([BIKE_IMAGE]),
            "owner_id": 4,
            "total_rentals": 14,
            "rating": 4.7
        },
        {
            "title": "Personal Wellness Device",
            "description": "High-quality wellness and relaxation device. Promotes self-care and stress relief.",
            "category": "Wellness",
            "daily_rate": 1.0,
            "weekly_rate": 18.0,
            "security_deposit": 20.0,
            "location": "Witherspoon Hall",
            "images": json.dumps([CAMERA_IMAGE]),
            "owner_id": 2,
            "total_rentals": 4,
            "rating": 4.9
        }
    ]

    items = []
    for item_data in items_data:
        item = Item(**item_data)
        db.add(item)
        items.append(item)

    db.commit()
    print(f"Created {len(items)} items")

    # Create some rentals
    rentals_data = [
        {
            "item_id": 1,
            "owner_id": 1,
            "renter_id": 7,
            "start_date": datetime.utcnow() - timedelta(days=10),
            "end_date": datetime.utcnow() - timedelta(days=7),
            "status": RentalStatus.COMPLETED.value,
            "total_cost": 24.0,
            "security_deposit": 50.0,
            "platform_fee": 3.6,
            "owner_earnings": 20.4,
            "approved_at": datetime.utcnow() - timedelta(days=10),
            "picked_up_at": datetime.utcnow() - timedelta(days=10),
            "returned_at": datetime.utcnow() - timedelta(days=7)
        },
        {
            "item_id": 4,
            "owner_id": 4,
            "renter_id": 7,
            "start_date": datetime.utcnow() - timedelta(days=5),
            "end_date": datetime.utcnow() + timedelta(days=2),
            "status": RentalStatus.ACTIVE.value,
            "total_cost": 84.0,
            "security_deposit": 100.0,
            "platform_fee": 12.6,
            "owner_earnings": 71.4,
            "approved_at": datetime.utcnow() - timedelta(days=5),
            "picked_up_at": datetime.utcnow() - timedelta(days=5)
        },
        {
            "item_id": 7,
            "owner_id": 4,
            "renter_id": 2,
            "start_date": datetime.utcnow() + timedelta(days=1),
            "end_date": datetime.utcnow() + timedelta(days=3),
            "status": RentalStatus.APPROVED.value,
            "total_cost": 18.0,
            "security_deposit": 50.0,
            "platform_fee": 2.7,
            "owner_earnings": 15.3,
            "approved_at": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "item_id": 2,
            "owner_id": 2,
            "renter_id": 3,
            "start_date": datetime.utcnow() + timedelta(days=2),
            "end_date": datetime.utcnow() + timedelta(days=4),
            "status": RentalStatus.PENDING.value,
            "total_cost": 10.0,
            "security_deposit": 30.0,
            "platform_fee": 1.5,
            "owner_earnings": 8.5
        }
    ]

    rentals = []
    for rental_data in rentals_data:
        rental = Rental(**rental_data)

        # Generate QR codes for approved/active rentals
        if rental.status in [RentalStatus.APPROVED.value, RentalStatus.ACTIVE.value]:
            pickup_qr, return_qr = generate_rental_qr_codes(len(rentals) + 1)
            rental.pickup_qr_code = pickup_qr
            rental.return_qr_code = return_qr

        db.add(rental)
        rentals.append(rental)

    db.commit()
    print(f"Created {len(rentals)} rentals")

    # Create some messages
    messages_data = [
        {
            "rental_id": 1,
            "sender_id": 7,
            "receiver_id": 1,
            "message": "Hi! I'd like to rent your camera for the weekend. Is it still available?",
            "is_read": True,
            "created_at": datetime.utcnow() - timedelta(days=11)
        },
        {
            "rental_id": 1,
            "sender_id": 1,
            "receiver_id": 7,
            "message": "Yes it is! I can meet you at Butler tomorrow at 2pm.",
            "is_read": True,
            "created_at": datetime.utcnow() - timedelta(days=10, hours=22)
        },
        {
            "rental_id": 1,
            "sender_id": 7,
            "receiver_id": 1,
            "message": "Perfect! See you then.",
            "is_read": True,
            "created_at": datetime.utcnow() - timedelta(days=10, hours=21)
        },
        {
            "rental_id": 2,
            "sender_id": 7,
            "receiver_id": 4,
            "message": "Thanks for approving! When can I pick up the PS5?",
            "is_read": True,
            "created_at": datetime.utcnow() - timedelta(days=5, hours=3)
        },
        {
            "rental_id": 2,
            "sender_id": 4,
            "receiver_id": 7,
            "message": "I'm free after 4pm today. Want to meet at Frist?",
            "is_read": True,
            "created_at": datetime.utcnow() - timedelta(days=5, hours=2)
        }
    ]

    for message_data in messages_data:
        message = Message(**message_data)
        db.add(message)

    db.commit()
    print(f"Created {len(messages_data)} messages")

    # Create some ratings
    ratings_data = [
        {
            "rental_id": 1,
            "rater_id": 7,
            "rated_user_id": 1,
            "rating": 5.0,
            "comment": "Great camera and Emily was super helpful with setup! Highly recommend.",
            "created_at": datetime.utcnow() - timedelta(days=7)
        },
        {
            "rental_id": 1,
            "rater_id": 1,
            "rated_user_id": 7,
            "rating": 5.0,
            "comment": "Perfect renter! Took great care of the equipment.",
            "created_at": datetime.utcnow() - timedelta(days=6)
        }
    ]

    for rating_data in ratings_data:
        rating = Rating(**rating_data)
        db.add(rating)

    db.commit()
    print(f"Created {len(ratings_data)} ratings")

    # Create transactions
    transactions_data = [
        {
            "rental_id": 1,
            "user_id": 7,
            "amount": 74.0,
            "transaction_type": "payment",
            "description": "Payment for rental #1",
            "created_at": datetime.utcnow() - timedelta(days=10)
        },
        {
            "rental_id": 1,
            "user_id": 1,
            "amount": 20.4,
            "transaction_type": "earnings",
            "description": "Earnings from rental #1",
            "created_at": datetime.utcnow() - timedelta(days=7)
        },
        {
            "rental_id": 1,
            "user_id": 7,
            "amount": 50.0,
            "transaction_type": "refund",
            "description": "Security deposit refund for rental #1",
            "created_at": datetime.utcnow() - timedelta(days=7)
        },
        {
            "rental_id": 2,
            "user_id": 7,
            "amount": 184.0,
            "transaction_type": "payment",
            "description": "Payment for rental #2",
            "created_at": datetime.utcnow() - timedelta(days=5)
        }
    ]

    for transaction_data in transactions_data:
        transaction = Transaction(**transaction_data)
        db.add(transaction)

    db.commit()
    print(f"Created {len(transactions_data)} transactions")

    db.close()
    print("\n✅ Database seeded successfully!")
    print("Demo credentials:")
    print("  Email: demo@princeton.edu")
    print("  Password: demo123")
    print("\nOther test accounts:")
    print("  emily.chen@princeton.edu / demo123")
    print("  marcus.johnson@princeton.edu / demo123")


if __name__ == "__main__":
    seed_database()
