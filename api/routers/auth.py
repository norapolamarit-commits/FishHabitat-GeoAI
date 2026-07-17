from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth import (
    COOKIE_NAME,
    JWT_EXPIRE_DAYS,
    create_session_token,
    get_current_user,
    hash_password,
    require_user,
    verify_password,
)
from db import get_db
from db_models import User

router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PreferencesRequest(BaseModel):
    home_lat: float | None = None
    home_lon: float | None = None
    target_species: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    home_lat: float | None
    home_lon: float | None
    target_species: str | None

    class Config:
        from_attributes = True


def _set_session_cookie(response: Response, user_id: int):
    token = create_session_token(user_id)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=JWT_EXPIRE_DAYS * 24 * 3600,
    )


@router.post("/signup", response_model=UserOut)
def signup(body: SignupRequest, response: Response, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        display_name=body.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_session_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    _set_session_cookie(response, user.id)
    return user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME)
    return {"status": "ok"}


@router.get("/me", response_model=UserOut | None)
def me(user: User | None = Depends(get_current_user)):
    return user


@router.patch("/preferences", response_model=UserOut)
def update_preferences(
    body: PreferencesRequest, user: User = Depends(require_user), db: Session = Depends(get_db)
):
    if body.home_lat is not None:
        user.home_lat = body.home_lat
    if body.home_lon is not None:
        user.home_lon = body.home_lon
    if body.target_species is not None:
        user.target_species = body.target_species
    db.commit()
    db.refresh(user)
    return user
