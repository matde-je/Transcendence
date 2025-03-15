import http.server
import ssl

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow all origins (use specific domain in production)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

server_address = ('localhost', 8302)
httpd = http.server.HTTPServer(server_address, CORSRequestHandler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='localhost.pem')

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
print("Serving on https://localhost:8302")
httpd.serve_forever()
