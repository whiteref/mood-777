
import { SlotItem } from './types';
import ritualData from './ritual_data.json';

/**
 * 💡 시니어의 조언: 1,000장의 사진을 관리할 때는 URL을 직접 쓰지 마세요.
 */
const CLOUD_STORAGE_URL = "https://images.unsplash.com/photo-"; // 임시 Unsplash 기반 (향후 R2 연동)

const CATEGORY_KEYWORDS: Record<string, string> = {
  tea: "herbal,tea,cup,organic",
  activity: "yoga,meditation,wellness,zen",
  perfume: "perfume,scent,luxury,fragrance",
  flower: "flower,bloom,aesthetic,nature"
};

const mapToSlotItem = (items: any[]): SlotItem[] => {
  return items.map(item => {
    const keyword = CATEGORY_KEYWORDS[item.category] || "lifestyle";
    return {
      ...item,
      // 더욱 정교한 이미지 매칭을 위해 카테고리별 영문 키워드와 개별 항목명을 조합합니다.
      imageUrl: `https://loremflickr.com/800/1000/${keyword},${encodeURIComponent(item.name.split(' ')[0])},luxury/all`
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
