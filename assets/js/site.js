/* BRH Coaching — site vitrine : menu mobile et formulaire de contact. */

/* Adresse qui reçoit les demandes du formulaire (service gratuit FormSubmit).
   À la première demande envoyée depuis une nouvelle adresse de site, FormSubmit envoie
   un e-mail « Activate Form » à cette adresse : cliquer une seule fois sur le lien. */
const FORM_EMAIL = "vincentbrehier.pro@gmail.com";

/* ---------- Menu mobile ---------- */
(function(){
  const menu = document.querySelector('.menu-btn');
  const tabs = document.getElementById('tabs');
  if(!menu || !tabs) return;
  menu.addEventListener('click', ()=>{
    const open = tabs.classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && tabs.classList.contains('open')){ tabs.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.focus(); }
  });
})();

/* ---------- Formulaire (page Contact) ---------- */
(function(){
  const form = document.getElementById('form');
  if(!form) return;
  const steps = [...form.querySelectorAll('fieldset[data-step]')];
  const bars = [...document.querySelectorAll('.progress li')];
  const back = document.getElementById('back');
  const next = document.getElementById('next');
  const send = document.getElementById('send');
  const result = document.getElementById('result');
  let current = 0;

  function show(i){
    steps.forEach((s,k)=> s.hidden = k!==i);
    bars.forEach((b,k)=>{ b.className = k<i ? 'done' : (k===i ? 'on' : ''); });
    back.hidden = i===0;
    next.hidden = i===steps.length-1;
    send.hidden = i!==steps.length-1;
    current = i;
  }

  function validate(i){
    const s = steps[i];
    const msg = s.querySelector('.err-msg');
    s.querySelectorAll('.invalid').forEach(e=>e.classList.remove('invalid'));
    msg.textContent = '';
    const problems = [];
    if(i===0){
      if(!s.querySelector('input[name="Formule"]:checked')) problems.push('choisissez une formule');
      if(!s.querySelector('input[name="Objectifs"]:checked')) problems.push('cochez au moins un objectif');
    }
    if(i===1){
      if(!s.querySelector('input[name="Niveau actuel"]:checked')) problems.push('indiquez votre niveau actuel');
    }
    if(i===2){
      [['prenom','votre prénom'],['email','une adresse e-mail valide'],['tel','un numéro de téléphone'],['ville','votre commune']].forEach(([id,label])=>{
        const el = document.getElementById(id);
        const ok = id==='email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) :
                   id==='tel' ? el.value.replace(/\D/g,'').length>=9 : el.value.trim()!=='';
        if(!ok){ el.classList.add('invalid'); problems.push(label); }
      });
      if(!document.getElementById('rgpd').checked) problems.push('acceptez l\'utilisation de vos informations');
    }
    if(problems.length){ msg.textContent = 'Pour continuer, ' + problems.join(', ') + '.'; return false; }
    return true;
  }

  next.addEventListener('click', ()=>{ if(validate(current)){ show(current+1); form.scrollIntoView({block:'start'}); } });
  back.addEventListener('click', ()=> show(current-1));

  // Formule présélectionnée depuis une page d'offre : /contact/?formule=domicile|distance
  const f = new URLSearchParams(location.search).get('formule');
  const pre = { domicile:'Coaching à domicile (50 €/h)', distance:'Suivi à distance (78 €/mois)' }[f];
  if(pre){ const r = form.querySelector('input[name="Formule"][value="'+pre+'"]'); if(r) r.checked = true; }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!validate(2)) return;
    if(form.querySelector('[name="_honey"]').value) return;
    const data = {};
    for(const [k,v] of new FormData(form).entries()){ data[k] = data[k] ? data[k] + ', ' + v : v; }
    delete data._honey;
    data._subject = 'Nouvelle demande de coaching : ' + (data['Prénom']||'') + ' ' + (data['Nom']||'') + ' (' + (data['Formule']||'') + ')';
    data._template = 'table';
    data._replyto = data.email;

    send.disabled = true; send.textContent = 'Envoi en cours…';
    try{
      const res = await fetch('https://formsubmit.co/ajax/' + FORM_EMAIL, {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(data)
      });
      const json = await res.json();
      finish(json.success === true || json.success === 'true');
    }catch(err){ finish(false); }
  });

  function finish(ok){
    form.hidden = ok;
    document.querySelector('.progress').hidden = ok;
    send.disabled = false; send.textContent = 'Envoyer ma demande';
    result.hidden = false;
    result.className = 'result' + (ok ? '' : ' fail');
    result.innerHTML = ok
      ? '<h2>Demande envoyée</h2><p>Merci ! J\'ai bien reçu votre demande et je vous recontacte rapidement. Une fois l\'accompagnement lancé, vous recevrez vos accès à votre espace client BRH Coaching.</p>'
      : '<h2>L\'envoi n\'a pas abouti</h2><p>Vérifiez votre connexion puis cliquez à nouveau sur « Envoyer ma demande ». Vos réponses sont conservées. Vous pouvez aussi m\'appeler au 07 81 59 32 65.</p>';
    result.focus();
  }
})();

/* ---------- Anciennes adresses en #ancre (ancien site sur une seule page) ---------- */
(function(){
  if(location.pathname !== '/') return;
  const old = { domicile:'/coaching-a-domicile/', distance:'/suivi-a-distance/', specialites:'/specialites/', parcours:'/parcours/', faq:'/questions-frequentes/', contact:'/contact/' }[location.hash.slice(1)];
  if(old) location.replace(old);
})();
