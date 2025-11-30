"""
Startup and shutdown event handlers.
"""

# --- IMPORTS ---
from fastapi import FastAPI
from opty_api import routers
from opty_api.app import container
from opty_api.app import health
from opty_api.mongo.repositories.users import UserRepository
from opty_api.mongo.setup.connection import MongoDBSetup
from openai import AsyncOpenAI
from supabase import acreate_client


# --- CODE ---
async def on_startup(app: FastAPI) -> None:
    """
    Initialize the service on startup.
    """
    # Mount routers
    routers.mount(app)

    # Initialize MongoDB
    mongodb = MongoDBSetup(db_name=container['config'].MONGODB_DB_NAME,
                           mongodb_url=container['config'].MONGODB_URL,)

    # Initialize repositories
    user_repository = UserRepository(mongodb)

    # Initialize supabase client
    supabase_client = await acreate_client(supabase_url=container['config'].SUPABASE_URL,
                                           supabase_key=container['config'].SUPABASE_KEY)

    # Initialize OpenAI client
    openai_client = AsyncOpenAI(api_key=container['config'].OPENAI_API_KEY)

    # Update container
    container.update({
        'mongodb': mongodb,
        'user_repository': user_repository,
        'supabase_client': supabase_client,
        'openai_client': openai_client,
    })

    # Set app health as OK
    health.status = 'OK'


def on_shutdown(app: FastAPI) -> None:  #pylint: disable=W0613
    """
    Run on service shutdown.
    """
    pass
