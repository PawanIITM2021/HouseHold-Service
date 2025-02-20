from main import app
from backend.sec import datastore
from backend.models import db, Role, Section
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.drop_all()
    db.create_all()
    section = Section(section_name="Section 1", section_discription="Section 1")
    db.session.add(section)
    # datastore.find_or_create_role(name="admin", description="User is an admin")
    datastore.find_or_create_role(name="member", discription="User is a Member")
    datastore.find_or_create_role(name="admin", discription="User is a Admin")
    db.session.commit()
    # if not datastore.find_user(email="admin@email.com"):
    #     datastore.create_user(
    #         email="admin@email.com", password=generate_password_hash("pass123"), roles=["admin"])
    if not datastore.find_user(email="admin@email.com"):
        datastore.create_user(name="Admin",
                              email="admin@email.com", password=generate_password_hash("pass123"), roles=["admin"],
                              active=True)
    if not datastore.find_user(email="m1@email.com"):
        datastore.create_user(
            name="Member 1",
            email="m1@email.com", password=generate_password_hash("pass123"), roles=["member"])
    if not datastore.find_user(email="m2@email.com"):
        datastore.create_user(
            name="Member 2",
            email="m2@email.com", password=generate_password_hash("pass123"), roles=["member"])

    db.session.commit()
