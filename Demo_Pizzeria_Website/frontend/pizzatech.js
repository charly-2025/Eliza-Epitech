const API = "http://127.0.0.1:5000";

let _deliveryCoords = [];
let _deliverySeconds = 0; //temps livraison retourné par le back

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
  return `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="#eee"/>
      <text x="50%" y="55%" text-anchor="middle" font-size="8" fill="#666">${type}</text>
    </svg>
  `;
}
function chkSVG(){
  return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#22c55e"/>
      <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" fill="none"/>
    </svg>
  `;
}

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

  //ID sur les inputs du step 4
  const step4=document.querySelectorAll(".step-page")[3];
  if(step4){
    const inputs=step4.querySelectorAll(".finp");
    const ids=["inp-prenom","inp-nom","inp-address","inp-email","inp-phone","inp-cardname","inp-cardnum","inp-cardexp","inp-cardcvv"];
    inputs.forEach((inp,i)=>{if(ids[i]&&!inp.id)inp.id=ids[i]});
  }
}


function updateCartBar(){
  const bar=document.getElementById("cartBar");
  const n=cartCount(),t=cartTotal();
  document.getElementById("cartCountLbl").textContent=n+" article"+(n>1?"s":"");
  document.getElementById("cartTotalLbl").textContent=fmt(t);
  if(n>0)bar.classList.add("visible");else bar.classList.remove("visible");
}

function confirmOrder(){
  //récupère les champs du formulaire de paiement
  const inputs = document.querySelectorAll(".finp");
  const prenom  = inputs[0]?.value.trim() || "";
  const nom     = inputs[1]?.value.trim() || "";
  const address = document.querySelector("input[name='addressInput']").value;
  const email   = document.querySelector("input[name='payment-email']").value;
  const phone   = document.querySelector("input[name='payment-phone']").value;

  if(!prenom || !nom || !address || !email){
    alert("Veuillez remplir tous les champs obligatoires (prénom, nom, adresse, email).");
    return;
  }

  //collecte les pizza_id réels (numérique) depuis DATA
  //le back attend des ids de la table pizzas (entiers)
  //on mappe nos ids locaux (p1..p9) vers les vrais ids DB
  //en utilisant l'index dans DATA.pizzas (p1 = index 0 -> db_id 1)
  const pizzaIds = [];
  Object.entries(cart.pizzas).forEach(([localId, q])=>{
    const item = DATA.pizzas.find(p=>p.id===localId);
    if(!item) return;
    const dbId = parseInt(localId.replace("p",""), 10); // p3 → 3
    for(let i=0;i<q;i++) pizzaIds.push((dbId));
  });

  const payload = {
    name    : prenom + " " + nom,
    email   : email,
    phone   : phone,
    address : address,
    pizzas  : pizzaIds,
    coords  : _deliveryCoords.length ? _deliveryCoords : [0, 0]
  };

  //désactive le bouton pendant l'envoi
  const btn = document.getElementById("btnNext");
  btn.disabled = true;
  btn.textContent = "Envoi en cours...";

  console.log(payload)
  console.log(_deliveryCoords)

  fetch(API + "/newcommand", {
    method  : "POST",
    headers : {"Content-Type":"application/json"},
    body    : JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if(data.result !== "succes"){
      console.log(data)
      alert("Erreur lors de la commande. Veuillez réessayer.");
      btn.disabled = false;
      btn.textContent = "Confirmer et payer";
      return;
    }
    //lance le timer avec le vrai temps livraison du back
    //_deliverySeconds rempli lors de la validation d'adresse
    const delivSecs = _deliverySeconds > 0 ? _deliverySeconds : (Math.floor(Math.random()*11)+15)*60;
    const delivMins = Math.round(delivSecs / 60);

    timerSecs  = delivSecs;
    timerTotal = delivSecs;

    document.getElementById("modalForm").style.display="none";
    const sc=document.getElementById("confirmScreen");
    sc.classList.add("show");
    document.getElementById("delivMins").textContent = delivMins;
    tick();
    if(timerIv) clearInterval(timerIv);
    timerIv = setInterval(()=>{
      timerSecs--;
      tick();
      if(timerSecs<=0){
        clearInterval(timerIv);
        document.getElementById("timerDig").textContent="Livré !";
        document.getElementById("timerTxt").textContent="Votre commande est arrivée. Bon appétit !";
      }
    }, 1000);

    cart.pizzas={};cart.desserts={};cart.boissons={};
    _deliveryCoords=[];_deliverySeconds=0;
    updateCartBar();
  })
  .catch(err=>{
    console.error(err);
    alert("Impossible de joindre le serveur. Vérifiez que le backend Flask est lancé.");
    btn.disabled = false;
    btn.textContent = "Confirmer et payer";
  });
}

function tick(){
  const m=Math.floor(timerSecs/60),s=timerSecs%60;
  document.getElementById("timerDig").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  const pct=(timerSecs/timerTotal)*100;
  document.getElementById("timerBarIn").style.width=pct+"%";
}
//auto complete l'address
function initAddressAutocomplete(){
  const container = document.getElementById("addressAutocomplete");
  if(!container) return;

  let debounce, currentItems=[], activeIndex=-1;
  container.style.position="relative";

  const inp = document.createElement("input");
  inp.type="text"; inp.id="addressInput"; inp.name="address";
  inp.required=true; inp.autocomplete="off";
  inp.placeholder="Votre adresse de livraison...";
  inp.className="finp";
  inp.style.width="100%";
  container.appendChild(inp);

  const sug = document.createElement("div");
  sug.style.cssText="position:absolute;top:100%;left:0;width:100%;border:1px solid #ccc;background:#fff;z-index:1000;max-height:200px;overflow-y:auto;font-family:sans-serif;";
  container.appendChild(sug);

  function clear(){sug.innerHTML="";currentItems=[];activeIndex=-1;}
  function setActive(i){
    sug.querySelectorAll("div").forEach((el,j)=>el.style.background=j===i?"#eee":"#fff");
    activeIndex=i;
  }
  function selectFeature(f){
    inp.value=f.properties.formatted;
    clear();
    const lat=f.properties.lat, lon=f.properties.lon;
    _deliveryCoords=[lon,lat];

    //valide la livraison + récupère le temps réel
    fetch(API+"/timetravel",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({destination:[lon,lat]})
    })
    .then(r=>r.json())
    .then(d=>{
      if(!d.success){
        alert("Livraison impossible à cette adresse. Entrez une adresse valide.");
        inp.value="";
        _deliveryCoords=[];
        return;
      }
      //d.duration est un tableau [minutes, secondes] ou [heures, minutes, secondes]
      //on reconvertit en secondes pour le timer
      const dur = d.duration;
      if(dur.length===1) _deliverySeconds = dur[0];
      else if(dur.length===2) _deliverySeconds = dur[0]*60+dur[1];
      else _deliverySeconds = dur[0]*3600+dur[1]*60+dur[2];
    })
    .catch(()=>{
      //Back indisponible : on laisse coords remplies, timer tombera en fallback aléatoire
      console.warn("timetravel non disponible, fallback timer aléatoire");
    });
  }

  function fetchSuggestions(val){
    const key="377ccf1ef5fb4abda18ae2eb6e6723cf"; //même clé que main.js
    fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&limit=5&filter=countrycode:fr&apiKey=${key}`)
    .then(r=>r.json())
    .then(d=>{
      clear();
      if(!d.features?.length) return;
      currentItems=d.features;
      d.features.forEach((f,i)=>{
        const el=document.createElement("div");
        el.textContent=f.properties.formatted;
        el.style.cssText="padding:10px;cursor:pointer;border-bottom:1px solid #eee;";
        el.addEventListener("mouseover",()=>setActive(i));
        el.addEventListener("click",()=>selectFeature(f));
        sug.appendChild(el);
      });
    }).catch(console.error);
  }

  inp.addEventListener("input",function(){
    clearTimeout(debounce);
    if(!this.value||this.value.length<3){clear();return;}
    debounce=setTimeout(()=>fetchSuggestions(this.value),300);
  });
  inp.addEventListener("keydown",function(e){
    if(!currentItems.length) return;
    if(e.key==="ArrowDown"){e.preventDefault();setActive((activeIndex+1)%currentItems.length);}
    if(e.key==="ArrowUp"){e.preventDefault();setActive((activeIndex-1+currentItems.length)%currentItems.length);}
    if(e.key==="Enter"){e.preventDefault();if(activeIndex>=0)selectFeature(currentItems[activeIndex]);}
  });
  document.addEventListener("click",e=>{if(!container.contains(e.target))clear();});
}

