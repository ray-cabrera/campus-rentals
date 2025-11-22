from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Message, Rental
from ..schemas import MessageCreate, MessageResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify rental exists and user is part of it
    rental = db.query(Rental).filter(Rental.id == message_data.rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    if rental.owner_id != current_user.id and rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to message about this rental"
        )

    # Create message
    new_message = Message(
        rental_id=message_data.rental_id,
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        message=message_data.message
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.get("/rental/{rental_id}", response_model=List[MessageResponse])
async def get_rental_messages(
    rental_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify user is part of rental
    rental = db.query(Rental).filter(Rental.id == rental_id).first()
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )

    if rental.owner_id != current_user.id and rental.renter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these messages"
        )

    messages = db.query(Message).filter(
        Message.rental_id == rental_id
    ).order_by(Message.created_at.asc()).all()

    # Mark messages as read for current user
    for message in messages:
        if message.receiver_id == current_user.id:
            message.is_read = True

    db.commit()

    return messages


@router.get("/", response_model=List[MessageResponse])
async def get_my_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        (Message.sender_id == current_user.id) |
        (Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()

    return messages


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).count()

    return {"unread_count": count}
