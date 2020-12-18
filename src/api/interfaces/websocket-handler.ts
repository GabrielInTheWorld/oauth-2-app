import { Server } from 'http';

export interface SocketMessage {
  [key: string]: any;
}

export abstract class WebsocketHandler {
  public abstract initWebsocket(server: Server): void;
  public abstract emit(socketId: string, message: SocketMessage): void;
  public abstract broadcastToAll(message: SocketMessage): void;
  public abstract broadcastExceptOne(socketId: string, message: SocketMessage): void;
  public abstract broadcastByFunction(fn: (socketId: string) => SocketMessage, omittedSocket: string): void;
}
