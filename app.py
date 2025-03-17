import os
import asyncio
import nest_asyncio
from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
from agents import Agent, WebSearchTool, Runner

# Asyncio event loop sorununu çözmek için nest_asyncio uygula
nest_asyncio.apply()

# .env dosyasından çevre değişkenlerini yükle
load_dotenv()

app = Flask(__name__)

# OpenAI istemcisini başlat
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Web Arama Aracı Ajanı oluştur
search_agent = Agent(
    name="Web Arama Asistanı",
    instructions="""Sen bir web arama asistanısın. 
    Kullanıcının sorusunu anlayıp bu konu hakkında web'de arama yap ve en iyi yanıtı hazırla.
    Detaylı ve faydalı bilgiler ver. Cevaplarını Türkçe olarak sağla.
    Kaynaklardan alınan bilgileri kendi anlayışınla birleştirerek kapsamlı yanıtlar oluştur.
    Arama sonuçlarını mutlaka açık ve anlaşılır bir şekilde belirt.
    """,
    tools=[WebSearchTool()]
)

@app.route('/')
def index():
    return render_template('index.html')

# Arama işlemini asenkron olarak gerçekleştiren yardımcı fonksiyon
async def perform_search(query):
    return await Runner.run(search_agent, query)

@app.route('/api/search', methods=['POST'])
def api_search():
    data = request.json
    query = data.get('query', '')
    
    if not query:
        return jsonify({"error": "Arama sorgusu boş olamaz"}), 400
    
    try:
        # Yeni event loop oluştur
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Asenkron arama işlemini gerçekleştir
        search_result = loop.run_until_complete(perform_search(query))
        
        # Yanıtı al
        agent_output = search_result.final_output
        
        # Örnek arama sonuçları (OpenAI Agent ile yapılan aramanın sonuçları AI yanıtında olacak)
        # Bu sürümde tool çağrılarına doğrudan erişim yok, bu nedenle otomatik sonuçlar oluşturuyoruz
        search_results = []
        
        # Yanıttan URL çıkarmaya çalış (basit bir yaklaşım)
        import re
        urls = re.findall(r'https?://[^\s\)\"\']+', agent_output)
        
        # Eğer yanıtta URL'ler bulunursa, bunları sonuçlara ekle
        if urls:
            for i, url in enumerate(urls):
                search_results.append({
                    "title": f"Kaynak {i+1}",
                    "url": url,
                    "snippet": "Aşağıdaki AI yanıtında detaylar bulunmaktadır."
                })
        
        # Eğer sonuçlar boşsa, örnek sonuçlar ekle (hata durumunda)
        if not search_results:
            search_results = [
                {"title": "AI Yanıtı", "url": "#", "snippet": "AI yanıtında arama sonuçları birleştirilmiştir. Daha fazla bilgi için yanıtı inceleyebilirsiniz."}
            ]
        
        return jsonify({
            "query": query,
            "search_results": {"results": search_results},
            "ai_response": agent_output
        })
        
    except Exception as e:
        print(f"Arama hatası: {e}")
        return jsonify({
            "query": query,
            "search_results": {"results": [
                {"title": "Web arama hatası", "url": "#", "snippet": f"Arama yapılırken bir hata oluştu: {str(e)}"}
            ]},
            "ai_response": "Üzgünüm, web aramada bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
        })

if __name__ == '__main__':
    app.run(debug=True) 