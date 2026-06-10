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
import { ParticipantService } from 'src/bll/participant.service';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { CreateParticipantDto } from 'src/dto/participant/create-participant.dto';
import { UpdateParticipantDto } from 'src/dto/participant/update-participant.dto';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilterParticipantDto } from 'src/dto/participant/filter-participant.dto';

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
  async create(@Body() item: CreateParticipantDto, @Request() req: any) {
    const data = await this.participantService.create(item, req.user.id);
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
  async findByConversationId(@Query() query: FilterParticipantDto, @Request() req: any) {
    const { data, nextCursor } = await this.participantService.findByConversationId(query, req.user.id);
    return this.responseHandler.HandleResponse(data, nextCursor);
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
    const data = await this.participantService.findById(id);
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
  async update(@Param('id', ParseIntPipe) id: number, @Body() item: UpdateParticipantDto, @Request() req: any) {
    const { message } = await this.participantService.update(id, item, req.user.id);
    return this.responseHandler.HandleResponse({}, null, message);
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
  async deleteById(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const { message } = await this.participantService.deleteById(id, req.user.id);
    return this.responseHandler.HandleResponse({}, null, message);
  }
}
