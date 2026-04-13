//dict of donner
const DATA = {
  pizzas: [
    { id:"p1", name: "Margherita Tech", desc: "Tomate, mozzarella di bufala, basilic frais", price: 10.90, cat: "classique", img: "pizza-slider-2.jpg" },
    { id:"p2", name: "4 Fromages 2.0", desc: "Gorgonzola, chèvre, raclette, emmental", price: 13.90, cat: "classique", img: "pizza-amour-de-pizza.jpg" },
    { id:"p3", name: "Reine du Code", desc: "Jambon, champignons, mozzarella, crème fraîche", price: 13.50, cat: "classique", img: "" },
    { id:"p4", name: "Capricciosa Verde", desc: "Courgettes, champignons, poivrons, olives", price: 12.90, cat: "vegetarienne", img: "pizza-slider-1.jpg" },
    { id:"p5", name: "Veggie Hack", desc: "Aubergines grillées, tomates séchées, roquette", price: 12.50, cat: "vegetarienne", img: "" },
    { id:"p6", name: "Primavera Bot", desc: "Artichauts, coeurs de palmier, tomates cerises", price: 11.90, cat: "vegetarienne", img: "" },
    { id:"p7", name: "AI Pepperoni", desc: "Double pepperoni, jalapeños, mozzarella fumée", price: 14.90, cat: "speciale", img: "" },
    { id:"p8", name: "Pizza Dark Mode", desc: "Encre de seiche, mozzarella, crevettes, citron", price: 15.90, cat: "speciale", img: "" },
    { id:"p9", name: "Open Source", desc: "4 fromages, miel de truffe, noix de cajou", price: 16.50, cat: "speciale", img: "" }
  ],
  desserts: [
    { id:"d1", name: "Tiramisu Maison", desc: "Mascarpone, café, cacao", price: 5.50, img: "" },
    { id:"d2", name: "Fondant Choco", desc: "Coeur coulant, glace vanille", price: 6.50, img: "" },
    { id:"d3", name: "Panna Cotta", desc: "Coulis de fruits rouges", price: 5.00, img: "" },
    { id:"d4", name: "Brownie Noix", desc: "Chocolat noir, noix, caramel beurre salé", price: 5.90, img: "" }
  ],
  boissons: [
    { id:"b1", name: "Coca-Cola 33cl", desc: "Classic ou Zero", price: 2.90, img: "" },
    { id:"b2", name: "Eau Pétillante", desc: "San Pellegrino 50cl", price: 3.20, img: "" },
    { id:"b3", name: "Jus d'Orange", desc: "Pressé maison", price: 3.90, img: "" },
    { id:"b4", name: "Limonade Citron", desc: "Maison, menthe fraîche", price: 4.50, img: "" },
    { id:"b5", name: "Café Espresso", desc: "Grain arabica sélectionné", price: 2.50, img: "" },
    { id:"b6", name: "Bière Artisanale", desc: "Blonde locale, 33cl", price: 4.90, img: "" }
  ]
};
const cart={pizzas:{},desserts:{},boissons:{}};
let step=0,timerSecs=0,timerTotal=0,timerIv=null;

const STEPS=[
  {key:"pizzas",title:"Votre pizza",sub:"Choisissez une ou plusieurs pizzas",grid:"order-grid",required:true},
  {key:"desserts",title:"Votre dessert",sub:"Optionnel — ajoutez une douceur",grid:"order-grid-4",required:false},
  {key:"boissons",title:"Votre boisson",sub:"Optionnel — accompagnez votre repas",grid:"order-grid-4",required:false},
  {key:"paiement",title:"Paiement",sub:"",grid:"",required:false}
];

function fmt(n){return n.toFixed(2).replace(".",",")+"\u00a0€"}
function qty(t,id){return cart[t][id]||0}
function setQty(t,id,v){if(v<=0)delete cart[t][id];else cart[t][id]=v}
function cartTotal(){
  let s=0;
  ["pizzas","desserts","boissons"].forEach(t=>{
    const items=DATA[t];
    Object.entries(cart[t]).forEach(([id,q])=>{const it=items.find(i=>i.id===id);if(it)s+=it.price*q});
  });
  return s;
}
function cartCount(){
  return Object.values(cart.pizzas).reduce((a,b)=>a+b,0)
        +Object.values(cart.desserts).reduce((a,b)=>a+b,0)
        +Object.values(cart.boissons).reduce((a,b)=>a+b,0);
}

