"""Password hashing + JWT session helpers.

Sessions are stored as a JWT in an httpOnly cookie (not readable by page
JavaScript — real XSS protection, standard practice) rather than a bearer
token in localStorage.
"""

import datetime
import os

import bcrypt
from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from db import get_db
from db_models import User

# Dev default so the app runs out of the box; override via env in any real
# deployment (a fixed dev secret means sessions are only as secure as this
# machine — fine for a local research demo, not for production).
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-only-fishing-habitat-geoai-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30
COOKIE_NAME = "session_token"

# Using the bcrypt library directly rather than passlib's CryptContext:
# passlib 1.7.4's internal self-test (detect_wrap_bug) crashes against
# bcrypt>=4.1's stricter API (verified 2026-07-16) — passlib hasn't been
# updated for it. bcrypt.hashpw/checkpw is simpler and avoids the issue.
_BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    truncated = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(truncated, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    truncated = password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.checkpw(truncated, hashed.encode("utf-8"))


def create_session_token(user_id: int) -> str:
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire}, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM
    )


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    """Returns the logged-in user, or None if not authenticated. Does NOT
    raise — the site stays public; callers that require auth check for None
    themselves and raise 401 explicitly."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        return None
    return db.get(User, user_id)


def require_user(user: User | None = Depends(get_current_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
