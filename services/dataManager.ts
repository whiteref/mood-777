
/**
 * 💡 시니어 엔지니어의 팁: 
 * 1,000개의 데이터를 수동으로 관리하지 마세요. 
 * 데이터의 'ID'와 이미지 파일의 '이름'을 일치시키는 규칙(Convention)이 핵심입니다.
 */

export interface MasterItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

// 1. AI가 생성한 1,000개의 데이터 리스트 (예시)
// 실제로는 이 배열이 1,000개까지 확장됩니다.
export const MASTER_DATA_LIST: MasterItem[] = [
  { id: "jasmine_001", name: "프리미엄 자스민", description: "은은한 향의 고산지대 자스민", category: "tea" },
  { id: "peppermint_005", name: "쿨 페퍼민트", description: "입안 가득 퍼지는 청량함", category: "tea" },
  { id: "lavender_021", name: "프로방스 라벤더", description: "심신 안정에 좋은 보랏빛 향기", category: "tea" },
  // ... 997개 더 추가 가능
];

/**
 * 2. 자동 매칭 로직
 * 어떤 아이템을 던져줘도 규칙에 따라 정확한 사진 경로를 반환합니다.
 * 이미지 서버(Cloudflare R2 등)에 'tea/jasmine_001.webp' 형태로 저장되어 있어야 합니다.
 */
export const getAutoMappedImageUrl = (item: MasterItem): string => {
  const STORAGE_BASE_URL = "https://cdn.your-app.com/assets/";
  // 카테고리별 폴더 구조와 ID를 결합하여 1:1 매칭
  return `${STORAGE_BASE_URL}${item.category}/${item.id}.webp`;
};

/**
 * 3. AI에게 1,000개 데이터 생성을 요청하는 '마스터 프롬프트'
 */
export const GENERATE_MASTER_PROMPT = `
  전 세계의 차(Tea) 종류 1,000개를 다음 JSON 형식으로 생성해라.
  반드시 중복이 없어야 하며, 한국어로 작성해라.
  형식: { "id": "tea_001", "name": "이름", "description": "설명" }
`;
