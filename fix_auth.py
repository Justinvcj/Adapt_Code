with open('backend/app/routers/auth.py', 'r') as f:
    content = f.read()

old_register_except = """        return {
            "status": "success",
            "user_id": user_id,
            "access_token": res.session.access_token if res.session else None,
            "display_name": req.display_name
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))"""

new_register_except = """        return {
            "status": "success",
            "user_id": user_id,
            "access_token": res.session.access_token if res.session else None,
            "display_name": req.display_name
        }
    except HTTPException:
        raise
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Registration failed: {e}")
        raise HTTPException(status_code=400, detail="Registration failed.")"""
        
content = content.replace(old_register_except, new_register_except)


old_login_except = """        return {
            "status": "success",
            "user_id": user_id,
            "access_token": res.session.access_token,
            "display_name": display_name,
            "is_pro": is_pro
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))"""

new_login_except = """        return {
            "status": "success",
            "user_id": user_id,
            "access_token": res.session.access_token,
            "display_name": display_name,
            "is_pro": is_pro
        }
    except HTTPException:
        raise
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials.")"""
        
content = content.replace(old_login_except, new_login_except)

with open('backend/app/routers/auth.py', 'w') as f:
    f.write(content)
print("Done fixing auth.py")
