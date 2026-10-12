#!/usr/bin/env python3
"""CI-only PostgREST smoke test against a synthetic disposable database."""
import base64
import hashlib
import hmac
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:3000"
SECRET = "super-long-local-p2-only-jwt-test-secret-2026"
ADMIN = "11111111-1111-4111-8111-111111111111"
USER = "22222222-2222-4222-8222-222222222222"
PENDING_ID = "55555555-5555-4555-8555-555555555555"
DISABLED_ID = "66666666-6666-4666-8666-666666666666"
EXPIRED_ID = "77777777-7777-4777-8777-777777777777"


def b64(payload):
    return base64.urlsafe_b64encode(payload).rstrip(b"=").decode()


def token(user_id):
    header = b64(b'{"alg":"HS256","typ":"JWT"}')
    payload = b64(json.dumps({
        "role": "authenticated",
        "sub": user_id,
        "aud": "authenticated",
        "exp": int(time.time()) + 1800,
    }, separators=(",", ":")).encode())
    message = f"{header}.{payload}"
    signature = hmac.new(SECRET.encode(), message.encode(), hashlib.sha256).digest()
    return f"{message}.{b64(signature)}"


def call(method, path, as_user=None, body=None, expected=(200,)):
    headers = {"Accept": "application/json"}
    if as_user:
        headers["Authorization"] = "Bearer " + token(as_user)
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=6) as response:
            status, raw = response.status, response.read().decode()
    except urllib.error.HTTPError as exc:
        status, raw = exc.code, exc.read().decode()
    if status not in expected:
        raise AssertionError(f"{method} {path} unexpected HTTP {status}: {raw[:800]}")
    try:
        payload = json.loads(raw) if raw else None
    except json.JSONDecodeError:
        payload = raw
    return status, payload


def select(code, as_user=None, embedded=False):
    selection = "id,code,stores!inner(name,slug)" if embedded else "id,code"
    query = urllib.parse.urlencode({"select": selection, "code": f"eq.{code}"})
    if embedded:
        query += "&stores.is_active=eq.true"
    return call("GET", "/promo_codes?" + query, as_user=as_user)[1]


def check(condition, text):
    assert condition, text
    print("PASS:", text, flush=True)


def main():
    for _ in range(30):
        try:
            call("GET", "/promo_codes?select=id&limit=0")
            break
        except (urllib.error.URLError, TimeoutError, AssertionError):
            time.sleep(1)
    else:
        raise RuntimeError("Disposable PostgREST did not become ready")

    # RLS protects pending, expired, and disabled-store codes from visitors.
    for code in ("P2-HTTP-PENDING", "P2-HTTP-EXPIRED", "P2-HTTP-DISABLED"):
        check(select(code) == [], f"Anonymous visitor cannot see {code}")
    check(select("P2-HTTP-DISABLED", ADMIN), "Disabled promo readable by admin only")

    # Non-admin cannot see pending and cannot approve it, despite possessing auth JWT.
    check(select("P2-HTTP-PENDING", USER) == [], "Regular user cannot read pending promo")
    call("PATCH", "/promo_codes?code=eq.P2-HTTP-PENDING", USER,
         {"approved": True}, expected=(204,))
    check(len(select("P2-HTTP-PENDING", ADMIN)) == 1,
          "Admin can still review regular-user pending submission")
    check(select("P2-HTTP-PENDING") == [],
          "Non-admin approval attempt did not publish the pending code")

    # Public API cannot insert stores.
    status, _ = call("POST", "/stores", body={
        "name": "Injected", "slug": "p2-http-injected"
    }, expected=(401, 403))
    check(status in (401, 403), "Anonymous store creation denied")

    # Admin can approve; public PostgREST can see the joined active parent store.
    call("PATCH", "/promo_codes?code=eq.P2-HTTP-PENDING", ADMIN,
         {"approved": True}, expected=(204,))
    check(len(select("P2-HTTP-PENDING", embedded=True)) == 1,
          "Approved promo with active parent store is visible via embedded join")

    # Click and vote RPCs must reject disabled parent stores.
    _, redirect = call("POST", "/rpc/record_promo_click", body={
        "p_promo_id": DISABLED_ID, "p_fingerprint": "ci-disabled-uuid"
    })
    check(redirect is None, "Disabled-store redirect rejected by public RPC")
    status, payload = call("POST", "/rpc/record_promo_vote", body={
        "p_promo_id": DISABLED_ID, "p_vote_type": "worked",
        "p_fingerprint": "ci-disabled-fingerprint"
    }, expected=(400,))
    check(status == 400 and "promo not available" in str(payload),
          "Disabled-store vote rejected by public RPC")

    _, redirect = call("POST", "/rpc/record_promo_click", body={
        "p_promo_id": PENDING_ID, "p_fingerprint": "ci-active-fingerprint"
    })
    check(redirect == "https://example.invalid/http-active",
          "Enabled and approved promo redirect works")

    # Admin disables store; all public surfaces and actions become unavailable.
    call("PATCH", "/stores?slug=eq.p2-http-active", ADMIN,
         {"is_active": False}, expected=(204,))
    check(select("P2-HTTP-PENDING") == [],
          "Disabled store removes approved promo from public listing")
    _, redirect = call("POST", "/rpc/record_promo_click", body={
        "p_promo_id": PENDING_ID
    })
    check(redirect is None, "Store deactivation blocks additional clicks")
    check(len(select("P2-HTTP-PENDING", ADMIN)) == 1,
          "Admin review visibility survives parent store deactivation")


if __name__ == "__main__":
    main()
