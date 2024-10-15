# Starts and build all containers defined in docker-compose.yml
run:
	@clear
	docker-compose -f srcs/docker-compose.yml up --build

# Stop all containers defined in docker-compose.yml
stop:
	@clear
	docker-compose -f srcs/docker-compose.yml stop

# Stop and remove all containers and networks defined in docker-compose.yml
down:
	@clear
	docker-compose -f srcs/docker-compose.yml down 

# Stop and remove all containers, network, images and volumes defined in docker-compose.yml
clean:
	@clear
	docker-compose -f srcs/docker-compose.yml down --rmi all --volumes

# Create a virtual environment
venv:
#	virtualenv .venv
	@clear
	python3 -m venv .venv


# Activate the virtual environment (needs to run this command in a terminal)
activate:
	@clear
	@echo "To activate the virtual environment, run:"
	@echo "source .venv/bin/activate"

# Install dependencies inside the virtual environment
install:
	. venv/bin/activate && pip install -r ./srcs/requirements.txt

# Create a superuser in Django
createsuperuser:
	@clear
	docker-compose -f srcs/docker-compose.yml run backend python manage.py createsuperuser

# Migrate the database
migrate:
	@clear
	docker-compose -f srcs/docker-compose.yml run backend python manage.py migrate

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

# Display containers logs
logs:
	@clear
	docker-compose -f srcs/docker-compose.yml logs

.PHONY: run stop down clean venv activate install createsuperuser migrate info backend-it db-it logs #fclean 
