
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../translations';

export interface ShoppingItem {
  itemName: string;
  itemPrice: string;
  itemReason: string;
  searchKeyword: string;
  itemImageUrl?: string;
}

const ART_DIRECTION = "High-end aesthetic cosmetic photography, soft pink lighting, premium rose gold accents, feminine mood, 8k resolution, centered composition, pastel pink background, minimalist luxury style.";

/**
 * 1,000개의 고정 아이템 외에, AI가 추천하는 '행운의 아이템'을 실시간으로 그려냅니다.
 */
export const generateConsistentImage = async (itemName: string): Promise<string | undefined> => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return undefined;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const imagePrompt = `${itemName}, ${ART_DIRECTION}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [{ text: imagePrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("AI Image Generation Failed, using fallback:", e);
  }

  // AI 이미지 생성 실패 시 또는 키워드 보강을 위해 여성용 핑크 화장품 세트 이미지 반환
  // [보안] 곰 조각상 등 부적절한 이미지 방지를 위해 안정적인 Unsplash 고정 URL 사용
  return `https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&w=800&q=80`;
};

/**
 * 사용자가 선택한 리추얼(차, 활동, 향, 꽃)을 분석하여 최적의 쇼핑 아이템을 제안합니다.
 */
export const getRealtimeShoppingItems = async (
  tea: string,
  activity: string,
  perfume: string,
  flower: string,
  lang: Language
): Promise<ShoppingItem | null> => {
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const fallbacks = {
      KR: {
        itemName: "Pink Glow Ritual Skincare Set",
        itemPrice: "₩48,000",
        itemReason: "현재 인연의 에너지가 너무 강해 AI가 잠시 휴식 중입니다. 대신 당신의 피부와 마음에 생기를 더해줄 핑크빛 리추얼 세트를 준비했습니다.",
        searchKeyword: "pink glow skincare ritual set"
      },
      EN: {
        itemName: "Pink Glow Ritual Skincare Set",
        itemPrice: "$35.00",
        itemReason: "The energy of our connection is so strong right now that the AI is taking a short rest. Instead, we've prepared a pink ritual set to revitalize your skin and soul.",
        searchKeyword: "pink glow skincare ritual set"
      },
      JA: {
        itemName: "ピンクグロウ リ추얼 スキンケアセット",
        itemPrice: "¥5,200",
        itemReason: "現在、縁のエネルギーが非常に強いため、AIが一時的に休息しています。代わりに、あなたの肌と心に活力を与えるピンク色のリチュアルセットを用意しました。",
        searchKeyword: "pink glow skincare ritual set"
      }
    };
    return {
      ...fallbacks[lang],
      itemImageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const langInstructions = {
      KR: "모든 응답(아이템 이름, 추천 사유 등)은 한국어로 작성해 주세요.",
      EN: "Please write all responses (item name, reason, etc.) in English.",
      JA: "すべての回答（アイテム名、推薦理由など）は日本語で作成してください。"
    };

    const prompt = `당신은 럭셔리 라이프스타일 큐레이터입니다. 사용자가 선택한 리추얼 조합(${tea}, ${activity}, ${perfume}, ${flower})에 어울리는 '행운의 오브제' 한 가지를 추천해 주세요. 
    
    [중요 지침 - 필독]
    1. 반드시 '여성스럽고', '핑크빛 테마'의 프리미엄 화장품이나 인테리어 소품(예: 로즈 퀄츠 롤러, 핑크 무드등, 실크 슬립 등) 중에서 추천하세요. 
    2. 중후하거나 딱딱한 조각상(곰, 사자, 고양이 동상 등 모든 형태의 조형물)은 절대로 추천하지 마세요. (매우 중요)
    3. 모든 응답은 우아하고 품격 있는 톤앤매너를 유지하세요.
    
    ${langInstructions[lang]}
    
    반드시 아래 JSON 형식으로만 응답하세요:
    {
      "itemName": "아이템 이름",
      "itemPrice": "가격대(문자열)",
      "itemReason": "추천 사유 (2문장 이내)",
      "searchKeyword": "쿠팡 검색을 위한 핵심 키워드 (핑크, 화장품, 뷰티 관련 영문 위주)"
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            itemPrice: { type: Type.STRING },
            itemReason: { type: Type.STRING },
            searchKeyword: { type: Type.STRING },
          },
          required: ["itemName", "itemPrice", "itemReason", "searchKeyword"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    const itemImageUrl = await generateConsistentImage(data.itemName);

    return { ...data, itemImageUrl };
  } catch (e: any) {
    console.error("AI Shopping Recommendation Failed:", e);
    const errorFallbacks = {
      KR: {
        itemName: "Rose Quartz Face Roller",
        itemPrice: "₩22,000",
        itemReason: "오늘의 인연은 매우 부드럽고 따뜻합니다. 당신의 아름다움을 깨워줄 핑크 쿼츠 페이스 롤러를 추천해 드려요.",
        searchKeyword: "rose quartz face roller pink"
      },
      EN: {
        itemName: "Rose Quartz Face Roller",
        itemPrice: "$16.00",
        itemReason: "Today's connection is very soft and warm. We recommend a rose quartz face roller to awaken your beauty.",
        searchKeyword: "rose quartz face roller pink"
      },
      JA: {
        itemName: "ローズクォーツ フェイスローラー",
        itemPrice: "¥2,500",
        itemReason: "今日のご縁はとても柔らかく温かいものです。あなたの美しさを呼び覚ますローズクォーツフェイスローラーをお勧めします。",
        searchKeyword: "rose quartz face roller pink"
      }
    };
    return {
      ...errorFallbacks[lang],
      itemImageUrl: `https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80`
    };
  }
};
