include srcs/.env

# Stars and build all containers defined in docker-compose.yml
run:
	@clear
	docker-compose -f $(COMPOSE_FILE) up --build

# Stop all containers defined in docker-compose.yml
stop:
	docker-compose -f $(COMPOSE_FILE) stop

# Stop and remove all containers, network and volumes defined in docker-compose.yml
down:
	docker-compose -f $(COMPOSE_FILE) down

# Comando para criar o ambiente virtual
venv:
	virtualenv venv

# Comando para ativar o ambiente virtual
activate:
	source venv/bin/activate

# Comando para instalar dependências dentro do ambiente virtual
install:
	pip install -r requirements.txt

# Comando para criar um superuser no Django
createsuperuser:
	docker-compose -f $(COMPOSE_FILE) run web python manage.py createsuperuser

# Comando para rodar migrações do Django
migrate:
	docker-compose -f $(COMPOSE_FILE) run web python manage.py migrate

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
	docker-compose -f $(COMPOSE_FILE) logs

.PHONY: run stop venv activate install clean createsuperuser migrate info backend-it db-it logs #fclean 
