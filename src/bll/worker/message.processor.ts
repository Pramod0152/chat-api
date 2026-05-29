import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { GatewayService } from 'src/gateway/gateway.service';
import { MessageService } from '../message.service';

@Processor('message-queue')
export class MessageProcessor extends WorkerHost {
  constructor(
    private readonly gateway: GatewayService,
    private readonly messageService: MessageService,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      const payload = job.data;
      const message = await this.messageService.create(payload.user_id, payload as CreateMessageDto);
      await this.gateway.emitMessage(message);
    } catch (error) {
      console.error('Error processing message', error);
      throw error;
    }
  }
}
