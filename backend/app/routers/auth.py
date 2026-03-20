from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import LoginRequest
from app.services.supabase_client import supabase

router = APIRouter()


@router.post("/login")
def login(data: LoginRequest):

    response = supabase.auth.sign_in_with_password({
        "email": data.email,
        "password": data.password
    })

    if response.user is None:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    return {
        "access_token": response.session.access_token,
        "user": response.user.email
    }