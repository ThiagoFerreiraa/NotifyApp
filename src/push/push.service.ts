import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';
import {
  PushSubscriptionDto,
  SendNotificationDto,
  SendSaleNotificationsDto,
} from './dto';

@Injectable()
export class PushService implements OnModuleInit {
  private subscriptions: Map<string, PushSubscriptionDto> = new Map();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const publicKey = this.configService.getOrThrow<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.getOrThrow<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.getOrThrow<string>('VAPID_SUBJECT');

    webPush.setVapidDetails(subject, publicKey, privateKey);
  }

  getPublicKey(): string {
    return this.configService.getOrThrow<string>('VAPID_PUBLIC_KEY');
  }

  subscribe(subscription: PushSubscriptionDto): { success: boolean } {
    this.subscriptions.set(subscription.endpoint, subscription);
    return { success: true };
  }

  unsubscribe(endpoint: string): { success: boolean } {
    this.subscriptions.delete(endpoint);
    return { success: true };
  }

  async sendNotification(
    subscription: PushSubscriptionDto,
    notification: SendNotificationDto,
  ): Promise<{ success: boolean }> {
    console.log('Enviando notificação para:', notification.icon);
    const payload = JSON.stringify({
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/assets/icons/icon-128x128.png',
        data: {
          url: notification.url || '/',
        },
      },
    });

    try {
      await webPush.sendNotification(subscription, payload);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      if (error.statusCode === 410) {
        this.subscriptions.delete(subscription.endpoint);
      }
      throw error;
    }
  }

  async sendNotificationToAll(
    notification: SendNotificationDto,
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const promises = Array.from(this.subscriptions.values()).map(
      async (subscription) => {
        try {
          await this.sendNotification(subscription, notification);
          sent++;
        } catch {
          failed++;
        }
      },
    );

    await Promise.all(promises);
    return { success: true, sent, failed };
  }

  getSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  async sendSaleNotifications(
    data: SendSaleNotificationsDto,
  ): Promise<{ success: boolean; totalSent: number; totalFailed: number }> {
    const { amount, quantity } = data;
    let totalSent = 0;
    let totalFailed = 0;

    const formatCurrency = (value: number) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    for (let i = 0; i < quantity; i++) {
      const notification: SendNotificationDto = {
        title: 'Nova Venda Realizada!',
        body: `Você recebeu ${formatCurrency(amount)}`,
        icon: '/assets/IconZucroPay.webp',
        url: '/vendas',
      };

      const result = await this.sendNotificationToAll(notification);
      totalSent += result.sent;
      totalFailed += result.failed;

      // Pequeno delay entre notificações para não sobrecarregar
      if (i < quantity - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return { success: true, totalSent, totalFailed };
  }
}
