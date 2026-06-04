import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParticipantService } from 'src/bll/participant.service';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { CreateParticipantDto } from 'src/dto/participant/create-participant.dto';
import { UpdateParticipantDto } from 'src/dto/participant/update-participant.dto';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Participants')
@Controller('participants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class ParticipantController {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly responseHandler: ResponseHandlerService,
  ) {}

  @Post()
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
  async create(@Body() item: CreateParticipantDto) {
    const data = await this.participantService.create(item);
    return this.responseHandler.HandleResponse(data);
  }

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
  async findByConversationId(
    @Query('conversation_id', ParseIntPipe) conversation_id: number,
    @Request() req: any,
  ) {
    const data = await this.participantService.findByConversationId(conversation_id, req.user.id);
    return this.responseHandler.HandleResponse(data);
  }

  @Get(':participant_id')
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
  async findById(@Param('participant_id', ParseIntPipe) participant_id: number) {
    const data = await this.participantService.findById(participant_id);
    return this.responseHandler.HandleResponse(data);
  }

  @Patch(':participant_id')
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
  async update(@Param('participant_id', ParseIntPipe) participant_id: number, @Body() item: UpdateParticipantDto) {
    const data = await this.participantService.update(participant_id, item);
    return this.responseHandler.HandleResponse(data);
  }

  @Delete(':participant_id')
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
  async deleteById(@Param('participant_id', ParseIntPipe) participant_id: number) {
    const { message } = await this.participantService.deleteById(participant_id);
    return this.responseHandler.HandleResponse({}, message);
  }
}
