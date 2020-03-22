# dine-in

Web service for restaurant seating management system.

## Get Started

There are two ways to start the services of this project:

1. Using Docker (recommended)
1. Manual Installation

### Using Docker

If you already have Docker installed with `docker-compose`, you can install and starts the services with:

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
   ```

1. Start all the services:

   ```bash
   yarn start
   ```

## API

- Once the services started, you can explore the available REST endpoints at `<baseUrl>/api`, e.g. [http://localhost:4000/api](http://localhost:4000/api)
- The Websocket endpoints is available at the port number following `WEBSOCKET_PORT` variable, e.g. `ws://localhost:8080`

## Built With

- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
