import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { ReadMessageDto } from 'src/dto/message/read-message.dto';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { BadRequestException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // your Vite dev origin
    allowedHeaders: ['token'],
    credentials: true,
  },
})
export class GatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectQueue('message-queue') private readonly messageQueue: Queue,
    private readonly participantDataService: ParticipantDataService,
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

        socket.data.user = { id: payload.sub };
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(client: Socket) {
    const user_id = client.data.user?.id;
    if (!user_id) {
      client.disconnect();
      return;
    }

    client.join(`user-${user_id}`);
    console.log(`User ${user_id} connected`);
  }

  handleDisconnect(client: Socket) {
    const user_id = client.data.user?.id;
    if (user_id) {
      console.log(`User ${user_id} disconnected`);
    }
  }

  @SubscribeMessage('send-message')
  async handleMessage(@MessageBody() payload: CreateMessageDto, @ConnectedSocket() client: Socket) {
    const isParticipant = await this.participantDataService.checkParticipantExists(
      client.data.user.id,
      payload.conversation_id,
    );

    if (!isParticipant) {
      throw new BadRequestException('Not a participant of this conversation');
    }

    const data: any = {
      conversation_id: payload.conversation_id,
      user_id: client.data.user.id,
      content: payload.content,
      type: payload.type,
    };

    await this.messageQueue.add('message-queue', data, {
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: {
        age: 1000 * 60 * 60 * 24,
      },
    });
  }

  emitMessage(targetUserId: number, message: ReadMessageDto) {
    this.server.to(`user-${targetUserId}`).emit('on-message-received', message);
  }
}
