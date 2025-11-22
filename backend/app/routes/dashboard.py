from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, Item, Rental, Transaction, RentalStatus
from ..schemas import DashboardStats, TransactionResponse
from ..utils.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Active rentals (as owner)
    active_rentals = db.query(Rental).filter(
        Rental.owner_id == current_user.id,
        Rental.status.in_([RentalStatus.APPROVED.value, RentalStatus.ACTIVE.value])
    ).count()

    # Items listed
    items_listed = db.query(Item).filter(
        Item.owner_id == current_user.id
    ).count()

    # Items borrowed (as renter)
    items_borrowed = db.query(Rental).filter(
        Rental.renter_id == current_user.id,
        Rental.status == RentalStatus.ACTIVE.value
    ).count()

    # Pending requests (as owner)
    pending_requests = db.query(Rental).filter(
        Rental.owner_id == current_user.id,
        Rental.status == RentalStatus.PENDING.value
    ).count()

    # Calculate weekly earnings (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_earnings = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "earnings",
        Transaction.created_at >= week_ago
    ).scalar() or 0.0

    # Calculate monthly earnings (last 30 days)
    month_ago = datetime.utcnow() - timedelta(days=30)
    monthly_earnings = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_type == "earnings",
        Transaction.created_at >= month_ago
    ).scalar() or 0.0

    return {
        "total_earnings": current_user.total_earnings,
        "active_rentals": active_rentals,
        "items_listed": items_listed,
        "items_borrowed": items_borrowed,
        "pending_requests": pending_requests,
        "monthly_earnings": round(monthly_earnings, 2),
        "weekly_earnings": round(weekly_earnings, 2)
    }


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()

    return transactions
