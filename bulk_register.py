import requests
import random
import time
import csv
from faker import Faker

URL = "http://localhost:5000/api/auth/register"
TOTAL_USERS = 20000
DELAY = 0.02   

fake = Faker()

avatars = [
    "http://localhost:5000/avatars/avatar1.jpg",
    "http://localhost:5000/avatars/avatar2.jpg",
    "http://localhost:5000/avatars/avatar3.jpg",
    "http://localhost:5000/avatars/avatar4.jpg",
    "http://localhost:5000/avatars/avatar5.jpg",
    "http://localhost:5000/avatars/avatar6.jpg",
]

def generate_user(i):
    return {
        "fullName": fake.name(),
        "username": f"user{i}_{fake.user_name()}",
        "email": f"user{i}_{fake.email()}",
        "password": "Password@123",
        "avatar": random.choice(avatars)
    }

success = 0
failed = 0

with open("registered_users7.csv", mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["fullName", "username", "email", "password", "avatar", "status"])

    print("Starting bulk registration...\n")

    for i in range(TOTAL_USERS):
        user = generate_user(i)

        try:
            response = requests.post(URL, json=user)

            if response.status_code in [200, 201]:
                print(f"{i+1}: {user['username']}")
                success += 1

                writer.writerow([
                    user["fullName"],
                    user["username"],
                    user["email"],
                    user["password"],
                    user["avatar"],
                    "SUCCESS"
                ])
            else:
                print(f"{i+1}: Failed -> {response.text}")
                failed += 1

                writer.writerow([
                    user["fullName"],
                    user["username"],
                    user["email"],
                    user["password"],
                    user["avatar"],
                    "FAILED"
                ])

        except Exception as e:
            print(f"{i+1}: Error -> {e}")
            failed += 1

            writer.writerow([
                user["fullName"],
                user["username"],
                user["email"],
                user["password"],
                user["avatar"],
                "ERROR"
            ])

        time.sleep(DELAY)

print("\nDONE")
print(f"Total Success: {success}")
print(f"Total Failed: {failed}")