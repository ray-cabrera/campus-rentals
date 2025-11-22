# Campus Rentals

A peer-to-peer marketplace for college students to rent out their unused items to other students.

![Campus Rentals](https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800)

## Features

### Core Features
- **User System**: Registration/login with .edu email verification, user profiles with ratings and verification badges
- **Item Listing**: Add items with photos, descriptions, and flexible pricing (hourly/daily/weekly rates)
- **Categories**: Electronics, Tools, Fashion, Sports, Party Supplies, Academic, Transportation, Outdoor, Music, Wellness
- **Search & Discovery**: Browse by category, price, location with full-text search
- **Rental Flow**: Request to rent, owner approval, QR code verification for pickup/return

### Safety & Trust
- $2,000 insurance coverage per rental (simulated)
- Photo documentation at pickup/return
- In-app messaging between renter and owner
- 5-star rating system for both parties
- Verified student badges (.edu email verification)

### Financial Tracking
- Earnings dashboard with projections
- Transaction history
- 15% platform fee display
- Weekly/monthly/semester earnings projections

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Lucide Icons
- **Backend**: Python FastAPI
- **Database**: SQLite
- **Authentication**: JWT tokens
- **Real-time**: WebSocket for messaging (with polling fallback)

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with demo data
python seed_data.py

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Demo Credentials

All demo accounts use the password: `demo123`

| Email | Description |
|-------|-------------|
| demo@princeton.edu | Fresh demo account |
| alex.chen@princeton.edu | Top earner with $1,250+ |
| sarah.johnson@princeton.edu | Tool expert |
| marcus.williams@princeton.edu | Music & tech enthusiast |
| emma.davis@princeton.edu | Outdoor gear specialist |
| james.rodriguez@princeton.edu | Party supplies king |

## Project Structure

```
campus-rentals/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # Authentication utilities
│   ├── utils.py         # Helper functions
│   ├── database.py      # Database configuration
│   ├── seed_data.py     # Demo data seeder
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main application
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - List items (with filters)
- `GET /api/items/{id}` - Get item details
- `POST /api/items` - Create new item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

### Rentals
- `GET /api/rentals` - List user's rentals
- `POST /api/rentals` - Create rental request
- `POST /api/rentals/{id}/approve` - Approve rental
- `POST /api/rentals/{id}/reject` - Reject rental
- `POST /api/rentals/{id}/verify-pickup` - Verify pickup
- `POST /api/rentals/{id}/verify-return` - Verify return

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/{user_id}` - Get messages with user
- `POST /api/messages` - Send message

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/earnings-chart` - Get earnings data

## Demo Scenarios

### 1. New User Registration
1. Click "Get Started"
2. Fill in your .edu email and details
3. Create password and register
4. Explore the dashboard

### 2. Browse and Rent
1. Go to "Browse Items"
2. Filter by category or search
3. Click on an item to view details
4. Click "Request to Rent"
5. Select dates and submit request

### 3. List an Item
1. Click "List Item" in navbar
2. Fill in item details
3. Use "Suggested Pricing" for auto-pricing
4. Submit listing

### 4. Manage Rentals
1. Go to "My Rentals"
2. Switch between "Borrowing" and "Lending" tabs
3. Approve/reject requests
4. Use QR codes for pickup/return

### 5. View Earnings
1. Go to "Earnings" page
2. View charts and projections
3. See transaction history

## Key Design Decisions

1. **Princeton Orange (#FF6600)**: Used as primary brand color for campus identity
2. **Mobile-First**: Responsive design optimized for students on mobile
3. **Trust Indicators**: Verification badges, ratings, and insurance displayed prominently
4. **QR Verification**: Secure handoff process for physical items
5. **Auto-Pricing**: AI-suggested pricing based on category averages

## Future Enhancements

- [ ] Push notifications
- [ ] Calendar integration
- [ ] Multi-campus support
- [ ] Payment processing (Stripe)
- [ ] Item reservation system
- [ ] Damage report workflow
- [ ] Mobile app (React Native)

## Contributing

This project was built for a hackathon demonstration. Feel free to fork and extend!

## License

MIT License - Feel free to use this for your own campus!

---

**Built with love for Princeton students**

*Share More, Spend Less*
