from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import User, Rating, Rental, RentalStatus
from ..schemas import RatingCreate, RatingResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/ratings", tags=["ratings"])


@router.post("/", response_model=RatingResponse)
async def create_rating(
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify rental exists and is completed
    rental = db.query(Rental).filter(Rental.id == rating_data.rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    if rental.status != RentalStatus.COMPLETED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only rate completed rentals"
        )

    # Verify user is part of rental
    if rental.owner_id != current_user.id and rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to rate this rental"
        )

    # Check if already rated
    existing_rating = db.query(Rating).filter(
        Rating.rental_id == rating_data.rental_id,
        Rating.rater_id == current_user.id,
        Rating.rated_user_id == rating_data.rated_user_id
    ).first()

    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already rated this user for this rental"
        )

    # Create rating
    new_rating = Rating(
        rental_id=rating_data.rental_id,
        rater_id=current_user.id,
        rated_user_id=rating_data.rated_user_id,
        rating=rating_data.rating,
        comment=rating_data.comment
    )

    db.add(new_rating)

    # Update user's average rating
    rated_user = db.query(User).filter(User.id == rating_data.rated_user_id).first()
    if rated_user:
        avg_rating = db.query(func.avg(Rating.rating)).filter(
            Rating.rated_user_id == rating_data.rated_user_id
        ).scalar()

        total_ratings = db.query(Rating).filter(
            Rating.rated_user_id == rating_data.rated_user_id
        ).count()

        rated_user.rating = round(avg_rating, 1) if avg_rating else 5.0
        rated_user.total_ratings = total_ratings + 1

    db.commit()
    db.refresh(new_rating)

    return new_rating


@router.get("/user/{user_id}", response_model=List[RatingResponse])
def get_user_ratings(
    user_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    ratings = db.query(Rating).filter(
        Rating.rated_user_id == user_id
    ).order_by(Rating.created_at.desc()).offset(skip).limit(limit).all()

    return ratings
