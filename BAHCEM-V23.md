# Bahçem V2.3 — Supabase bulut yedeği (kurulum bekliyor)

Bu sürüm bulut erişimi için bir uygulama iskeleti ve SQL şemasıdır; canlı bir Supabase projesine bağlanmadı. Varsayılan config kapalı. Kullanıcı kayıtları veya anahtarlar depoya eklenmedi. V2.2 yerel panel çalışmaya devam eder. Yeni panelin tek bir JSON anlık görüntüsü kullanıcı başına saklanır. Profil ve eski defter ayrı kalır; otomatik çift yönlü senkronizasyon veya birleştirme yoktur. Aynı cihazdaki yerel veriler hesaba özel veya şifreli değildir. Çıkış, cihazdaki yerel kopyayı silmez.

## Kurulum
1. https://supabase.com/dashboard üzerinden ayrı bir TEST projesi açın. Bölge, ücret, yedekleme ve kişisel veri şartlarını kontrol edin. Mevcut üretim veritabanına deneme yapmayın.
2. SQL Editor'da `supabase/migrations/202611260001_orchard_snapshots.sql` dosyasını inceleyip yeni projede bir kez uygulayın. Her satırın sahibi auth.users kimliği; anon/public erişimi yok; authenticated yalnız kendi satırını seçebilir/yazabilir. Silme UI'da yok; yönetici hesap silme ve saklama süresi prosedürü belirlemelidir.
3. Authentication'da e-posta/parola sağlayıcısını etkinleştirin, genel kayıt ve anonim girişleri kapatın. Kullanıcıları yönetici üzerinden oluşturun; güçlü benzersiz parola ve e-posta doğrulaması kullanın. Parolayı GitHub'a veya sohbete yazmayın. Bu sürüm parola sıfırlama, CAPTCHA ve MFA ekranı içermez; internetten herkese açmadan önce gerekli güvenlik kontrollerini ve MFA desteğini tamamlayın.
4. Test ortamında proje URL'si (https://PROJECTREF.supabase.co) ve yalnız `sb_publishable_...` anahtarını `bahcem-cloud-config.js` içine girin. Secret/service_role veya veritabanı parolası kesinlikle tarayıcıda bulunmamalıdır. Test kopyasında enabled:true; ana dalda testler tamamlanana dek false.
5. İki ayrı test hesabı ve örnek verilerle aşağıdaki testleri yapın. Gerçek kişisel kayıt kullanmayın. Başarıdan sonra kontrollü üretim dağıtımı.

## Kabul testleri (henüz canlı yapılmadı)
- Oturumsuz GET/POST/PATCH: erişim reddi, veri sızıntısı yok.
- A ve B farklı hesapları: A kendi kaydını ekler/okur; B A'nın owner_id filtresiyle satır göremez, A adına insert/update yapamaz. B kendi yedeğini oluşturur.
- İki cihaz aynı revision ile PATCH: yalnız ilk yazma başarılı, ikincisi sıfır satır/çatışma; kullanıcı önce indirip karşılaştırır. İlk kayıt çakışmasında unique constraint.
- Hatalı JSON, fazla boyut, revision atlama, owner_id değiştirme: reddedilir. İstemci ayrıca panel şemasını doğrular; sunucu yalnız üst düzey şema ve boyut doğrular.
- Şifre hatası, süre sonu, çevrimdışı, ağ zaman aşımı, çıkış: belirteçler kalıcı saklanmaz; yerel kayıtlar korunur. JWT süre sonuna kadar geçerli olabilir. Uygulama otomatik refresh yapmaz; sayfa yenilemesinde tekrar giriş.
- Yerel değişiklik ve restore: onay olmadan hiçbir kayıt gönderilmez veya ezilmez. Yedek indir, geri yükle, fotoğraflar ve CSV doğrula.
- Canlı ortamda HTTPS, üçüncü taraf script denetimi, XSS/CSP, oturum ve MFA, RLS bağımsız güvenlik testi, yedek/geri dönüş ve veri silme süreçleri tamamlanmadan gerçek verileri yükleme.

## Google E-Tablolar sonraki aşama
CSV mevcut yöntemdir. Gerçek Google bağlantısı için yetkili sunucu/Edge Function, ayrı Google OAuth istemcisi, açık kullanıcı onayı, en dar Drive/Sheets kapsamı, güvenli sunucu tarafı refresh token saklama ve sahiplik denetimi gerekir. Kayıtlar kalıcı UUID ile idempotent aktarılmalı; tarih/para/birim alanları ve formül sütunları ayrı test edilmeli. Açık GitHub deposunda kişisel Sheet kimlikleri ve OAuth secret bulunmamalı. Uygulama bu aşamada Google'a veri göndermez.

## Resmî başvurular
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/sessions
- https://supabase.com/docs/guides/security/production-checklist
- https://github.com/supabase/auth/blob/master/openapi.yaml
