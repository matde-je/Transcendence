# Starts and build all containers defined in docker-compose.yml
run:
	@clear
	docker compose --file docker-compose.yml up --build

# Stop all containers defined in docker-compose.yml
stop:
	@clear
	docker compose --file docker-compose.yml stop

# Stop and remove all containers and networks defined in docker-compose.yml
down:
	@clear
	docker compose --file docker-compose.yml down

# Stop and remove all containers, network, images and volumes defined in docker-compose.yml
clean:
	@clear
	docker compose --file docker-compose.yml down --rmi all --volumes --remove-orphans

# Remove all containers, images and volumes not used
fclean: clean
	docker system prune --all --volumes --force

# Create a superuser in Django
create_superuser:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py createsuperuser

# Create usersT
create_users:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py create_users

# Enroll all users in all open tournaments
enroll-users:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py enroll_users

# Enroll all users in the waiting list
waiting_list:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py waiting_list

win_percentages:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py win_percentages

create_friendships:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py create_friendships

# Migrate the database
migrate:
	@clear
	docker compose --file docker-compose.yml run backend python manage.py makemigrations
	docker compose --file docker-compose.yml run backend python manage.py migrate

# Display containers details
info:
	@clear
	@echo "*****    docker ps -a   *****"
	@docker ps -a
	@echo "\n*****   docker images   *****"
	@docker images
	@echo "\n*****   docker network ls   *****"
	@docker network ls
	@echo "\n*****   docker volume ls   *****"
	@docker volume ls

# Interactive mode
backend-it:
	@clear
	docker exec -it django /bin/bash

db-it:
	@clear
	docker exec -it postgres /bin/bash

tournament-it:
	@clear
	docker exec -it tournament /bin/bash

# Display containers logs
logs:
	@clear
	docker compose --file docker-compose.yml logs

# Generate SSL certificates (only if they don't exist)
generate-certs:
	@clear
	@echo "Generating SSL certificates..."
	@openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=PT/ST=Lisboa/L=Lisboa/O=42/OU=42/CN=localhost"
	@echo "Certificates generated and saved..."

# Copy the certificates to the app directory
copy-certs:
	@clear
	@echo "Copying certificates to the app directory..."
	@cp cert.pem ./transcendence/cert.crt
	@cp key.pem ./transcendence/cert.key
	@echo "Certificates copied."


.PHONY: run stop down clean fclean venv activate install create_superuser create_users migrate info backend-it db-it logs generate-certs copy-certs