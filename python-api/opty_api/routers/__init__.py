"""
HTTP routers.
"""

# --- IMPORTS ---
from fastapi import FastAPI
from opty_api.routers import auth
from opty_api.routers import system
from opty_api.routers import search


# --- CODE ---
def mount(app: FastAPI) -> None:
    """
    Mount all routers on application.

    :param app: main app router

    :returns: nothing
    """
    app.include_router(system.router, tags = ['system'], prefix = '/api')
    app.include_router(auth.router, tags = ['authentication'], prefix = '/api/auth')
    app.include_router(search.router, tags = ['search'], prefix = '/api/search')
