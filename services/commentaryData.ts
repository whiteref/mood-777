
import { Language } from '../translations';

export const COMBINATION_DB: Record<string, Record<Language, string>> = {
  "default": {
    KR: "선택하신 조합은 오늘 당신의 기분을 맑게 정화해 줄 완벽한 리추얼입니다. 따뜻한 차 한 잔과 함께 특별한 향기와 꽃이 주는 에너지를 만끽하며, 나만을 위한 소중한 시간을 보내보세요. 이 리추얼이 당신의 평온한 하루를 응원합니다.",
    EN: "This combination is a perfect ritual to clear and purify your mood today. Enjoy a precious moment for yourself with a cup of warm tea and the energy of special scents and flowers.",
    JA: "選択された組み合わせは、今日の気分を清らかに浄화してくれる完璧なリチュアルです。温かいお茶と共に、特別な香りと花が与えるエネルギーを満喫し, 自分だけの貴重な時間をお過ごしください。"
  }
};

export const getLocalCommentary = (t: string, a: string, p: string, f: string, lang: Language): string => {
  const key = `${t}-${a}-${p}-${f}`;
  const commentary = COMBINATION_DB[key] || COMBINATION_DB["default"];
  return commentary[lang];
};
