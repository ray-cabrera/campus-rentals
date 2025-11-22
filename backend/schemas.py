from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    residence: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    residence: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None

class UserResponse(UserBase):
    id: int
    profile_photo: Optional[str] = None
    phone: Optional[str] = None
    location: str
    residence: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool
    verification_badge: bool
    rating: float
    total_reviews: int
    total_earnings: float
    items_rented_out: int
    items_borrowed: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    id: int
    full_name: str
    profile_photo: Optional[str] = None
    residence: Optional[str] = None
    rating: float
    total_reviews: int
    verification_badge: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# Item schemas
class ItemBase(BaseModel):
    title: str
    description: str
    category: str
    condition: Optional[str] = "Good"
    price_hour: Optional[float] = None
    price_day: float
    price_week: Optional[float] = None
    deposit: Optional[float] = 0.0
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ItemCreate(ItemBase):
    images: str  # JSON array of base64 images

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    price_hour: Optional[float] = None
    price_day: Optional[float] = None
    price_week: Optional[float] = None
    deposit: Optional[float] = None
    location: Optional[str] = None
    is_available: Optional[bool] = None
    images: Optional[str] = None

class ItemResponse(ItemBase):
    id: int
    owner_id: int
    images: str
    is_available: bool
    insurance_value: float
    rating: float
    total_rentals: int
    total_reviews: int
    views: int
    created_at: datetime
    owner: UserPublic

    class Config:
        from_attributes = True

class ItemListResponse(BaseModel):
    id: int
    title: str
    category: str
    price_hour: Optional[float] = None
    price_day: float
    price_week: Optional[float] = None
    location: str
    rating: float
    total_reviews: int
    is_available: bool
    images: str
    owner: UserPublic

    class Config:
        from_attributes = True

# Rental schemas
class RentalCreate(BaseModel):
    item_id: int
    start_date: datetime
    end_date: datetime
    notes: Optional[str] = None

class RentalUpdate(BaseModel):
    status: Optional[str] = None
    pickup_photo: Optional[str] = None
    return_photo: Optional[str] = None
    pickup_verified: Optional[bool] = None
    return_verified: Optional[bool] = None

class RentalResponse(BaseModel):
    id: int
    item_id: int
    renter_id: int
    owner_id: int
    start_date: datetime
    end_date: datetime
    total_price: float
    deposit_amount: float
    platform_fee: float
    owner_earnings: float
    status: str
    pickup_qr_code: Optional[str] = None
    return_qr_code: Optional[str] = None
    pickup_verified: bool
    return_verified: bool
    notes: Optional[str] = None
    created_at: datetime
    item: ItemListResponse
    renter: UserPublic
    owner: UserPublic

    class Config:
        from_attributes = True

# Message schemas
class MessageCreate(BaseModel):
    receiver_id: int
    rental_id: Optional[int] = None
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    rental_id: Optional[int] = None
    content: str
    is_read: bool
    created_at: datetime
    sender: UserPublic

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    user: UserPublic
    last_message: MessageResponse
    unread_count: int

# Review schemas
class ReviewCreate(BaseModel):
    reviewed_id: int
    item_id: Optional[int] = None
    rental_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    reviewed_id: int
    item_id: Optional[int] = None
    rental_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    reviewer: UserPublic

    class Config:
        from_attributes = True

# Transaction schemas
class TransactionResponse(BaseModel):
    id: int
    user_id: int
    rental_id: Optional[int] = None
    type: str
    amount: float
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard schemas
class EarningsSummary(BaseModel):
    total_earnings: float
    this_month: float
    this_week: float
    pending_earnings: float
    active_rentals: int
    completed_rentals: int
    items_listed: int
    average_rating: float

class DashboardStats(BaseModel):
    earnings: EarningsSummary
    recent_transactions: List[TransactionResponse]
    active_rentals: List[RentalResponse]

# Pricing suggestion
class PricingSuggestion(BaseModel):
    category: str
    suggested_hourly: Optional[float]
    suggested_daily: float
    suggested_weekly: float
    suggested_deposit: float
