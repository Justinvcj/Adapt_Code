with open("backend/app/routers/problems.py", "r") as f:
    content = f.read()

# Fix IDOR on mastery endpoint
content = content.replace(
    '@router.get("/mastery/{user_id}")\nasync def get_mastery(user_id: str = Depends(get_current_user)):',
    '@router.get("/mastery")\nasync def get_mastery(user_id: str = Depends(get_current_user)):'
)

with open("backend/app/routers/problems.py", "w") as f:
    f.write(content)
print("Done fixing IDOR")
