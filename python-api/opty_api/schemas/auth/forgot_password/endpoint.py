"""
Forgot password endpoint schema.
"""

# --- IMPORTS ---
from pydantic import BaseModel, EmailStr


class UserForgotPasswordPayload(BaseModel):
    """
    Forgot password request payload.
    """
    email: EmailStr
