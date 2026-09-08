(() => {
  const soilForm = document.querySelector("#soil-check-form");
  const soilResult = document.querySelector("#soil-check-result");
  const nutrientForm = document.querySelector("#nutrient-calc-form");
  const nutrientResult = document.querySelector("#nutrient-calc-result");
  const n = value => Number.parseFloat(value);
  const fmt = value => new Intl.NumberFormat("tr-TR",{maximumFractionDigits:2}).format(value);

  function assessSoil(event){
    event?.preventDefault();
    const ph=n(document.querySelector("#soil-ph").value);
    const ec=n(document.querySelector("#soil-ec").value);
    const organic=n(document.querySelector("#soil-om").value);
    const lime=document.querySelector("#soil-lime").value;
    const drainage=document.querySelector("#soil-drainage").value;
    if([ph,ec,organic].some(Number.isNaN)){
      soilResult.innerHTML='<div class="result-panel alert"><h4>Eksik değer var</h4><p>pH, EC ve organik madde alanlarını doldurun.</p></div>'; return;
    }
    const priorities=[]; const checks=[]; let level=0;
    if(drainage==="poor"){priorities.push("Önce drenaj, sıkışma ve damlatıcı dağılımını düzeltin; kök sorunu çözülmeden gübre artışı beklenen sonucu vermeyebilir.");level=2}
    if(ec>=4){priorities.push("EC yüksek görünüyor. Tuz kaynağını, sulama suyunu ve kök bölgesindeki birikimi uzmanla değerlendirin; yeni gübre yükünü otomatik artırmayın.");checks.push("Sulama suyu EC, sodyum ve bikarbonat analizi");level=2}
    else if(ec>=2){priorities.push("EC için dikkat gerekir. Numunenin derinliğini ve sulama sonrası tuz dağılımını kontrol edin.");checks.push("Farklı derinliklerden tekrar EC kontrolü");level=Math.max(level,1)}
    if(ph>=7.8){priorities.push("Yüksek pH; demir, çinko ve manganın toprakta bulunsa bile alımını sınırlayabilir. Belirtiyi yalnızca ürün dozu artırarak çözmeye çalışmayın.");checks.push("Yaprak analizi ile Fe–Zn–Mn durumu");level=Math.max(level,1)}
    else if(ph<5.5){priorities.push("Düşük pH kök ve besin dengesi açısından araştırılmalı; düzeltme kararı tamponlama kapasitesine göre verilmelidir.");checks.push("Tampon pH ve değişebilir asitlik");level=Math.max(level,1)}
    if(lime==="high"){priorities.push("Yüksek kireçte fosfor ve bazı mikro elementlerin yarayışlılığı azalabilir; bant uygulaması, form ve zamanlama analizle seçilmelidir.");checks.push("Aktif kireç ve yaprak mikro element sonuçları");level=Math.max(level,1)}
    if(organic<2){priorities.push("Organik madde düşük görünüyor. İyi olgunlaşmış organik kaynak, örtü yönetimi ve toprağı çıplak bırakmama seçeneklerini kademeli planlayın.");level=Math.max(level,1)}
    else if(organic<3){priorities.push("Organik madde orta düzeyde; yıllık kayıtla koruma ve artırma hedefi koyun.")}
    if(!priorities.length){priorities.push("Girilen temel değerlerde belirgin bir ön uyarı görünmüyor; gübre kararını yine toprak + yaprak analizi, ürün yükü ve sürgün gelişimiyle verin.")}
    if(!checks.length) checks.push("Aynı dönemde yaprak analizi, sürgün uzunluğu ve ürün yükü kaydı");
    const cls=level===2?"alert":level===1?"caution":"";
    const title=level===2?"Önce kök bölgesi sorununu çözün":level===1?"Analiz sonucu dikkat istiyor":"Temel koşullar uygun görünüyor";
    soilResult.innerHTML='<div class="result-panel '+cls+'"><h4>'+title+'</h4><strong>Öncelikler</strong><ul>'+priorities.map(x=>'<li>'+x+'</li>').join("")+'</ul><strong>Bir sonraki kontrol</strong><ul>'+checks.map(x=>'<li>'+x+'</li>').join("")+'</ul><p class="result-note">Bu araç laboratuvar raporunu teşhis etmez; yalnızca hangi sorunun önce araştırılacağını sıralar.</p></div>';
  }

  function calculateNutrients(event){
    event?.preventDefault();
    const area=n(document.querySelector("#calc-area").value);
    const trees=n(document.querySelector("#calc-trees").value);
    const dose=n(document.querySelector("#calc-dose").value);
    const nitrogen=n(document.querySelector("#calc-n").value);
    const phosphorus=n(document.querySelector("#calc-p").value);
    const potassium=n(document.querySelector("#calc-k").value);
    if([area,trees,dose,nitrogen,phosphorus,potassium].some(x=>Number.isNaN(x)||x<0)||area<=0||trees<=0){
      nutrientResult.innerHTML='<div class="result-panel alert"><h4>Değerleri kontrol edin</h4><p>Alan ve ağaç sayısı sıfırdan büyük; diğer değerler sıfır veya pozitif olmalıdır.</p></div>'; return;
    }
    const product=area*dose;
    const N=product*nitrogen/100, P=product*phosphorus/100, K=product*potassium/100;
    const perTree=product*1000/trees;
    nutrientResult.innerHTML='<div class="result-kpis"><div><strong>'+fmt(product)+' kg</strong><span>Toplam ürün</span></div><div><strong>'+fmt(N)+' kg N</strong><span>Saf azot</span></div><div><strong>'+fmt(P)+' kg P₂O₅</strong><span>Etiket fosforu</span></div><div><strong>'+fmt(K)+' kg K₂O</strong><span>Etiket potasyumu</span></div></div><p class="result-note">Ağaç başına matematiksel ürün karşılığı: <b>'+fmt(perTree)+' g</b>. Bu değer uygulama önerisi değildir; yalnızca girdi kaydını karşılaştırır. P₂O₅ ve K₂O etiket birimleridir.</p>';
  }

  soilForm?.addEventListener("submit",assessSoil);
  nutrientForm?.addEventListener("submit",calculateNutrients);
  if(soilForm) assessSoil();
  if(nutrientForm) calculateNutrients();
})();