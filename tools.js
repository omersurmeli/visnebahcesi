const trNumber=(value,digits=1)=>Number(value).toLocaleString('tr-TR',{maximumFractionDigits:digits});
const celsius=fahrenheit=>(fahrenheit-32)*5/9;
const frostStages={
  budSwell:{name:'Tomurcuk şişmesi',ten:15,ninety:0},sideGreen:{name:'Yanlarda yeşil görünüm',ten:24,ninety:10},
  greenTip:{name:'Yeşil uç',ten:26,ninety:22},tightCluster:{name:'Sıkı küme',ten:26,ninety:24},
  openCluster:{name:'Açık küme',ten:28,ninety:24},firstWhite:{name:'İlk beyaz',ten:28,ninety:24},
  firstBloom:{name:'İlk çiçek',ten:28,ninety:24},fullBloom:{name:'Tam çiçek',ten:28,ninety:24}
};
const frostForm=document.querySelector('#frost-form');
if(frostForm)frostForm.addEventListener('submit',event=>{event.preventDefault();const stage=frostStages[document.querySelector('#frost-stage').value],temp=Number(document.querySelector('#frost-temp').value),ten=celsius(stage.ten),ninety=celsius(stage.ninety),result=document.querySelector('#frost-result');let level='low',title='Kritik eşiklerin üzerinde',detail='Tablodaki yaklaşık %10 hasar eşiğinin üzerinde; yine de bahçenin soğuk ceplerini izleyin.';if(temp<=ninety){level='high';title='Çok yüksek hasar riski';detail='Beklenen değer yaklaşık %90 hasar eşiğine eşit veya daha düşük.'}else if(temp<=ten){level='high';title='Hasar riski yüksek';detail='Beklenen değer yaklaşık %10 ile %90 hasar eşikleri arasında.'}else if(temp<=ten+1.5){level='watch';title='Eşiğe yakın: yakın izleme gerekir';detail='Tahmin küçük sapmalar gösterebilir; bahçe içi ölçüm ve koruma planı önemlidir.'}result.className=`smart-result risk-${level}`;result.innerHTML=`<strong>${title}</strong><p>${stage.name}: yaklaşık %10 hasar eşiği ${trNumber(ten)} °C, %90 hasar eşiği ${trNumber(ninety)} °C.</p><p>Girilen en düşük değer: <b>${trNumber(temp)} °C</b></p>`});

const sprayerForm=document.querySelector('#sprayer-form');
if(sprayerForm)sprayerForm.addEventListener('submit',event=>{event.preventDefault();const flow=Number(document.querySelector('#sprayer-flow').value),speed=Number(document.querySelector('#sprayer-speed').value),spacing=Number(document.querySelector('#row-spacing').value),tank=Number(document.querySelector('#sprayer-tank').value),litresHa=600*flow/(speed*spacing),litresDa=litresHa/10,coverage=tank/litresDa,result=document.querySelector('#sprayer-result');result.innerHTML=`<strong>Gerçek uygulama hacmi: ${trNumber(litresDa)} L/dekar</strong><div class="result-grid"><span><b>${trNumber(litresHa,0)} L/ha</b>hektara su</span><span><b>${trNumber(coverage,2)} dekar</b>bir depo ile alan</span><span><b>${trNumber(tank/flow)} dakika</b>depo boşalma süresi</span></div>`});

const phiDate=document.querySelector('#phi-date');if(phiDate)phiDate.value=new Date().toISOString().slice(0,10);
const phiForm=document.querySelector('#phi-form');if(phiForm)phiForm.addEventListener('submit',event=>{event.preventDefault();const raw=document.querySelector('#phi-date').value,days=Number(document.querySelector('#phi-days').value),date=new Date(`${raw}T12:00:00`),result=document.querySelector('#phi-result');date.setDate(date.getDate()+days);result.innerHTML=`<strong>En erken hasat: ${date.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})}</strong><p>${days} günlük etiket süresi, son uygulama tarihine eklenmiştir. Sonraki bir uygulama yapılırsa hesabı yeniden başlatın.</p>`});

