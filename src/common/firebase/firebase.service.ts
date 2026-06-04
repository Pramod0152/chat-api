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
    // generate fcm token
    try {
      const response = await admin.messaging().send({
        token:
          'fF7J72wo3KGeCN46d2hjNI:APA91bGBum2KflKClKLKEiADf27_FqO-dqaQP28ekSpmtLi_QhaKk0HvfGVfBQeM7IY2xXGRTkinl8f2TgJ6jVsws04rKso0GlB6r-H96pZRJ-DSHt8SHzA',
        webpush: {
          notification: {
            title: 'Firebase Notification',
            body: 'Pramod Sent You a Notification',
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
}
