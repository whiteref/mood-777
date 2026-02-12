
import { SlotItem } from './types';
import ritualData from './ritual_data.json';

/**
 * 💡 시니어의 조언: 1,000장의 사진을 관리할 때는 URL을 직접 쓰지 마세요.
 */
const CLOUD_STORAGE_URL = "https://images.unsplash.com/photo-"; // 임시 Unsplash 기반 (향후 R2 연동)

// 🐻 곰 조각상 방지를 위한 프리미엄 핑크 에스테틱 전용 큐레이션 (Verified IDs)
const PREMIUM_IMAGES: Record<string, string[]> = {
  tea: [
    "1596462502278-27bfdc4033c8", // Pink cosmetic/tea vibe
    "1556228720-195a672e8a03", // Pink aesthetic
    "1612817288484-6f916006741a", // Pink flower/tea
    "1629198688000-71f23e745b6e", // Pink tea cup tone
  ],
  activity: [
    "1518241353317-8f539d420f60", // Pink yoga/relax
    "1552693805-65eeac276233", // Pink meditation vibe
    "1596462502278-27bfdc4033c8", // Calm pink
    "1556228720-195a672e8a03", // Resting pink
  ],
  perfume: [
    "1620916566398-39f1143ab7be", // Pink skincare/perfume
    "1596462502278-27bfdc4033c8", // Luxury pink
    "1612817288484-6f916006741a", // Floral scent vibe
    "1556228720-195a672e8a03", // Glass/Pink
  ],
  flower: [
    "1612817288484-6f916006741a", // Pink flower closeup
    "1596462502278-27bfdc4033c8", // Pink bloom
    "1490750967868-58aa6818e6F", // Pink rose classic
    "1508610048659-a06b669e3321", // Pink petals
  ]
};

const mapToSlotItem = (items: any[], category: string): SlotItem[] => {
  return items.map((item, index) => {
    // 🎲 고정된 큐레이션 리스트 내에서 아이템별로 고유한 이미지를 할당 (Hash-like)
    const imageList = PREMIUM_IMAGES[category] || PREMIUM_IMAGES['flower'];
    const imageId = imageList[index % imageList.length];

    return {
      ...item,
      // 🔒 Unsplash 고정 ID + Cloudinary/Imgix 옵션으로 품질 최적화
      imageUrl: `${CLOUD_STORAGE_URL}${imageId}?auto=format&fit=crop&w=800&q=80`
    };
  });
};

// 1. 허브티 (Herbal Teas)
export const TEAS: SlotItem[] = mapToSlotItem(ritualData.Tea, 'tea');

// 2. 활동 (Activities)
export const ACTIVITIES: SlotItem[] = mapToSlotItem(ritualData.Activity, 'activity');

// 3. 향수 (Perfumes)
export const PERFUMES: SlotItem[] = mapToSlotItem(ritualData.Perfume, 'perfume');

// 4. 꽃 (Flowers)
export const FLOWERS: SlotItem[] = mapToSlotItem(ritualData.Flower, 'flower');
