import qrcode
import io
import base64
from datetime import datetime


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

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"


def generate_rental_qr_codes(rental_id: int):
    """Generate pickup and return QR codes for a rental"""
    timestamp = datetime.utcnow().isoformat()

    pickup_data = f"RENTAL_PICKUP:{rental_id}:{timestamp}"
    return_data = f"RENTAL_RETURN:{rental_id}:{timestamp}"

    pickup_qr = generate_qr_code(pickup_data)
    return_qr = generate_qr_code(return_data)

    return pickup_qr, return_qr
