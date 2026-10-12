#!/usr/bin/env python3
"""P2 real Next.js public rendering and /go route smoke on disposable local APIs."""
import base64
import hashlib
import hmac
import json
import sys
import time
import urllib.error
import urllib.request

APP = "http://127.0.0.1:3333"
LOCAL_JWT_SECRET = "super-long-local-p2-only-jwt-test-secret-2026"
LIVE = "88888888-8888-4888-8888-888888888888"
DISABLED = "66666666-6666-4666-8666-666666666666"

def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def anon_token():
    header = b64(b'{"alg":"HS256","typ":"JWT"}')
    payload = b64(json.dumps({
        "role": "anon", "iss": "p2-ci-only",
        "exp": int(time.time()) + 3600
    }, separators=(",", ":")).encode())
    body = header + "." + payload
    sig = b64(hmac.new(LOCAL_JWT_SECRET.encode(),body.encode(),hashlib.sha256).digest())
    return body + "." + sig

class NoFollow(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, hdrs, newurl):
        return None

opener = urllib.request.build_opener(NoFollow)

def request(path):
    try:
        with opener.open(APP + path, timeout=12) as response:
            return response.status, response.headers, response.read().decode(errors="replace")
    except urllib.error.HTTPError as ex:
        return ex.code, ex.headers, ex.read().decode(errors="replace")

def check(ok, message):
    if not ok:
        raise AssertionError(message)
    print("PASS: " + message, flush=True)

def main(after=False):
    for _ in range(45):
        try:
            status, _, html = request("/")
            if status in (200, 500):
                break
        except (OSError, TimeoutError):
            pass
        time.sleep(1)
    else:
        raise RuntimeError("Next.js app server never responded")

    status, _, home = request("/")
    check(status == 200, f"Next.js homepage returned HTTP 200, got {status}")

    if not after:
        check("P2-HTTP-LIVE" in home, "Approved active-store offer appears on real homepage")
        for code in ("P2-HTTP-PENDING", "P2-HTTP-EXPIRED", "P2-HTTP-DISABLED"):
            check(code not in home, "Real homepage excludes " + code)
        status, _, detail = request("/store/p2-http-active")
        check(status == 200 and "P2-HTTP-LIVE" in detail,
              "Active store page renders live offer")
        check("P2-HTTP-EXPIRED" not in detail and "P2-HTTP-PENDING" not in detail,
              "Store page hides pending and expired offers")
        status, hdr, _ = request("/store/p2-http-disabled")
        check(status == 404, "Disabled store page returns 404")
        status, hdr, _ = request("/go/" + DISABLED)
        check(status in (301, 302, 303, 307, 308)
              and hdr.get("Location","").endswith("/"),
              "Disabled-store deal route redirects safely to homepage")
        status, hdr, _ = request("/go/" + LIVE)
        check(status in (301, 302, 303, 307, 308)
              and hdr.get("Location") == "https://example.invalid/live",
              "Approved active-store deal route redirects to expected target")
    else:
        check("P2-HTTP-LIVE" not in home and "P2-HTTP-PENDING" not in home,
              "Real homepage hides offers after parent store is disabled")
        status, _, _ = request("/store/p2-http-active")
        check(status == 404, "Previously active store page now returns 404")
        status, hdr, _ = request("/go/" + LIVE)
        check(status in (301, 302, 303, 307, 308)
              and hdr.get("Location","").endswith("/"),
              "Formerly active offer no longer redirects to merchant")

if __name__ == "__main__":
    if "--anon-jwt" in sys.argv:
        print(anon_token())
    else:
        main(after="--after-disable" in sys.argv)