const fertilizerForm=document.querySelector('#fertilizer-form');
if(fertilizerForm)fertilizerForm.addEventListener('submit',event=>{event.preventDefault();const bag=Number(document.querySelector('#fert-bag').value),count=Number(document.querySelector('#fert-count').value),price=Number(document.querySelector('#fert-price').value),area=Number(document.querySelector('#fert-area').value),trees=Number(document.querySelector('#fert-trees').value)||0,n=Number(document.querySelector('#fert-n').value),p=Number(document.querySelector('#fert-p').value),k=Number(document.querySelector('#fert-k').value),total=bag*count,cost=price*count,result=document.querySelector('#fertilizer-result');result.innerHTML=`<strong>${trNumber(total)} kg ürün · ${trNumber(cost/area,2)} ₺/dekar</strong><div class="result-grid"><span><b>${trNumber(total*n/100,2)} kg N</b>${trNumber(total*n/100/area,2)} kg/da</span><span><b>${trNumber(total*p/100,2)} kg P₂O₅</b>${trNumber(total*p/100/area,2)} kg/da</span><span><b>${trNumber(total*k/100,2)} kg K₂O</b>${trNumber(total*k/100/area,2)} kg/da</span></div><p>Toplam maliyet: <b>${trNumber(cost,2)} ₺</b>${trees?` · ağaç başına matematiksel maliyet: <b>${trNumber(cost/trees,2)} ₺</b>`:''}</p>`});

const routeForm=document.querySelector('#route-form');
if(routeForm)routeForm.addEventListener('submit',event=>{event.preventDefault();const rows=Number(document.querySelector('#route-rows').value),trees=Number(document.querySelector('#route-trees').value),requested=Number(document.querySelector('#route-samples').value),count=Math.min(requested,rows*trees),positions=[.18,.52,.82,.34,.68],points=[],seen=new Set();for(let i=0;i<count*5&&points.length<count;i++){const index=points.length,row=Math.max(1,Math.min(rows,Math.round((index+.5)*rows/count))),tree=Math.max(1,Math.min(trees,Math.round(positions[i%positions.length]*trees)));for(let offset=0;offset<trees;offset++){const candidate=((tree-1+offset)%trees)+1,key=`${row}-${candidate}`;if(!seen.has(key)){seen.add(key);points.push([row,candidate]);break}}}document.querySelector('#route-result').innerHTML=`<strong>${points.length} ağaçlık dengeli rota</strong><p>Sıraları aynı uçtan numaralandırın. Ağaç numarası, sıraya girdiğiniz taraftan sayılır.</p><ol>${points.map(([row,tree],index)=>`<li><b>${index+1}.</b> ${row}. sıra · ${tree}. ağaç</li>`).join('')}</ol>`});


