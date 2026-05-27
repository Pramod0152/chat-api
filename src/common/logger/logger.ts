import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { EnvVariableType } from 'src/lib/enums';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LoggerService {
	private logger: winston.Logger;

	private levels = {
		emerg: 0,
		alert: 1,
		crit: 2,
		error: 3,
		warning: 4,
		notice: 5,
		info: 6,
		debug: 7,
	};

	constructor(private configService: ConfigService) {
		this.initializeLogger();
	}

	initializeLogger() {
		this.logger = winston.createLogger({
			levels: this.levels,
			level: 'debug',
			format: winston.format.combine(winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }), winston.format.prettyPrint()),

			/** At least one transport is must required  */
			transports: [
				new DailyRotateFile({
					filename: 'logs/errors/error-%DATE%.log',
					datePattern: 'YYYY-MM-DD',
					level: 'error',
					maxSize: '90m',
					maxFiles: '180d',
					zippedArchive: true,
				}),
			],
		});

		/** Add console and file transport only in local.*/
		const env: string = this.configService.get<string>('NODE_ENV');
		if (env != EnvVariableType.PROD) {
			this.addConsoleTransport();
			this.addFileTransport();
		}
	}

	/** Add file transports to the logger.*/
	addFileTransport() {
		/** Create winston transport to Write all logs to the daily rotated combined log files */
		const allLogs = new DailyRotateFile({
			filename: 'logs/combined-logs/combined-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			level: 'debug',
			maxSize: '90m',
			maxFiles: '180d',
			zippedArchive: true,
		});

		this.logger.add(allLogs);
	}

	/** Add console transport to the logger.*/
	addConsoleTransport() {
		/**Customize the logging format.*/
		const format = winston.format.combine(
			/**Add the message timestamp with the preferred format. */
			winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),

			/** Tell Winston that the logs must be colored.*/
			winston.format.colorize({ all: true }),

			/**Define the format of the message showing the timestamp, the level and the message.*/
			winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
		);

		/** Add the transport to the logger.*/
		this.logger.add(new winston.transports.Console({ format: format }));
	}

	emerg(message: string) {
		this.logger.emerg(message);
	}

	alert(message: string) {
		this.logger.alert(message);
	}

	crit(message: string) {
		this.logger.crit(message);
	}

	error(message: string) {
		this.logger.error(message);
	}

	warning(message: string) {
		this.logger.warning(message);
	}

	notice(message: string) {
		this.logger.notice(message);
	}

	debug(message: string) {
		this.logger.debug(message);
	}

	info(message: string) {
		this.logger.info(message);
	}

	/**
	 * Write activity logs to a file with format activity-logs-d-m-y.logs
	 * @param source The source of the activity (e.g., 'FirebaseService')
	 * @param action The action being performed (e.g., 'sendPushNotification')
	 * @param data The data related to the activity
	 */
	logActivity(source: string, action: string, data: any): void {
		const now = new Date();
		const day = now.getDate().toString().padStart(2, '0');
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const year = now.getFullYear();

		// Create filename in the requested format
		const fileName = `notification-logs-${day}-${month}-${year}.logs`;
		const logDir = path.join(process.cwd(), 'logs');
		const filePath = path.join(logDir, fileName);

		// Ensure logs directory exists
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
		}

		// Format the log entry
		const timestamp = now.toISOString();
		const logEntry = {
			timestamp,
			source,
			action,
			data,
		};

		// Initialize logs array
		let logs: any[] = [];

		// Check if file exists and read its content
		if (fs.existsSync(filePath)) {
			try {
				const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
				// Parse existing logs as JSON array
				if (fileContent.trim()) {
					logs = JSON.parse(fileContent);
					// Ensure logs is an array
					if (!Array.isArray(logs)) {
						logs = [];
					}
				}
			} catch (error) {
				// If parsing fails, start with an empty array
				console.error(`Error parsing log file ${fileName}:`, error);
				logs = [];
			}
		}

		// Add new log entry at the beginning of the array
		logs.unshift(logEntry);

		// Write the updated JSON array back to the file
		fs.writeFileSync(filePath, JSON.stringify(logs, null, 0), { encoding: 'utf8' });
	}
}
