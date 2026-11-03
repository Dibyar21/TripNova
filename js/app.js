(() => {
"use strict";
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const get=(key, fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const put=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
const session=()=>get("tripnova_session",null);
const requireAuth=()=>{if(!session()){location.href="index.html";return false}return true};
const toast=(text,type="success")=>{let region=$(".toast-region");if(!region){region=document.createElement("div");region.className="toast-region";region.setAttribute("aria-live","polite");document.body.append(region)}const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=text;region.append(el);setTimeout(()=>el.remove(),3200)};
let trips=[];
const header=()=>{
 const user=session();const current=location.pathname.split("/").pop()||"home.html";
 const links=[["Home","home.html"],["Destinations","destinations.html"],["Services","services.html"],["About","about.html"],["Contact","contact.html"]];
 $("#site-header").innerHTML=`<header class="site-header"><a class="brand site-brand" href="home.html"><img src="assets/tripnova-logo.png" alt="TripNova" class="site-brand-logo"></a><button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button><nav class="nav-links" id="nav-links">${links.map(([n,u])=>`<a class="${current===u?"active":""}" href="${u}">${n}</a>`).join("")}</nav><div class="nav-actions"><a class="nav-cart" href="cart.html" aria-label="Shopping cart">♧<span class="cart-count" id="header-cart-count">0</span></a><a class="nav-user" href="profile.html">${safe((user?.name||"Traveler").split(" ")[0])} ↗</a><button class="nav-logout" id="logout-button">Log out</button></div></header>`;
 $("#menu-toggle").addEventListener("click",()=>{const nav=$("#nav-links"),open=nav.classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(open));$("#menu-toggle").textContent=open?"×":"☰"});
 $("#logout-button").addEventListener("click",()=>{localStorage.removeItem("tripnova_session");location.href="index.html"});
 updateCartCount();
};
const footer=()=>{const el=$("#site-footer");if(el)el.innerHTML=`<footer class="site-footer"><div class="footer-main"><div class="footer-brand"><a class="brand site-brand" href="home.html"><img src="assets/tripnova-logo.png" alt="TripNova" class="site-brand-logo"></a><p>Find your somewhere. Curated inspiration for the journeys that stay with you.</p></div><nav class="footer-links"><a href="destinations.html">Destinations</a><a href="services.html">Services</a><a href="about.html">About</a><a href="contact.html">Contact</a><a href="profile.html">My profile</a></nav></div><div class="footer-bottom"><span>© 2026 TripNova · Student demo project</span><span>Demo only · No real bookings or payments</span></div></footer>`};
const readCart=()=>{
 const raw=get("tripnova_cart",[]);
 // Upgrade the older ["bali", "kyoto"] format to [{id, quantity}] safely.
 const normalized=raw.map(item=>typeof item==="string"?{id:item,quantity:1}:{id:item?.id,quantity:Math.max(1,Math.min(20,Number(item?.quantity)||1))}).filter(item=>item.id);
 if(JSON.stringify(raw)!==JSON.stringify(normalized))put("tripnova_cart",normalized);
 return normalized;
};
const saveCart=cart=>{put("tripnova_cart",cart);updateCartCount()};
const updateCartCount=()=>{const el=$("#header-cart-count");if(el)el.textContent=readCart().reduce((n,item)=>n+item.quantity,0)};
const imageMarkup=(src,alt,cls="")=>src?`<img class="${cls}" src="${safe(src)}" alt="${safe(alt)}" loading="lazy">`:`<div class="image-placeholder ${cls}" role="img" aria-label="Image not added yet"><span>Photo placeholder</span><small>Add your image in <code>data/trips.json</code></small></div>`;
const getTrip=id=>trips.find(t=>t.id===id);
const card=(t)=>{const saved=get("tripnova_wishlist",[]).includes(t.id),photo=t.images?.[0]||"";return `<article class="destination-card"><a class="card-image ${photo?"has-photo":"image-empty"}" href="destination.html?id=${encodeURIComponent(t.id)}" ${photo?`style="background-image:url('${safe(photo)}')"`:""} aria-label="Explore ${safe(t.name)}">${photo?"":`<span class="image-empty-label">Add photo: ${safe(t.id)}-1.jpg</span>`}<span class="card-category">${safe(t.category)}</span></a><button class="favorite-btn ${saved?"saved":""}" data-favorite="${t.id}" aria-label="${saved?"Remove from":"Add to"} wishlist">${saved?"♥":"♡"}</button><div class="card-body"><div class="card-title-row"><div><h3><a href="destination.html?id=${encodeURIComponent(t.id)}">${safe(t.name)}</a></h3><span class="card-location">⌖ ${safe(t.country)} · ${safe(t.duration)}</span></div><span class="rating">★ ${t.rating}</span></div><p class="card-description">${safe(t.shortDescription)}</p><div class="card-footer"><div><span class="price-label">TRIP PACKAGE FROM</span><span class="price">${money(t.price)}</span></div><a class="card-arrow" href="destination.html?id=${encodeURIComponent(t.id)}" aria-label="View ${safe(t.name)}">↗</a></div></div></article>`};
const renderCards=(target,items)=>{const el=$(target);if(el)el.innerHTML=items.map(card).join("");};
const attachFavorites=()=>$$("[data-favorite]").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();let saved=get("tripnova_wishlist",[]),id=btn.dataset.favorite;saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];put("tripnova_wishlist",saved);btn.classList.toggle("saved",saved.includes(id));btn.textContent=saved.includes(id)?"♥":"♡";btn.setAttribute("aria-label",saved.includes(id)?"Remove from wishlist":"Add to wishlist");toast(saved.includes(id)?"Added to your wishlist":"Removed from wishlist");if($("#wishlist-grid")){const list=saved.map(getTrip).filter(Boolean);renderCards("#wishlist-grid",list);attachFavorites();if(!list.length)$("#wishlist-grid").innerHTML=`<p class="muted">Your wishlist is waiting for a little inspiration. <a class="arrow-link" href="destinations.html">Explore destinations →</a></p>`}}));
const addToCart=id=>{const cart=readCart(),existing=cart.find(item=>item.id===id);if(existing){existing.quantity=Math.min(20,existing.quantity+1);saveCart(cart);toast("Traveler quantity increased in your cart")}else{cart.push({id,quantity:1});saveCart(cart);toast("Added to your trip cart")}};
const initHome=()=>{renderCards("#featured-grid",trips.slice(0,3));attachFavorites();const form=$("#newsletter-form");form?.addEventListener("submit",e=>{e.preventDefault();$("#newsletter-message").textContent="Thanks! This demo has saved your interest locally.";form.reset()})};
const initDestinations=()=>{const render=()=>{let list=[...trips],q=($("#destination-search")?.value||"").toLowerCase().trim(),cat=$("#category-filter")?.value||"all",sort=$("#sort-filter")?.value||"featured";list=list.filter(t=>(cat==="all"||t.category===cat)&&`${t.name} ${t.country} ${t.shortDescription} ${t.category}`.toLowerCase().includes(q));if(sort==="price-low")list.sort((a,b)=>a.price-b.price);if(sort==="price-high")list.sort((a,b)=>b.price-a.price);if(sort==="rating")list.sort((a,b)=>b.rating-a.rating);renderCards("#destination-grid",list);$("#result-count").textContent=`Showing ${list.length} ${list.length===1?"destination":"destinations"}`;$("#empty-state").classList.toggle("hidden",list.length>0);attachFavorites()};["#destination-search","#category-filter","#sort-filter"].forEach(s=>$(s)?.addEventListener("input",render));render()};
const initDetail=()=>{const id=new URLSearchParams(location.search).get("id"),t=getTrip(id),root=$("#destination-detail");if(!t){root.innerHTML=`<div class="empty-state"><span>✦</span><h2>Destination not found</h2><p>That place may have moved. Explore our other destinations.</p><a class="btn btn-primary" href="destinations.html">Browse destinations →</a></div>`;return}document.title=`${t.name} | TripNova`;root.innerHTML=`<div class="breadcrumb"><a href="destinations.html">Destinations</a> / ${safe(t.name)}</div><div class="detail-hero">${imageMarkup(t.images?.[0],`${t.name} scenic view`,"detail-main-image")}<div class="detail-side-gallery">${imageMarkup(t.images?.[1],`${t.name} attraction`)}${imageMarkup(t.images?.[2],`${t.name} experience`)}</div></div><div class="detail-title-row"><div><span class="eyebrow">${safe(t.category.toUpperCase())} ESCAPE</span><h1>${safe(t.name)}, <em>${safe(t.country)}</em></h1><div class="detail-meta"><span>★ ${t.rating} guest rating</span><span>◷ ${safe(t.duration)}</span><span>⌖ ${safe(t.region)}</span></div></div><div><span class="price">${money(t.price)}</span><div class="muted small-text">per traveler · demo estimate</div></div></div><div class="detail-columns"><div><h2>A place to remember</h2><p class="detail-copy">${safe(t.description)}</p><h2>Make the most of it</h2><div class="highlights">${t.highlights.map(x=>`<div class="highlight"><span>✦</span>${safe(x)}</div>`).join("")}</div><h2>Good to know</h2><p class="detail-copy"><strong>Best time to visit:</strong> ${safe(t.bestTime)}<br><strong>Suggested duration:</strong> ${safe(t.duration)}<br><strong>Travel style:</strong> ${safe(t.category)} · <strong>Included:</strong> curated itinerary and demo trip planning</p></div><aside class="booking-box"><span class="eyebrow">YOUR NEXT CHAPTER</span><p class="price">${money(t.price)} <span class="muted small-text">/ person</span></p><p>Estimated package price. Actual travel costs may vary.</p><hr><div class="mini-row"><span>Trip duration</span><strong>${safe(t.duration)}</strong></div><div class="mini-row"><span>Guest rating</span><strong>★ ${t.rating}/5</strong></div><button class="btn btn-primary btn-full" id="detail-add">Add to cart <span>＋</span></button><button class="btn btn-outline btn-full" id="detail-book">Book this trip →</button><p class="small-text">Demo booking only. No real payment or reservation.</p></aside></div>`;
 $("#detail-add").addEventListener("click",()=>addToCart(t.id));$("#detail-book").addEventListener("click",()=>{addToCart(t.id);location.href="booking.html"});
};
const initCart=()=>{const root=$("#cart-items"),summary=$("#cart-summary");const render=()=>{const cart=readCart(),lines=cart.map(item=>({...item,trip:getTrip(item.id)})).filter(item=>item.trip),total=lines.reduce((n,item)=>n+item.trip.price*item.quantity,0),travelers=lines.reduce((n,item)=>n+item.quantity,0);if(!lines.length){root.innerHTML=`<div class="empty-cart"><div class="empty-icon">♧</div><h2>Your cart is taking a little break.</h2><p class="muted">Add a destination to start planning your next escape.</p><a class="btn btn-primary" href="destinations.html">Explore destinations →</a></div>`;summary.innerHTML=`<h2>Trip summary</h2><p class="muted">Your selected destinations will appear here.</p>`;return}root.innerHTML=lines.map(({trip:t,quantity})=>`<article class="cart-item"><a class="cart-thumb" href="destination.html?id=${encodeURIComponent(t.id)}">${t.images?.[0]?`<img src="${safe(t.images[0])}" alt="${safe(t.name)}">`:`<div class="image-placeholder cart-placeholder"><span>${safe(t.name)}</span><small>Add photo in data/trips.json</small></div>`}</a><div><h3><a href="destination.html?id=${encodeURIComponent(t.id)}">${safe(t.name)}</a></h3><p>${safe(t.country)} · ${safe(t.duration)}</p><div class="quantity-control" aria-label="Traveler quantity"><button type="button" data-qty="-1" data-id="${t.id}" aria-label="Remove one traveler" ${quantity<=1?"disabled":""}>−</button><span>${quantity} ${quantity===1?"traveler":"travelers"}</span><button type="button" data-qty="1" data-id="${t.id}" aria-label="Add one traveler" ${quantity>=20?"disabled":""}>+</button></div><a class="remove-btn" href="#" data-remove="${t.id}">Remove trip</a></div><div class="cart-item-price">${money(t.price*quantity)}<small>${money(t.price)} / traveler</small></div></article>`).join("");summary.innerHTML=`<h2>Trip summary</h2><div class="summary-row"><span>Destinations (${lines.length})</span><strong>${money(total)}</strong></div><div class="summary-row"><span>Travelers (${travelers})</span><strong>${travelers}</strong></div><div class="summary-row"><span>Demo booking fee</span><strong>₹0</strong></div><div class="summary-row summary-total"><span>Estimated total</span><strong>${money(total)}</strong></div><p class="muted small-text">Price is calculated per traveler. Demo only; no real booking is made.</p><a class="btn btn-primary btn-full" href="booking.html">Proceed to demo payment →</a><a class="btn btn-outline btn-full" href="destinations.html">Add another destination</a>`;$$("[data-qty]").forEach(button=>button.addEventListener("click",()=>{const id=button.dataset.id,delta=Number(button.dataset.qty),next=readCart().map(item=>item.id===id?{...item,quantity:Math.max(1,Math.min(20,item.quantity+delta))}:item);saveCart(next);render()}));$$("[data-remove]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();saveCart(readCart().filter(item=>item.id!==a.dataset.remove));render();toast("Trip removed from cart")}))};render();window.addEventListener("storage",e=>{if(e.key==="tripnova_cart")render()})};
const initPayment=()=>{
  const form=$("#payment-form");
  const msg=$("#payment-message",form);
  if(!form||!msg)return;

  const cart=readCart();
  const lines=cart.map(item=>({...item,trip:getTrip(item.id)})).filter(item=>item.trip);
  const items=lines.map(item=>item.trip);
  if(!items.length){
    $("#checkout-summary").innerHTML=`<h2>No trips selected</h2><p class="muted">Add a destination before checkout.</p><a class="btn btn-primary btn-full" href="destinations.html">Explore destinations</a>`;
    form.classList.add("hidden");
    return;
  }

  const total=lines.reduce((n,item)=>n+item.trip.price*item.quantity,0);
  $("#checkout-summary").innerHTML=`<h2>Your trip summary</h2>${lines.map(({trip:t,quantity})=>`<div class="summary-row"><span>${safe(t.name)} × ${quantity}</span><strong>${money(t.price*quantity)}</strong></div>`).join("")}<div class="summary-row"><span>Demo fee</span><strong>₹0</strong></div><div class="summary-row summary-total"><span>Total</span><strong>${money(total)}</strong></div><p class="muted small-text">No real money will be charged.</p>`;

  const methods=$$("input[name=method]",form);
  const card=$("#card-fields",form),upi=$("#upi-fields",form),bank=$("#bank-fields",form);
  const toggle=()=>{
    const selected=$('input[name="method"]:checked',form);
    const method=selected?selected.value:"card";
    card.classList.toggle("hidden",method!=="card");
    upi.classList.toggle("hidden",method!=="upi");
    bank.classList.toggle("hidden",method!=="netbanking");
    ["cardName","cardNumber","expiry","cvv"].forEach(name=>form.elements[name].required=method==="card");
    form.elements.upi.required=method==="upi";
    form.elements.bank.required=method==="netbanking";
    clearPaymentErrors();
  };
  methods.forEach(r=>r.addEventListener("change",toggle));

  // Format card inputs for readability; validation always checks the digits only.
  form.elements.cardNumber.addEventListener("input",e=>{
    const digits=e.target.value.replace(/\D/g,"").slice(0,16);
    e.target.value=digits.replace(/(\d{4})(?=\d)/g,"$1 ").trim();
  });
  form.elements.expiry.addEventListener("input",e=>{
    const digits=e.target.value.replace(/\D/g,"").slice(0,4);
    e.target.value=digits.length>2?digits.slice(0,2)+"/"+digits.slice(2):digits;
  });
  form.elements.cvv.addEventListener("input",e=>{
    e.target.value=e.target.value.replace(/\D/g,"").slice(0,4);
  });

  const clearPaymentErrors=()=>{
    msg.textContent="";
    msg.style.color="";
    [...form.elements].forEach(el=>{
      el.removeAttribute("aria-invalid");
      el.classList.remove("field-invalid");
    });
  };
  const setPaymentError=(message,field)=>{
    msg.textContent=message;
    msg.style.color="#b42318";
    if(field){
      field.setAttribute("aria-invalid","true");
      field.classList.add("field-invalid");
      field.focus();
    }
  };
  const validPersonName=value=>{
    const normalized=value.trim().replace(/\s+/g," ");
    // Require at least two real name parts; reject numbers, symbols-only, and one-word names.
    const parts=normalized.split(" ");
    return parts.length>=2 &&
      parts.every(part=>/^[\p{L}][\p{L}'’-]{1,}$/u.test(part)) &&
      normalized.length>=5;
  };
  const passesLuhn=value=>{
    let sum=0,doubleDigit=false;
    for(let i=value.length-1;i>=0;i--){
      let digit=Number(value[i]);
      if(doubleDigit){digit*=2;if(digit>9)digit-=9}
      sum+=digit;
      doubleDigit=!doubleDigit;
    }
    return sum%10===0;
  };
  const isFutureExpiry=value=>{
    if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value))return false;
    const [month,year]=value.split("/").map(Number);
    const fullYear=2000+year;
    const now=new Date();
    return fullYear>now.getFullYear() ||
      (fullYear===now.getFullYear() && month>=now.getMonth()+1);
  };
  toggle();

  form.addEventListener("submit",e=>{
    e.preventDefault();
    clearPaymentErrors();

    const selected=$('input[name="method"]:checked',form);
    const method=selected?.value||"card";
    const btn=$("#pay-button");
    if(btn.disabled)return;

    if(method==="card"){
      const name=form.elements.cardName.value;
      const number=form.elements.cardNumber.value.replace(/\D/g,"");
      const expiry=form.elements.expiry.value.trim();
      const cvv=form.elements.cvv.value.trim();

      if(!validPersonName(name)){
        setPaymentError("Enter a valid cardholder name with at least a first name and surname. Numbers are not allowed.",form.elements.cardName);
        return;
      }
      if(!/^\d{16}$/.test(number)||!passesLuhn(number)){
        setPaymentError("Enter a valid 16-digit demo card number. Test number: 4242 4242 4242 4242.",form.elements.cardNumber);
        return;
      }
      if(!isFutureExpiry(expiry)){
        setPaymentError("Enter a valid future expiry date in MM/YY format.",form.elements.expiry);
        return;
      }
      if(!/^\d{3,4}$/.test(cvv)){
        setPaymentError("CVV must contain exactly 3 or 4 digits.",form.elements.cvv);
        return;
      }
    }else if(method==="upi"){
      const vpa=form.elements.upi.value.trim();
      if(!/^[A-Za-z0-9][A-Za-z0-9._-]{1,}@[A-Za-z][A-Za-z0-9.-]{1,}$/.test(vpa)){
        setPaymentError("Enter a valid demo UPI ID, for example traveler@upi.",form.elements.upi);
        return;
      }
    }else if(method==="netbanking"){
      if(!form.elements.bank.value){
        setPaymentError("Please select a demo bank before continuing.",form.elements.bank);
        return;
      }
    }

    if(!form.elements.demoConsent.checked){
      setPaymentError("Please confirm that you understand this is a demo payment.",form.elements.demoConsent);
      return;
    }

    msg.textContent="Validating demo payment…";
    msg.style.color="";
    btn.disabled=true;
    btn.textContent="Simulating payment…";

    setTimeout(()=>{
      const booking={
        id:"TN"+Date.now().toString().slice(-8),
        date:new Date().toISOString(),
        items:lines.map(({trip,quantity})=>({id:trip.id,quantity})),
        total,
        method,
        status:"Demo confirmed",
        email:session()?.email||""
      };
      const bookings=get("tripnova_bookings",[]);
      bookings.unshift(booking);
      put("tripnova_bookings",bookings);
      put("tripnova_cart",[]);
      updateCartCount();

      $("#success-description").textContent=`Your demo booking is confirmed for ${lines.map(({trip,quantity})=>`${trip.name} × ${quantity}`).join(", ")}.`;
      $("#ticket-content").innerHTML=`<div class="ticket-row"><span>Booking reference</span><strong>${booking.id}</strong></div><div class="ticket-row"><span>Destination(s)</span><strong>${lines.map(({trip,quantity})=>`${safe(trip.name)} × ${quantity}`).join(", ")}</strong></div><div class="ticket-row"><span>Amount (demo)</span><strong>${money(total)}</strong></div><div class="ticket-row"><span>Payment method</span><strong>${method==="card"?"Demo card":method==="upi"?"Demo UPI":"Demo net banking"}</strong></div><div class="ticket-row"><span>Status</span><strong>✓ Demo confirmed</strong></div><div class="ticket-row"><span>Date</span><strong>${new Date(booking.date).toLocaleDateString("en-IN")}</strong></div>`;
      $("#success-modal").classList.remove("hidden");

      $("#download-ticket").onclick=()=>{
        const receipt=`TRIPNOVA — DEMO BOOKING RECEIPT\n\nReference: ${booking.id}\nDestination(s): ${lines.map(({trip,quantity})=>`${trip.name} × ${quantity}`).join(", ")}\nAmount: ${money(total)}\nPayment: Demo ${method}\nStatus: Demo confirmed\nDate: ${new Date(booking.date).toLocaleString("en-IN")}\n\nNo real payment or reservation was made.`;
        const blob=new Blob([receipt],{type:"text/plain"});
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=url;
        a.download=`TripNova-Receipt-${booking.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      };
    },1200);
  });

  form.addEventListener("input",e=>{
    if(e.target.matches("input,select")){
      e.target.removeAttribute("aria-invalid");
      e.target.classList.remove("field-invalid");
    }
    if(msg.textContent && msg.style.color==="rgb(180, 35, 24)"){
      msg.textContent="";
      msg.style.color="";
    }
  });
};
const initProfile=()=>{const u=session();$("#profile-card").innerHTML=`<div class="avatar">${safe((u?.name||"T").split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase())}</div><h2>${safe(u?.name||"Traveler")}</h2><p>${safe(u?.email||"")}</p><p>${safe(get("tripnova_users",[]).find(x=>x.email===u?.email)?.phone||"")}</p><button class="btn btn-outline btn-full" id="profile-logout">Log out</button>`;$("#profile-logout").addEventListener("click",()=>{localStorage.removeItem("tripnova_session");location.href="index.html"});const bookings=get("tripnova_bookings",[]).filter(b=>!b.email||b.email===u?.email);const bookingName=item=>{const id=typeof item==="string"?item:item?.id,qty=typeof item==="string"?1:(Number(item?.quantity)||1);return `${getTrip(id)?.name||"Trip"}${qty>1?` × ${qty}`:""}`};$("#booking-history").innerHTML=bookings.length?bookings.map(b=>`<div class="booking-history-item"><div><strong>${(b.items||[]).map(bookingName).map(safe).join(", ")}</strong><small>${safe(b.id)} · ${new Date(b.date).toLocaleDateString("en-IN")}</small></div><div style="text-align:right"><strong>${money(b.total)}</strong><br><span class="status-pill">${safe(b.status||"Demo confirmed")}</span></div></div>`).join(""):`<div class="empty-state"><h3>No bookings yet</h3><p>When you complete a demo checkout, it will show up here.</p><a class="arrow-link" href="destinations.html">Find a destination →</a></div>`;const saved=get("tripnova_wishlist",[]).map(getTrip).filter(Boolean);renderCards("#wishlist-grid",saved);attachFavorites();if(!saved.length)$("#wishlist-grid").innerHTML=`<p class="muted">Your wishlist is waiting for a little inspiration. <a class="arrow-link" href="destinations.html">Explore destinations →</a></p>`};
const initContact=()=>$("#contact-form")?.addEventListener("submit",e=>{e.preventDefault();$("#contact-message").textContent="Thanks for your message! This is a frontend demo, so it has not been sent to a server.";e.target.reset();toast("Demo message validated")});
async function boot(){const page=location.pathname.split("/").pop()||"home.html";if(page!=="index.html"&&!requireAuth())return;if(page==="index.html")return;header();footer();try{const res=await fetch("data/trips.json");if(!res.ok)throw new Error("Could not load trips.json");trips=await res.json()}catch(err){console.error(err);const main=$("main");if(main)main.insertAdjacentHTML("afterbegin",`<p class="notice notice-error">Destination data could not load. Please run this project through a local server (for example, VS Code Live Server).</p>`);return}if(page==="home.html")initHome();if(page==="destinations.html")initDestinations();if(page==="destination.html")initDetail();if(page==="cart.html")initCart();if(page==="booking.html")initPayment();if(page==="profile.html")initProfile();if(page==="contact.html")initContact()}
window.addEventListener("storage",e=>{if(e.key==="tripnova_cart")updateCartCount()});
document.addEventListener("DOMContentLoaded",boot);
})();