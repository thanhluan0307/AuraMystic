import { ImageSourcePropType } from 'react-native';

export const TAROT_IMAGES: Record<string, ImageSourcePropType> = {
  // 22 Lá Major Arcana
  major_0: require('../../assets/Major/thefool.png'),
  major_1: require('../../assets/Major/theMagician.png'),
  major_2: require('../../assets/Major/theHighPriestess.png'),
  major_3: require('../../assets/Major/theEmpressss.png'),
  major_4: require('../../assets/Major/theEmperor.png'),
  major_5: require('../../assets/Major/theHierophant.png'),
  major_6: require('../../assets/Major/theLoves.png'),
  major_7: require('../../assets/Major/theChariot.png'),
  major_8: require('../../assets/Major/strength.png'),
  major_9: require('../../assets/Major/theHermit.png'),
  major_10: require('../../assets/Major/wheel-fortune.png'),
  major_11: require('../../assets/Major/justice.png'),
  major_12: require('../../assets/Major/theHangedMan.png'),
  major_13: require('../../assets/Major/death.png'),
  major_14: require('../../assets/Major/temperance.png'),
  major_15: require('../../assets/Major/theDevil.png'),
  major_16: require('../../assets/Major/theTower.png'),
  major_17: require('../../assets/Major/theStar.png'),
  major_18: require('../../assets/Major/theMoon.png'),
  major_19: require('../../assets/Major/theSun.png'),
  major_20: require('../../assets/Major/judgement.png'),
  major_21: require('../../assets/Major/theWorld.png'),

  // Cups (Bộ Cốc)
  cups_1: require('../../assets/Cups/1.png'),
  cups_2: require('../../assets/Cups/2.png'),
  cups_3: require('../../assets/Cups/3.png'),
  cups_4: require('../../assets/Cups/4.png'),
  cups_5: require('../../assets/Cups/5.png'),
  cups_6: require('../../assets/Cups/6.png'),
  cups_7: require('../../assets/Cups/7.png'),
  cups_8: require('../../assets/Cups/8.png'),
  cups_9: require('../../assets/Cups/9.png'),
  cups_10: require('../../assets/Cups/10.png'),
  cups_page: require('../../assets/Cups/Page.png'),
  cups_knight: require('../../assets/Cups/Knight.png'),
  cups_queen: require('../../assets/Cups/Queen.png'),
  cups_king: require('../../assets/Cups/King.png'),

  // Pentacles (Bộ Tiền / Đồng Xu)
  pentacles_1: require('../../assets/Pentacies/1.png'),
  pentacles_2: require('../../assets/Pentacies/2.png'),
  pentacles_3: require('../../assets/Pentacies/3.png'),
  pentacles_4: require('../../assets/Pentacies/4.png'),
  pentacles_5: require('../../assets/Pentacies/5.png'),
  pentacles_6: require('../../assets/Pentacies/6.png'),
  pentacles_7: require('../../assets/Pentacies/7.png'),
  pentacles_8: require('../../assets/Pentacies/8.png'),
  pentacles_9: require('../../assets/Pentacies/9.png'),
  pentacles_10: require('../../assets/Pentacies/10.png'),
  pentacles_page: require('../../assets/Pentacies/Page.png'),
  pentacles_knight: require('../../assets/Pentacies/Knight.png'),
  pentacles_queen: require('../../assets/Pentacies/Queen.png'),
  pentacles_king: require('../../assets/Pentacies/King.png'),

  // Swords (Bộ Kiếm)
  swords_1: require('../../assets/Swords/1.png'),
  swords_2: require('../../assets/Swords/2.png'),
  swords_3: require('../../assets/Swords/3.png'),
  swords_4: require('../../assets/Swords/4.png'),
  swords_5: require('../../assets/Swords/5.png'),
  swords_6: require('../../assets/Swords/6.png'),
  swords_7: require('../../assets/Swords/7.png'),
  swords_8: require('../../assets/Swords/8.png'),
  swords_9: require('../../assets/Swords/9.png'),
  swords_10: require('../../assets/Swords/10.png'),
  swords_page: require('../../assets/Swords/Page.png'),
  swords_knight: require('../../assets/Swords/Knight.png'),
  swords_queen: require('../../assets/Swords/Queen.png'),
  swords_king: require('../../assets/Swords/King.png'),

  // Wands (Bộ Gậy)
  wands_1: require('../../assets/Wands/1.png'),
  wands_2: require('../../assets/Wands/2.png'),
  wands_3: require('../../assets/Wands/3.png'),
  wands_4: require('../../assets/Wands/4.png'),
  wands_5: require('../../assets/Wands/5.png'),
  wands_6: require('../../assets/Wands/6.png'),
  wands_7: require('../../assets/Wands/7.png'),
  wands_8: require('../../assets/Wands/8.png'),
  wands_9: require('../../assets/Wands/9.png'),
  wands_10: require('../../assets/Wands/10.png'),
  wands_page: require('../../assets/Wands/Page.png'),
  wands_knight: require('../../assets/Wands/Knight.png'),
  wands_queen: require('../../assets/Wands/Queen.png'),
  wands_king: require('../../assets/Wands/King.png'),
};

export function getTarotImage(imageKey?: string): ImageSourcePropType | undefined {
  if (!imageKey) return undefined;
  return TAROT_IMAGES[imageKey];
}

