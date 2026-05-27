import { ApiProperty } from '@nestjs/swagger';
import { SeverityType } from 'src/lib/enums';

export class Meta {
	/**
	 * HIT - the resource was found in server cache
	 * MISS - The resource was not found in Servers cache and was served from the origin data-source (Db)
	 */
	@ApiProperty({ default: 'MISS' })
	cacheStatus?: string;

	/** Custome code for the response.  */
	@ApiProperty()
	code?: number | string;

	/** Custome code for the response.  */
	@ApiProperty()
	httpStatusCode?: number;

	@ApiProperty()
	path?: string;

	@ApiProperty()
	method?: string;

	@ApiProperty()
	timestamp?: Date;

	@ApiProperty()
	severity?: SeverityType;

	@ApiProperty()
	stack?: string;

	@ApiProperty()
	app_version?: string;

	@ApiProperty()
	setting_version?: string;

	constructor(opt: any) {
		this.cacheStatus = opt.cacheStatus || 'MISS';
	}
}
