from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base


class RentalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ItemCategory(str, enum.Enum):
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


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    college = Column(String, nullable=False)
    phone = Column(String)
    bio = Column(Text)
    profile_image = Column(Text)  # Base64 or URL
    is_verified = Column(Boolean, default=False)
    rating = Column(Float, default=5.0)
    total_ratings = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_earnings = Column(Float, default=0.0)

    # Relationships
    items = relationship("Item", back_populates="owner", foreign_keys="Item.owner_id")
    rentals_as_owner = relationship("Rental", back_populates="owner", foreign_keys="Rental.owner_id")
    rentals_as_renter = relationship("Rental", back_populates="renter", foreign_keys="Rental.renter_id")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    ratings_given = relationship("Rating", back_populates="rater", foreign_keys="Rating.rater_id")
    ratings_received = relationship("Rating", back_populates="rated_user", foreign_keys="Rating.rated_user_id")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    daily_rate = Column(Float, nullable=False)
    weekly_rate = Column(Float, nullable=False)
    security_deposit = Column(Float, nullable=False)
    images = Column(Text)  # JSON string array of base64 images
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String)  # e.g., "Butler College"
    is_available = Column(Boolean, default=True)
    insurance_coverage = Column(Float, default=2000.0)
    rating = Column(Float, default=5.0)
    total_ratings = Column(Integer, default=0)
    total_rentals = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="items", foreign_keys=[owner_id])
    rentals = relationship("Rental", back_populates="item")


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    renter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, nullable=False, default=RentalStatus.PENDING.value)
    total_cost = Column(Float, nullable=False)
    security_deposit = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    owner_earnings = Column(Float, nullable=False)
    pickup_qr_code = Column(Text)
    return_qr_code = Column(Text)
    pickup_photos = Column(Text)  # JSON string array
    return_photos = Column(Text)  # JSON string array
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime)
    picked_up_at = Column(DateTime)
    returned_at = Column(DateTime)

    # Relationships
    item = relationship("Item", back_populates="rentals")
    owner = relationship("User", back_populates="rentals_as_owner", foreign_keys=[owner_id])
    renter = relationship("User", back_populates="rentals_as_renter", foreign_keys=[renter_id])
    messages = relationship("Message", back_populates="rental")
    transactions = relationship("Transaction", back_populates="rental")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rental = relationship("Rental", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="received_messages", foreign_keys=[receiver_id])


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=False)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rated_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)  # 1-5 stars
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rater = relationship("User", back_populates="ratings_given", foreign_keys=[rater_id])
    rated_user = relationship("User", back_populates="ratings_received", foreign_keys=[rated_user_id])


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)  # payment, refund, earnings
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rental = relationship("Rental", back_populates="transactions")
