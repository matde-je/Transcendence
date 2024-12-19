# Use the official Python image as a base
FROM python:3.10

# Define the working directory within the container
WORKDIR /app

# Copy the dependency file to the container
COPY requirements.txt .

# Install project dependencies
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Install PostgreSQL client to use pg_isready for checking database readiness
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Generate SSL certificate using OpenSSL
# RUN openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=PT/ST=Lisboa/L=Lisboa/O=42/OU=42/CN=matde-je.42.fr"

# Copy all project files to the container
COPY key.pem /app/cert.key
COPY cert.pem /app/cert.crt
COPY ./transcendence /app

# Set the environment variable for Django to run in non-interactive mode
ENV PYTHONUNBUFFERED=1

# Expose port 8001 for the Django server with SSL
EXPOSE 8001

# Use pg_isready to wait for the PostgreSQL database to be ready before starting Django
CMD ["sh", "-c", "until pg_isready -h db -p 5432 -U $POSTGRES_USER; do echo 'Waiting for Postgres...'; sleep 2; done && python manage.py migrate && python manage.py runserver_plus --cert-file cert.pem 0.0.0.0:8001"]
