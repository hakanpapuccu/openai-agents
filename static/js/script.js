document.addEventListener('DOMContentLoaded', function() {
    // DOM elementleri
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const chatMessages = document.getElementById('chatMessages');
    const loadingElement = document.getElementById('loading');
    const searchResultsElement = document.getElementById('searchResults');
    const errorElement = document.getElementById('error');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
    const sidebar = document.querySelector('.sidebar');
    const newChatBtn = document.getElementById('newChatBtn');
    const webSearchBtn = document.querySelector('.web-search-btn');
    
    // Bootstrap modal örneği oluştur
    const searchResultsModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));
    
    // Son arama verilerini saklama
    let lastSearchResults = null;
    let currentSearchId = 0;
    
    // Örnek sorguları
    const exampleQueries = [
        "İstanbul'da bu hafta sonu hava nasıl olacak?",
        "Python programlama dilinin avantajları nelerdir?",
        "Türkiye'nin UNESCO Dünya Mirası Listesi'ndeki yerleri",
        "Kahve sağlığa faydalı mıdır?",
        "En iyi doğal turistik yerler Türkiye"
    ];

    // Auto-resize textarea
    searchQuery.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        // Maximum yükseklik sınırlaması
        if (this.scrollHeight > 200) {
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }
    });

    // Sayfa yüklendiğinde input alanına odaklan
    searchQuery.focus();

    // Enter tuşuna basıldığında formu gönder (shift+enter yeni satır)
    searchQuery.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            searchForm.dispatchEvent(new Event('submit'));
        }
    });

    // Sidebar toggle düğmesi
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-collapsed');
            document.querySelector('.main-content').classList.toggle('sidebar-hidden');
        });
    }

    // Mobil cihazlar için sidebar düğmesi
    if (mobileSidebarBtn) {
        mobileSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }

    // Tıklama ile sidebar'ı kapat (sadece mobil)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar.classList.contains('show') && 
            !sidebar.contains(e.target) && e.target !== mobileSidebarBtn) {
            sidebar.classList.remove('show');
        }
    });

    // Yeni sohbet butonu
    if (newChatBtn) {
        newChatBtn.addEventListener('click', function() {
            clearChat();
        });
    }
    
    // Web arama butonu
    if (webSearchBtn) {
        webSearchBtn.addEventListener('click', function() {
            const query = searchQuery.value.trim();
            if (!query) {
                showError('Lütfen bir soru girin.');
                return;
            }
            
            // Web'de arama için özel sorgu oluştur
            const webQuery = `Web'de ara: ${query}`;
            
            // Kullanıcı mesajını ekle
            addMessage(webQuery, 'user');
            
            // API isteği gönder
            performSearch(webQuery);
        });
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const query = searchQuery.value.trim();
        if (!query) {
            showError('Lütfen bir soru girin.');
            return;
        }

        // Kullanıcı mesajını ekle
        addMessage(query, 'user');
        
        // API isteği gönder
        performSearch(query);
    });
    
    // Arama işlemini gerçekleştir
    function performSearch(query) {
        // Formu sıfırla
        searchQuery.value = '';
        searchQuery.style.height = 'auto';
        
        // Yükleme göstergesini göster
        loadingElement.classList.remove('d-none');
        
        // Hata mesajını temizle
        hideError();
        
        // Arama ID'sini arttır (her arama benzersiz olsun)
        const searchId = ++currentSearchId;
        
        // Otomatik kaydırma
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
        
        // Input alanına odaklan
        searchQuery.focus();
        
        // API'ye istek gönder
        fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.');
            }
            return response.json();
        })
        .then(data => {
            // Yalnızca en son arama sonucunu göster
            if (searchId !== currentSearchId) return;
            
            // Yükleme göstergesini gizle
            loadingElement.classList.add('d-none');
            
            // Arama sonuçlarını sakla
            lastSearchResults = data.search_results;
            
            // AI yanıtını ekle
            let aiResponse = formatResponse(data.ai_response);
            
            // Sonuçları görüntüle bağlantısı ekle
            if (data.search_results && data.search_results.results && data.search_results.results.length > 0) {
                aiResponse += `<p><a class="search-results-link" onclick="document.dispatchEvent(new CustomEvent('showSearchResults'))">
                    <i class="bi bi-search me-1"></i>Arama sonuçlarını görüntüle</a></p>`;
            }
            
            // Bot mesajını ekle
            addMessage(aiResponse, 'bot', true);
            
            // Arama sonuçlarını modal için hazırla
            prepareSearchResults(data.search_results);
            
            // Input alanına odaklan
            searchQuery.focus();
        })
        .catch(error => {
            // Yalnızca en son arama hatasını göster
            if (searchId !== currentSearchId) return;
            
            // Yükleme göstergesini gizle
            loadingElement.classList.add('d-none');
            
            // Hata mesajını göster
            showError(error.message);
            
            // Input alanına odaklan
            searchQuery.focus();
        });
    }
    
    // Arama sonuçlarını gösterme olayını dinle
    document.addEventListener('showSearchResults', function() {
        if (lastSearchResults) {
            searchResultsModal.show();
        }
    });
    
    // Sohbeti temizleme butonu
    clearChatBtn.addEventListener('click', function() {
        clearChat();
    });
    
    // Sohbeti temizleme fonksiyonu
    function clearChat() {
        // İlk mesaj dışındaki tüm mesajları temizle
        while (chatMessages.children.length > 1) {
            chatMessages.removeChild(chatMessages.lastChild);
        }
        
        // Yükleme göstergesini gizle
        loadingElement.classList.add('d-none');
        
        // Hata mesajını gizle
        hideError();
        
        // Arama sonuçlarını temizle
        lastSearchResults = null;
        
        // Input alanını temizle ve odaklan
        searchQuery.value = '';
        searchQuery.focus();
        
        // Kullanıcıya bildir
        const firstMessage = chatMessages.querySelector('.message-row.bot .message-bubble');
        if (firstMessage) {
            firstMessage.innerHTML = `
                <p>Sohbet temizlendi! Size nasıl yardımcı olabilirim?</p>
                <p class="small text-muted mt-2">İpucu: Detaylı sorular daha iyi cevaplar almanızı sağlar.</p>
            `;
        }
    }
    
    // İpucu: Örnek bir soru seçmek için placeholder değiştirme
    let exampleIndex = 0;
    setInterval(() => {
        searchQuery.setAttribute('placeholder', `Örn: ${exampleQueries[exampleIndex]}`);
        exampleIndex = (exampleIndex + 1) % exampleQueries.length;
    }, 5000);

    // Yanıtı biçimlendirme fonksiyonu
    function formatResponse(response) {
        // Kod bloklarını biçimlendir
        let formattedResponse = response.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
            return `<pre><code class="${language}">${escapeHtml(code)}</code></pre>`;
        });
        
        // Tek satırlık kodları biçimlendir
        formattedResponse = formattedResponse.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // URL'leri tıklanabilir bağlantılara dönüştür
        formattedResponse = formattedResponse.replace(
            /(https?:\/\/[^\s()<>]+(?:\([\w\d]+\)|([^,.;:'"\s()<>[\]])))/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        
        // Satır sonlarını paragraf etiketlerine dönüştür
        formattedResponse = formattedResponse.split('\n\n').map(paragraph => {
            if (paragraph.trim() && !paragraph.includes('<pre>') && !paragraph.startsWith('<p>')) {
                return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
            }
            return paragraph;
        }).join('');
        
        return formattedResponse;
    }
    
    // HTML karakterlerini escape etme
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Mesaj ekleme fonksiyonu
    function addMessage(content, type, isHTML = false) {
        const messageRow = document.createElement('div');
        messageRow.className = `message-row ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        
        if (type === 'user') {
            avatar.innerHTML = '<i class="bi bi-person"></i>';
        } else {
            avatar.innerHTML = '<i class="bi bi-robot"></i>';
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        if (isHTML) {
            messageBubble.innerHTML = content;
        } else {
            const paragraph = document.createElement('p');
            paragraph.textContent = content;
            messageBubble.appendChild(paragraph);
        }
        
        messageContent.appendChild(messageBubble);
        messageRow.appendChild(avatar);
        messageRow.appendChild(messageContent);
        chatMessages.appendChild(messageRow);
        
        // Sohbeti en alta kaydır
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Arama sonuçlarını modal için hazırlama fonksiyonu
    function prepareSearchResults(results) {
        searchResultsElement.innerHTML = '';
        
        // Sonuç sayacı ve arama bilgisi
        const resultInfo = document.createElement('div');
        resultInfo.className = 'result-info mb-4 pb-2 border-bottom';
        
        if (results && results.results && results.results.length > 0) {
            const items = results.results.slice(0, 20); // İlk 20 sonucu göster
            
            resultInfo.innerHTML = `<p class="mb-1"><strong>${items.length}</strong> sonuç bulundu</p>`;
            searchResultsElement.appendChild(resultInfo);
            
            items.forEach((item, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                const title = item.title || 'Başlık bulunamadı';
                const url = item.url || '#';
                const snippet = item.snippet || 'İçerik bulunamadı';
                
                resultItem.innerHTML = `
                    <span class="result-number text-muted">${index + 1}.</span>
                    <a href="${url}" class="result-title" target="_blank">${title}</a>
                    <span class="result-url">${url}</span>
                    <p class="result-snippet">${snippet}</p>
                `;
                
                searchResultsElement.appendChild(resultItem);
            });
        } else {
            searchResultsElement.innerHTML = '<div class="text-center py-5"><i class="bi bi-exclamation-circle fs-1 text-muted"></i><p class="mt-3">Arama sonucu bulunamadı veya beklenmeyen yanıt formatı.</p></div>';
        }
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }

    function hideError() {
        errorElement.classList.add('d-none');
        errorElement.textContent = '';
    }
}); 