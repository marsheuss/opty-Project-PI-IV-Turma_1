from datetime import datetime
from opty_api.mongo.repositories.refresh_tokens import RefreshTokenRepository
from opty_api.utils.auth import generate_refresh_token, create_access_token
from opty_api.err.not_found_error import NotFoundError


def refresh_access_token(refresh_token: str):
    repo = RefreshTokenRepository()
    stored = repo.get(refresh_token)

    if not stored:
        raise NotFoundError("Refresh token inválido ou expirado")

    if stored["expires_at"] < datetime.utcnow():
        repo.delete(refresh_token)
        raise NotFoundError("Refresh token expirado")

    # --- ROTACIONAR TOKEN VELHO ---
    repo.delete(refresh_token)

    # --- CRIAR NOVO ACCESS TOKEN ---
    new_access_token = create_access_token({"user_id": stored["user_id"]})

    # --- GERAR NOVO REFRESH TOKEN ---
    new_refresh_token, expires_at = generate_refresh_token()

    repo.create(
        user_id=stored["user_id"],
        token=new_refresh_token,
        expires_at=expires_at
    )

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }
