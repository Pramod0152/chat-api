import { NestApplication, NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, RequestMethod, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import swaggerInit from './swagger';
import { LoggerService } from './common/logger/logger';
import * as useragent from 'express-useragent';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
	const app: NestApplication = await NestFactory.create(AppModule, {
		abortOnError: false,
		rawBody: true,
	});

	/** config  variable */
	const configService = app.get(ConfigService);

	const port: number = configService.get<number>('HTTP_PORT');

	const globalPrifix: string = configService.get<string>('GLOBAL_PREFIX');
	const apiVersion: string = configService.get<string>('API_VERSION');

	/** useragent for enhanced log of the request */
	app.use(useragent.express());

	/** Cookie parser for cookie-based authentication */
	app.use(cookieParser());

	/** Inject logger instance */
	const logger: LoggerService = app.get<LoggerService>(LoggerService);

	/** Enable Cors — allow all subdomains of taasnet.com, taascard.com, airbank.one + localhost */
	const allowedDomains = [
		/^https?:\/\/([a-z0-9-]+\.)*taasnet\.com$/,
		/^https?:\/\/stagelink\.live$/,
		/^https?:\/\/([a-z0-9-]+\.)*taascard\.com$/,
		/^https?:\/\/([a-z0-9-]+\.)*airbank\.one$/,
		/^https?:\/\/localhost(:\d+)?$/,
	];
	app.enableCors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			const isAllowed = allowedDomains.some((regex) => regex.test(origin));
			callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
		},
		credentials: true,
		exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type'],
	});

	/** Intercepter to add no-cach header */
	app.useGlobalInterceptors();

	/**
	 * NOTE: If we implements reverse proxy for compression we should not use compression middleware.
	 * Because gzip compressin will hit on the processor.
	 * For high-traffic websites in production, it is strongly recommended to offload compression from the application server
	 */
	app.use(compression());

	/** Helmet will secure api by setting various HTTP headers */
	// app.use(helmet());

	/** Config validation pipes for class validation.*/
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			exceptionFactory: (errors: ValidationError[]) => {
				const formatErrors = (errs: ValidationError[]) => {
					const messages = [];
					for (const error of errs) {
						if (error.constraints) {
							messages.push(...Object.values(error.constraints));
						}
						if (error.children && error.children.length) {
							messages.push(...formatErrors(error.children));
						}
					}
					return messages;
				};
				const errorMessage = formatErrors(errors).join(', ');
				return new BadRequestException({
					message: errorMessage,
				});
			},
		}),
	);

	/** Prefix for all api */
	app.setGlobalPrefix(globalPrifix + '/' + apiVersion, {
		exclude: [
			{ path: 'robots.txt', method: RequestMethod.GET },
			{ path: 'file/access', method: RequestMethod.GET },
		],
	});

	// Serve static files from 'uploads' directory
	app.useStaticAssets(join(__dirname, '..', 'uploads'), {
		prefix: '/uploads',
		setHeaders: (res) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
			res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
		},
	});

	// Ensure logs directory exists and serve static files from it
	const logsPath = join(__dirname, '..', 'logs');
	if (!existsSync(logsPath)) {
		mkdirSync(logsPath, { recursive: true });
	}

	app.useStaticAssets(logsPath, {
		prefix: '/logs',
		setHeaders: (res, path) => {
			// Set proper content type for log files
			if (path.endsWith('.logs')) {
				res.setHeader('Content-Type', 'text/plain');
			}
		},
	});

	/** Initialize of swagger.*/
	await swaggerInit(app);

	/** Initialize application.*/
	await app.listen(port);

	logger.info(`🚀 🚀 🚀 Application is running on: ${await app.getUrl()} 🚀 🚀 🚀`);
}

/** NOTE: Handle unhandledRejecton in proper way. */
process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
	// application specific logging, throwing an error, or other logic here
});

bootstrap();
