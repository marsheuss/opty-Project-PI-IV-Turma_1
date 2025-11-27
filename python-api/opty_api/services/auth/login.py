"""
User login service.
"""

# --- IMPORTS ---
from opty_api.app import container
from opty_api.err.supabase_error import SupabaseError
from supabase_auth.errors import AuthApiError
from opty_api.utils.auth import generate_refresh_token
from opty_api.mongo.repositories.refresh_tokens import RefreshTokenRepository


# --- TYPES ---
from supabase_auth.types import AuthResponse
from supabase_auth.types import OAuthResponse


# --- CODE ---
async def login_user(email: str, password: str):
    """
    Login user with email and password.
    """

    try:
        # 1 — LOGIN NO SUPABASE
        auth_response = await container["supabase_client"].auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        user_id = auth_response.user.id
        access_token = auth_response.session.access_token

        # 2 — PEGAR REFRESH TOKEN DO SUPABASE
        supabase_refresh_token = auth_response.session.refresh_token

        # 3 — SALVAR REFRESH TOKEN DO SUPABASE NO MONGO
        from opty_api.mongo.repositories.users import UserRepository
        users_repo = UserRepository(container["mongo_client"])

        await users_repo.update_by_email(
            email,
            {"supabase_refresh_token": supabase_refresh_token}
        )

        # 4 — CRIAR REFRESH TOKEN INTERNO (MONGO)
        from opty_api.utils.auth import generate_refresh_token
        from opty_api.mongo.repositories.refresh_tokens import RefreshTokenRepository

        internal_refresh_token, expires_at = generate_refresh_token()

        repo = RefreshTokenRepository()
        repo.create(
            user_id=user_id,
            token=internal_refresh_token,
            expires_at=expires_at
        )

        # 5 — RETORNO FINAL
        return {
            "access_token": access_token,           # do Supabase
            "refresh_token": internal_refresh_token, # nosso (interno)
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": auth_response.user.email
            }
        }

    except AuthApiError as e:
        raise AuthApiError(code=e.code, status=e.status, message=e.message)

    except Exception as e:
        raise SupabaseError(f"[SUPABASE] Login failed: {str(e)}")



async def login_with_oauth(provider: str) -> OAuthResponse:
    """
    Login with OAuth provider (Google, GitHub, etc).

    :param provider: OAuth provider name

    :return: OAuthResponse from Supabase
    """

    # Authenticate with Supabase OAuth
    try:
        auth_response = await container['supabase_client'].auth.sign_in_with_oauth({
            'provider': provider,
        })

        # Return auth response
        return auth_response

    # Error in supabase auth: raise custom error
    except Exception as e:
        raise SupabaseError(f'[SUPABASE  ] OAuth login failed: {str(e)}') from e