import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConversationService } from 'src/bll/conversation.service';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { CreateConversationDto } from 'src/dto/conversation/create-conversation.dto';
import { UpdateConversationDto } from 'src/dto/conversation/update-conversation.dto';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Conversations')
@Controller('conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
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
  async create(@Request() req: any, @Body() item: CreateConversationDto) {
    const admin_id = req.user.id;
    const data = await this.conversationService.create(admin_id, item);
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
  async findAll(@Request() req: any) {
    const data = await this.conversationService.findAll(req.user.id);
    return this.responseHandler.HandleResponse(data);
  }

  @Get(':conversation_id')
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
  async findById(@Param('conversation_id', ParseIntPipe) conversation_id: number) {
    const data = await this.conversationService.findById(conversation_id);
    return this.responseHandler.HandleResponse(data);
  }

  @Patch(':conversation_id')
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
  async update(@Param('conversation_id', ParseIntPipe) conversation_id: number, @Body() item: UpdateConversationDto) {
    const { message } = await this.conversationService.update(conversation_id, item);
    return this.responseHandler.HandleResponse({}, message);
  }

  @Delete(':conversation_id')
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
  async deleteById(@Param('conversation_id', ParseIntPipe) conversation_id: number) {
    const { message } = await this.conversationService.deleteById(conversation_id);
    return this.responseHandler.HandleResponse({}, message);
  }
}
