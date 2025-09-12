async function fetchListings(q=''){
  const res = await fetch('/api/listings' + (q?('?q='+encodeURIComponent(q)):'') );
  return res.json();
}

function el(tag,attrs={},children=''){ const e=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); if(typeof children==='string') e.innerHTML=children; else (children||[]).forEach(c=>e.appendChild(c)); return e; }

if(location.pathname === '/' || location.pathname === '/index.html'){
  const container = document.getElementById('listings');
  const qinput = document.getElementById('q');
  document.getElementById('searchBtn').addEventListener('click', async ()=>{
    const q = qinput.value.trim();
    const rows = await fetchListings(q);
    renderListings(rows,container);
  });
  (async ()=>{ const rows = await fetchListings(); renderListings(rows,container); })();
}

function renderListings(rows,container){ container.innerHTML='';
  rows.forEach(r=>{
    const card = el('div',{class:'card'});
    const img = r.image_filename ? `<img src="/uploads/${r.image_filename}">` : '<div style="height:160px;background:#ddd;border-radius:6px"></div>';
    card.innerHTML = img + `<h3>${r.title}</h3><p>${r.city} — $${r.price_per_night}/night</p><p>${r.description.substring(0,120)}</p><a href="/listing.html?id=${r.id}">View</a>`;
    container.appendChild(card);
  });
}

if(location.pathname.endsWith('/listing.html')){
  const id = new URLSearchParams(location.search).get('id');
  (async ()=>{
    const res = await fetch('/api/listings/' + id);
    if(!res.ok){ document.getElementById('listing').innerText='Listing not found'; return }
    const l = await res.json();
    document.getElementById('listing').innerHTML = `<h2>${l.title}</h2><p>${l.city} — $${l.price_per_night}/night</p><p>${l.description}</p>` + (l.image_filename?`<img src="/uploads/${l.image_filename}" style="max-width:400px">`:'');
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const fd = new FormData(form);
      const payload = {
        listing_id: id,
        guest_name: fd.get('guest_name'),
        guest_email: fd.get('guest_email'),
        checkin: fd.get('checkin'),
        checkout: fd.get('checkout')
      };
      const r = await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data = await r.json();
      if(r.ok) alert('Booking confirmed! ID: ' + data.id);
      else alert('Error: ' + (data.error||'unknown'));
    });
  })();
}

if(location.pathname.endsWith('/admin.html')){
  const form = document.getElementById('adminForm');
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const fd = new FormData(form);
    const pass = document.getElementById('adminPass').value;
    const r = await fetch('/api/admin/listings',{
      method:'POST', body: fd, headers: { 'x-admin-pass': pass }
    });
    const data = await r.json();
    if(r.ok) alert('Listing created — id ' + data.id);
    else alert('Error: ' + (data.error||JSON.stringify(data)));
  });
}
