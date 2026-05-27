import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessageService } from 'src/bll/message.service';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { CreateMessageDto } from 'src/dto/message/create-message.dto';
import { UpdateMessageDto } from 'src/dto/message/update-message.dto';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages')
@Controller('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
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
  async create(@Request() req: any, @Body() item: CreateMessageDto) {
    const data = await this.messageService.create(req.user.id, item);
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
  async findAll(@Query('conversation_id', new ParseIntPipe({ optional: true })) conversation_id?: number) {
    const data = await this.messageService.findAll(conversation_id);
    return this.responseHandler.HandleResponse(data);
  }

  @Get(':id')
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
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.messageService.findById(id);
    return this.responseHandler.HandleResponse(data);
  }

  @Patch(':id')
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
  async update(@Param('id', ParseIntPipe) id: number, @Body() item: UpdateMessageDto) {
    const { message } = await this.messageService.update(id, item);
    return this.responseHandler.HandleResponse({}, message);
  }

  @Delete(':id')
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
  async deleteById(@Param('id', ParseIntPipe) id: number) {
    const { message } = await this.messageService.deleteById(id);
    return this.responseHandler.HandleResponse({}, message);
  }
}
