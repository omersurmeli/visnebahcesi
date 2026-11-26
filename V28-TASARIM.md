# V2.8 — Görsel sistem ve bilgi mimarisi
24 sayfaya ortak header, SVG marka işareti, favicon ve ortak tasarım CSS'si eklendi. Ana sayfada hızlı erişim üstte; hava durumu günlük karar alanından önce; araştırma ve rehberler ayrı gruplandı. Mevcut üç fotoğraf korundu. Altı yeni kavramsal SVG çizim budama, besleme, bitki sağlığı, sulama, hasat ve vişne ürünleri içindir; tanı fotoğrafı veya gerçek bahçe çekimi değildir. Mevcut JavaScript, canonical adresler ve kullanıcı verileri korunur. Tarayıcı testlerine ana sayfa görselleri, yatay taşma ve makale mobil menüsü eklendi; test sonuçları ve görsel inceleme henüz doğrulanmadı. Canlıya alınmadan önce CI kontrolü gerekir.


## V3.0 — Yerleşim ve görsel hiyerarşi
V2.8 öncül commit'i için CI başarılıydı (45793689230). Bu yeni revizyonda ana sayfa hava ve günlük karar kutuları geniş ekranda yan yana, dar ekranda alt alta; eksik hava alanları gizli kalır. Bahçem gerçek kayıt modülleri, metrikler ve raporlar öne taşındı; yapılandırılmamış bulut bağlantıları açılır ayrıntılarda, özel sensör paneli daha aşağıda görünür. Mevcut kayıt anahtarları ve hesaplama kodları korunur. Akıllı bahçe için yeni özgün kavramsal SVG çizim eklendi; gerçek saha fotoğrafı değildir. Ortak alt menü üç kategoriyle oluşturulur. Testlere tablet, yeni görsel, alt menü ve yönetim paneli sırası kontrolleri eklendi. Yeni revizyonun CI ve görsel incelemesi tamamlanmadan yayınlanmaz.


## Görsel inceleme kapısı
8c49f28 için CI 45794723967: SEO, paketleme ve Chromium 1440×900 / 768×1024 / 390×844 başarılı. Önceki çalışma görsel arşiv üretmedi. Yeni kontrol adımı aynı yayın paketinden 21 gerçek Chromium ekran görüntüsü ve 3 temas sayfası üretir; dış ağ ve kişisel kayıtlar kullanılmaz. Bu commit site uygulamasını değiştirmez. Görsel inceleme ayrıca doğrulanır.


## V3.0.1 — Görsel ve yayın düzeltmesi
Ana dal 07de052 için 45797693832 başarılı; 21 gerçek ekran görüntüsü ve 3 temas sayfası üretildi, üç temas sayfası incelendi. Rehber kapaklarında eski koyu pseudo-element ile yeni koyu yazı çakışması görüldü. Açık kapak arka planı ve koyu yazı birlikte sabitlendi; bütün yeni rehber kapaklarında hesaplanmış CSS kontrolü eklendi. Mobil sensör seçimleri tek sütuna alındı. Görsel yakalama kaydırması sabit başlığı hesaba katar. Hava servisi testlerde ağ engeli nedeniyle hata durumu gösterir. Pages 45797694071 teknik testleri ve upload başarılı, deploy artifact metadata aşaması 0 sonuç nedeniyle başarısız; paket 15105298559 sonradan API'de mevcut. Yeni dağıtımda actions:read ve en fazla 120 saniyelik paket görünürlüğü doğrulaması eklendi. Bu değişiklik gerçek dağıtım başarısı garanti etmez; yeni çalıştırma kontrol edilmelidir.
