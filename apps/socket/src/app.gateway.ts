import { Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { IncomingMessage } from 'http';
import * as url from 'url';
import WebSocket, { Server } from 'ws';

@WebSocketGateway()
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private bidClients = new Map<string, WebSocket[]>();

  private registerClient(restaurant: string, client: WebSocket) {
    const currentClients = this.bidClients.get(restaurant);

    if (currentClients) {
        currentClients.push(client)
    } else {
        this.bidClients.set(restaurant, [client])
    }
  }

  private cleanupClient(client: WebSocket) {
    this.bidClients.forEach((value, key) => {
        const clientIndex = value.indexOf(client);
        if (clientIndex > -1) {
            value.splice(clientIndex, 1)
        }
        if (value.length === 0) {
            this.bidClients.delete(key)
        }
    })
  }

  handleConnection(client: WebSocket, msg: IncomingMessage) {
      if (msg.url) {
          const { query } = url.parse(msg.url, true);
          const restaurantToSubscribe = query && query.restaurant;

          if (restaurantToSubscribe) {
              if (Array.isArray(restaurantToSubscribe)) {
                restaurantToSubscribe.forEach(restaurant => this.registerClient(restaurant, client))
              } else {
                this.registerClient(restaurantToSubscribe, client)
              }
          }
      }
  }

  handleDisconnect(client: WebSocket) {
    this.cleanupClient(client)
  }

  broadCastAll() {
    this.server.clients.forEach(client => {
      client.send(
        JSON.stringify({
          type: 'hello',
        }),
        err => {
          if (err) {
            console.error(err);
          }
        },
      );
    });
  }
}
