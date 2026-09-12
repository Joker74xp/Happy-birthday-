export interface BirthdayMemory {
  id: string;
  image: string;
  driveUrl?: string;
  caption: string;
  date?: string;
  tag?: string;
}

export interface BirthdayConfig {
  recipientName: string;
  senderName: string;
  nickname: string;
  passkey: string;
  passkeyHint: string;
  letterTitle: string;
  letterSubtitle: string;
  letterMessage: string;
  cakeTitle: string;
  cakeCelebrationText: string;
  musicVideoId?: string;
  memories: BirthdayMemory[];
}

export type AppStage =
  | 'heart'
  | 'letter'
  | 'cake'
  | 'passkey'
  | 'memories'
  | 'celebration';
