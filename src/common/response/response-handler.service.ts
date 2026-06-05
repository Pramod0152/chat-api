import { Injectable } from '@nestjs/common';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { SuccessMessageType } from 'src/lib/enums';

@Injectable()
export class ResponseHandlerService {
  public async HandleResponse<T>(
    data: T,
    nextCursor?: number | null,
    message?: string,
  ): Promise<GenericResponseDto<T>> {
    return {
      message: message || SuccessMessageType.DefaultSuccessMessage,
      data: data ?? ({} as T),
      nextCursor: nextCursor != null ? Buffer.from(String(nextCursor), 'ascii').toString('base64') : null,
    };
  }
}
