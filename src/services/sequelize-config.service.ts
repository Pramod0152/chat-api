import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModuleOptions, SequelizeOptionsFactory } from '@nestjs/sequelize';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
	constructor(private configService: ConfigService) {}

	createSequelizeOptions(): SequelizeModuleOptions {
		const DATABASE_HOST = this.configService.get<string>('DATABASE_HOST');
		const DATABASE_USER = this.configService.get<string>('DATABASE_USER');
		const DATABASE_PORT = this.configService.get<number>('DATABASE_PORT');
		const DATABASE_PASSWORD = this.configService.get<string>('DATABASE_PASSWORD');
		const DATABASE_NAME = this.configService.get<string>('DATABASE_NAME');

		return {
			dialect: 'mysql',
			host: DATABASE_HOST,
			port: DATABASE_PORT,
			username: DATABASE_USER,
			password: DATABASE_PASSWORD,
			database: DATABASE_NAME,
			autoLoadModels: true,
			logging: false,
			/** Never make it true it will crate tables according to the models */
			synchronize: false,
			define: {
				timestamps: false,
			},
		};
	}
}
