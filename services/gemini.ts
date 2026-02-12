
import { GoogleGenAI, Type } from "@google/genai";

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
  if (!process.env.API_KEY) return undefined;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  flower: string
): Promise<ShoppingItem | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `당신은 라이프스타일 큐레이터입니다. 사용자가 선택한 리추얼 조합(${tea}, ${activity}, ${perfume}, ${flower})에 어울리는 '행운의 오브제' 한 가지를 추천해 주세요. 프리미엄하고 감성적인 아이템이어야 합니다.`;

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
  } catch (e) {
    console.error("AI Shopping Recommendation Failed:", e);
    return null;
  }
};
