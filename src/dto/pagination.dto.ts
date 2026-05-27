import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationDto {
    @ApiPropertyOptional({ description: 'Offset of the query. Default is 0.' })
    @Transform(({ value }) => parseInt(value, 10))
    offset: number;

    @ApiPropertyOptional({ description: 'Limit of the data. Default is 10.' })
    @Transform(({ value }) => parseInt(value, 10))
    limit: number;
}
