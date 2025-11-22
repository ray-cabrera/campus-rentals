from fastapi import FastAPI, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime, timedelta
import json

from database import engine, get_db, Base
from models import User, Item, Rental, Message, Review, Transaction, RentalStatus
from schemas import (
    UserCreate, UserUpdate, UserResponse, UserPublic, Token, LoginRequest,
    ItemCreate, ItemUpdate, ItemResponse, ItemListResponse,
    RentalCreate, RentalUpdate, RentalResponse,
    MessageCreate, MessageResponse, ConversationResponse,
    ReviewCreate, ReviewResponse,
    TransactionResponse, EarningsSummary, DashboardStats,
    PricingSuggestion
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, validate_edu_email
)
from utils import generate_qr_code, calculate_rental_price, get_pricing_suggestion, PRINCETON_LOCATIONS

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Rentals API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager for real-time messaging
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_message(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()

# ============ AUTH ROUTES ============

@app.post("/api/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email is valid .edu
    if not validate_edu_email(user.email):
        raise HTTPException(
            status_code=400,
            detail="Please use a valid .edu email address"
        )

    # Check if user exists
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        residence=user.residence,
        is_verified=True,  # Auto-verify for demo
        verification_badge=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ USER ROUTES ============

@app.get("/api/users/{user_id}", response_model=UserPublic)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/me", response_model=UserResponse)
def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/api/users/{user_id}/items", response_model=List[ItemListResponse])
def get_user_items(user_id: int, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.owner_id == user_id).all()
    return items

@app.get("/api/users/{user_id}/reviews", response_model=List[ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewed_id == user_id).all()
    return reviews

# ============ ITEM ROUTES ============

@app.post("/api/items", response_model=ItemResponse)
def create_item(
    item: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_item = Item(
        **item.model_dump(),
        owner_id=current_user.id,
        insurance_value=2000.0
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/api/items", response_model=List[ItemListResponse])
def get_items(
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    available_only: bool = True,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Item)

    if available_only:
        query = query.filter(Item.is_available == True)

    if category:
        query = query.filter(Item.category == category)

    if location:
        query = query.filter(Item.location.contains(location))

    if min_price:
        query = query.filter(Item.price_day >= min_price)

    if max_price:
        query = query.filter(Item.price_day <= max_price)

    if search:
        query = query.filter(
            or_(
                Item.title.ilike(f"%{search}%"),
                Item.description.ilike(f"%{search}%")
            )
        )

    items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()
    return items

@app.get("/api/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Increment view count
    item.views += 1
    db.commit()
    db.refresh(item)
    return item

@app.put("/api/items/{item_id}", response_model=ItemResponse)
def update_item(
    item_id: int,
    item_update: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in item_update.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item

@app.delete("/api/items/{item_id}")
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

@app.get("/api/items/pricing/suggestion")
def get_pricing_suggestions(category: str):
    suggestion = get_pricing_suggestion(category)
    return PricingSuggestion(
        category=category,
        suggested_hourly=suggestion["hourly"],
        suggested_daily=suggestion["daily"],
        suggested_weekly=suggestion["weekly"],
        suggested_deposit=suggestion["deposit"]
    )

# ============ RENTAL ROUTES ============

@app.post("/api/rentals", response_model=RentalResponse)
def create_rental(
    rental: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == rental.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not item.is_available:
        raise HTTPException(status_code=400, detail="Item not available")
    if item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot rent your own item")

    # Calculate pricing
    pricing = calculate_rental_price(
        item.price_hour, item.price_day, item.price_week,
        rental.start_date, rental.end_date
    )

    # Generate QR codes
    pickup_data = json.dumps({
        "type": "pickup",
        "rental_id": None,  # Will update after commit
        "item": item.title,
        "timestamp": datetime.utcnow().isoformat()
    })
    return_data = json.dumps({
        "type": "return",
        "rental_id": None,
        "item": item.title,
        "timestamp": datetime.utcnow().isoformat()
    })

    db_rental = Rental(
        item_id=rental.item_id,
        renter_id=current_user.id,
        owner_id=item.owner_id,
        start_date=rental.start_date,
        end_date=rental.end_date,
        total_price=pricing["total_price"],
        deposit_amount=item.deposit,
        platform_fee=pricing["platform_fee"],
        owner_earnings=pricing["owner_earnings"],
        status=RentalStatus.PENDING,
        pickup_qr_code=generate_qr_code(pickup_data),
        return_qr_code=generate_qr_code(return_data),
        notes=rental.notes
    )
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)

    return db_rental

@app.get("/api/rentals", response_model=List[RentalResponse])
def get_rentals(
    status: Optional[str] = None,
    as_owner: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if as_owner:
        query = db.query(Rental).filter(Rental.owner_id == current_user.id)
    else:
        query = db.query(Rental).filter(Rental.renter_id == current_user.id)

    if status:
        query = query.filter(Rental.status == status)

    rentals = query.order_by(Rental.created_at.desc()).all()
    return rentals

@app.get("/api/rentals/{rental_id}", response_model=RentalResponse)
def get_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.renter_id != current_user.id and rental.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return rental

@app.put("/api/rentals/{rental_id}", response_model=RentalResponse)
def update_rental(
    rental_id: int,
    rental_update: RentalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.renter_id != current_user.id and rental.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in rental_update.model_dump(exclude_unset=True).items():
        setattr(rental, field, value)

    # Handle status changes
    if rental_update.status == RentalStatus.APPROVED:
        rental.item.is_available = False

    if rental_update.status == RentalStatus.COMPLETED:
        rental.item.is_available = True
        rental.item.total_rentals += 1

        # Create transaction for owner
        transaction = Transaction(
            user_id=rental.owner_id,
            rental_id=rental.id,
            type="earning",
            amount=rental.owner_earnings,
            description=f"Rental of {rental.item.title}",
            status="completed"
        )
        db.add(transaction)

        # Update owner earnings
        rental.owner.total_earnings += rental.owner_earnings
        rental.owner.items_rented_out += 1

        # Update renter stats
        rental.renter.items_borrowed += 1

    db.commit()
    db.refresh(rental)
    return rental

@app.post("/api/rentals/{rental_id}/approve")
def approve_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can approve")

    rental.status = RentalStatus.APPROVED
    rental.item.is_available = False
    db.commit()
    return {"message": "Rental approved"}

@app.post("/api/rentals/{rental_id}/reject")
def reject_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")
    if rental.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can reject")

    rental.status = RentalStatus.REJECTED
    db.commit()
    return {"message": "Rental rejected"}

@app.post("/api/rentals/{rental_id}/verify-pickup")
def verify_pickup(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    rental.pickup_verified = True
    rental.status = RentalStatus.ACTIVE
    db.commit()
    return {"message": "Pickup verified"}

@app.post("/api/rentals/{rental_id}/verify-return")
def verify_return(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental not found")

    rental.return_verified = True
    rental.status = RentalStatus.COMPLETED
    rental.item.is_available = True
    rental.item.total_rentals += 1

    # Create transaction
    transaction = Transaction(
        user_id=rental.owner_id,
        rental_id=rental.id,
        type="earning",
        amount=rental.owner_earnings,
        description=f"Rental of {rental.item.title}",
        status="completed"
    )
    db.add(transaction)

    rental.owner.total_earnings += rental.owner_earnings
    rental.owner.items_rented_out += 1
    rental.renter.items_borrowed += 1

    db.commit()
    return {"message": "Return verified, rental completed"}

# ============ MESSAGE ROUTES ============

@app.post("/api/messages", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_message = Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        rental_id=message.rental_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)

    # Send via WebSocket if connected
    await manager.send_message(message.receiver_id, {
        "type": "new_message",
        "message": {
            "id": db_message.id,
            "sender_id": db_message.sender_id,
            "content": db_message.content,
            "created_at": db_message.created_at.isoformat()
        }
    })

    return db_message

@app.get("/api/messages/conversations", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get unique conversation partners
    sent = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct()
    received = db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct()

    partner_ids = set()
    for (id,) in sent.all():
        partner_ids.add(id)
    for (id,) in received.all():
        partner_ids.add(id)

    conversations = []
    for partner_id in partner_ids:
        partner = db.query(User).filter(User.id == partner_id).first()

        last_message = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.desc()).first()

        unread_count = db.query(Message).filter(
            Message.sender_id == partner_id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()

        conversations.append({
            "user": partner,
            "last_message": last_message,
            "unread_count": unread_count
        })

    # Sort by last message time
    conversations.sort(key=lambda x: x["last_message"].created_at, reverse=True)
    return conversations

@app.get("/api/messages/{user_id}", response_model=List[MessageResponse])
def get_messages_with_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()

    # Mark received messages as read
    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return messages

# ============ REVIEW ROUTES ============

@app.post("/api/reviews", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_review = Review(
        reviewer_id=current_user.id,
        **review.model_dump()
    )
    db.add(db_review)

    # Update user rating
    reviewed_user = db.query(User).filter(User.id == review.reviewed_id).first()
    if reviewed_user:
        total = reviewed_user.rating * reviewed_user.total_reviews + review.rating
        reviewed_user.total_reviews += 1
        reviewed_user.rating = round(total / reviewed_user.total_reviews, 1)

    # Update item rating if applicable
    if review.item_id:
        item = db.query(Item).filter(Item.id == review.item_id).first()
        if item:
            total = item.rating * item.total_reviews + review.rating
            item.total_reviews += 1
            item.rating = round(total / item.total_reviews, 1)

    db.commit()
    db.refresh(db_review)
    return db_review

# ============ DASHBOARD & ANALYTICS ============

@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_month = now.replace(day=1)

    # Get transactions
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).all()

    this_week = sum(t.amount for t in transactions if t.created_at >= start_of_week and t.type == "earning")
    this_month = sum(t.amount for t in transactions if t.created_at >= start_of_month and t.type == "earning")

    # Get rentals
    active_rentals = db.query(Rental).filter(
        Rental.owner_id == current_user.id,
        Rental.status.in_([RentalStatus.APPROVED, RentalStatus.ACTIVE])
    ).all()

    pending_earnings = sum(r.owner_earnings for r in active_rentals)

    completed_rentals = db.query(Rental).filter(
        Rental.owner_id == current_user.id,
        Rental.status == RentalStatus.COMPLETED
    ).count()

    items_count = db.query(Item).filter(Item.owner_id == current_user.id).count()

    # Format rentals for response
    active_rentals_formatted = []
    for r in active_rentals:
        active_rentals_formatted.append({
            "id": r.id,
            "item_id": r.item_id,
            "renter_id": r.renter_id,
            "owner_id": r.owner_id,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "total_price": r.total_price,
            "deposit_amount": r.deposit_amount,
            "platform_fee": r.platform_fee,
            "owner_earnings": r.owner_earnings,
            "status": r.status,
            "pickup_qr_code": r.pickup_qr_code,
            "return_qr_code": r.return_qr_code,
            "pickup_verified": r.pickup_verified,
            "return_verified": r.return_verified,
            "notes": r.notes,
            "created_at": r.created_at,
            "item": {
                "id": r.item.id,
                "title": r.item.title,
                "category": r.item.category,
                "price_hour": r.item.price_hour,
                "price_day": r.item.price_day,
                "price_week": r.item.price_week,
                "location": r.item.location,
                "rating": r.item.rating,
                "total_reviews": r.item.total_reviews,
                "is_available": r.item.is_available,
                "images": r.item.images,
                "owner": {
                    "id": r.item.owner.id,
                    "full_name": r.item.owner.full_name,
                    "profile_photo": r.item.owner.profile_photo,
                    "residence": r.item.owner.residence,
                    "rating": r.item.owner.rating,
                    "total_reviews": r.item.owner.total_reviews,
                    "verification_badge": r.item.owner.verification_badge,
                    "created_at": r.item.owner.created_at
                }
            },
            "renter": {
                "id": r.renter.id,
                "full_name": r.renter.full_name,
                "profile_photo": r.renter.profile_photo,
                "residence": r.renter.residence,
                "rating": r.renter.rating,
                "total_reviews": r.renter.total_reviews,
                "verification_badge": r.renter.verification_badge,
                "created_at": r.renter.created_at
            },
            "owner": {
                "id": r.owner.id,
                "full_name": r.owner.full_name,
                "profile_photo": r.owner.profile_photo,
                "residence": r.owner.residence,
                "rating": r.owner.rating,
                "total_reviews": r.owner.total_reviews,
                "verification_badge": r.owner.verification_badge,
                "created_at": r.owner.created_at
            }
        })

    return {
        "earnings": {
            "total_earnings": current_user.total_earnings,
            "this_month": this_month,
            "this_week": this_week,
            "pending_earnings": pending_earnings,
            "active_rentals": len(active_rentals),
            "completed_rentals": completed_rentals,
            "items_listed": items_count,
            "average_rating": current_user.rating
        },
        "recent_transactions": [
            {
                "id": t.id,
                "user_id": t.user_id,
                "rental_id": t.rental_id,
                "type": t.type,
                "amount": t.amount,
                "description": t.description,
                "status": t.status,
                "created_at": t.created_at
            }
            for t in transactions[:10]
        ],
        "active_rentals": active_rentals_formatted
    }

@app.get("/api/dashboard/earnings-chart")
def get_earnings_chart(
    period: str = "month",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()

    if period == "week":
        start = now - timedelta(days=7)
        group_format = "%Y-%m-%d"
    elif period == "month":
        start = now - timedelta(days=30)
        group_format = "%Y-%m-%d"
    else:  # year
        start = now - timedelta(days=365)
        group_format = "%Y-%m"

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "earning",
        Transaction.created_at >= start
    ).all()

    # Group by date
    earnings_by_date = {}
    for t in transactions:
        date_key = t.created_at.strftime(group_format)
        earnings_by_date[date_key] = earnings_by_date.get(date_key, 0) + t.amount

    return earnings_by_date

@app.get("/api/locations")
def get_locations():
    return list(PRINCETON_LOCATIONS.keys())

@app.get("/api/categories")
def get_categories():
    return [
        "Electronics", "Tech", "Tools", "Fashion", "Sports",
        "Party Supplies", "Academic", "Transportation",
        "Outdoor", "Music", "Wellness"
    ]

# ============ WEBSOCKET FOR REAL-TIME MESSAGING ============

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle ping/pong for keeping connection alive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
