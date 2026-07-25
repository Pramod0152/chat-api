import { Body, Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterMessageDto } from 'src/dto/message/filter-message.dto';
import { AiService } from 'src/bll/ai.service';

@ApiTags('summary')
@Controller('summary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly responseHandler: ResponseHandlerService,
  ) { }

  @Get()
  @ApiNotFoundResponse({
    type: GenericResponseDto,
    description: 'Record Not Found!.',
  })
  @ApiBadRequestResponse({
    type: GenericResponseDto,
    description: 'Form Validation Error!. ',
  })
  @ApiUnauthorizedResponse({
    type: GenericResponseDto,
    description: 'Unauthorized!. ',
  })
  async getSummary(@Request() req: any, @Query() item: FilterMessageDto) {
    const user_id = req.user?.id || req.user?.userId;
    const data = await this.aiService.generateSummary(user_id, item);
    return this.responseHandler.HandleResponse(data);
  }
}
