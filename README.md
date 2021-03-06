# dine-in

https://dine-in-rest.herokuapp.com/docs

Web service for restaurant seating management system.

- a REST service
- a queue service using Redis
- a WebSocket service

## Get Started

There are two ways to start the services of this project:

1. Using Docker (recommended)
1. Manual Installation

### Using Docker

If you already have Docker installed with Docker Compose, you can install and start the services with:

```bash
docker-compose --compatibility up -d
```

This will starts 3 Rest API services with 3 WebSocket servers with Nginx as load-balancer in front of them.

> You can shutdown the services with the command `docker-compose down`

### Manual Installation

1. Install the following software if not available in your machine:

   - MongoDB
   - Redis

1. Install all project dependencies.

   ```bash
   yarn install
   ```

1. Add a `.env` file at the root of the project with the following contents:

   ```
   RESTAURANT_DB_URL=mongodb://localhost:27017/restaurant
   PORT=4000
   REDIS_URL=redis://localhost:6379
   WEBSOCKET_PORT=8080
   JWT_SECRET=Y0UR_JWT_S3CR3T
   ```

1. Start all the services:

   ```bash
   yarn start
   ```

## API

- Once the services started, you can explore the available REST endpoints at `<baseUrl>/api`, e.g. [http://localhost:4000/api](http://localhost:4000/api)
- The Websocket endpoints is available at the port number following `WEBSOCKET_PORT` variable, e.g. `ws://localhost:8080`

## Integration Testing

You can run the integration testing between the application of the project with the following command:

```bash
yarn test:e2e
```

## E2E Testing

You can run end-to-end testing between the applications in a docker containers with:

```bash
docker-compose -f docker-compose-test.yaml run e2etest
```

## Built With

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
