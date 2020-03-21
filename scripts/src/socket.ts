import { EventPayload, Events, REDIS_URL } from '@app/const';
import { config } from 'dotenv';
import redis from 'redis';
import url from 'url';
import WebSocket from 'ws';

type WebSocketWithHeartBeat = WebSocket & {
  isAlive: boolean;
};

type DataPayload<Type extends keyof EventPayload> = {
  pattern: Type;
  data: EventPayload[Type];
};

type Payload = DataPayload<keyof EventPayload>;

config();

const bidClients = new Map<string, WebSocketWithHeartBeat[]>();
const redisClient = redis.createClient(process.env[REDIS_URL] as string);

redisClient
  .on('connect', () => console.log('redis client connected'))
  .on('error', err => {
    console.error('error on redis client');
    console.error(err);
  });

redisClient.on('message', (channel, message) => {
  const payload: Payload | null = message && JSON.parse(message);

  if (payload) {
    const clients = bidClients.get(payload.data.restaurant);
    if (clients) {
      const dataToClient = JSON.stringify({
        type: channel,
        payload: payload.data,
      });
      clients.forEach(client => {
        client.send(dataToClient);
      });
    }
  }
});

redisClient.subscribe(Object.values(Events), err => {
  if (err) {
    console.error(err);
  }
});

const wss = new WebSocket.Server({
  port: 8080,
});

function keepAlive(this: WebSocketWithHeartBeat) {
  this.isAlive = true;
}
function registerClient(restaurant: string, client: WebSocketWithHeartBeat) {
  const currentClients = bidClients.get(restaurant);

  client.isAlive = true;
  client.on('pong', keepAlive);

  if (currentClients) {
    currentClients.push(client);
  } else {
    bidClients.set(restaurant, [client]);
  }
}

function cleanupClient(restaurant: string, client: WebSocketWithHeartBeat) {
  const clients = bidClients.get(restaurant);
  if (clients) {
    if (clients.length === 1) {
      bidClients.delete(restaurant);
    } else {
      clients.splice(clients.indexOf(client), 1);
    }
    client.terminate();
  }
}

wss.on('connection', (ws: WebSocketWithHeartBeat, req) => {
  if (req.url) {
    const { query } = url.parse(req.url, true);

    const restaurantToListen = query && query.restaurant;

    if (restaurantToListen) {
      if (Array.isArray(restaurantToListen)) {
        restaurantToListen.forEach(restaurant => {
          registerClient(restaurant, ws);
          ws.on('close', () => cleanupClient(restaurant, ws));
        });
      } else {
        registerClient(restaurantToListen, ws);
        ws.on('close', () => cleanupClient(restaurantToListen, ws));
      }
    }

    ws.on('message', message => {
      console.log(`Received: ${message}`);
    });
  }
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
const intervalId = setInterval(() => {
  bidClients.forEach((clients, key) => {
    clients.forEach(client => {
      if (!client.isAlive) {
        cleanupClient(key, client);
      } else {
        client.isAlive = false;
        client.ping(noop);
      }
    });
  });
}, 1000);

wss.on('close', () => {
  clearInterval(intervalId);
});

function gracefulShutdown() {
  console.log(`Process ${process.pid} is shutting down...`);

  Promise.all([
    new Promise(fulfill => {
      redisClient.quit(() => {
        fulfill();
      });
    }),
    new Promise(fulfill => {
      wss.close(() => fulfill());
    }),
  ]).finally(() => process.exit(0));
}

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);
