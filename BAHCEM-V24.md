# Bahçem V2.4 – Google E-Tablolar ve kontrollü cihaz aktarımı

Varsayılan Google ve Supabase bağlantıları kapalıdır. Mevcut 14 sekmeli yönetim dosyası ve kullanıcı kayıtları değiştirilmedi. Yeni Google raporu, V2.2 panelinin yalnızca seçilmiş metin ve sayı alanlarını içeren 7 sekmeli ayrı bir anlık görüntüdür. Her aktarım yeni dosya oluşturur. UUID'ler korunur; mevcut dosyalara yazma, otomatik iki yönlü senkronizasyon ve satır birleştirme yoktur. Fotoğraflar, eski defter ve profil hariç. RAW değerler kullanılır; metin formül olarak çalıştırılmaz. Rapor, resmî muhasebe tablosu değildir. Google ve Supabase hesapları birbirinden bağımsızdır.

## Google test kurulumu
1. Google Cloud Console'da ayrı test projesi açın: https://console.cloud.google.com/
2. Google Sheets API'yi etkinleştirin. OAuth onay ekranı, uygulama adı, destek e-postası, gizlilik politikası ve test kullanıcılarını yapılandırın. Gerekli doğrulama ve kullanım politikalarını tamamlayın.
3. Web uygulaması OAuth Client ID oluşturun. Yetkili JavaScript kaynaklarına yalnız kontrol edilen HTTPS test originini ekleyin; üretim için https://visnebahcesi.com. Client secret kullanılmaz; public Client ID'yi bahcem-sheets-config.js içine koyun. Testte enabled:true; doğrulama öncesi ana dalda false.
4. Kullanıcı tetiklemesiyle Google Identity Services yüklenir. Yalnız drive.file yetkisi istenir. Kısa ömürlü access token bellekte kalır; otomatik refresh ve arka plan işi yok. Gerçek veriden önce sahte kayıtla test edin. Supabase ve Google yetkilerini aynı oturumda birlikte kullanmadan önce üçüncü taraf script, XSS ve CSP güvenlik incelemesi yapın.
5. Test: kullanıcı izin vermediğinde veri gönderilmez; farklı hesap seçimi, süre sonu, izin kaldırma, ağ hatası, yanlış kapsam, RAW formül benzeri metinler, 7 sekme, boş/çok satır, tekrar aktarım ve kısmi dosya senaryoları. Yeni dosyanın paylaşım ayarlarını Drive'da kontrol edin. Rapor oluşturulması paylaşım izni vermez; kurum politikaları ayrıca geçerlidir.

## Cihazlar arasında
V2.3 bulut yedeğine kayıtlara göre karşılaştırma eklendi. Yerelde/bulutta bulunan UUID ve değişmiş kayıtlar gösterilir. Yerel değişiklik veya bulut revizyonu değişirse yazma öncesi karşılaştırma yeniden gerekir. Buluta özgü/farklı kayıtlar varsa ayrıca onay istenir. Yine de bu bir manuel yedek değiştirme modelidir, otomatik birleştirme değildir. Bulut ve yerel JSON yedeği alın; tek kullanıcı, iki cihaz ve eşzamanlı yazma testleri yapın. Gerçek RLS/OAuth entegrasyon testleri yapılmadı.

## Belgeler
- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/sheets/api/scopes
- https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate
- https://developers.google.com/workspace/sheets/api/guides/values
