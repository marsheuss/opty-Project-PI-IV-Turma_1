"""
Data models.
"""

# --- IMPORTS ---
from pydantic import BaseModel
from pydantic_settings import BaseSettings


# --- TYPES ---
from typing import Any
from typing import Dict
from typing import Literal


# --- CODE ---
# Config model
class Config(BaseSettings):
    """
    Application configuration.
    """
    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # MongoDB settings
    MONGODB_URL: str
    MONGODB_DB_NAME: str

    # OpenAI settings
    OPENAI_API_KEY: str

    class Config:
        """
        Pydantic settings configuration.
        """
        env_file = '.env'


# Health model
class Health(BaseModel):
    """
    System health status.
    """
    status: Literal['OK', 'WARNING', 'FAILURE', 'UNKNOWN'] = 'UNKNOWN'


# Info model
class Info(BaseModel):
    """
    System information.
    """
    name: str
    description: str
    version: str
    extra: Dict[str, Any]


# --- Forward references ---
Config.model_rebuild()
Health.model_rebuild()
Info.model_rebuild()
