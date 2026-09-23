with open("backend/app/routers/checkout.py", "r") as f:
    content = f.read()

content = content.replace("from app.core.dependencies import get_current_user", "from app.core.dependencies import get_current_user, require_admin")

content = content.replace(
    "async def mock_upgrade(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:",
    "async def mock_upgrade(user_id: str = Depends(require_admin)) -> Dict[str, Any]:"
)

with open("backend/app/routers/checkout.py", "w") as f:
    f.write(content)
print("Done fixing checkout.py")
