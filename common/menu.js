/* Écran de démarrage commun : couverture du jeu, titre et présentation en tête du menu de chaque jeu. */
(function(){
  var D=window.SDJ_JEU, tpl=document.getElementById('sdj-cover'); if(!D||!tpl) return;
  var norm=function(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();};
  var T=norm(D.t), AL=(D.a||[]).map(norm);
  function banner(){ var b=document.createElement('div'); b.className='sdj-ban'; b.setAttribute('aria-hidden','true'); b.innerHTML=tpl.innerHTML; return b; }
  function guideBtn(){ if(typeof window.SDJ_GUIDE!=='function') return null; var g=document.createElement('button'); g.type='button'; g.className='sdj-guide';
    g.innerHTML='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.500C4 4.700 4.700 4 5.500 4H11v15H5.500C4.700 19 4 19.700 4 20.500zM20 5.500C20 4.700 19.300 4 18.500 4H13v15h5.500c.800 0 1.500.700 1.500 1.500z"/></svg>Guide de jeu';
    g.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); window.SDJ_GUIDE(); }); return g; }
  function head(box,before){ var w=document.createElement('div'); w.className='sdj-head'; w.appendChild(banner()); var g=guideBtn(); if(g) w.appendChild(g); box.insertBefore(w,before); }
  function dress(){
    var m=document.querySelector('#modal:not([hidden]) .mbox');
    if(m&&!m.querySelector('.sdj-head')&&!m.querySelector('.hbody,[data-ht]')){
      var h=m.firstElementChild;
      if(h&&h.tagName==='H2'){ var t=norm(h.textContent), gen=/^nouve/.test(t);
        if(gen||t===T||AL.indexOf(t)>=0){ head(m,h);
          if(gen){ h.textContent=D.t; var nx=h.nextElementSibling; if(!nx||nx.tagName!=='P'){ var p=document.createElement('p'); p.className='sdj-pitch'; p.textContent=D.d; m.insertBefore(p,h.nextSibling); } }
          m.classList.add('sdj-start'); } }
    }
    var me=document.querySelector('.menu');
    if(me&&!me.querySelector('.sdj-head')){ var h1=me.querySelector('h1'); if(h1) head(me,h1); me.classList.toggle('sdj-nohead',!document.querySelector('header.top')); }
  }
  var busy=false;
  new MutationObserver(function(){ if(busy) return; busy=true; try{ dress(); }finally{ busy=false; } }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  dress();
})();
