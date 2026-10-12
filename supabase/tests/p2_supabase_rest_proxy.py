#!/usr/bin/env python3
"""Disposable GitHub Actions Supabase REST prefix proxy to local PostgREST.

Strictly loopback-only. Never connect this script to an external endpoint.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import http.client
from urllib.parse import urlsplit

class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def forward(self):
        parsed = urlsplit(self.path)
        if not parsed.path.startswith("/rest/v1/"):
            data = b"Not found"
            self.send_response(404)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        rest_path = parsed.path.removeprefix("/rest/v1")
        if parsed.query:
            rest_path += "?" + parsed.query
        length = int(self.headers.get("Content-Length", "0"))
        data = self.rfile.read(length) if length else None
        headers = {k: v for k, v in self.headers.items()
                   if k.lower() not in ("host", "connection", "content-length")}
        conn = http.client.HTTPConnection("127.0.0.1", 3000, timeout=10)
        try:
            conn.request(self.command, rest_path, body=data, headers=headers)
            response = conn.getresponse()
            payload = response.read()
            self.send_response(response.status)
            for k, v in response.getheaders():
                if k.lower() not in ("connection", "transfer-encoding", "content-length"):
                    self.send_header(k, v)
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        finally:
            conn.close()

    do_GET = forward
    do_HEAD = forward
    do_POST = forward
    do_PATCH = forward

if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 3001), Handler)
    print("P2 isolated REST proxy started on 127.0.0.1:3001", flush=True)
    server.serve_forever()
