# Uses the official Python image as a base
FROM python:3.10

# Defines the working directory within the container
WORKDIR /app

# Copy the dependency file to the container
COPY requirements.txt .

# Install project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Generate SSL certificate using OpenSSL
RUN openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=PT/ST=Lisboa/L=Lisboa/O=42/OU=42/CN=matde-je.42.fr"

# Copy all project files to the container
COPY . .

# Sets the environment variable for Django to spin in non-interactive mode
ENV PYTHONUNBUFFERED=1

# Expose port 8000 for the Django server with SSL
EXPOSE 8000

# Run the Django server with SSL
CMD ["python", "manage.py", "runserver_plus", "--cert-file", "cert.pem", "0.0.0.0:8000"]