function phSVG(type){
  if(type==="pizza")return`<svg width="64" height="64" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#E8962A"/><circle cx="50" cy="50" r="36" fill="#CC1A1A"/><circle cx="50" cy="50" r="29" fill="#F5C542"/><circle cx="36" cy="42" r="5" fill="#CC1A1A"/><circle cx="58" cy="36" r="4" fill="#CC1A1A"/><circle cx="44" cy="57" r="5" fill="#CC1A1A"/><circle cx="61" cy="55" r="4" fill="#CC1A1A"/></svg>`;
  if(type==="dessert")return`<svg width="54" height="54" viewBox="0 0 80 80" fill="none"><rect x="10" y="40" width="60" height="26" rx="8" fill="#8B4513"/><ellipse cx="40" cy="40" rx="30" ry="10" fill="#C0623A"/><ellipse cx="40" cy="30" rx="16" ry="9" fill="#F5C542"/></svg>`;
  return`<svg width="40" height="54" viewBox="0 0 60 80" fill="none"><rect x="12" y="10" width="36" height="50" rx="7" fill="#1a5fa8"/><ellipse cx="30" cy="10" rx="18" ry="7" fill="#3a85d8"/><rect x="20" y="60" width="20" height="12" rx="4" fill="#0e3d70"/></svg>`;
}
function chkSVG(){return`<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}

function cardHTML(item,type){
  const typeKey=type==="pizzas"?"pizza":type==="desserts"?"dessert":"boisson";
  const q=qty(type,item.id);
  const sel=q>0?"selected":"";
  const img=item.img?`<img src="${item.img}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:"";
  const ph=`<div class="oimg-ph" style="${item.img?"display:none":""}">${phSVG(typeKey)}</div>`;
  const qtyHTML=q>0?`<div class="qty-ctrl" onclick="event.stopPropagation()">
    <button class="qty-btn" onclick="chQty('${type}','${item.id}',-1)">-</button>
    <span class="qty-n">${q}</span>
    <button class="qty-btn" onclick="chQty('${type}','${item.id}',1)">+</button>
  </div>`:"";
  return`<div class="order-card ${sel}" id="oc-${item.id}" onclick="toggleItem('${type}','${item.id}')">
    <div class="chk">${chkSVG()}</div>
    <div class="oimg">
      ${img}${ph}

    </div>
    <div class="oinfo">
      <div class="oname">${item.name}</div>
      <div class="odesc">${item.desc}</div>
      <div class="oprice">${fmt(item.price)}</div>
      ${qtyHTML}
    </div>
  </div>`;
}

function openPop(e,id,type){
  e.stopPropagation();
  document.querySelectorAll(".url-popup.open").forEach(p=>p.classList.remove("open"));
  const p=document.getElementById("pop-"+id);
  if(p)p.classList.toggle("open");
}
document.addEventListener("click",()=>{document.querySelectorAll(".url-popup.open").forEach(p=>p.classList.remove("open"))});

function applyImg(id,type){
  const url=document.getElementById("url-"+id).value.trim();
  const items=DATA[type];
  const it=items.find(i=>i.id===id);
  if(it&&url)it.img=url;
  document.getElementById("pop-"+id).classList.remove("open");
  renderSection(type);
  renderMenu(document.querySelector(".tab.active").dataset.cat||"all");
}

function renderSection(type){
  const gridId=type==="pizzas"?"gPizzas":type==="desserts"?"gDesserts":"gBoissons";
  const el=document.getElementById(gridId);
  if(!el)return;
  const s=STEPS.find(x=>x.key===type);
  el.className=s.grid;
  el.innerHTML=DATA[type].map(it=>cardHTML(it,type)).join("");
  updateFooter();updateCartBar();
}

function toggleItem(type,id){
  const q=qty(type,id);
  setQty(type,id,q===0?1:0);
  renderSection(type);
}
function chQty(type,id,d){setQty(type,id,qty(type,id)+d);renderSection(type)}

//step of modal
function openModal(preId){
  if(preId){const f=DATA.pizzas.find(p=>p.id===preId||p.name===preId);if(f&&!cart.pizzas[f.id])cart.pizzas[f.id]=1}
  step=0;
  ["pizzas","desserts","boissons"].forEach(t=>renderSection(t));
  goStep(0);
  document.getElementById("overlay").classList.add("open");
  document.body.style.overflow="hidden";
}
function closeModal(){
  document.getElementById("overlay").classList.remove("open");
  document.body.style.overflow="";
  document.getElementById("confirmScreen").classList.remove("show");
  document.getElementById("modalForm").style.display="flex";
  if(timerIv)clearInterval(timerIv);
}

