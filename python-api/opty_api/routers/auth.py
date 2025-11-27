"""
Authentication endpoints.
"""

# --- IMPORTS ---
from fastapi import APIRouter
from fastapi import Depends
from fastapi import status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from opty_api.app import container
from opty_api.services.auth.create_profile import create_user_profile
from opty_api.services.auth.login import login_user
from opty_api.services.auth.login import login_with_oauth
from opty_api.services.auth.register import register_user
from opty_api.services.auth.update import update_user_profile
from opty_api.utils.dependencies import get_current_active_user
from opty_api.utils.dependencies import require_role
from pydantic import BaseModel
from opty_api.services.auth.reset_password import (
    send_reset_email,
    reset_password_with_token
)
from datetime import datetime
from fastapi import HTTPException
from opty_api.mongo.repositories.refresh_tokens import RefreshTokenRepository
from opty_api.mongo.repositories.users import UserRepository
from opty_api.utils.auth import generate_refresh_token, generate_new_access_token

# --- TYPES ---
from opty_api.schemas.auth.create_profile.endpoint import CreateProfilePayload
from opty_api.schemas.auth.login.endpoint import UserLoginPayload
from opty_api.schemas.auth.login.endpoint import UserLoginResponse
from opty_api.schemas.auth.register.endpoint import UserRegisterPayload
from opty_api.schemas.auth.update.endpoint import UserUpdatePayload
from opty_api.schemas.token import Token
from opty_api.schemas.user import User
from supabase_auth.types import OAuthResponse
from typing import Dict

# --- SCHEMAS ---
class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetPayload(BaseModel):
    access_token: str
    new_password: str


# --- GLOBAL ---
# Router instance
router = APIRouter()


# --- ENDPOINTS ---
@router.post('/register', response_model=Dict[str, str], status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterPayload):
    """
    Creates a new user account in Supabase Auth and a user profile in MongoDB.

    :param user_data: User registration data.
    """
    # Call the register service
    await register_user(payload.model_dump())

    # Return a success message
    return JSONResponse(
        content={
            'response': 'Registration successful! Please check your email to confirm your account before logging in.'
        },
        status_code=status.HTTP_201_CREATED
    )


@router.post('/profile', response_model=User, status_code=status.HTTP_201_CREATED)
async def create_profile(payload: CreateProfilePayload):
    """
    Creates a user profile in MongoDB only (for OAuth users).
    Used when a user authenticates via OAuth and doesn't have a profile yet.

    :param payload: Profile data.
    """
    # Call the create profile service
    created_profile = await create_user_profile(payload.model_dump())

    # Return created profile
    return JSONResponse(
        content=jsonable_encoder(created_profile),
        status_code=status.HTTP_201_CREATED
    )


@router.post('/login', response_model=UserLoginResponse)
async def login(payload: UserLoginPayload):
    """
    Login with email and password.
    Authenticates user with Supabase and returns JWT tokens.

    :param payload: User login data.

    :return: UserLoginResponse containing tokens and user data.
    """

    # Call the login service
    result = await login_user(
        email=payload.email,
        password=payload.password
    )

    # Build token response
    token: Token = {
    "access_token": result["access_token"],
    "refresh_token": result["refresh_token"],
    "token_type": "bearer",
    "expires_in": 3600  
}


    # Get user data from MongoDB
    user = await container['user_repository'].get_by_email(payload.email)

    # Build final response
    response = UserLoginResponse(
        token=token,
        user=user
    )

    # Return response
    return JSONResponse(content=jsonable_encoder(response.model_dump()), status_code=status.HTTP_200_OK)


@router.get('/oauth/{provider}', response_model=OAuthResponse)
async def oauth_login(provider: str):   # pylint: disable=W0613
    """
    Initiate OAuth login flow.

    Supported providers: google, github, etc.
    Returns the OAuth URL to redirect the user to.
    """

    # Call the OAuth login service
    url = await login_with_oauth(provider)

    # Return the OAuth URL
    return JSONResponse(content=url.model_dump(), status_code=status.HTTP_200_OK)


