from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class RentalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Category(str, enum.Enum):
    ELECTRONICS = "Electronics"
    TOOLS = "Tools"
    FASHION = "Fashion"
    SPORTS = "Sports"
    PARTY = "Party Supplies"
    ACADEMIC = "Academic"
    TRANSPORTATION = "Transportation"
    OUTDOOR = "Outdoor"
    MUSIC = "Music"
    WELLNESS = "Wellness"
    TECH = "Tech"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    profile_photo = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, default="Princeton University")
    residence = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_badge = Column(Boolean, default=False)
    rating = Column(Float, default=5.0)
    total_reviews = Column(Integer, default=0)
    total_earnings = Column(Float, default=0.0)
    items_rented_out = Column(Integer, default=0)
    items_borrowed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("Item", back_populates="owner")
    rentals_as_renter = relationship("Rental", foreign_keys="Rental.renter_id", back_populates="renter")
    rentals_as_owner = relationship("Rental", foreign_keys="Rental.owner_id", back_populates="owner")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    reviews_given = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.reviewed_id", back_populates="reviewed")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    condition = Column(String, default="Good")

    price_hour = Column(Float, nullable=True)
    price_day = Column(Float)
    price_week = Column(Float, nullable=True)

    deposit = Column(Float, default=0.0)
    insurance_value = Column(Float, default=2000.0)

    images = Column(Text)  # JSON array of base64 images
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    is_available = Column(Boolean, default=True)
    availability_calendar = Column(Text, nullable=True)  # JSON for blocked dates

    rating = Column(Float, default=5.0)
    total_rentals = Column(Integer, default=0)
    total_reviews = Column(Integer, default=0)
    views = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="items")
    rentals = relationship("Rental", back_populates="item")
    reviews = relationship("Review", back_populates="item")

class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    renter_id = Column(Integer, ForeignKey("users.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))

    start_date = Column(DateTime)
    end_date = Column(DateTime)

    total_price = Column(Float)
    deposit_amount = Column(Float, default=0.0)
    platform_fee = Column(Float)  # 15% commission
    owner_earnings = Column(Float)

    status = Column(String, default=RentalStatus.PENDING)

    pickup_qr_code = Column(Text, nullable=True)
    return_qr_code = Column(Text, nullable=True)
    pickup_photo = Column(Text, nullable=True)
    return_photo = Column(Text, nullable=True)
    pickup_verified = Column(Boolean, default=False)
    return_verified = Column(Boolean, default=False)

    insurance_claim = Column(Boolean, default=False)
    insurance_claim_amount = Column(Float, nullable=True)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    item = relationship("Item", back_populates="rentals")
    renter = relationship("User", foreign_keys=[renter_id], back_populates="rentals_as_renter")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="rentals_as_owner")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=True)

    content = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="messages_received")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewed_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=True)

    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviews_given")
    reviewed = relationship("User", foreign_keys=[reviewed_id], back_populates="reviews_received")
    item = relationship("Item", back_populates="reviews")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=True)

    type = Column(String)  # earning, payout, deposit, refund
    amount = Column(Float)
    description = Column(String)
    status = Column(String, default="completed")

    created_at = Column(DateTime, default=datetime.utcnow)
