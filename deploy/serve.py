# Static server for the Motion Graphics Demo: like `python -m http.server`, but tells browsers to always
# re-check (no stale catalog after an update) and binds 0.0.0.0 so the tailnet can reach it.
import http.server, functools, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
root = sys.argv[1] if len(sys.argv) > 1 else '.'
http.server.ThreadingHTTPServer(('0.0.0.0', 8095), functools.partial(H, directory=root)).serve_forever()
