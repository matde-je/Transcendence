import http.server
import ssl

server_address = ('localhost', 8300)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile='localhost.pem', server_side=True)
httpd.serve_forever()
