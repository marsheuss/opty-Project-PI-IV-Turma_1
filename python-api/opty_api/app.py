"""
Global service objects.
"""

# --- IMPORTS ---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from opty_api.models import Config
from opty_api.models import Health
from opty_api.models import Info
from opty_api.schemas.container import Container


# --- CODE ---
# FastAPI app
app = FastAPI(
    title = 'Opty-Api',
    description = 'This is a REST API backend for OPTY project'
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Configuration
config = Config()

# Info
info = Info(
    name = app.title,
    description = app.description,
    version = app.version,
    extra = {}
)

# System health
health = Health()

# Dependency injection container
container: Container = {
    'config': config,
}