@router.get('/me', response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile.

    Returns the authenticated user's profile data.
    """
    return JSONResponse(content=jsonable_encoder(current_user), status_code=status.HTTP_200_OK)


@router.put('/me', response_model=User)
async def update_current_user_profile(
    update_data: UserUpdatePayload,
    current_user: User = Depends(get_current_active_user)
):
    """
    Update current user profile.
    Updates the authenticated user's profile data in MongoDB.

    :param update_data: Data to update the user profile with.
    :param current_user: The currently authenticated user.

    :return: Updated User profile.
    """

    # Update user profile in database
    updated_user = await update_user_profile(
        supabase_id=current_user['supabase_id'],
        update_data=update_data
    )

    # Return updated user profile
    return JSONResponse(content=jsonable_encoder(updated_user), status_code=status.HTTP_200_OK)


@router.delete('/me')
async def delete_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Delete current user account (soft delete).
    Marks the user account as inactive.

    :param current_user: The currently authenticated user.
    """

    # Soft delete user in database
    await container['user_repository'].delete_user(supabase_id=current_user['supabase_id'])

    # Delete user in Supabase Auth (soft delete)
    await container['supabase_client'].auth.admin.delete_user(current_user['supabase_id'], should_soft_delete=True)

    # Return success message
    return JSONResponse(
        content={'message': 'Account deleted successfully'},
        status_code=status.HTTP_200_OK
    )


@router.get('/users', response_model=list[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    supervisor: User = Depends(require_role('supervisor'))  # pylint: disable=W0613
):
    """
    Returns a list of all users in the system.
    Only accessible by users with supervisor role.

    :param skip: Number of users to skip (for pagination)
    :param limit: Maximum number of users to return

    :return: List of UserResponse objects
    """

    # Fetch users from the database
    users_data = await container['user_repository'].get_all(skip=skip, limit=limit)

    # Return the list of users
    return JSONResponse(content=jsonable_encoder(users_data), status_code=status.HTTP_200_OK)

@router.post("/request-password-reset")
async def request_password_reset(payload: PasswordResetRequest):
    """
    Sends a password reset email via Supabase.
    """
    try:
        send_reset_email(payload.email)
        return JSONResponse(
            content={"message": "If this email exists, a recovery link was sent."},
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/reset-password")
async def reset_password(payload: PasswordResetPayload):
    """
    Completes the password reset using the access token.
    """
    try:
        response = reset_password_with_token(
            payload.access_token,
            payload.new_password
        )

        # SDK retorna {"user": { ... }} quando OK
        if not response or response.user is None:
            return JSONResponse(
                content={"error": "Invalid or expired token."},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        return JSONResponse(
            content={"message": "Password updated successfully!"},
            status_code=status.HTTP_200_OK
        )

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=status.HTTP_400_BAD_REQUEST
        )

class RefreshTokenPayload(BaseModel):
    refresh_token: str


@router.post("/refresh")
async def refresh_token(payload: RefreshTokenPayload):
    """
    Gera um novo access_token usando:
    - refresh_token interno (Mongo)
    - refresh_token do Supabase (salvo no usuário)
    """

    internal_token = payload.refresh_token

    refresh_repo = RefreshTokenRepository()
    user_repo = UserRepository(container["mongo_client"])

    # 1 — Buscar refresh interno no Mongo
    stored = refresh_repo.get(internal_token)
    if not stored:
        raise HTTPException(status_code=401, detail="Refresh token inválido")

    # 2 — Verificar expiração
    if stored["expires_at"] < datetime.utcnow():
        refresh_repo.delete(internal_token)
        raise HTTPException(status_code=401, detail="Refresh token expirado")

    user_id = stored["user_id"]

    # 3 — Rotação: apagar este refresh_token
    refresh_repo.delete(internal_token)

    # 4 — Buscar no Mongo o refresh_token do Supabase
    user = await user_repo.get_by_supabase_id(user_id)
    if not user or "supabase_refresh_token" not in user:
        raise HTTPException(status_code=401, detail="Não há refresh_token do Supabase salvo.")

    supabase_refresh_token = user["supabase_refresh_token"]

    # 5 — Gerar novo access_token comunicando com o Supabase
    new_access_token = await generate_new_access_token(supabase_refresh_token)

    # 6 — Criar novo refresh interno
    new_internal_token, expires_at = generate_refresh_token()
    refresh_repo.create(
        user_id=user_id,
        token=new_internal_token,
        expires_at=expires_at
    )

    # 7 — Resposta final
    return {
        "access_token": new_access_token,
        "refresh_token": new_internal_token,
        "token_type": "bearer"
    }
