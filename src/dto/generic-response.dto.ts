import { ApiProperty } from '@nestjs/swagger';
import { Meta } from './meta.dto';

export class GenericResponseDto<TData> {
	@ApiProperty()
	message?: string;

	@ApiProperty()
	meta?: Meta;

	@ApiProperty()
	data: TData;
}
