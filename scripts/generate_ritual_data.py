import os
import json
import asyncio
import google.generativeai as genai

# API 키 설정
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash') 

async def generate_category_data_chunk(category_name, start_idx, count):
    prompt = f"""
    당신은 럭셔리 라이프스타일 큐레이터 및 데이터 전문가입니다. 
    오늘을 닻 내리는 나만의 비밀식 'Mood Blossom' 프로젝트를 위한 대규모 데이터베이스를 구축 중입니다.
    
    분류: {category_name} 
    목표: 중복 없이 고유한 아이템 {count}개 리스트업 (현재 인덱스: {start_idx} ~ {start_idx + count - 1})
    
    각 아이템은 다음 JSON 형식을 반드시 지켜야 합니다:
    {{
        "id": "{category_name.lower()}_{start_idx + 1}_id",
        "name": "아이템 이름",
        "category": "{category_name.lower()}",
        "description": "이 아이템이 주는 기분이나 리추얼적 의미 (고급스러운 표현 사용, 한 문장)"
    }}
    
    출력 지침:
    1. 오직 유효한 JSON 배열만 출력하세요. 
    2. 마크다운(` ```json ` 등)이나 추가 설명 없이 순수 텍스트만 출력하세요.
    3. 아이템의 ID는 '{category_name.lower()}_숫자' 형식을 권장합니다.
    """
    
    try:
        response = await model.generate_content_async(prompt)
        text = response.text.strip()
        
        # Markdown 파싱 방어 코드
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                text = "\n".join(lines[1:-1])
        
        data = json.loads(text.strip())
        return data
    except Exception as e:
        print(f"Error generating chunk for {category_name} starting at {start_idx}: {e}")
        return []

async def main():
    categories = ["Tea", "Activity", "Perfume", "Flower"]
    total_per_category = 250
    chunk_size = 50
    
    output_file = "ritual_data_1000.json"
    
    # 이어하기(Resume) 기능
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as f:
            try:
                full_data = json.load(f)
            except:
                full_data = {cat: [] for cat in categories}
    else:
        full_data = {cat: [] for cat in categories}
    
    for cat in categories:
        current_count = len(full_data.get(cat, []))
        while current_count < total_per_category:
            print(f"Generating {cat} items: {current_count} / {total_per_category}...")
            chunk = await generate_category_data_chunk(cat, current_count, chunk_size)
            
            if chunk:
                # ID 중복 방지 및 정규화
                for idx, item in enumerate(chunk):
                    item['id'] = f"{cat.lower()}_{current_count + idx + 1}"
                
                full_data[cat].extend(chunk)
                current_count = len(full_data[cat])
                
                # 중간 저장
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(full_data, f, ensure_ascii=False, indent=2)
                
                print(f"  -> Saved {current_count} items for {cat}")
            else:
                print("  -> Failed to get chunk, retrying in 20s...")
                await asyncio.sleep(20)
                continue
                
            await asyncio.sleep(8) # RPM(Requests Per Minute) 제한 방어 (10 RPM 미만 유지)
        
    print(f"\nFinal Check: Total {sum(len(v) for v in full_data.values())} items generated.")
    print(f"Results saved to {output_file}")

if __name__ == "__main__":
    asyncio.run(main())
