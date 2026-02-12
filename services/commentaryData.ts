
/**
 * 이 파일이 고객님께서 말씀하신 "조합별 내용 미리 작성" 공간입니다.
 * Key는 '티ID-활동ID-향수ID-꽃ID' 형식입니다.
 */
export const COMBINATION_DB: Record<string, string> = {
  "tea_4-act_1-perf_4-flow_3": "페퍼민트의 청량함과 숲길의 싱그러운 공기가 만나 지친 마음을 정화하고, 그 위에 얹어진 플로럴 부케의 우아한 잔향은 당신의 내면을 다정하게 감싸 안아줍니다. 여기에 태양을 닮은 해바라기의 찬란한 에너지가 더해져, 정적인 휴식과 동적인 생동감이 완벽한 균형을 이루는 환상적인 시너지가 완성되었습니다. 오늘 이 조합은 당신의 감각을 섬세하게 깨워주며, 마치 숲속에서 마주한 눈부신 햇살처럼 당신의 하루를 가장 빛나게 피워낼 것입니다.",
  // 기본값 (데이터가 없을 경우를 대비한 템플릿)
  "default": "선택하신 조합은 오늘 당신의 기분을 맑게 정화해 줄 완벽한 리추얼입니다. 따뜻한 차 한 잔과 함께 특별한 향기와 꽃이 주는 에너지를 만끽하며, 나만을 위한 소중한 시간을 보내보세요. 이 리추얼이 당신의 평온한 하루를 응원합니다."
};

export const getLocalCommentary = (t: string, a: string, p: string, f: string): string => {
  const key = `${t}-${a}-${p}-${f}`;
  return COMBINATION_DB[key] || COMBINATION_DB["default"];
};
