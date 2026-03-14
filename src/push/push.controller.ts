import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { PushService } from './push.service';
import {
  PushSubscriptionDto,
  SendNotificationDto,
  SendSaleNotificationsDto,
} from './dto';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-public-key')
  getVapidPublicKey(): { publicKey: string } {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @Post('subscribe')
  subscribe(@Body() subscription: PushSubscriptionDto): { success: boolean } {
    return this.pushService.subscribe(subscription);
  }

  @Delete('unsubscribe')
  unsubscribe(@Body('endpoint') endpoint: string): { success: boolean } {
    return this.pushService.unsubscribe(endpoint);
  }

  @Post('send')
  async sendToAll(
    @Body() notification: SendNotificationDto,
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    return this.pushService.sendNotificationToAll(notification);
  }

  @Post('send-sales')
  async sendSaleNotifications(
    @Body() data: SendSaleNotificationsDto,
  ): Promise<{ success: boolean; totalSent: number; totalFailed: number }> {
    return this.pushService.sendSaleNotifications(data);
  }

  @Get('subscriptions/count')
  getSubscriptionsCount(): { count: number } {
    return { count: this.pushService.getSubscriptionsCount() };
  }
}