function syncPizzasFromBackend(){
  fetch(API+"/get_pizzas")
  .then(r=>r.json())
  .then(rows=>{
    //rows = [[pizza_id, name, preparation_time, price]]
    rows.forEach(row=>{
      const dbId=row[0], dbName=row[1], dbPrice=parseFloat(row[3]);
      const localId="p"+dbId;
      const item=DATA.pizzas.find(p=>p.id===localId);
      if(item){
        item.name  = dbName;
        item.price = dbPrice;
      } else {
        //pizza présente en DB mais pas encore dans DATA → on l'ajoute
        DATA.pizzas.push({
          id: localId, name: dbName,
          desc: "", price: dbPrice,
          cat: "classique", img: ""
        });
      }
    });
    //re-render menu après sync
    renderMenu(document.querySelector(".tab.active")?.dataset.cat||"all");
  })
  .catch(()=>{
    console.warn("Backend non disponible — pizzas affichées depuis les données locales.");
  });
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
  fetch("http://127.0.0.1:5000/chatbot", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: msg })
  })
  .then(res => res.json())
  .then(data => {
    td.remove();
    addMsg(data.reply, "bot");
  })
  .catch(err => {
    td.remove();
    addMsg("Erreur serveur 😢", "bot");
  });
}

//init
document.addEventListener("DOMContentLoaded",()=>{
  renderMenu("all");
  document.querySelector(".tab").dataset.cat="all";
  document.getElementById("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")sendChat()});
  document.getElementById("overlay").addEventListener("click",e=>{if(e.target===document.getElementById("overlay"))closeModal()});
  setTimeout(()=>{document.querySelectorAll(".perf-bar").forEach(b=>{b.style.width=b.dataset.val+"%"})},700);

  // Connexion backend
  syncPizzasFromBackend();
  initAddressAutocomplete();
});


