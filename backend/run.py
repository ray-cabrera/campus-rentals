import uvicorn
from app.seed_data import seed_database

if __name__ == "__main__":
    # Seed the database
    try:
        seed_database()
    except Exception as e:
        print(f"Seeding info: {e}")

    # Run the server
    print("\nStarting Campus Rentals API server...")
    print("API docs available at: http://localhost:8000/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
