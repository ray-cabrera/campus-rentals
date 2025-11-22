from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import User, Item, Rental, Transaction, RentalStatus
from ..schemas import RentalCreate, RentalResponse, RentalUpdate
from ..utils.auth import get_current_user
from ..utils.qr_code import generate_rental_qr_codes

router = APIRouter(prefix="/api/rentals", tags=["rentals"])


def calculate_rental_cost(item: Item, start_date: datetime, end_date: datetime):
    """Calculate rental costs and fees"""
    days = (end_date - start_date).days
    if days < 1:
        days = 1

    # Use weekly rate if 7+ days, otherwise daily rate
    if days >= 7:
        weeks = days // 7
        remaining_days = days % 7
        total_cost = (weeks * item.weekly_rate) + (remaining_days * item.daily_rate)
    else:
        total_cost = days * item.daily_rate

    platform_fee = total_cost * 0.15  # 15% platform fee
    owner_earnings = total_cost - platform_fee

    return {
        "total_cost": round(total_cost, 2),
        "platform_fee": round(platform_fee, 2),
        "owner_earnings": round(owner_earnings, 2),
        "security_deposit": item.security_deposit
    }


@router.post("/", response_model=RentalResponse)
async def create_rental(
    rental_data: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get item
    item = db.query(Item).filter(Item.id == rental_data.item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Can't rent your own item
    if item.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot rent your own item"
        )

    # Check if item is available
    if not item.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item is not available"
        )

    # Calculate costs
    costs = calculate_rental_cost(item, rental_data.start_date, rental_data.end_date)

    # Create rental
    new_rental = Rental(
        item_id=item.id,
        owner_id=item.owner_id,
        renter_id=current_user.id,
        start_date=rental_data.start_date,
        end_date=rental_data.end_date,
        status=RentalStatus.PENDING.value,
        **costs
    )

    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)

    return new_rental


@router.get("/", response_model=List[RentalResponse])
async def get_rentals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    as_owner: bool = False,
    status: str = None
):
    if as_owner:
        query = db.query(Rental).filter(Rental.owner_id == current_user.id)
    else:
        query = db.query(Rental).filter(Rental.renter_id == current_user.id)

    if status:
        query = query.filter(Rental.status == status)

    rentals = query.order_by(Rental.created_at.desc()).all()
    return rentals


@router.get("/{rental_id}", response_model=RentalResponse)
async def get_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    # Check if user is owner or renter
    if rental.owner_id != current_user.id and rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this rental"
        )

    return rental


@router.put("/{rental_id}/approve", response_model=RentalResponse)
async def approve_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    # Only owner can approve
    if rental.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can approve this rental"
        )

    if rental.status != RentalStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rental is not pending"
        )

    # Generate QR codes
    pickup_qr, return_qr = generate_rental_qr_codes(rental.id)

    rental.status = RentalStatus.APPROVED.value
    rental.approved_at = datetime.utcnow()
    rental.pickup_qr_code = pickup_qr
    rental.return_qr_code = return_qr

    # Update item availability
    item = db.query(Item).filter(Item.id == rental.item_id).first()
    if item:
        item.is_available = False

    db.commit()
    db.refresh(rental)

    return rental


@router.put("/{rental_id}/pickup", response_model=RentalResponse)
async def mark_pickup(
    rental_id: int,
    pickup_data: RentalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    if rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    rental.status = RentalStatus.ACTIVE.value
    rental.picked_up_at = datetime.utcnow()
    if pickup_data.pickup_photos:
        rental.pickup_photos = pickup_data.pickup_photos

    # Create transaction for payment
    transaction = Transaction(
        rental_id=rental.id,
        user_id=current_user.id,
        amount=rental.total_cost + rental.security_deposit,
        transaction_type="payment",
        description=f"Payment for rental #{rental.id}"
    )
    db.add(transaction)

    db.commit()
    db.refresh(rental)

    return rental


@router.put("/{rental_id}/return", response_model=RentalResponse)
async def mark_return(
    rental_id: int,
    return_data: RentalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    # Either owner or renter can mark return
    if rental.owner_id != current_user.id and rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    rental.status = RentalStatus.COMPLETED.value
    rental.returned_at = datetime.utcnow()
    if return_data.return_photos:
        rental.return_photos = return_data.return_photos

    # Update item availability
    item = db.query(Item).filter(Item.id == rental.item_id).first()
    if item:
        item.is_available = True
        item.total_rentals += 1

    # Update owner earnings
    owner = db.query(User).filter(User.id == rental.owner_id).first()
    if owner:
        owner.total_earnings += rental.owner_earnings

    # Create earnings transaction
    earnings_transaction = Transaction(
        rental_id=rental.id,
        user_id=rental.owner_id,
        amount=rental.owner_earnings,
        transaction_type="earnings",
        description=f"Earnings from rental #{rental.id}"
    )
    db.add(earnings_transaction)

    # Refund security deposit
    refund_transaction = Transaction(
        rental_id=rental.id,
        user_id=rental.renter_id,
        amount=rental.security_deposit,
        transaction_type="refund",
        description=f"Security deposit refund for rental #{rental.id}"
    )
    db.add(refund_transaction)

    db.commit()
    db.refresh(rental)

    return rental


@router.put("/{rental_id}/cancel", response_model=RentalResponse)
async def cancel_rental(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    # Owner or renter can cancel
    if rental.owner_id != current_user.id and rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    rental.status = RentalStatus.CANCELLED.value

    # Make item available again if it was approved
    if rental.status in [RentalStatus.PENDING.value, RentalStatus.APPROVED.value]:
        item = db.query(Item).filter(Item.id == rental.item_id).first()
        if item:
            item.is_available = True

    db.commit()
    db.refresh(rental)

    return rental
