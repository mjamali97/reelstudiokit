# Reel Studio · tam kılavuz

**Diller:** [English](en.md) · [فارسی](fa.md) · [العربية](ar.md) · Türkçe · [Deutsch](de.md) · [Français](fr.md) · [Italiano](it.md)

Reel Studio, [Claude Code](https://claude.com/claude-code) içinde çalışan bir içerik stüdyosudur. Claude ile kendi dilinde
konuşursun; paylaşımlarını planlar, markanın sesiyle yazar, reels videolarını 14 hareketli stilde kurgular, karuselleri,
hikâyeleri ve öne çıkan kapaklarını markanın renk ve fontlarıyla hazırlar, senin ✅ onayından sonra Zernio üzerinden yayınlar
ve her sabah rakamları Telegram'dan gönderir. Her sayfa için çalışır: pastane, restoran, fotoğraf stüdyosu, kuaför, klinik,
online mağaza, uzman, kişisel sayfa ya da birden çok müşterisi olan bir ajans.

---

## 1 · Önce dene (5 dakika, hesap gerekmez)

```bash
git clone https://github.com/mjamali97/reelstudiokit.git my-studio
cd my-studio
bash tools/install.sh
bash telegram-bot/demo/demo.sh tr
```

**Windows:** PowerShell'de `powershell -ExecutionPolicy Bypass -File tools\install.ps1` (`-Install` eklersen Git, Node, Python, ffmpeg, uv ve Chrome'u winget ile kurar), sonra `node telegram-bot\demo\demo.mjs`. Claude Code kitin komutlarını Git Bash'te çalıştırır, bu yüzden rehberin geri kalanı yazıldığı gibi çalışır.

Üç sütunlu bir sayfa açılır: **Stüdyo botu**, **Yayın botu** ve **kanalın**. 📝 Taslaklar → paylaşımda ✅ → Yayın sütununda
son ✅'e bas ve kanala düşmesini izle. 📊 Panel ve 💬 Gelen kutusunu aç, bir bağlantı gönder. Hiçbir şey bilgisayarından çıkmaz.
Ctrl-C ile durdur.

Görsel örnekler `examples/bakery/` klasöründe (hayali bir pastane): 10 karusel şablonu, 11 hikâye şablonu, öne çıkan kapakları.
`fonts/gallery.html` 51 fontu gösterir. Claude Code'da `/demo` hepsini adım adım gezdirir.

## 2 · Gerekenler

