from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import User, Item
from ..schemas import ItemCreate, ItemUpdate, ItemResponse
from ..utils.auth import get_current_user

router = APIRouter(prefix="/api/items", tags=["items"])


@router.post("/", response_model=ItemResponse)
async def create_item(
    item_data: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_item = Item(
        **item_data.model_dump(),
        owner_id=current_user.id
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.get("/", response_model=List[ItemResponse])
def get_items(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    available_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(Item)

    if available_only:
        query = query.filter(Item.is_available == True)

    if category:
        query = query.filter(Item.category == category)

    if search:
        query = query.filter(
            (Item.title.ilike(f"%{search}%")) |
            (Item.description.ilike(f"%{search}%"))
        )

    if min_price is not None:
        query = query.filter(Item.daily_rate >= min_price)

    if max_price is not None:
        query = query.filter(Item.daily_rate <= max_price)

    if location:
        query = query.filter(Item.location.ilike(f"%{location}%"))

    items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()

    return items


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    item_data: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this item"
        )

    for key, value in item_data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this item"
        )

    db.delete(item)
    db.commit()

    return {"message": "Item deleted successfully"}


@router.get("/user/my-items", response_model=List[ItemResponse])
async def get_my_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Item).filter(Item.owner_id == current_user.id).all()
    return items
