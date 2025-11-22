"""
Seed data script for Campus Rentals
Creates demo users, items, rentals, and transactions
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
import json
import random
from database import SessionLocal, engine, Base
from models import User, Item, Rental, Message, Review, Transaction, RentalStatus
from auth import get_password_hash
from utils import generate_qr_code

# Create all tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def clear_data():
    """Clear existing data"""
    db.query(Transaction).delete()
    db.query(Review).delete()
    db.query(Message).delete()
    db.query(Rental).delete()
    db.query(Item).delete()
    db.query(User).delete()
    db.commit()

def create_users():
    """Create demo users"""
    users_data = [
        {
            "email": "alex.chen@princeton.edu",
            "full_name": "Alex Chen",
            "residence": "Butler College",
            "bio": "CS major, love photography and outdoor adventures. Happy to share my gear!",
            "rating": 4.9,
            "total_reviews": 23,
            "total_earnings": 1250.00,
            "items_rented_out": 45,
            "items_borrowed": 12
        },
        {
            "email": "sarah.johnson@princeton.edu",
            "full_name": "Sarah Johnson",
            "residence": "Whitman College",
            "bio": "Engineering student with too many tools. Let me help with your projects!",
            "rating": 4.8,
            "total_reviews": 18,
            "total_earnings": 890.00,
            "items_rented_out": 32,
            "items_borrowed": 8
        },
        {
            "email": "marcus.williams@princeton.edu",
            "full_name": "Marcus Williams",
            "residence": "Rockefeller College",
            "bio": "Music and tech enthusiast. Got speakers, cameras, and gaming gear to share.",
            "rating": 4.7,
            "total_reviews": 15,
            "total_earnings": 720.00,
            "items_rented_out": 28,
            "items_borrowed": 15
        },
        {
            "email": "emma.davis@princeton.edu",
            "full_name": "Emma Davis",
            "residence": "Mathey College",
            "bio": "Outdoor club member with camping and hiking gear. Let's explore together!",
            "rating": 4.9,
            "total_reviews": 12,
            "total_earnings": 560.00,
            "items_rented_out": 22,
            "items_borrowed": 6
        },
        {
            "email": "james.rodriguez@princeton.edu",
            "full_name": "James Rodriguez",
            "residence": "Wilson College",
            "bio": "Event planning expert with party supplies galore. Make your event epic!",
            "rating": 4.8,
            "total_reviews": 20,
            "total_earnings": 980.00,
            "items_rented_out": 38,
            "items_borrowed": 10
        },
        {
            "email": "olivia.thompson@princeton.edu",
            "full_name": "Olivia Thompson",
            "residence": "Forbes College",
            "bio": "Fashion major with designer pieces for formal events. Look your best!",
            "rating": 5.0,
            "total_reviews": 8,
            "total_earnings": 450.00,
            "items_rented_out": 15,
            "items_borrowed": 4
        },
        {
            "email": "david.kim@princeton.edu",
            "full_name": "David Kim",
            "residence": "E-Quad Engineering",
            "bio": "CS and EE double major. Tech gear for all your project needs.",
            "rating": 4.8,
            "total_reviews": 14,
            "total_earnings": 680.00,
            "items_rented_out": 25,
            "items_borrowed": 18
        },
        {
            "email": "sophia.martinez@princeton.edu",
            "full_name": "Sophia Martinez",
            "residence": "Pyne Hall",
            "bio": "Sports enthusiast with equipment for every season. Stay active!",
            "rating": 4.6,
            "total_reviews": 11,
            "total_earnings": 380.00,
            "items_rented_out": 18,
            "items_borrowed": 9
        },
        {
            "email": "demo@princeton.edu",
            "full_name": "Demo User",
            "residence": "Frist Campus Center",
            "bio": "Demo account for testing. Feel free to explore!",
            "rating": 5.0,
            "total_reviews": 0,
            "total_earnings": 0,
            "items_rented_out": 0,
            "items_borrowed": 0
        },
        {
            "email": "michael.brown@princeton.edu",
            "full_name": "Michael Brown",
            "residence": "Witherspoon Hall",
            "bio": "Wellness advocate with fitness and relaxation gear.",
            "rating": 4.9,
            "total_reviews": 7,
            "total_earnings": 290.00,
            "items_rented_out": 12,
            "items_borrowed": 5
        }
    ]

    users = []
    for user_data in users_data:
        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash("demo123"),
            full_name=user_data["full_name"],
            residence=user_data["residence"],
            bio=user_data["bio"],
            rating=user_data["rating"],
            total_reviews=user_data["total_reviews"],
            total_earnings=user_data["total_earnings"],
            items_rented_out=user_data["items_rented_out"],
            items_borrowed=user_data["items_borrowed"],
            is_verified=True,
            verification_badge=True
        )
        db.add(user)
        users.append(user)

    db.commit()
    for user in users:
        db.refresh(user)
    return users

def create_items(users):
    """Create demo items"""
    # Sample image placeholders (in real app, these would be base64 images)
    def get_placeholder_images(category):
        return json.dumps([f"https://images.unsplash.com/photo-{category}?w=400"])

    items_data = [
        # Tech/Electronics
        {
            "title": "Canon EOS 80D DSLR Camera",
            "description": "Professional-grade DSLR camera perfect for photography projects, events, or just capturing memories. Includes 18-135mm lens, extra battery, and carrying case. Great for student films and photo assignments.",
            "category": "Tech",
            "price_hour": 8,
            "price_day": 25,
            "price_week": 100,
            "deposit": 150,
            "location": "Butler College",
            "owner_idx": 0,
            "rating": 4.9,
            "total_rentals": 28,
            "total_reviews": 15
        },
        {
            "title": "PlayStation 5 Console + Controllers",
            "description": "PS5 Digital Edition with two controllers. Perfect for game nights or when you need a study break. Includes popular games like FIFA and Call of Duty.",
            "category": "Tech",
            "price_hour": None,
            "price_day": 12,
            "price_week": 50,
            "deposit": 100,
            "location": "Rockefeller College",
            "owner_idx": 2,
            "rating": 4.7,
            "total_rentals": 18,
            "total_reviews": 12
        },
        {
            "title": "MacBook Pro M1 - 16GB RAM",
            "description": "2021 MacBook Pro with M1 chip, 16GB RAM, 512GB SSD. Perfect for coding, video editing, or when your laptop is in repair. Charger included.",
            "category": "Tech",
            "price_hour": 3,
            "price_day": 15,
            "price_week": 80,
            "deposit": 200,
            "location": "E-Quad Engineering",
            "owner_idx": 6,
            "rating": 5.0,
            "total_rentals": 12,
            "total_reviews": 8
        },
        # Tools
        {
            "title": "DeWalt Power Drill Set",
            "description": "20V MAX cordless drill with complete bit set. Great for DIY projects, furniture assembly, or engineering projects. Includes charger and carrying case.",
            "category": "Tools",
            "price_hour": 5,
            "price_day": 12,
            "price_week": 40,
            "deposit": 50,
            "location": "Whitman College",
            "owner_idx": 1,
            "rating": 4.8,
            "total_rentals": 22,
            "total_reviews": 14
        },
        # Fashion
        {
            "title": "Black Evening Gown - Size 6",
            "description": "Elegant black evening gown perfect for formals, galas, or special events. Designer quality, professionally dry cleaned after each rental.",
            "category": "Fashion",
            "price_hour": None,
            "price_day": 25,
            "price_week": 80,
            "deposit": 75,
            "location": "Frist Campus Center",
            "owner_idx": 5,
            "rating": 5.0,
            "total_rentals": 8,
            "total_reviews": 6
        },
        # Transportation
        {
            "title": "Mountain Bike - Trek Marlin 7",
            "description": "Quality mountain bike great for campus transportation or trail riding. Helmet included. Perfect condition, recently tuned.",
            "category": "Transportation",
            "price_hour": 5,
            "price_day": 15,
            "price_week": 60,
            "deposit": 100,
            "location": "Firestone Library",
            "owner_idx": 3,
            "rating": 4.6,
            "total_rentals": 15,
            "total_reviews": 10
        },
        {
            "title": "Loaded Longboard - Cruiser",
            "description": "Premium longboard for cruising campus. Smooth ride, great bearings. Perfect for getting to class in style.",
            "category": "Transportation",
            "price_hour": 3,
            "price_day": 8,
            "price_week": 30,
            "deposit": 50,
            "location": "Pyne Hall",
            "owner_idx": 7,
            "rating": 4.6,
            "total_rentals": 12,
            "total_reviews": 8
        },
        # Outdoor
        {
            "title": "4-Person Camping Tent",
            "description": "Spacious 4-person tent with rainfly. Easy setup, great for outdoor club trips or weekend adventures. Includes stakes and carrying bag.",
            "category": "Outdoor",
            "price_hour": None,
            "price_day": 15,
            "price_week": 50,
            "deposit": 75,
            "location": "Mathey College",
            "owner_idx": 3,
            "rating": 4.9,
            "total_rentals": 10,
            "total_reviews": 7
        },
        # Party
        {
            "title": "JBL PartyBox Bluetooth Speaker",
            "description": "Powerful bluetooth speaker with LED lights. Perfect for parties, tailgates, or outdoor events. 12+ hours battery life.",
            "category": "Party Supplies",
            "price_hour": 5,
            "price_day": 20,
            "price_week": 70,
            "deposit": 100,
            "location": "Wilson College",
            "owner_idx": 4,
            "rating": 4.8,
            "total_rentals": 25,
            "total_reviews": 18
        },
        {
            "title": "Epson HD Projector + Screen",
            "description": "1080p HD projector with portable screen. Perfect for movie nights, presentations, or outdoor screenings. HDMI and USB compatible.",
            "category": "Party Supplies",
            "price_hour": 8,
            "price_day": 25,
            "price_week": 90,
            "deposit": 150,
            "location": "Friend Center",
            "owner_idx": 4,
            "rating": 4.7,
            "total_rentals": 20,
            "total_reviews": 14
        },
        # Sports
        {
            "title": "Burton Snowboard with Bindings",
            "description": "155cm all-mountain snowboard with medium bindings. Great for trips to the slopes. Well-maintained, recently waxed.",
            "category": "Sports",
            "price_hour": None,
            "price_day": 25,
            "price_week": 100,
            "deposit": 150,
            "location": "Forbes College",
            "owner_idx": 7,
            "rating": 4.9,
            "total_rentals": 8,
            "total_reviews": 5
        },
        # Music
        {
            "title": "Fender Acoustic Guitar",
            "description": "Beautiful acoustic guitar with soft case. Perfect for learning, jam sessions, or performances. Recently restrung.",
            "category": "Music",
            "price_hour": 3,
            "price_day": 10,
            "price_week": 40,
            "deposit": 75,
            "location": "Woolworth Center",
            "owner_idx": 2,
            "rating": 4.8,
            "total_rentals": 14,
            "total_reviews": 10
        },
        # Wellness
        {
            "title": "Personal Wellness Device",
            "description": "Theragun massage device for muscle recovery. Perfect for athletes or anyone needing relief after long study sessions.",
            "category": "Wellness",
            "price_hour": 2,
            "price_day": 8,
            "price_week": 30,
            "deposit": 50,
            "location": "Witherspoon Hall",
            "owner_idx": 9,
            "rating": 4.9,
            "total_rentals": 10,
            "total_reviews": 6
        },
        # More items for variety
        {
            "title": "DJI Mini 3 Drone",
            "description": "Compact drone with 4K camera. Perfect for aerial photography, campus events, or just having fun. Easy to fly for beginners.",
            "category": "Tech",
            "price_hour": 10,
            "price_day": 35,
            "price_week": 150,
            "deposit": 200,
            "location": "Butler College",
            "owner_idx": 0,
            "rating": 4.8,
            "total_rentals": 6,
            "total_reviews": 4
        },
        {
            "title": "Ring Light Kit for Content Creation",
            "description": "18-inch ring light with tripod stand. Perfect for Zoom calls, content creation, or photo shoots. Adjustable brightness.",
            "category": "Tech",
            "price_hour": 2,
            "price_day": 8,
            "price_week": 30,
            "deposit": 30,
            "location": "Rockefeller College",
            "owner_idx": 2,
            "rating": 4.7,
            "total_rentals": 16,
            "total_reviews": 11
        },
        {
            "title": "Formal Suit - Size 40R",
            "description": "Navy blue formal suit, perfect for interviews, formals, or presentations. Includes jacket and pants. Professionally maintained.",
            "category": "Fashion",
            "price_hour": None,
            "price_day": 20,
            "price_week": 60,
            "deposit": 50,
            "location": "Forbes College",
            "owner_idx": 5,
            "rating": 4.9,
            "total_rentals": 10,
            "total_reviews": 7
        },
        {
            "title": "Paddleboard with Paddle",
            "description": "Inflatable SUP paddleboard. Great for Lake Carnegie adventures. Includes pump, paddle, and carrying backpack.",
            "category": "Outdoor",
            "price_hour": 8,
            "price_day": 25,
            "price_week": 90,
            "deposit": 100,
            "location": "Mathey College",
            "owner_idx": 3,
            "rating": 4.8,
            "total_rentals": 8,
            "total_reviews": 5
        },
        {
            "title": "GoPro Hero 11 Action Camera",
            "description": "Waterproof action camera perfect for sports, adventures, or underwater filming. Includes mounts and accessories.",
            "category": "Tech",
            "price_hour": 5,
            "price_day": 18,
            "price_week": 70,
            "deposit": 100,
            "location": "Wilson College",
            "owner_idx": 4,
            "rating": 4.9,
            "total_rentals": 14,
            "total_reviews": 9
        },
        {
            "title": "Portable Air Conditioner",
            "description": "8,000 BTU portable AC unit. Perfect for hot dorm rooms with no AC. Easy to install, quiet operation.",
            "category": "Electronics",
            "price_hour": None,
            "price_day": 15,
            "price_week": 60,
            "deposit": 75,
            "location": "Whitman College",
            "owner_idx": 1,
            "rating": 4.6,
            "total_rentals": 5,
            "total_reviews": 3
        },
        {
            "title": "Karaoke Machine with Mics",
            "description": "Full karaoke system with two wireless microphones and Bluetooth connectivity. Party essential!",
            "category": "Party Supplies",
            "price_hour": 5,
            "price_day": 15,
            "price_week": 50,
            "deposit": 75,
            "location": "Wilson College",
            "owner_idx": 4,
            "rating": 4.7,
            "total_rentals": 18,
            "total_reviews": 12
        },
        {
            "title": "Yoga Mat and Block Set",
            "description": "Premium yoga mat with blocks and strap. Perfect for fitness classes or personal practice.",
            "category": "Wellness",
            "price_hour": 1,
            "price_day": 5,
            "price_week": 18,
            "deposit": 20,
            "location": "Witherspoon Hall",
            "owner_idx": 9,
            "rating": 5.0,
            "total_rentals": 8,
            "total_reviews": 5
        },
        {
            "title": "Electric Scooter - Xiaomi",
            "description": "Fast and reliable electric scooter. 15-mile range, perfect for campus commuting. Includes charger.",
            "category": "Transportation",
            "price_hour": 4,
            "price_day": 12,
            "price_week": 45,
            "deposit": 100,
            "location": "E-Quad Engineering",
            "owner_idx": 6,
            "rating": 4.7,
            "total_rentals": 20,
            "total_reviews": 14
        },
        {
            "title": "Instant Pot Duo 8-Quart",
            "description": "Multi-use pressure cooker perfect for dorm cooking. Makes everything from rice to soups to yogurt!",
            "category": "Electronics",
            "price_hour": None,
            "price_day": 8,
            "price_week": 30,
            "deposit": 40,
            "location": "Butler College",
            "owner_idx": 0,
            "rating": 4.8,
            "total_rentals": 12,
            "total_reviews": 8
        },
        {
            "title": "Telescope - Celestron",
            "description": "Quality telescope for stargazing. Perfect for astronomy classes or romantic dates. Easy setup included.",
            "category": "Academic",
            "price_hour": 5,
            "price_day": 15,
            "price_week": 50,
            "deposit": 100,
            "location": "Firestone Library",
            "owner_idx": 6,
            "rating": 4.9,
            "total_rentals": 6,
            "total_reviews": 4
        },
        {
            "title": "Ski Set with Boots - Size 10",
            "description": "Complete ski set including skis, boots (size 10), and poles. Ready for trips to the mountains!",
            "category": "Sports",
            "price_hour": None,
            "price_day": 30,
            "price_week": 120,
            "deposit": 150,
            "location": "Forbes College",
            "owner_idx": 7,
            "rating": 4.8,
            "total_rentals": 6,
            "total_reviews": 4
        }
    ]

    items = []
    for item_data in items_data:
        owner_idx = item_data.pop("owner_idx")
        item = Item(
            owner_id=users[owner_idx].id,
            images=json.dumps([f"/api/placeholder/{item_data['category'].lower()}"]),
            insurance_value=2000.0,
            is_available=True,
            **item_data
        )
        db.add(item)
        items.append(item)

    db.commit()
    for item in items:
        db.refresh(item)
    return items

def create_rentals(users, items):
    """Create sample rentals with various statuses"""
    rentals_data = [
        # Completed rentals (for transaction history)
        {
            "item_idx": 0,  # Canon Camera
            "renter_idx": 2,  # Marcus
            "days_ago_start": 30,
            "days_ago_end": 28,
            "status": RentalStatus.COMPLETED
        },
        {
            "item_idx": 3,  # Drill
            "renter_idx": 6,  # David
            "days_ago_start": 25,
            "days_ago_end": 24,
            "status": RentalStatus.COMPLETED
        },
        {
            "item_idx": 8,  # JBL Speaker
            "renter_idx": 0,  # Alex
            "days_ago_start": 20,
            "days_ago_end": 19,
            "status": RentalStatus.COMPLETED
        },
        {
            "item_idx": 9,  # Projector
            "renter_idx": 3,  # Emma
            "days_ago_start": 15,
            "days_ago_end": 14,
            "status": RentalStatus.COMPLETED
        },
        {
            "item_idx": 5,  # Mountain Bike
            "renter_idx": 1,  # Sarah
            "days_ago_start": 10,
            "days_ago_end": 7,
            "status": RentalStatus.COMPLETED
        },
        # Active rentals
        {
            "item_idx": 11,  # Guitar
            "renter_idx": 5,  # Olivia
            "days_ago_start": 2,
            "days_ago_end": -3,
            "status": RentalStatus.ACTIVE
        },
        # Pending rentals
        {
            "item_idx": 2,  # MacBook
            "renter_idx": 4,  # James
            "days_ago_start": -1,
            "days_ago_end": -4,
            "status": RentalStatus.PENDING
        },
        {
            "item_idx": 13,  # Drone
            "renter_idx": 1,  # Sarah
            "days_ago_start": -2,
            "days_ago_end": -3,
            "status": RentalStatus.PENDING
        }
    ]

    rentals = []
    now = datetime.utcnow()

    for rental_data in rentals_data:
        item = items[rental_data["item_idx"]]
        renter = users[rental_data["renter_idx"]]

        start_date = now - timedelta(days=rental_data["days_ago_start"])
        end_date = now - timedelta(days=rental_data["days_ago_end"])
        duration_days = (end_date - start_date).days

        total_price = item.price_day * duration_days
        platform_fee = round(total_price * 0.15, 2)
        owner_earnings = total_price - platform_fee

        rental = Rental(
            item_id=item.id,
            renter_id=renter.id,
            owner_id=item.owner_id,
            start_date=start_date,
            end_date=end_date,
            total_price=total_price,
            deposit_amount=item.deposit,
            platform_fee=platform_fee,
            owner_earnings=owner_earnings,
            status=rental_data["status"],
            pickup_qr_code=generate_qr_code(f"pickup-{item.id}-{renter.id}"),
            return_qr_code=generate_qr_code(f"return-{item.id}-{renter.id}"),
            pickup_verified=rental_data["status"] in [RentalStatus.ACTIVE, RentalStatus.COMPLETED],
            return_verified=rental_data["status"] == RentalStatus.COMPLETED
        )
        db.add(rental)
        rentals.append(rental)

    db.commit()
    for rental in rentals:
        db.refresh(rental)
    return rentals

def create_transactions(users, rentals):
    """Create transaction history for completed rentals"""
    transactions = []

    for rental in rentals:
        if rental.status == RentalStatus.COMPLETED:
            transaction = Transaction(
                user_id=rental.owner_id,
                rental_id=rental.id,
                type="earning",
                amount=rental.owner_earnings,
                description=f"Rental of {rental.item.title}",
                status="completed",
                created_at=rental.end_date
            )
            db.add(transaction)
            transactions.append(transaction)

    db.commit()
    return transactions

def create_reviews(users, items, rentals):
    """Create sample reviews"""
    reviews_data = [
        {
            "reviewer_idx": 2,  # Marcus
            "reviewed_idx": 0,  # Alex (camera owner)
            "item_idx": 0,
            "rating": 5,
            "comment": "Amazing camera, Alex was super helpful with pickup. Would definitely rent again!"
        },
        {
            "reviewer_idx": 6,  # David
            "reviewed_idx": 1,  # Sarah (drill owner)
            "item_idx": 3,
            "rating": 5,
            "comment": "Drill worked perfectly for my project. Sarah even gave me tips on using it."
        },
        {
            "reviewer_idx": 0,  # Alex
            "reviewed_idx": 4,  # James (speaker owner)
            "item_idx": 8,
            "rating": 4,
            "comment": "Great speaker, made our party amazing! Battery lasted the whole night."
        },
        {
            "reviewer_idx": 3,  # Emma
            "reviewed_idx": 4,  # James (projector owner)
            "item_idx": 9,
            "rating": 5,
            "comment": "Perfect for movie night! Great quality and easy to set up."
        },
        {
            "reviewer_idx": 1,  # Sarah
            "reviewed_idx": 3,  # Emma (bike owner)
            "item_idx": 5,
            "rating": 4,
            "comment": "Smooth ride around campus. Bike was in great condition."
        }
    ]

    for review_data in reviews_data:
        review = Review(
            reviewer_id=users[review_data["reviewer_idx"]].id,
            reviewed_id=users[review_data["reviewed_idx"]].id,
            item_id=items[review_data["item_idx"]].id,
            rating=review_data["rating"],
            comment=review_data["comment"]
        )
        db.add(review)

    db.commit()

def create_messages(users):
    """Create sample message conversations"""
    messages_data = [
        (2, 0, "Hey! I saw your camera listing. Is it available this weekend?"),
        (0, 2, "Yes it is! What dates are you thinking?"),
        (2, 0, "Friday evening to Sunday. I have a project to shoot."),
        (0, 2, "Perfect! Go ahead and submit a rental request and I'll approve it."),

        (6, 1, "Hi Sarah! Need the drill for a quick project tomorrow. Available?"),
        (1, 6, "Yep! You can pick it up at Whitman anytime after 2pm."),
        (6, 1, "Awesome, thanks! I'll be there around 3."),
    ]

    for sender_idx, receiver_idx, content in messages_data:
        message = Message(
            sender_id=users[sender_idx].id,
            receiver_id=users[receiver_idx].id,
            content=content
        )
        db.add(message)

    db.commit()

def main():
    print("Starting Campus Rentals seed data creation...")

    print("Clearing existing data...")
    clear_data()

    print("Creating users...")
    users = create_users()
    print(f"Created {len(users)} users")

    print("Creating items...")
    items = create_items(users)
    print(f"Created {len(items)} items")

    print("Creating rentals...")
    rentals = create_rentals(users, items)
    print(f"Created {len(rentals)} rentals")

    print("Creating transactions...")
    transactions = create_transactions(users, rentals)
    print(f"Created {len(transactions)} transactions")

    print("Creating reviews...")
    create_reviews(users, items, rentals)

    print("Creating messages...")
    create_messages(users)

    print("\n=== Seed Data Complete ===")
    print(f"Demo login credentials:")
    print(f"  Email: demo@princeton.edu")
    print(f"  Password: demo123")
    print(f"\nOr use any other user email with password: demo123")

    db.close()

if __name__ == "__main__":
    main()
