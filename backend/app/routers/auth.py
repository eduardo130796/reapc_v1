from fastapi import APIRouter
from app.schemas.auth_schema import LoginRequest, LoginResponse
from app.services.auth_service import login_service, refresh_token_service

router = APIRouter()


@router.post("/login")
def login(data: LoginRequest):
    return login_service(data.email, data.password)


@router.post("/refresh")
def refresh(refresh_token: str):
    return refresh_token_service(refresh_token)