function goStep(n){
  step=n;
  document.querySelectorAll(".step-page").forEach((p,i)=>p.classList.toggle("active",i===n));
  document.querySelectorAll(".step-dot").forEach((d,i)=>d.classList.toggle("active",i===n));
  const s=STEPS[n];
  document.getElementById("mStepLbl").textContent="Étape "+(n+1)+" / "+STEPS.length;
  document.getElementById("mTitle").textContent=s.title;
  const prev=document.getElementById("btnPrev");
  const next=document.getElementById("btnNext");
  prev.style.visibility=n===0?"hidden":"visible";
  next.textContent=n===STEPS.length-1?"Confirmer et payer":n===STEPS.length-2?"Passer au paiement":"Continuer";
  if(n===STEPS.length-1)buildRecap();
  updateFooter();
}
function nextStep(){
  if(step===0&&Object.keys(cart.pizzas).length===0)return;
  if(step<STEPS.length-1)goStep(step+1);
  else confirmOrder();
}
function prevStep(){if(step>0)goStep(step-1)}

function updateFooter(){
  document.getElementById("fTotal").textContent=fmt(cartTotal());
  const next=document.getElementById("btnNext");
  next.disabled=step===0&&Object.keys(cart.pizzas).length===0;
}

//pay and recapitulation
function buildRecap(){
  const lines=[];
  DATA.pizzas.forEach(p=>{const q=cart.pizzas[p.id];if(q)lines.push({name:p.name,q,price:p.price})});
  DATA.desserts.forEach(p=>{const q=cart.desserts[p.id];if(q)lines.push({name:p.name,q,price:p.price})});
  DATA.boissons.forEach(p=>{const q=cart.boissons[p.id];if(q)lines.push({name:p.name,q,price:p.price})});
  document.getElementById("recapLines").innerHTML=lines.map(l=>`<div class="rline"><span>${l.q>1?l.q+"x ":""}${l.name}</span><span>${fmt(l.price*l.q)}</span></div>`).join("");
  document.getElementById("recapTotal").textContent=fmt(cartTotal());
}


function updateCartBar(){
  const bar=document.getElementById("cartBar");
  const n=cartCount(),t=cartTotal();
  document.getElementById("cartCountLbl").textContent=n+" article"+(n>1?"s":"");
  document.getElementById("cartTotalLbl").textContent=fmt(t);
  if(n>0)bar.classList.add("visible");else bar.classList.remove("visible");
}

//timer ramdom for livraison
function confirmOrder(){
  const mins=Math.floor(Math.random()*11)+15;
  timerSecs=mins*60;timerTotal=timerSecs;
  document.getElementById("modalForm").style.display="none";
  const sc=document.getElementById("confirmScreen");
  sc.classList.add("show");
  document.getElementById("delivMins").textContent=mins;
  tick();
  if(timerIv)clearInterval(timerIv);
  timerIv=setInterval(()=>{timerSecs--;tick();if(timerSecs<=0){clearInterval(timerIv);document.getElementById("timerDig").textContent="Livré !";document.getElementById("timerTxt").textContent="Votre commande est arrivée. Bon appétit !"}},1000);
  cart.pizzas={};cart.desserts={};cart.boissons={};
  updateCartBar();
}
function tick(){
  const m=Math.floor(timerSecs/60),s=timerSecs%60;
  document.getElementById("timerDig").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  const pct=(timerSecs/timerTotal)*100;
  document.getElementById("timerBarIn").style.width=pct+"%";
}

//function for menu page
function renderMenu(cat){
  const grid=document.getElementById("menuGrid");
  const list=cat==="all"?DATA.pizzas:DATA.pizzas.filter(p=>p.cat===cat);
  grid.innerHTML=list.map(p=>{
    const imgTag=p.img?`<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">`:`<div class="menu-img-ph">${phSVG("pizza")}</div>`;
    return`<div class="menu-card" onclick="openModal('${p.id}')">
      <div class="menu-img">${imgTag}</div>
      <div class="menu-info">
        <div class="menu-name">${p.name}</div>
        <div class="menu-desc">${p.desc}</div>
        <div class="menu-footer">
          <div class="menu-price">${fmt(p.price)}</div>
          <button class="add-btn">Commander</button>
        </div>
      </div>
    </div>`;
  }).join("");
}
function filterMenu(cat,btn){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  btn.classList.add("active");btn.dataset.cat=cat;
  renderMenu(cat);
}

