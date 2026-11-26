# V2.6 – Yayın öncesi denetim
26.11.2026. 24 HTML sayfası ve 17 JavaScript dosyası incelendi. Canonical/OG URL, sosyal görsel, JSON-LD, kimlikler ve iç bağlantı listeleri kontrol edildi. Altı rehbere ortak script eklendi. Bahçem'de ortak script ile eski defter arasındaki weatherCodes isim çakışması giderildi; eski defter IIFE kapsamına alındı. Bozuk eski kayıtların üzerine yazmayı sınırlayan kontroller, CSV formül benzeri metin koruması, eski kayıt yedeği doğrulaması, araştırma menüsü, tablet menüsü, sensör bağlantısı ve sitemap güncellemesi eklendi. Bulut ve Google config kapalı.

**Yayın kararı:** Bu geliştirme dalı yayın adayındadır; gerçek tarayıcı, dış kaynak bağlantısı ve bilimsel doz/eşik denetimi, canlı Pages dağıtımı, kullanıcı güvenlik testleri tamamlanmadan kararlı sürüm ilan edilmez. Supabase/OAuth/ESP32 uçtan uca bağlı değildir. Kopyalama koruması caydırıcıdır; kişisel kayıtların düzenlenmesine izin verilir.


## V2.6 yayın adayı – ek kontroller
Ana dalın bağımsız kopyalama koruması commit'i karşılaştırıldı: yalnız script.js ve style.css ekleri bulunuyor ve her iki ek de geliştirme dalında birebir korunuyor. Ana dal ebeveyn olarak birleştirme commit'ine dahil edildi. Yayın paketi yalnızca kök HTML/CSS/JS, sitemap, robots, CNAME ve izinli görselleri içerir; SQL, Edge Function, proje notları ve test dosyaları dağıtılmaz. PR iş akışına Chromium masaüstü ve mobil testleri eklendi. Testler dış ağ ve gerçek kullanıcı hesabı kullanmaz. Bu testler ancak GitHub Actions çalıştırması başarıyla tamamlanırsa geçmiş sayılır; canlı siteye yayın yapılmadı.


## V2.7 test ortamı düzeltmesi
İlk GitHub Actions çalıştırmasında SEO PASS: 24 sayfa ve 24 sitemap URL; yayın paketi 24 HTML. Chromium kurulumu Ubuntu 26.04 ile Playwright 1.56 uyumsuzluğu nedeniyle durdu. Test ve dağıtım ortamı Ubuntu 24.04 olarak sabitlendi; canlı dağıtımın önüne de aynı tarayıcı testi eklendi. Yeni çalıştırma başarılı olmadan birleştirme yapılmaz.


## V2.7 bilimsel son kontrol — 26.11.2026
Önceki 9e2695d commit'i için GitHub Actions 45788462655 başarılı: 24 sayfa/sitemap, paketleme ve Chromium 1440×900 ile 390×844 smoke testleri. Bu sonuç önceki commit'e aittir. MSU Extension orijinal tablosu (görsel ve metin) ve CSU 2004 PDF metni karşılaştırıldı: tam çiçekte %90 ölüm için 24 °F (−4,4 °C) ve 25 °F (−3,9 °C) kaynak farkı mevcut; çiçek sonrası yalnız CSU'da. Budama tablosu kaynak ayrımıyla düzeltildi. TAGEM 2022 teknik talimat metninden monilya, yaprak lekesi, bakteriyel kanser, kiraz sineği, akar ve siyah yaprakbiti referansları kontrol edildi. Kiraz tuzak yoğunluğunun vişneye doğrudan aktarılmadığı belirtildi. Kaynak PDF görsellerinin CSU/TAGEM için erişimi başarısız; metin kontrolü yapıldı. Kaynak defteri 83 kayıt olarak korundu, K-050 içinde MSU çapraz bağlantısı eklendi. Bu inceleme tüm 83 kaynağın, tüm tarımsal eşiklerin veya güncel ruhsatların doğrulandığı anlamına gelmez. Supabase/OAuth/ESP32 bağlantıları kapalı; yeniden CI sonucu doğrulanmadan yayın yok.