const irrigationForm=document.querySelector('#smart-irrigation-form');
const irrigationFields=['irrigation-area','irrigation-trees','irrigation-emitters','irrigation-flow','irrigation-target','irrigation-rain','irrigation-rain-efficiency','irrigation-system-efficiency','irrigation-stage','irrigation-soil'];
const irrigationStageNotes={
  cicek:'Çiçeklenmede kök bölgesini havasız bırakacak uzun sulamadan kaçının; don gecesinde sulama kararını bu hesaptan ayrı değerlendirin.',
  tutum:'Meyve tutumunda ani su stresini önleyin; hesaplanan süreyi bölerek uygulamak ağır bünyede yüzey akışını azaltabilir.',
  irilesme:'Meyve irileşmesinde ıslak-kuru dalgalanmasını azaltın; aynı kontrol noktalarında nemi tekrar ölçün.',
  renklenme:'Hasat öncesinde aşırı ve ani sulama yerine dengeli nemi koruyun; meyve ve toprak durumunu birlikte izleyin.',
  hasat:'Hasat günlerinde kasa, traktör ve işçi trafiğini çamurlu zemine sokmayacak zamanı seçin.',
  sonrasi:'Hasattan sonra sulamayı birden kesmeyin; sağlıklı yaprakların sezon sonuna kadar işlevini sürdürmesi için nemi izleyin.',
  dinlenme:'Dinlenmede otomatik programa bağlı kalmayın; yağış, toprak nemi ve su birikmesini esas alın.'
};
function restoreIrrigationInputs(){
  try{
    const saved=JSON.parse(localStorage.getItem('visne-smart-irrigation')||'{}');
    const profile=JSON.parse(localStorage.getItem('visne-profile-v1')||'{}');
    const hasSaved=Object.keys(saved).length>0;
    if(!hasSaved){
      if(profile['garden-area'])document.getElementById('irrigation-area').value=profile['garden-area'];
      if(profile['garden-trees'])document.getElementById('irrigation-trees').value=profile['garden-trees'];
    }
    irrigationFields.forEach(id=>{if(saved[id]!==undefined&&document.getElementById(id))document.getElementById(id).value=saved[id]});
  }catch(error){}
}
function saveIrrigationInputs(){
  const values={};
  irrigationFields.forEach(id=>{const element=document.getElementById(id);if(element)values[id]=element.value});
  localStorage.setItem('visne-smart-irrigation',JSON.stringify(values));
}
if(irrigationForm){
  restoreIrrigationInputs();
  irrigationForm.addEventListener('submit',event=>{
    event.preventDefault();
    const value=id=>Number(document.getElementById(id).value);
    const area=value('irrigation-area'),trees=value('irrigation-trees'),emitters=value('irrigation-emitters'),flow=value('irrigation-flow'),target=value('irrigation-target'),rain=value('irrigation-rain'),rainEfficiency=value('irrigation-rain-efficiency')/100,systemEfficiency=value('irrigation-system-efficiency')/100,stage=document.getElementById('irrigation-stage').value,soil=document.getElementById('irrigation-soil').value,result=document.getElementById('smart-irrigation-result');
    if([area,trees,emitters,flow,systemEfficiency].some(number=>!Number.isFinite(number)||number<=0)){result.className='smart-result risk-high';result.innerHTML='<strong>Girdileri kontrol edin</strong><p>Alan, ağaç sayısı, damlatıcı debisi ve sistem verimi sıfırdan büyük olmalıdır.</p>';return}
    const usefulRainLitres=rain*1000*area*rainEfficiency;
    const usefulRainPerTree=usefulRainLitres/trees;
    const remainingPerTree=Math.max(0,target-usefulRainPerTree);
    const appliedPerTree=remainingPerTree/systemEfficiency;
    const treeFlow=emitters*flow;
    const hours=appliedPerTree/treeFlow;
    const totalM3=appliedPerTree*trees/1000;
    let title=remainingPerTree===0?'Girilen yağış varsayımı su hedefini karşılıyor':trNumber(hours,2)+' saat çalışma süresi';
    let level=remainingPerTree===0?'low':'watch';
    let fieldNote='Kök bölgesini sulama ortasında ve bittikten sonra yeniden kontrol edin.';
    if(soil==='islak'){title='Kök bölgesi ıslak: sulamayı erteleyip yeniden ölçün';level='high';fieldNote='Hesap matematiksel süreyi gösterse de ıslak/çamurlu kök bölgesinde uygulamaya başlamayın.'}
    else if(soil==='kuru'){fieldNote='Kuru gözlem hesabı destekliyor; ilk uygulamada suyun kök derinliğine ulaşıp ulaşmadığını kontrol edin.'}
    result.className='smart-result risk-'+level;
    result.innerHTML='<strong>'+title+'</strong><div class="result-grid"><span><b>'+trNumber(remainingPerTree,1)+' L/ağaç</b>yağış sonrası net hedef</span><span><b>'+trNumber(totalM3,2)+' m³</b>hesaplanan toplam uygulama</span><span><b>'+trNumber(usefulRainPerTree,1)+' L/ağaç</b>faydalı sayılan yağış</span></div><p><b>Saha notu:</b> '+fieldNote+'</p><p>'+irrigationStageNotes[stage]+'</p>';
    saveIrrigationInputs();
  });
}
const irrigationForecast=document.querySelector('#irrigation-forecast');
if(irrigationForecast){
  fetch('https://api.open-meteo.com/v1/forecast?latitude=37.18265&longitude=29.812736&daily=precipitation_sum,precipitation_probability_max&forecast_days=3&timezone=Europe%2FIstanbul')
    .then(response=>{if(!response.ok)throw new Error('forecast');return response.json()})
    .then(data=>{
      const total=(data.daily.precipitation_sum||[]).reduce((sum,item)=>sum+(Number(item)||0),0);
      const probability=Math.max(...(data.daily.precipitation_probability_max||[0]).map(item=>Number(item)||0));
      irrigationForecast.innerHTML='<span><b>Yeşilköy · önümüzdeki 3 gün</b> Tahmini toplam yağış: <strong>'+trNumber(total,1)+' mm</strong> · en yüksek yağış olasılığı: <strong>%'+trNumber(probability,0)+'</strong></span><small>Tahmini yağışı “ölçülen yağış” alanına yazmayın; gerçekleşen miktarı yağışölçerden girin.</small>';
    })
    .catch(()=>{irrigationForecast.innerHTML='<span><b>Canlı yağış tahmini alınamadı.</b> Sulama kararında bahçe ölçümünüzü ve yerel tahmini birlikte kullanın.</span>'});
}


