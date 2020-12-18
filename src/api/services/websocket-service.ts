import { Server } from 'http';
import { connection as Connection, request as Request, IMessage, server as WebsocketServer } from 'websocket';

import { Constructable } from '../../application/model-layer/core/modules/decorators';
import { Random } from '../../application/util/helper';
import { SocketConnection } from './../instances/socket-connection';
import { SocketMessage } from './../interfaces/websocket-handler';
import { WebsocketHandler } from '../interfaces/websocket-handler';

@Constructable(WebsocketHandler)
export class WebsocketService extends WebsocketHandler {
  private websocketServer: WebsocketServer;
  private readonly sockets = new Map<string, SocketConnection>();

  public initWebsocket(httpServer: Server): void {
    this.websocketServer = new WebsocketServer({ httpServer });
    this.initWebsocketRoutes();
  }

  private initWebsocketRoutes(): void {
    this.websocketServer.on('connect', socket => this.onConnect(socket));
    this.websocketServer.on('request', request => this.onRequest(request));
    this.websocketServer.on('close', socket => this.onClose(socket));
  }

  private onConnect(socket: Connection): void {
    console.log('onConnection', socket);
  }

  private onRequest(request: Request): void {
    console.log('onRequest', request);
    console.log('received request from origin: ', request.origin);
    if (!this.isOriginAllowed(request.origin)) {
      request.reject();
      return;
    }
    const connection = request.accept('echo-protocol', request.origin);
    const socket = this.createSocket(connection);
    this.sockets.set(socket.id, socket);
  }

  private createSocket(connection: Connection): SocketConnection {
    const id = Random.id();
    const socket = new SocketConnection({ id, connection });
    console.log('client connected', id);

    const content = { event: 'id', content: { id } };
    socket.send(content);
    socket.onMessage(message => {
      console.log('parsedMessage', message);
    });

    socket.onClose((reason, description) => {
      this.sockets.delete(socket.id);
    });
    return socket;
  }

  private onClose(socket: Connection): void {
    console.log('onClose', socket);
  }

  public broadcastExceptOne(socket: string, message: SocketMessage): void {
    this.sockets.forEach((value, key) => {
      if (key !== socket) {
        this.emit(key, message);
      }
    });
  }

  public broadcastToAll(message: SocketMessage): void {
    this.sockets.forEach((value, key) => {
      this.emit(key, message);
    });
  }

  public broadcastByFunction(fn: (socketId: string) => SocketMessage, omittedSocket: string): void {
    const sockets = Array.from(this.sockets.keys()).filter(socket => socket !== omittedSocket);
    for (const socket of sockets) {
      const message = fn(socket);
      this.emit(socket, message);
    }
  }

  public emit(socket: string, message: SocketMessage): void {
    this.sockets.get(socket)?.send(message);
  }

  private isOriginAllowed(origin: string): boolean {
    return true;
  }
}