//for speak chatbot
const BOT=[
  {k:["végétar","vegan"],r:()=>"Je vous recommande la Capricciosa Verde (12,90€) ou la Veggie Hack (12,50€). Généreuses et sans viande !"},
  {k:["pepperoni","épicé","pimenté"],r:()=>"Notre AI Pepperoni — double pepperoni et jalapeños — est notre bestseller à 14,90€."},
  {k:["fromage"],r:()=>"Le 4 Fromages 2.0 (gorgonzola, chèvre, raclette, emmental) à 13,90€ est incontournable."},
  {k:["livraison","arrive","quand","combien de temps","délai"],r:()=>{const m=Math.floor(Math.random()*11)+15;return`En ce moment le délai estimé est de <strong>${m} minutes</strong>. Passez commande, vos pizzas arrivent vite !`}},
  {k:["prix","cher","coût","combien"],r:()=>"Nos pizzas vont de 10,90€ à 16,50€. Desserts : 5€ à 6,50€. Boissons : 2,50€ à 4,90€."},
  {k:["spéciale","speciale","original"],r:()=>"Nos spéciales : AI Pepperoni, Pizza Dark Mode à l'encre de seiche, et Open Source aux 4 fromages et truffe."},
  {k:["dessert"],r:()=>"Tiramisu maison 5,50€, Fondant choco 6,50€, Panna cotta 5€, Brownie noix-caramel 5,90€."},
  {k:["boisson","boire","coca","jus","eau"],r:()=>"Coca-Cola, eau pétillante, jus d'orange pressé, limonade citron, café espresso et bière artisanale. De 2,50€ à 4,90€."},
  {k:["commander","commande"],r:()=>"Cliquez sur 'Commander maintenant' ou sur n'importe quelle pizza. Vous pourrez choisir pizza, dessert et boisson !"},
  {k:["allergi","gluten","sans"],r:()=>"Mentionnez vos allergies dans votre commande ou appelez-nous au 01 23 45 67 89."},
  {k:["ouvert","horaire","heure"],r:()=>"Ouvert tous les jours 11h30-14h30 et 18h-23h. Le chatbot est là 24h/24 !"},
  {k:["merci","super","top","parfait"],r:()=>"Avec plaisir ! Bonne dégustation chez PizzaTech !"},
  {k:["bonjour","salut","hello","bonsoir"],r:()=>"Bonjour ! Je suis PizzaBot. Demandez-moi notre carte, les prix, le délai de livraison, ou passez directement commande !"},
];
function getBotReply(msg){
  const m=msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  for(const e of BOT){if(e.k.some(k=>m.includes(k.normalize("NFD").replace(/[\u0300-\u036f]/g,""))))return e.r()}
  return"Je n'ai pas bien compris. Essayez : notre carte, les prix, le délai de livraison, ou dites ce que vous aimez manger !";
}
function addMsg(txt,who){
  const log=document.getElementById("chatLog");
  const d=document.createElement("div");
  d.className="msg"+(who==="user"?" user":"");
  d.innerHTML=`<div class="av-sm ${who==="user"?"av-user":"av-bot"}">${who==="user"?"Moi":"PT"}</div><div class="bubble ${who==="user"?"bubble-user":"bubble-bot"}">${txt}</div>`;
  log.appendChild(d);log.scrollTop=log.scrollHeight;
}
function sendChat(){
  const inp=document.getElementById("chatInput");
  const msg=inp.value.trim();if(!msg)return;
  addMsg(msg,"user");inp.value="";
  const log=document.getElementById("chatLog");
  const td=document.createElement("div");
  td.className="msg";
  td.innerHTML=`<div class="av-sm av-bot">PT</div><div class="bubble bubble-bot typing"><span></span><span></span><span></span></div>`;
  log.appendChild(td);log.scrollTop=log.scrollHeight;
  setTimeout(()=>{td.remove();addMsg(getBotReply(msg),"bot")},900);
}

//init
document.addEventListener("DOMContentLoaded",()=>{
  renderMenu("all");
  document.querySelector(".tab").dataset.cat="all";
  document.getElementById("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")sendChat()});
  document.getElementById("overlay").addEventListener("click",e=>{if(e.target===document.getElementById("overlay"))closeModal()});
  setTimeout(()=>{document.querySelectorAll(".perf-bar").forEach(b=>{b.style.width=b.dataset.val+"%"})},700);
});
