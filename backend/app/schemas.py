from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    college: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    college: str
    phone: Optional[str]
    bio: Optional[str]
    profile_image: Optional[str]
    is_verified: bool
    rating: float
    total_ratings: int
    total_earnings: float
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None


# Item Schemas
class ItemCreate(BaseModel):
    title: str
    description: str
    category: str
    daily_rate: float
    weekly_rate: float
    security_deposit: float
    images: Optional[str] = None  # JSON string array
    location: str


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    daily_rate: Optional[float] = None
    weekly_rate: Optional[float] = None
    security_deposit: Optional[float] = None
    images: Optional[str] = None
    location: Optional[str] = None
    is_available: Optional[bool] = None


class ItemResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    daily_rate: float
    weekly_rate: float
    security_deposit: float
    images: Optional[str]
    owner_id: int
    location: str
    is_available: bool
    insurance_coverage: float
    rating: float
    total_ratings: int
    total_rentals: int
    created_at: datetime
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# Rental Schemas
class RentalCreate(BaseModel):
    item_id: int
    start_date: datetime
    end_date: datetime


class RentalResponse(BaseModel):
    id: int
    item_id: int
    owner_id: int
    renter_id: int
    start_date: datetime
    end_date: datetime
    status: str
    total_cost: float
    security_deposit: float
    platform_fee: float
    owner_earnings: float
    pickup_qr_code: Optional[str]
    return_qr_code: Optional[str]
    created_at: datetime
    approved_at: Optional[datetime]
    picked_up_at: Optional[datetime]
    returned_at: Optional[datetime]
    item: Optional[ItemResponse] = None
    renter: Optional[UserResponse] = None
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class RentalUpdate(BaseModel):
    status: Optional[str] = None
    pickup_photos: Optional[str] = None
    return_photos: Optional[str] = None


# Message Schemas
class MessageCreate(BaseModel):
    rental_id: int
    receiver_id: int
    message: str


class MessageResponse(BaseModel):
    id: int
    rental_id: int
    sender_id: int
    receiver_id: int
    message: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserResponse] = None
    receiver: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# Rating Schemas
class RatingCreate(BaseModel):
    rental_id: int
    rated_user_id: int
    rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class RatingResponse(BaseModel):
    id: int
    rental_id: int
    rater_id: int
    rated_user_id: int
    rating: float
    comment: Optional[str]
    created_at: datetime
    rater: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionResponse(BaseModel):
    id: int
    rental_id: int
    user_id: int
    amount: float
    transaction_type: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Dashboard Schemas
class DashboardStats(BaseModel):
    total_earnings: float
    active_rentals: int
    items_listed: int
    items_borrowed: int
    pending_requests: int
    monthly_earnings: float
    weekly_earnings: float
