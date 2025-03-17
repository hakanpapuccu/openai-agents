# OpenAI Agents ile Web Arama Asistanı

Bu proje, OpenAI Agents SDK kullanarak web arama yapan ve sonuçları analiz eden modern bir chat uygulamasıdır.

## Özellikler

- OpenAI Agents WebSearchTool ile gerçek zamanlı web araması
- Chat tabanlı kullanıcı arayüzü
- Arama sonuçlarını popup olarak görüntüleme
- Modern ve duyarlı tasarım
- Kullanıcı dostu deneyim

## Kurulum

### Gereksinimler

- Python 3.8 veya üstü
- pip (Python paket yöneticisi)
- OpenAI API anahtarı

### Adımlar

1. Projeyi klonlayın veya indirin
2. Proje dizinine gidin
3. Sanal ortam oluşturun ve etkinleştirin:
   ```
   python -m venv venv
   # Windows'ta
   venv\Scripts\activate 
   # Unix/MacOS'ta
   source venv/bin/activate
   ```
4. Gerekli paketleri yükleyin:
   ```
   pip install -r requirements.txt
   ```
5. `.env` dosyasını düzenleyerek OpenAI API anahtarınızı ekleyin:
   ```
   OPENAI_API_KEY=sizin_api_anahtarınız
   ```

## Çalıştırma

Uygulamayı çalıştırmak için terminalde şu komutu kullanın:

```
python app.py
```

Uygulama varsayılan olarak `http://127.0.0.1:5000` adresinde çalışacaktır.

## Kullanım

1. Chat arayüzündeki metin kutusuna sorgunuzu yazın
2. Gönder butonuna tıklayın
3. Sistem OpenAI Agents ile web'de arama yapacak ve yanıt hazırlayacaktır
4. Yanıtta bulunan "Arama sonuçlarını görüntüle" bağlantısına tıklayarak web arama sonuçlarını popup olarak görüntüleyebilirsiniz

## Teknik Detaylar

Bu uygulama şu teknolojileri kullanmaktadır:

- **Backend**: Flask (Python)
- **AI**: OpenAI Agents SDK (WebSearchTool)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Arama**: OpenAI WebSearchTool (gerçek zamanlı web araması)

## Özelleştirme

- Farklı ya da ek agent'lar eklemek için `app.py` dosyasındaki Agent tanımını düzenleyebilirsiniz
- Farklı araçlar eklemek için OpenAI Agents SDK'nın diğer araçlarını kullanabilirsiniz
- Arayüzü özelleştirmek için `static/css/style.css` dosyasını düzenleyebilirsiniz

## OpenAI Agents SDK Hakkında

OpenAI Agents SDK, LLM'leri araçlarla donatmanın kolay bir yolunu sunar. Bu uygulamada WebSearchTool kullanılmaktadır, ancak FileSearchTool ve ComputerTool gibi başka araçlar da mevcuttur.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Destek

Herhangi bir sorunla karşılaşırsanız, lütfen GitHub üzerinden bir issue açın. 