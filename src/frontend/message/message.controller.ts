import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
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
import { PaginationDto } from 'src/dto/pagination.dto';
import { FilterMessageDto } from 'src/dto/message/filter-message.dto';

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
    const user_id = req.user.id;
    const data = await this.messageService.create(user_id, item);
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
  async findAll(@Query() query: FilterMessageDto, @Request() req: any) {
    const { data, nextCursor } = await this.messageService.findAll(req.user.id, query);
    return this.responseHandler.HandleResponse(data, nextCursor);
  }

  @Get(':message_id')
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
  async findById(@Param('message_id', ParseIntPipe) message_id: number) {
    const data = await this.messageService.findById(message_id);
    return this.responseHandler.HandleResponse(data);
  }

  @Patch(':message_id')
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
  async update(@Param('message_id', ParseIntPipe) message_id: number, @Body() item: UpdateMessageDto) {
    const { message } = await this.messageService.update(message_id, item);
    return this.responseHandler.HandleResponse({}, null, message);
  }

  @Delete(':message_id')
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
  async deleteById(@Param('message_id', ParseIntPipe) message_id: number) {
    const { message } = await this.messageService.deleteById(message_id);
    return this.responseHandler.HandleResponse({}, null, message);
  }
}
