# V2.6 – Yayın öncesi denetim
26.11.2026. 24 HTML sayfası ve 17 JavaScript dosyası incelendi. Canonical/OG URL, sosyal görsel, JSON-LD, kimlikler ve iç bağlantı listeleri kontrol edildi. Altı rehbere ortak script eklendi. Bahçem'de ortak script ile eski defter arasındaki weatherCodes isim çakışması giderildi; eski defter IIFE kapsamına alındı. Bozuk eski kayıtların üzerine yazmayı sınırlayan kontroller, CSV formül benzeri metin koruması, eski kayıt yedeği doğrulaması, araştırma menüsü, tablet menüsü, sensör bağlantısı ve sitemap güncellemesi eklendi. Bulut ve Google config kapalı.

**Yayın kararı:** Bu geliştirme dalı yayın adayındadır; gerçek tarayıcı, dış kaynak bağlantısı ve bilimsel doz/eşik denetimi, canlı Pages dağıtımı, kullanıcı güvenlik testleri tamamlanmadan kararlı sürüm ilan edilmez. Supabase/OAuth/ESP32 uçtan uca bağlı değildir. Kopyalama koruması caydırıcıdır; kişisel kayıtların düzenlenmesine izin verilir.


## V2.6 yayın adayı – ek kontroller
Ana dalın bağımsız kopyalama koruması commit'i karşılaştırıldı: yalnız script.js ve style.css ekleri bulunuyor ve her iki ek de geliştirme dalında birebir korunuyor. Ana dal ebeveyn olarak birleştirme commit'ine dahil edildi. Yayın paketi yalnızca kök HTML/CSS/JS, sitemap, robots, CNAME ve izinli görselleri içerir; SQL, Edge Function, proje notları ve test dosyaları dağıtılmaz. PR iş akışına Chromium masaüstü ve mobil testleri eklendi. Testler dış ağ ve gerçek kullanıcı hesabı kullanmaz. Bu testler ancak GitHub Actions çalıştırması başarıyla tamamlanırsa geçmiş sayılır; canlı siteye yayın yapılmadı.
