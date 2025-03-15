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

# Copy all project files to the container
COPY ./transcendence /app

# Create staticfiles directory and adjust permissions for Django
RUN mkdir -p /app/staticfiles && chmod -R 777 /app/staticfiles

COPY cert.key /app/cert.key
COPY cert.crt /app/cert.crt

# Set the environment variable for Django to run in non-interactive mode
ENV PYTHONUNBUFFERED=1

# Use pg_isready to wait for the PostgreSQL database to be ready before starting Django
CMD ["sh", "-c", "until pg_isready -h db -p 5432 -U $POSTGRES_USER; do echo 'Waiting for Postgres...'; sleep 2; done && python manage.py migrate && python manage.py runserver_plus --cert-file cert.pem 0.0.0.0:8001"]
