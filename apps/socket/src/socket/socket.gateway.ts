import { Injectable } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { IncomingMessage } from 'http';
import * as url from 'url';
import WebSocket, { Server } from 'ws';
import { EventPayload } from '@app/const';

@WebSocketGateway()
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private restaurantSubscribers = new Map<string, WebSocket[]>();

  private registerClient(restaurant: string, client: WebSocket) {
    const currentClients = this.restaurantSubscribers.get(restaurant);

    if (currentClients) {
      currentClients.push(client);
    } else {
      this.restaurantSubscribers.set(restaurant, [client]);
    }
  }

  private cleanupClient(client: WebSocket): void {
    this.restaurantSubscribers.forEach((value, key) => {
      const clientIndex = value.indexOf(client);
      if (clientIndex > -1) {
        value.splice(clientIndex, 1);
      }
      if (value.length === 0) {
        this.restaurantSubscribers.delete(key);
      }
    });
  }

  handleConnection(client: WebSocket, msg: IncomingMessage): void {
    if (msg.url) {
      const { query } = url.parse(msg.url, true);
      const restaurantToSubscribe = query && query.restaurant;

      if (restaurantToSubscribe) {
        if (Array.isArray(restaurantToSubscribe)) {
          restaurantToSubscribe.forEach((restaurant) =>
            this.registerClient(restaurant, client)
          );
        } else {
          this.registerClient(restaurantToSubscribe, client);
        }
      }
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.cleanupClient(client);
  }

  notifyEvent<Type extends keyof EventPayload>(
    type: Type,
    payload: EventPayload[Type]
  ): Promise<unknown> {
    const subs = this.restaurantSubscribers.get(payload.restaurant);
    if (subs) {
      const dataToClient = JSON.stringify({
        type,
        payload,
      });

      return Promise.all(
        subs.map(
          (sub) =>
            new Promise((fulfill, reject) =>
              sub.send(dataToClient, (err) => (err ? reject(err) : fulfill()))
            )
        )
      );
    }
    return Promise.resolve();
  }
}
