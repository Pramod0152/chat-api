import {
  ConnectedSocket,
  MessageBody,
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
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { ErrorMessageType } from 'src/lib/enums';
import { BadRequestException } from '@nestjs/common';

@WebSocketGateway()
export class GatewayService implements OnGatewayInit {
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

  async emitMessage(payload: any) {
    console.log('emitMessage', payload);
    this.server.emit(`on-message-received-${payload.conversation_id}`, payload);
  }
}
