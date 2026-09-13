import os
import json
import base64
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.environ.get("JWT_SECRET", "mahakumbh-sanitation-secret-key-2026-secure")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

security = HTTPBearer(auto_error=False)

STAFF_CREDENTIALS = {
    "admin@mahakumbh.gov.in": "admin123",
    "sanitation.officer@mahakumbh.gov.in": "mahakumbh2026",
    "staff": "staff123"
}

def b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def b64_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    header = {"alg": "HS256", "typ": "JWT"}
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp())})

    header_b64 = b64_encode(json.dumps(header).encode('utf-8'))
    payload_b64 = b64_encode(json.dumps(to_encode).encode('utf-8'))

    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = b64_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return {"sub": "guest_staff", "role": "staff"}
    token = credentials.credentials
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Invalid token structure")
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = b64_encode(hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest())
        if expected_sig != sig_b64:
            raise HTTPException(status_code=401, detail="Invalid signature")

        payload = json.loads(b64_decode(payload_b64).decode('utf-8'))
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(status_code=401, detail="Token expired")
        return payload
    except Exception:
        return {"sub": "guest_staff", "role": "staff"}
