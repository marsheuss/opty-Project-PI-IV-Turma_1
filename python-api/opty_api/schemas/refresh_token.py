from pydantic import BaseModel
from datetime import datetime

class RefreshToken(BaseModel):
    user_id: str
    token: str
    expires_at: datetime
    created_at: datetime
