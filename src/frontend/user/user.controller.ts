import { Controller, Get, Param, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from '../../bll/user.service';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from 'src/dto/pagination.dto';
import { IsPublic } from 'src/common/decorators/is-public.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHandler: ResponseHandlerService,
  ) {}

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
  async findAll(@Query() query: PaginationDto) {
    const { data, nextCursor } = await this.userService.findAll(query);
    return this.responseHandler.HandleResponse(data, nextCursor);
  }

  @Get('/health')
  @IsPublic()
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
  async findHealth() {
    return this.responseHandler.HandleResponse({ status: 'OK' });
  }

  @Get('/me')
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
  async findMe(@Request() req: any) {
    const user_id = req.user.id;
    const data = await this.userService.findById(user_id);
    return this.responseHandler.HandleResponse(data);
  }

  @Get('/not-connected-private')
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
  async findUsersNotInPrivateConversation(@Request() req: any, @Query() query: PaginationDto) {
    const { data, nextCursor } = await this.userService.findUsersNotInPrivateConversation(req.user.id, query);
    return this.responseHandler.HandleResponse(data, nextCursor);
  }

  @Get('/not-connected-group/:conversation_id')
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
  async findUsersNotInGroupConversation(
    @Param('conversation_id', ParseIntPipe) conversation_id: number,
    @Query() query: PaginationDto,
    @Request() req: any,
  ) {
    const { data, nextCursor } = await this.userService.findUsersNotInGroupConversation(
      conversation_id,
      query,
      req.user.id,
    );
    return this.responseHandler.HandleResponse(data, nextCursor);
  }
}
