import re

with open("backend/app/routers/problems.py", "r") as f:
    content = f.read()

# Delete get_mastery completely from problems.py
# Look for:
# @router.get("/mastery")
# async def get_mastery(user_id: str = Depends(get_current_user)):
#     ...
#     return { ... }
#
# (or if it still has {user_id})

pattern = r'@router\.get\("/mastery(?:/\{user_id\})?"\)\nasync def get_mastery\(user_id: str = Depends\(get_current_user\)\):[\s\S]*?return \{[\s\S]*?\}'

content = re.sub(pattern, "", content)

with open("backend/app/routers/problems.py", "w") as f:
    f.write(content)
print("Removed duplicate mastery from problems.py")
