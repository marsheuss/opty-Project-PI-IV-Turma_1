from opty_api.app import container
from opty_api.err.supabase_error import SupabaseError


async def send_reset_password_email(email: str) -> None:
    """
    Trigger Supabase password reset e-mail for a given user email.
    """
    supabase = container["supabase_client"]

    try:
        response = await supabase.auth.reset_password_for_email(email)

        # Se a lib retornar um objeto com .error, você pode tratar aqui:
        error = getattr(response, "error", None)
        if error:
            raise SupabaseError(f"[SUPABASE] Failed to send reset password email: {error.message}")

    except Exception as e:
        raise SupabaseError(f"[SUPABASE] Error sending reset password email: {str(e)}") from e
