(()=>{"use strict";
const fmt=(v,d=2)=>v.toLocaleString("tr-TR",{maximumFractionDigits:d});
const line=(s,v,u)=>s+": "+fmt(v)+" "+u;
const calc=(kind,a)=>{
  if(kind==="frost"){if(a.d>a.n)throw Error("Hasarlı örnek sayısı toplamı aşamaz.");return [line("Hasarlı oran",100*a.d/a.n,"%"),line("Hasarsız değerlendirilen",a.n-a.d,"adet"),"Tomurcuk hasarı, doğrudan verim kaybı değildir."];}
  if(kind==="yield"){if(a.target<a.brix||a.dry>a.wet)throw Error("Son Brix başlangıçtan düşük, son nem başlangıçtan yüksek olamaz.");const p=a.kg*a.press/100,f=a.kg*(1-a.loss/100);return [line("Çekirdeksiz/ayıklanmış",f,"kg"),line("Meyve suyu",p,"kg"),line("Kayıpsız teorik konsantre",p*a.brix/a.target,"kg"),line("Teorik kuru ürün",f*(1-a.wet/100)/(1-a.dry/100),"kg"),"Nem oranı güvenlik kriteri değildir."];}
  if(kind==="jam"){const n=Math.floor(a.kg*1.22/.35+1e-9),sold=Math.floor(n*(1-a.loss/100)),cost=a.kg*a.fruit+a.kg*.72*a.sugar+n*a.jar+a.other,rev=sold*a.sale;return [line("Tam kavanoz",n,"adet"),line("Satılabilen",sold,"adet"),line("Maliyet",cost,"TL"),line("Gelir",rev,"TL"),line("Üretim katkısı",rev-cost,"TL"),sold?line("Satılan birim maliyeti",cost/sold,"TL"):"Satılabilir birim yok."];}
  if(kind==="solar"){const wh=a.w*24,b=wh*a.days/.8/.85;return [line("Günlük tüketim",wh,"Wh"),line("Teorik panel alt sınırı",wh/a.sun/.7,"W"),line("Nominal batarya",b,"Wh"),line("Batarya kapasitesi",b/a.v,"Ah"),"Soğuk, gölge ve yaşlanma payı ayrıca gerekir."];}
  if(kind==="profit"){const rev=a.kg*a.price,m=rev-a.cost;return [line("Net satış geliri",rev,"TL"),line("Faaliyet farkı",m,"TL"),line("Gider / kg",a.cost/a.kg,"TL/kg"),line("Faaliyet farkı / ağaç",m/a.trees,"TL"),line("Faaliyet farkı / da",m/a.area,"TL")];}
  throw Error("Bilinmeyen hesap.");
};
document.querySelectorAll("form[data-v21]").forEach(f=>{const out=f.querySelector("output");const run=()=>{if(!f.checkValidity()){out.textContent="Geçerli sayısal değerler girin.";return;}const a=Object.fromEntries([...new FormData(f)].map(([k,v])=>[k,Number(v)]));try{out.textContent=calc(f.dataset.v21,a).join("\n");}catch(e){out.textContent=e.message;}};f.addEventListener("submit",e=>{e.preventDefault();run()});run();});
})();
