
import { SlotItem } from './types';
import ritualData from './ritual_data.json';

/**
 * 💡 시니어의 조언: 1,000장의 사진을 관리할 때는 URL을 직접 쓰지 마세요.
 */
const CLOUD_STORAGE_URL = "https://images.unsplash.com/photo-"; // 임시 Unsplash 기반 (향후 R2 연동)

const CATEGORY_KEYWORDS: Record<string, string> = {
  tea: "herbal,tea,cup,pink,aesthetic",
  activity: "yoga,meditation,wellness,pink,relax",
  perfume: "perfume,luxury,pink,bottle",
  flower: "flower,pink,bloom,aesthetic"
};

const mapToSlotItem = (items: any[]): SlotItem[] => {
  return items.map(item => {
    const keyword = CATEGORY_KEYWORDS[item.category] || "lifestyle";
    // 상업용 라이브러리의 중복 사진 방지를 위해 항목별 고유 숫자(lock)를 생성합니다.
    const lockSeed = item.id.split('_')[1] || Math.floor(Math.random() * 1000);
    return {
      ...item,
      // ?lock= 파라미터를 통해 모든 항목이 각기 다른 사진을 보장받도록 수정했습니다.
      imageUrl: `https://loremflickr.com/800/1000/${keyword}/all?lock=${lockSeed}`
    };
  });
};

// 1. 허브티 (Herbal Teas)
export const TEAS: SlotItem[] = mapToSlotItem(ritualData.Tea);

// 2. 활동 (Activities)
export const ACTIVITIES: SlotItem[] = mapToSlotItem(ritualData.Activity);

// 3. 향수 (Perfumes)
export const PERFUMES: SlotItem[] = mapToSlotItem(ritualData.Perfume);

// 4. 꽃 (Flowers)
export const FLOWERS: SlotItem[] = mapToSlotItem(ritualData.Flower);
