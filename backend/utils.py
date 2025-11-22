import qrcode
import io
import base64
import json
from typing import Optional
from datetime import datetime, timedelta

def generate_qr_code(data: str) -> str:
    """Generate a QR code and return as base64 string"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def calculate_rental_price(
    price_hour: Optional[float],
    price_day: float,
    price_week: Optional[float],
    start_date: datetime,
    end_date: datetime
) -> dict:
    """Calculate total rental price based on duration"""
    duration = end_date - start_date
    total_hours = duration.total_seconds() / 3600
    total_days = total_hours / 24

    # Calculate best price based on duration
    if total_days >= 7 and price_week:
        weeks = total_days // 7
        remaining_days = total_days % 7
        base_price = (weeks * price_week) + (remaining_days * price_day)
    elif total_days >= 1:
        base_price = total_days * price_day
    elif price_hour and total_hours > 0:
        base_price = total_hours * price_hour
    else:
        base_price = price_day  # Minimum one day

    platform_fee = round(base_price * 0.15, 2)  # 15% commission
    owner_earnings = round(base_price - platform_fee, 2)

    return {
        "total_price": round(base_price, 2),
        "platform_fee": platform_fee,
        "owner_earnings": owner_earnings,
        "duration_days": round(total_days, 1),
        "duration_hours": round(total_hours, 1)
    }

def get_pricing_suggestion(category: str) -> dict:
    """Get suggested pricing based on category"""
    suggestions = {
        "Electronics": {"hourly": 5, "daily": 15, "weekly": 70, "deposit": 100},
        "Tech": {"hourly": 8, "daily": 25, "weekly": 100, "deposit": 150},
        "Tools": {"hourly": 3, "daily": 10, "weekly": 40, "deposit": 50},
        "Fashion": {"hourly": None, "daily": 10, "weekly": 35, "deposit": 50},
        "Sports": {"hourly": 5, "daily": 15, "weekly": 50, "deposit": 75},
        "Party Supplies": {"hourly": 5, "daily": 20, "weekly": 80, "deposit": 100},
        "Academic": {"hourly": 2, "daily": 8, "weekly": 30, "deposit": 30},
        "Transportation": {"hourly": 3, "daily": 10, "weekly": 40, "deposit": 100},
        "Outdoor": {"hourly": 3, "daily": 12, "weekly": 50, "deposit": 75},
        "Music": {"hourly": 5, "daily": 15, "weekly": 60, "deposit": 100},
        "Wellness": {"hourly": 2, "daily": 8, "weekly": 30, "deposit": 25},
    }

    default = {"hourly": 5, "daily": 15, "weekly": 60, "deposit": 50}
    return suggestions.get(category, default)

# Princeton campus locations with coordinates
PRINCETON_LOCATIONS = {
    "Butler College": {"lat": 40.3434, "lng": -74.6555},
    "Whitman College": {"lat": 40.3432, "lng": -74.6598},
    "Mathey College": {"lat": 40.3498, "lng": -74.6605},
    "Rockefeller College": {"lat": 40.3478, "lng": -74.6583},
    "Wilson College": {"lat": 40.3443, "lng": -74.6575},
    "Forbes College": {"lat": 40.3403, "lng": -74.6545},
    "Frist Campus Center": {"lat": 40.3467, "lng": -74.6555},
    "Friend Center": {"lat": 40.3502, "lng": -74.6522},
    "E-Quad Engineering": {"lat": 40.3503, "lng": -74.6515},
    "Firestone Library": {"lat": 40.3492, "lng": -74.6578},
    "Woolworth Center": {"lat": 40.3479, "lng": -74.6594},
    "Pyne Hall": {"lat": 40.3488, "lng": -74.6598},
    "Witherspoon Hall": {"lat": 40.3483, "lng": -74.6612},
    "Nassau Hall": {"lat": 40.3486, "lng": -74.6590},
}

def get_location_coords(location_name: str) -> dict:
    """Get coordinates for a Princeton location"""
    return PRINCETON_LOCATIONS.get(location_name, {"lat": 40.3467, "lng": -74.6555})