const irrigationLogButton=document.querySelector('#save-irrigation-log');
const irrigationResultActions=document.querySelector('#irrigation-result-actions');
let latestIrrigationLog=null;
if(irrigationForm&&irrigationLogButton&&irrigationResultActions){
  irrigationForm.addEventListener('submit',()=>{
    const number=id=>Number(document.getElementById(id).value);
    const area=number('irrigation-area'),trees=number('irrigation-trees'),emitters=number('irrigation-emitters'),flow=number('irrigation-flow'),target=number('irrigation-target'),rain=number('irrigation-rain'),rainEfficiency=number('irrigation-rain-efficiency')/100,systemEfficiency=number('irrigation-system-efficiency')/100,soil=document.getElementById('irrigation-soil').value,stageSelect=document.getElementById('irrigation-stage');
    const valid=[area,trees,emitters,flow,systemEfficiency].every(item=>Number.isFinite(item)&&item>0);
    if(!valid){irrigationResultActions.hidden=true;latestIrrigationLog=null;return}
    const usefulRainPerTree=rain*1000*area*rainEfficiency/trees;
    const remainingPerTree=Math.max(0,target-usefulRainPerTree);
    const appliedPerTree=remainingPerTree/systemEfficiency;
    const hours=appliedPerTree/(emitters*flow);
    const totalM3=appliedPerTree*trees/1000;
    const canSave=soil!=='islak'&&remainingPerTree>0;
    irrigationResultActions.hidden=!canSave;
    irrigationLogButton.disabled=false;
    irrigationLogButton.textContent='Bahçem defterine kaydet';
    document.getElementById('irrigation-save-status').textContent='';
    latestIrrigationLog=canSave?{
      date:new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Istanbul'}),
      type:'Sulama',
      quantity:Number(totalM3.toFixed(2)),
      unitPrice:0,
      cost:0,
      note:'Akıllı sulama planı: '+trNumber(hours,2)+' saat · '+trNumber(totalM3,2)+' m³ · '+trNumber(remainingPerTree,1)+' L/ağaç · '+stageSelect.options[stageSelect.selectedIndex].text
    }:null;
  });
  irrigationLogButton.addEventListener('click',()=>{
    if(!latestIrrigationLog)return;
    let records=[];
    try{records=JSON.parse(localStorage.getItem('visne-logs-v1')||'[]');if(!Array.isArray(records))records=[]}catch(error){records=[]}
    records.unshift({...latestIrrigationLog,id:Date.now()});
    localStorage.setItem('visne-logs-v1',JSON.stringify(records));
    irrigationLogButton.disabled=true;
    irrigationLogButton.textContent='Kaydedildi ✓';
    document.getElementById('irrigation-save-status').textContent='Sulama planı bu cihazdaki Bahçem defterine eklendi.';
  });
}
