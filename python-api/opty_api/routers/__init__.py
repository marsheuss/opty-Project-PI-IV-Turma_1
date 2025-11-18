"""
HTTP routers.
"""

# --- IMPORTS ---
from fastapi import FastAPI
from opty_api.routers import auth
from opty_api.routers import system


# --- CODE ---
def mount(app: FastAPI) -> None:
    """
    Mount all routers on application.

    :param app: main app router

    :returns: nothing
    """
    app.include_router(system.router, tags = ['system'], prefix = '/api')
    app.include_router(auth.router, tags = ['authentication'], prefix = '/api/auth')
