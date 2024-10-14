include srcs/.env

# Starts and build all containers defined in docker-compose.yml
run:
	@clear
	docker-compose -f $(COMPOSE_FILE) up --build

# Stop all containers defined in docker-compose.yml
stop:
	docker-compose -f $(COMPOSE_FILE) stop

# Stop and remove all containers and networks defined in docker-compose.yml
down:
	docker-compose -f $(COMPOSE_FILE) down 

# Stop and remove all containers, network, images and volumes defined in docker-compose.yml
clean:
	clear
	docker-compose -f $(COMPOSE_FILE) down --rmi all --volumes

# Create a virtual environment
venv:
	virtualenv venv

# Activate the virtual environment
activate:
	. .venv/bin/activate

# Install dependencies inside the virtual environment
install:
	pip install -r ./srcs/requirements.txt

# Create a superuser in Django
createsuperuser:
	docker-compose -f $(COMPOSE_FILE) run backend python manage.py createsuperuser

# Migrate the database
migrate:
	docker-compose -f $(COMPOSE_FILE) run backend python manage.py migrate

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
backend-it:$(COMPOSE)
	@clear
	docker exec -it django /bin/bash

db-it:
	@clear
	docker exec -it postgres /bin/bash

# Display containers logs
logs:
	@clear
	docker-compose -f $(COMPOSE_FILE) logs

.PHONY: run stop down clean venv activate install createsuperuser migrate info backend-it db-it logs #fclean 