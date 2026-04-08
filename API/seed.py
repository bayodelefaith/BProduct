#!/usr/bin/env python
"""
Seed script to initialize admin users in the database
Run with: python seed.py
"""

from sqlmodel import SQLModel, Session, create_engine
from models.admin import Admin
from auth import hash_password
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, connect_args=connect_args)


def seed_admin():
    """Seed database with default admin user"""
    # Create all tables
    SQLModel.metadata.create_all(engine)
    print("✅ Database tables initialized")

    admin_users = [
        {
            "email": "admin@example.com",
            "name": "Admin",
            "password": "admin123",
        },
        {
            "email": "berithajao@gmail.com",
            "name": "Berith Admin",
            "password": "admin123",
        },
    ]

    with Session(engine) as session:
        from sqlmodel import select
        
        for admin_data in admin_users:
            # Check if admin already exists
            statement = select(Admin).where(Admin.email == admin_data["email"])
            existing = session.exec(statement).first()
            
            if not existing:
                hashed_pw = hash_password(admin_data["password"])
                admin = Admin(
                    email=admin_data["email"],
                    name=admin_data["name"],
                    hashed_password=hashed_pw
                )
                session.add(admin)
                session.commit()
                print(f"✅ Created admin: {admin_data['email']}")
            else:
                print(f"ℹ️  Admin already exists: {admin_data['email']}")

    print("\n" + "=" * 50)
    print("📋 Admin Credentials:")
    print("=" * 50)
    for admin_data in admin_users:
        print(f"\nEmail: {admin_data['email']}")
        print(f"Password: {admin_data['password']}")
    print("=" * 50)


if __name__ == "__main__":
    seed_admin()
