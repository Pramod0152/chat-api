import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { ParticipantDataService } from 'src/dal/participant.data.service';
import { EventEmitterType } from 'src/lib/enums';

@Injectable()
export class MessageListener {
  constructor(private readonly participantDataService: ParticipantDataService) {}

  @OnEvent(EventEmitterType.UpdateLastMessage)
  async handleUpdateLastMessageRead(payload: any) {
    if (payload.user_id === payload.message.user_id) return;

    await this.participantDataService.updateLastReadMessageId(
      payload.user_id,
      payload.message.conversation_id,
      payload.message.id,
    );
  }
}
