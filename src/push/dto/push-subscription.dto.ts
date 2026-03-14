export class PushSubscriptionKeysDto {
  p256dh: string;
  auth: string;
}

export class PushSubscriptionDto {
  endpoint: string;
  keys: PushSubscriptionKeysDto;
}
