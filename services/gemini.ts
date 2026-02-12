
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from '../translations';

export interface ShoppingItem {
  itemName: string;
  itemPrice: string;
  itemReason: string;
  searchKeyword: string;
  itemImageUrl?: string;
}

const ART_DIRECTION = "High-end aesthetic lifestyle photography, soft studio lighting, premium mood, 8k resolution, centered composition, pastel background, minimalist style.";

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

  // AI 이미지 생성 실패 시 감성적인 대체 이미지 반환
  return `https://loremflickr.com/800/800/${encodeURIComponent(itemName)},aesthetic,luxury/all`;
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
        itemName: "Crystal Quartz Meditation Stone",
        itemPrice: "₩24,500",
        itemReason: "현재 인연의 에너지가 너무 강해 AI가 잠시 휴식 중입니다. 대신 당신의 평온을 지켜줄 크리스탈 원석을 준비했습니다.",
        searchKeyword: "meditation crystal quartz"
      },
      EN: {
        itemName: "Crystal Quartz Meditation Stone",
        itemPrice: "$18.00",
        itemReason: "The energy of our connection is so strong right now that the AI is taking a short rest. Instead, we've prepared a crystal quartz to protect your peace.",
        searchKeyword: "meditation crystal quartz"
      },
      JA: {
        itemName: "クリスタルクォーツ 瞑想ストーン",
        itemPrice: "¥2,800",
        itemReason: "現在、縁のエネルギーが非常に強いため、AIが一時的に休息しています。代わりに、あなたの平穏を守るクリスタル原石を用意しました。",
        searchKeyword: "meditation crystal quartz"
      }
    };
    return {
      ...fallbacks[lang],
      itemImageUrl: "https://loremflickr.com/800/800/crystal,stone,aesthetic/all"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const langInstructions = {
      KR: "모든 응답(아이템 이름, 추천 사유 등)은 한국어로 작성해 주세요.",
      EN: "Please write all responses (item name, reason, etc.) in English.",
      JA: "すべての回答（アイテム名、推薦理由など）は日本語で作成してください。"
    };

    const prompt = `당신은 라이프스타일 큐레이터입니다. 사용자가 선택한 리추얼 조합(${tea}, ${activity}, ${perfume}, ${flower})에 어울리는 '행운의 오브제' 한 가지를 추천해 주세요. 프리미엄하고 감성적인 아이템이어야 합니다.
    
    ${langInstructions[lang]}
    
    반드시 아래 JSON 형식으로만 응답하세요:
    {
      "itemName": "아이템 이름",
      "itemPrice": "가격대(문자열)",
      "itemReason": "추천 사유 (2문장 이내)",
      "searchKeyword": "쿠팡 검색을 위한 핵심 키워드 (영문 위주)"
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
        itemName: "Silk Eye Mask & Ritual Mist",
        itemPrice: "₩32,000",
        itemReason: "오늘의 인연은 매우 고요하고 아늑합니다. 깊은 휴식을 도와줄 실크 마스크와 미스트 세트를 추천해 드려요.",
        searchKeyword: "silk eye mask aromatherapy mist"
      },
      EN: {
        itemName: "Silk Eye Mask & Ritual Mist",
        itemPrice: "$25.00",
        itemReason: "Today's ritual is very quiet and cozy. We recommend a silk mask and mist set to help you rest deeply.",
        searchKeyword: "silk eye mask aromatherapy mist"
      },
      JA: {
        itemName: "シルクアイマスク＆リチュアルミスト",
        itemPrice: "¥3,500",
        itemReason: "今日のご縁はとても静かで心地よいものです。深い休息を助けるシルクマスクとミストのセットをお勧めします。",
        searchKeyword: "silk eye mask aromatherapy mist"
      }
    };
    return {
      ...errorFallbacks[lang],
      itemImageUrl: `https://loremflickr.com/800/800/sleep,luxury,aesthetic/all`
    };
  }
};
