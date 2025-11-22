from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routes import auth, items, rentals, messages, ratings, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Campus Rentals API",
    description="A peer-to-peer marketplace for college students to rent items",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(rentals.router)
app.include_router(messages.router)
app.include_router(ratings.router)
app.include_router(dashboard.router)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Campus Rentals API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
