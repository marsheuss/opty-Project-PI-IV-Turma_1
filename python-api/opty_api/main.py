"""
Service entry point.
"""

# --- IMPORTS ---
from contextlib import asynccontextmanager
from fastapi import FastAPI
from opty_api.app import app
from opty_api.events import on_shutdown
from opty_api.events import on_startup
from opty_api.responders import errors  # pylint: disable=W0611

# --- IMPORTS DE ROTAS (ROUTERS) ---
from opty_api.routers import auth
from opty_api.routers import search
from opty_api.routers import system

# --- CÓDIGO DE INCLUSÃO DE ROTAS ---
# Incluir Routers na instância principal da aplicação
app.include_router(system.router)
app.include_router(auth.router, prefix="/auth")
app.include_router(search.router, prefix="/search")

# --- CODE ---
@asynccontextmanager
async def lifespan(application: FastAPI):
    """
    Handles startup and shutdown events for the application.
    """
    # Startup tasks
    await on_startup(application)

    # Run the app
    try:
        yield

    # Shutdown tasks
    finally:
        on_shutdown(application)

# Attach lifespan to the app
app.router.lifespan_context = lifespan
