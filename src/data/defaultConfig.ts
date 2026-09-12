import { BirthdayConfig } from '../types';
import { getDriveImageUrls } from '../utils/driveImage';

export const DEFAULT_CONFIG: BirthdayConfig = {
  recipientName: 'My Girl',
  senderName: 'Your Love',
  nickname: 'My Cutuuu',
  passkey: '2026',
  passkeyHint: 'Hint: 2026',
  letterTitle: 'A Letter, Just For You',
  letterSubtitle: 'Tap the envelope to unseal',
  letterMessage: `Happiest birthday my gurll😍👸

I pray you achieve all your dreams, stay happy, and keep smiling the way you do... because that smile is my favorite thing🫶

Everyday is your day because you are the main character... and YOU KNOW IT😌

Let's share unlimited laughs, love, fights, and happiness🪬🙂‍↔️

I love you forever and ever and ever. Thank you for being my partner in every sense, happy birthday darlzzz😍🫀💋

I love you darlzzzz, please be with me always🥺🤌`,
  cakeTitle: 'Swipe to Cut the Cake! 🎂',
  cakeCelebrationText: 'Happy Birthday, My Girl! 💗',
  musicVideoId: 'K2aJTT29ZdU',
  memories: [],
};

export function loadConfigFromUrl(): BirthdayConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;

  try {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name') || params.get('to');
    const nickname = params.get('nickname') || params.get('nick');
    const sender = params.get('sender') || params.get('from');
    const passkey = params.get('code') || params.get('passkey');
    const msg = params.get('msg') || params.get('message');
    const hint = params.get('hint');
    const photo = params.get('photo') || params.get('image') || params.get('img');
    const music = params.get('music') || params.get('yt');

    let memories = DEFAULT_CONFIG.memories;
    if (photo) {
      const decodedPhoto = decodeURIComponent(photo);
      const { primary, rawDriveUrl } = getDriveImageUrls(decodedPhoto);
      memories = [
        {
          id: '1',
          image: primary,
          driveUrl: rawDriveUrl,
          caption: 'The most special memory of us ✨',
          date: 'Cherished Moment',
          tag: 'Forever',
        },
      ];
    }

    return {
      ...DEFAULT_CONFIG,
      recipientName: name ? decodeURIComponent(name) : DEFAULT_CONFIG.recipientName,
      nickname: nickname ? decodeURIComponent(nickname) : (name ? decodeURIComponent(name) : DEFAULT_CONFIG.nickname),
      senderName: sender ? decodeURIComponent(sender) : DEFAULT_CONFIG.senderName,
      passkey: passkey ? decodeURIComponent(passkey) : DEFAULT_CONFIG.passkey,
      passkeyHint: hint ? decodeURIComponent(hint) : (passkey ? `Hint: ${passkey}` : DEFAULT_CONFIG.passkeyHint),
      letterMessage: msg ? decodeURIComponent(msg) : DEFAULT_CONFIG.letterMessage,
      cakeCelebrationText: name ? `Happy Birthday, ${decodeURIComponent(name)}! 💗` : DEFAULT_CONFIG.cakeCelebrationText,
      musicVideoId: music ? decodeURIComponent(music) : DEFAULT_CONFIG.musicVideoId,
      memories,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
