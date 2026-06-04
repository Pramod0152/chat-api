import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { GatewayService } from 'src/gateway/gateway.service';
import { MessageService } from '../message.service';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { FirebaseService } from 'src/common/firebase/firebase.service';

@Processor('message-queue')
export class MessageProcessor extends WorkerHost {
  constructor(
    private readonly gateway: GatewayService,
    private readonly messageService: MessageService,
    private readonly participantDataService: ParticipantDataService,
    private readonly firebaseService: FirebaseService,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      const payload = job.data;
      const message = await this.messageService.create(payload.user_id, payload as CreateMessageDto);
      const participants = await this.participantDataService.findByConversationId(payload.conversation_id);

      for (const participant of participants) {
        if (participant.user_id === payload.user_id) continue;
        this.gateway.emitMessage(participant.user_id, message);
        await this.firebaseService.sendNotification({
          user_id: participant.user_id,
          message: message,
        });
      }
    } catch (error) {
      console.error('Error processing message', error);
      throw error;
    }
  }
}