| | |
|---|---|
| Bilgisayar | macOS, Linux veya Windows 10/11 (WSL gerekmez; WSL2 ile de çalışır) |
| Yazılım | git, Node 20+, Python 3.11+, ffmpeg, Google Chrome, uv (`bash tools/install.sh` eksikleri ve nasıl kurulacağını söyler) |
| Claude Code | Claude aboneliği veya API anahtarı |
| Hesaplar (yalnızca canlı yayın için) | profesyonel Instagram hesabı, [Zernio](https://zernio.com) (yayın ve istatistik), Telegram, ücretsiz Gemini anahtarı, ücretsiz Cloudflare hesabı, GitHub |

Kurulum seviyeleri: `bash tools/install.sh` (temel: karusel, hikâye, altyazı, marka araçları, botlar) · `video` (reels motoru,
WhisperX kelime zamanlaması, Farsça tipografi denetleyicisi) · `all` (HyperFrames becerileri ve NextWork video editör eklentisi) ·
`check` (yalnızca rapor). Tüm araçlar ve lisansları: `tools/STACK.md`.

## 3 · Kurulum nasıl ilerler

Klasörü terminalde aç, `claude` çalıştır ve **`/setup`** yaz. Bir sohbet, form değil; istediğin yerde dur, kaldığı yerden devam
eder (`profile/SETUP-STATUS.md`). Toplam yaklaşık bir saat.

| aşama | ne olur | sen ne yaparsın |
|---|---|---|
| 0 Karşılama | dilin, tam kurulum / önce demo / ajans müşterisi | seçersin |
| 1 Keşif | işletme türü, elinde neler var | işaretlersin: web sitesi, Instagram, marka kitabı veya logo, menü veya fiyat listesi, Google Haritalar; bağlantı ve dosya paylaşırsın |
| 2 Okuma | Claude siteni (renkler, fontlar, logo, fiyatlar), Instagram ekran görüntülerini ve dosyalarını okur, **"Anladıklarım bunlar"** der ve markanı gerçek karelerde önizler | yanlışları düzeltirsin |
| 3 Profil ve ses | yalnızca malzemenin cevaplamadığı sorular; ardından **marka sesi**: resmîlik, "sen" mi "siz" mi, kullandığın ve kaçındığın kelimeler ve örnek testi ("bu üçünden hangisi sana benziyor?") | cevaplar, seçer, düzenlersin |
| 4 Tasarım sistemi | mevcut görünümün içe aktarılır ya da yan yana üç yön sunulur; sonra tüm araçlara uygulanır | seçer veya karıştırırsın |
| 5 İlk denetim | herkese açık verilerle sayfan: güçlü ve zayıf yanlar, ilk 5 düzeltme, hazır biyografi ve öne çıkan kapakları | hızlı kazanımları uygularsın |
| 6 Plan ve formatlar | işletme kılavuzun, kendi altyazı / karusel / hikâye / paylaşım formatların, ilk iki haftalık plan | seçersin |
| 7–8 Hesaplar ve botlar | Zernio, Telegram kanalı ve iki bot, Cloudflare ve GitHub, **test modunda** yayına alma | tıklarsın, anahtarları `.env` veya GitHub'a kendin yazarsın |
| 9 Başlangıç verisi | gerçek rakamların, en iyi paylaşım saatleri, tam denetim | okursun |
| 10 Canlıya geçiş | paylaşımlar kanala ulaşır, Zernio deneme modundan çıkar | "canlıya al" dersin |

Sohbete asla şifre veya anahtar yapıştırmazsın. Claude doğru sayfayı açar; gizli bilgiyi yerine sen yazarsın.

## 4 · Markan ve sonradan değiştirmek

Stüdyonun ürettiği her şey üç dosyayı okur:
- `brand/brand.json`: renkler, fontlar, logo, ad, kullanıcı adı, dil. Fontlar `fonts/` içindeki açık lisanslı kütüphaneden ya da lisansı olan kendi fontundan.
- `profile/CREATOR.md`: gerçekler: ne sattığın, fiyatlar (her biri kaynağıyla), çalışma saatleri, sipariş yolu, müşteriler, kanıtlar, hedefler.
- `profile/VOICE.md`: ses: kişilik, ton, hitap şekli, kelimeler, emoji, müşterilere yanıt, markaya uygun ve uygun olmayan cümleler.

Herhangi birini **`/brand`** ile değiştir ("renklerimizi daha sıcak yap", "asla 'ucuz' demeyiz", "işte yeni logomuz"). Önce önizleme
gösterir, sonra `node tools/brand/apply.mjs` değişikliği video stillerine, botun renklerine ve sesine taşır.

## 5 · İçerik üretmek

**Haftalık döngü:** `/content-plan` → çekim listesini çek → her reels için `/reel-idea` → `/reel-style` → kurgu → senin ✅ →
`/publish` → Telegram'daki kartta ✅ → haftada bir `/analytics`.

| istediğin | yaz | alacağın |
|---|---|---|
| doğrulanmış fikir ve senaryo | `/reel-idea` (ya da Stüdyo botuna bağlantı) | doğrulanmış bilgiler, senin sesinle senaryo, en zayıf kısmıyla viral puanı, şanslarıyla 2–3 stil |
| reels kurgusu | `/reel-style`, sonra stil | kendi çekimin üzerinde 9:16 hareketli kurgu, kalite kontrollü |
| karusel | `/carousel` | 10 şablondan 1080×1350 slaytlar: ipuçları, adımlar, efsane/gerçek, önce/sonra, fiyat menüsü, SSS, karşılaştırma, müşteri yorumu, kontrol listesi, ürün vitrini |
| hikâye | `/story` | 10 şablondan 1080×1920 kareler; anket, soru, bağlantı veya geri sayım çıkartması için boş alanlı |
| öne çıkan kapakları | `/story` → öne çıkanlar | yiyecek, mağaza, hizmet, içerik üreticisi için üç stilde ikon setleri |
| videoya altyazı | `/captions` | fontunla, Instagram'ın güvenli alanında, isteğe bağlı kelime kelime altyazı |

**14 video stili:**

| stil | his | en uygun |
|---|---|---|
| `/clean` | marka renklerin, sakin kartlar | her işletme için ev stili |
| `/vogue` | dergi | kahraman bir kişi ya da imza ürün |
| `/luxe` | siyah ve altın, yavaş | mücevher, kuaför, şık restoran |
| `/vox` | kolaj ve kanıt panosu | rakamlı hikâyeler, efsane ve gerçek |
| `/swiss` | ızgarada dev yazılar | listeler, fiyatlar, kampanyalar, haberler |
| `/brutal` | kalın çerçeve, çığlık renkler | genç kitle, mağazalar, uygulamalar |
| `/pop` | çizgi roman | atıştırmalık, oyuncak, parti, sokak lezzetleri |
| `/retro` | 70'ler posteri | pastaneler, kafeler, aile mekânları |
| `/neon` | gece tabelaları | akşam işletmeleri, barlar, güzellik |
| `/chalk` | menü panosu | kafeler, restoranlar, eğitim |
| `/receipt` | fiş yazıcısı | fiyatlar, "paranın karşılığı", teslimat |
| `/hud` | ekran arayüzü | sipariş, rezervasyon, online mağaza |
| `/doodle` | kâğıda el çizimi | nasıl yapılır, tarifler, ipuçları |
| `/depth` | başının arkasında kelimeler | kameraya konuşma: ipuçları, görüşler, uzmanlar |

Render almadan önizleme: `node tools/style-reel/stills.mjs neon --sheet`.

**Görsel, müzik, ikon: yalnızca kullanma hakkın olan** (`/assets`). Dahili: ~7.000 ikon (Lucide, Tabler, Phosphor, Heroicons),
markanın renklerine boyanan CC0 illüstrasyonlar (Open Doodles; herhangi bir kelimeden Open Peeps karakterleri), Noto emoji, 51 açık
lisanslı font ve haritası OpenStreetMap verisinden senin renklerinle çizilen `location` hikâyesi. Her reels için kaynak dosyasıyla:
`node tools/assets/fetch.mjs openverse|commons|pexels|pixabay|unsplash "<ne>"` fotoğraf, video b-roll, CC0 müzik ve ses efekti için.
Ticari olmayan veya share-alike içerik, Google Görseller ya da başka sayfanın paylaşımı asla; stok görsel "bir pasta"dır, "bizim pastamız" değil.

Her reels sana gösterilmeden önce otomatik kalite kontrolünden (`qa.py`: olmaması gereken yerde yüz, donmuş veya boş kare yok) ve
saniyede 3 karelik bir kontak sayfasıyla göz kontrolünden geçer. Her karusel ve hikâye de kontak sayfasıyla kontrol edilir.

## 6 · Yayınlama

Senin ✅ onayın olmadan hiçbir şey yayınlanmaz. `/publish` onaylanan videoyu Zernio'ya **taslak** olarak yükler, altyazıyı
formatınla yazar, yorumdan DM'e kapıyı kurar ve Stüdyo botuna bir kart gönderir. Tek ✅ Instagram'ı (bağlıysa YouTube'u da)
zamanlar. Telegram kanal paylaşımları, paylaşımı birebir gösteren Yayın botunda ikinci ve son bir ✅ ister.

## 7 · Telegram botları

Ücretsiz bir Cloudflare Worker üzerinde iki bot. Menüleri senin dilinde konuşur (`telegram-bot/wrangler.jsonc` içinde `LANG`: Türkçe için tr).

| düğme | ne yapar |
|---|---|
| 🎬 Reels · 💡 Fikirler · 📝 Taslaklar | üretim hattın; gönderdiğin her bağlantı veya metin fikir olarak kaydedilir, sonra araştırılır ve puanlanır |
| 📅 Program | içerik takvimi: ne planlandı, ne eksik |
| 📸 Hikâyeler · 📰 Haberler | her sabah senin sesinle bir hikâye fikri, alanının haber özeti (isteğe bağlı) |
| 🔎 Ara | kaynaklı bir cevap |
| 📊 Panel | özel sayfa: takipçiler, erişim, sayfa puanı, kitle, en iyi saatler, tüm paylaşımlar, takvim, rakipler |
| 💬 Gelen kutusu | yeni yorumlar ve DM'ler, senin sesin ve bilgilerinle önerilen yanıt: ✅ gönder, ✏️ kendim yazayım, ❌ yok say |
| ⚙️ Durum | ne açık, ne test modunda |
| 👥 Müşteriler | yalnızca ajans modunda |

**Otomatik mesajlar:** sabah 09:00'da günlük rapor (dünkü takipçiler, 7 günlük eğilim, beş parçasıyla 100 üzerinden sayfa puanı),
her paylaşımdan 24 saat ve 7 gün sonra rapor (medyanına göre izlenme, kaydetme, paylaşma, kapı yorumları, takipler), haftalık
rakip raporu ve aylık PDF raporu.

## 8 · Rakamlar ve denetimler

`/analytics` rakamlarını Zernio'dan çeker ve işe yarayanları günceller: kancalar, stil puanları, paylaşım günleri.
`/page-audit` tüm sayfayı denetler (profil, ızgara, içerik karışımı, izlenme süresi, kitle ile müşteri uyumu, zamanlama, dönüşüm,
rakipler): güçlü ve zayıf yanlar, ilk 5 düzeltme, iki haftalık plan. Ayda bir yeterli.

## 9 · Ajans modu (birden çok müşteri)

Müşteriler için kullanım ticari lisans gerektirir (`COMMERCIAL-LICENSE.md`); ajans modunu denemek ücretsiz.

```bash
node tools/client.mjs init my-first-client
node tools/client.mjs new kafe-istanbul "Kafe İstanbul"
node tools/client.mjs use kafe-istanbul
```

Her müşteri için `/setup` çalıştır ("Bir müşteri kur" seçeneği). Her müşteri için bir **profil** içeren tek Zernio hesabı ve
`AGENCY: "on"` ile bir çift bot: 👥 Müşteriler'den ekle; her müşteri davet bağlantısıyla katılıp kendi raporlarını alabilir ve
`node tools/client.mjs sync <slug> --id <n>` gelen kutusu asistanına o müşterinin sesini ve bilgilerini verir. Ayrıntılar: `playbook/AGENCY.md`.

## 10 · Güncelleme

`/update` yaz (veya `bash tools/update.sh`). Yeni sürümü çeker, sana ait her şeyi korur (profil, marka, formatlar, reels, bot
ayarları; liste `.gitattributes` içinde), yenilikleri ve senden bir işlem gerekip gerekmediğini gösterir.

## 11 · Diller

- **İçerik:** Claude'un yazdığı her dil; işleyiciler sağdan sola (Farsça, Arapça) ve soldan sağa yazıları uygun font ve rakamlarla çizer.
- **Bot menüleri:** `LANG` = `en`, `fa`, `ar`, `tr`, `de`, `fr`, `it`.
- **Bu kılavuz:** yedi dilde, bağlantılar sayfanın başında.

## 12 · Güvenlik ve gizlilik

- Senin ✅ onayın olmadan hiçbir şey yayınlanmaz (Telegram için iki kez). Yüklemeler taslaktır.
- Anahtarlar `.env` içinde (asla commit edilmez) ve GitHub/Cloudflare gizli değerlerinde durur. Claude sohbete anahtar yapıştırmanı asla istemez.
- Deposu özeldir; kitin kendisi hiçbir kişisel veri içermez.
- Ekrana veya altyazıya yalnızca kaynağı olan bilgiler girer; uydurma fiyat, yorum veya rakam yok.
- Bot testleri sahte servislere karşı çalışır: `bash telegram-bot/test/all.sh`.

## 13 · Sorun giderme

| sorun | çözüm |
|---|---|
| `install.sh` bir şeyin eksik olduğunu söylüyor | yazdırdığı komutla kur, tekrar çalıştır |
| Windows: `python3` bulunamıyor ya da Farsça metin bozuk | Python araçlarını `tools/py` (Git Bash) veya `tools\py.cmd` (PowerShell) ile çalıştır |
| render bir fontun yüklenmediğini söylüyor | `brand/brand.json` içindeki font kimliği `fonts/fonts.json` içinde yok ya da kendi fontunun `css` yolu yanlış |
| bot cevap vermiyor | `<BOT_URL>/setup?key=<SETUP_KEY>&info=1` adresini kendin aç ve iki webhook'u da kontrol et |
| raporda rakam yok | Instagram hesabı profesyonel ve Zernio'ya bağlı olmalı; yeni hesaplar birkaç günlük veri ister |
| demo başlamıyor | 8787 veya 8790 portu dolu; diğer programı kapat veya `telegram-bot/test/dev.log` dosyasına bak |

## 14 · SSS

**Yüzümü göstermem gerekir mi?** Hayır. Her kılavuzda yalnızca el ve yalnızca ürün formatları var.
**Sadece Farsça sayfalar için mi?** Hayır. Ana dil İngilizce; Farsça, Arapça, Türkçe, Almanca, Fransızca ve İtalyanca dahildir.
**Ücreti ne?** Kendi markan veya işletmen için ücretsiz (Business Source License 1.1); müşterileri için kullanan ajans, stüdyo veya serbest çalışanların ticari lisansa ihtiyacı var (`COMMERCIAL-LICENSE.md`). Her sürüm dört yıl sonra Apache-2.0 olur. Claude için ve ücretsiz katmanı aşarsan Zernio için ödersin.
**Kendi fontlarımı kullanabilir miyim?** Lisansı sosyal medya ve video kullanımına izin veriyorsa evet; `brand/brand.json` içine `{"name","css"}` olarak ekle.
**Güncelleme işimi siler mi?** Hayır. Dosyaların `.gitattributes` ile korunur.

## 15 · Tüm komutlar

`/setup` `/brand` `/demo` · `/content-plan` `/reel-idea` `/reel-style` · `/clean` `/vogue` `/luxe` `/vox` `/swiss` `/brutal`
`/pop` `/retro` `/neon` `/chalk` `/receipt` `/hud` `/doodle` `/depth` · `/carousel` `/story` `/captions` · `/publish` `/telegram-post` ·
`/analytics` `/page-audit` · `/assets` · `/update`
