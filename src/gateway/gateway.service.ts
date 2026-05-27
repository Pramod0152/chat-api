import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/frontend/auth/guards/jwt-auth.guard';

@WebSocketGateway()
export class GatewayService implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket, next) => {
      try {
        const token = (socket.handshake.headers?.token as string) || null;
        if (!token) {
          return next(new Error('Unauthorized'));
        }

        const payload = await this.jwtService.verifyAsync<{ sub: number }>(token, {
          secret: this.configService.get<string>('AUTH_JWT_ACCESS_TOKEN_SECRET_KEY'),
          ignoreExpiration: false,
        });

        socket.data.user = { id: payload.sub, name: 'pramod' };
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() payload: unknown, @ConnectedSocket() client: Socket) {
    const data = client.data.user;
    console.log(payload, data.id, data.name);
  }
}
