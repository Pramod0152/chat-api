import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { GatewayService } from 'src/gateway/gateway.service';
import { MessageService } from '../message.service';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { UserDataService } from 'src/dal/user.data.service';
import { ReadMessageDto } from 'src/dto/message/read-message.dto';

@Processor('message-queue')
export class MessageProcessor extends WorkerHost {
  constructor(
    private readonly gateway: GatewayService,
    private readonly messageService: MessageService,
    private readonly participantDataService: ParticipantDataService,
    private readonly firebaseService: FirebaseService,
    private readonly userDataService: UserDataService,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      const payload = job.data;
      const message = await this.messageService.create(payload.user_id, payload as CreateMessageDto);
      const participants = await this.participantDataService.findAllParticipants(payload.conversation_id);

      for (const participant of participants) {
        if (participant.user_id === payload.user_id) continue;
        this.gateway.emitMessage(participant.user_id, message);
      }

      await this.sendNotifications(payload.user_id, message, participants);
    } catch (error) {
      console.error('Error processing message', error);
      throw error;
    }
  }

  private async sendNotifications(senderId: number, message: ReadMessageDto, participants: { user_id: number }[]) {
    try {
      const user = await this.userDataService.findById(senderId);

      for (const participant of participants) {
        if (participant.user_id === senderId) continue;

        const tokens = await this.userDataService.findAllTokens(participant.user_id);
        if (tokens.length === 0) continue;

        for (const token of tokens) {
          try {
            await this.firebaseService.sendNotification({
              token: token.fcm_token,
              body: message.content,
              title: user.username + ' sent you a message',
            });
          } catch (error) {
            console.error('Error sending notification', error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending notification', error);
    }
  }
}
