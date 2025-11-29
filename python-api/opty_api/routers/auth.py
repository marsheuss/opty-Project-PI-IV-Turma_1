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
from opty_api.services.auth.forgot_password import send_reset_password_email
from opty_api.schemas.auth.forgot_password.endpoint import UserForgotPasswordPayload


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
        'access_token': result.session.access_token,
        'refresh_token': result.session.refresh_token,
        'token_type': 'bearer',
        'expires_in': result.session.expires_in
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

@router.post(
    "/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request password reset e-mail",
)
async def forgot_password(payload: UserForgotPasswordPayload) -> JSONResponse:
    """
    Trigger Supabase password reset e-mail for the given email.

    - Sempre retorna 202, mesmo se o e-mail não existir,
      para não revelar se o usuário está cadastrado ou não.
    """

    # Tenta disparar o e-mail via Supabase
    try:
        await send_reset_password_email(payload.email)
    except Exception:
        # Mesmo se der erro interno, não expõe detalhe pro cliente.
        # Você pode logar o erro internamente se quiser.
        pass

    # Resposta "genérica" de sucesso
    return JSONResponse(
        content={"message": "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha."},
        status_code=status.HTTP_202_ACCEPTED,
    )

