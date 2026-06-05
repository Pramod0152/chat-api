import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(private readonly configService: ConfigService) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.get('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
      }),
      storageBucket: this.configService.get('FIREBASE_STORAGE_BUCKET'),
    });
  }

  async sendNotification(item: any): Promise<any> {
    try {
      const response = await admin.messaging().send({
        token: item.token,
        webpush: {
          notification: {
            title: item.title,
            body: item.body,
          },
        },
      });
      return response;
    } catch (error) {
      console.error('Error sending notification', error);
      return {
        success: false,
        message: 'Error sending notification',
        error: error.message,
      };
    }
  }

  async verifyUserFromSSO(token: string) {
    return await admin.auth().verifyIdToken(token);
  }
}
