export interface SmsDriver {
  send(to: string, message: string): Promise<void>
}
