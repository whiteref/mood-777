export interface SlotItem {
  id: string;
  name: string; // Legacy field for safety
  name_kr: string;
  name_en: string;
  name_ja: string;
  category: 'tea' | 'activity' | 'perfume' | 'flower';
  imageUrl: string;
  luckyColor?: string;
  recommendation?: {
    itemName: string;
    itemDesc: string;
    affiliateUrl: string;
  };
}

export interface MoodResult {
  tea: SlotItem;
  activity: SlotItem;
  perfume: SlotItem;
  flower: SlotItem;
  score: number;
  aiCommentary?: string;
}

export enum SlotState {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  FINISHED = 'FINISHED'
}