function addressAutocomplete(containerElement, callback, options) {
  let debounceTimeout;
  let currentItems = [];
  let activeIndex = -1;

  containerElement.style.position = "relative";

  const inputElement = document.createElement("input");
  inputElement.id = "addressInput";
  inputElement.autocomplete = "off";
  inputElement.name = "addressInput";
  inputElement.required = true;
  inputElement.type = "text";
  inputElement.placeholder = options.placeholder || "Entrez une adresse";
  inputElement.className = "finp";
  containerElement.appendChild(inputElement);

  const suggestionsElement = document.createElement("div");
  suggestionsElement.style.position = "absolute";
  suggestionsElement.style.top = "100%";
  suggestionsElement.style.left = "0";
  suggestionsElement.style.width = "100%";
  suggestionsElement.style.border = "1.5px solid var(--bd)";
  suggestionsElement.style.background = "#fff";
  suggestionsElement.style.zIndex = "1000";
  suggestionsElement.style.maxHeight = "200px";
  suggestionsElement.style.overflowY = "auto";
  suggestionsElement.style.fontFamily = "var(--fb)";
  suggestionsElement.style.fontSize = "13px";
  suggestionsElement.style.borderRadius = "10px";
  suggestionsElement.style.marginTop = "4px";
  suggestionsElement.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
  suggestionsElement.style.display = "none"; 
  containerElement.appendChild(suggestionsElement);

  function clearSuggestions() {
    suggestionsElement.innerHTML = "";
    suggestionsElement.style.display = "none";
    currentItems = [];
    activeIndex = -1;
  }

  function setActive(index) {
    const items = suggestionsElement.querySelectorAll("div");
    items.forEach((item, i) => {
      item.style.background = i === index ? "#eee" : "#fff";
    });
    activeIndex = index;
  }

  function selectItem(feature) {
    inputElement.value = feature.properties.formatted;
    clearSuggestions();
    callback(feature);
  }

  function fetchData(value) {
    const apiKey = "377ccf1ef5fb4abda18ae2eb6e6723cf";
    let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&limit=5&apiKey=${apiKey}`;

    url += "&filter=countrycode:fr"; //We can change country code for acces other country

    fetch(url)
      .then(res => res.json())
      .then(data => {
        clearSuggestions();

        if (!data.features || data.features.length === 0) return;

        currentItems = data.features;

        data.features.forEach((feature, index) => {
          const item = document.createElement("div");
          item.textContent = feature.properties.formatted;

          item.style.padding = "10px";
          item.style.cursor = "pointer";
          item.style.borderBottom = "1px solid #eee";

          item.addEventListener("mouseover", () => setActive(index));
          item.addEventListener("click", () => selectItem(feature));

          suggestionsElement.appendChild(item);
        });
        suggestionsElement.style.display = "block";
      })
      .catch(err => console.error(err));
  }

  inputElement.addEventListener("input", function () {
    const value = this.value;

    clearTimeout(debounceTimeout);

    if (!value || value.length < 3) {
      clearSuggestions();
      return;
    }

    debounceTimeout = setTimeout(() => {
      fetchData(value);
    }, 300);
  });

  inputElement.addEventListener("keydown", function (e) {
    if (!currentItems.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % currentItems.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + currentItems.length) % currentItems.length);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectItem(currentItems[activeIndex]);
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!containerElement.contains(e.target)) {
      clearSuggestions();
    }
  });
}

addressAutocomplete(
  document.getElementById("autocomplete-container"),
  (selectedAddress) => {
    console.log("Adresse :", selectedAddress.properties.formatted);

    const lat = selectedAddress.properties.lat;
    const lon = selectedAddress.properties.lon;

    _deliveryCoords = [lon, lat]

    console.log("Coords :", _deliveryCoords);

   fetch("http://127.0.0.1:5000/timetravel", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    destination: _deliveryCoords
  })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      alert("Livraison impossible, entrez une adresse valide");

      const input = document.getElementById("addressInput");
      _deliveryCoords = []
      input.value = "";
      return;
    }

    console.log("Durée :", data.duration);
    console.log("Distance :", data.distance);
  })
  .catch(err => {
    console.error(err);
    alert("Erreur serveur");
  });
  },
  {
    placeholder: "Entre une adresse..."
  }
);
