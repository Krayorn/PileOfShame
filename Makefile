.PHONY: build build-prod up up-prod down symfony frontend-build

up:
	docker-compose up -d

build-prod:
	@echo "Building production environment..."
	@echo "Building Docker containers..."
	docker-compose -f docker-compose.prod.yml up -d --build

deploy:
	@echo "Building frontend..."
	@cd react && npm install
	@cd react && npm run build
	make build-prod
	make up-prod

up-prod:
	docker-compose -f docker-compose.prod.yml up -d

down:
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

down-prod:
	docker-compose -f docker-compose.prod.yml down

frontend-build:
	@echo "Building frontend..."
	@cd react && npm install
	@cd react && npm run build

symfony:
	docker exec -it pileofshame-symfony-1 bash

.PHONY: pre-commit
pre-commit:
	docker exec -it pileofshame-symfony-1 vendor/bin/rector
	docker exec -it pileofshame-symfony-1 vendor/bin/ecs --fix
	docker exec -it pileofshame-symfony-1 vendor/bin/phpstan analyse
