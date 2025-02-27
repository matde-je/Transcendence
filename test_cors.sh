
openssl req -new -x509 -keyout localhost.pem -out localhost.pem -days 365 -nodes
python3 test_cors.py
