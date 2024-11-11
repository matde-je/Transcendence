# Use the official Python image as a base
FROM python:3.10

# Define the working directory within the container
WORKDIR /app

# Copy the dependency file to the container
COPY requirements.txt .

# Install project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install PostgreSQL client to use pg_isready for checking database readiness
# Added this step to enable database readiness checks
RUN apt-get update && apt-get install -y postgresql-client

# Generate SSL certificate using OpenSSL
RUN openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=PT/ST=Lisboa/L=Lisboa/O=42/OU=42/CN=matde-je.42.fr"

# Copy project files
COPY . /app/

# Set PYTHONPATH to include the root directory
ENV PYTHONPATH=/app

# Set the environment variable for Django to run in non-interactive mode
ENV PYTHONUNBUFFERED=1

# Define the DJANGO_SETTINGS_MODULE environment variable
ENV DJANGO_SETTINGS_MODULE=transcendence.settings

# Expose port 8000 for the Daphne server
EXPOSE 8000

# Run the application (via Daphne in this case)
ENTRYPOINT ["sh", "-c", "until pg_isready -h db -p 5432 -U $${POSTGRES_USER}; do echo 'Waiting for Postgres...'; sleep 2; done && daphne -b 0.0.0.0 -p 8000 transcendence.asgi:application"]
