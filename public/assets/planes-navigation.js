/* First-party accessible navigation inspired by the public Planes Shader Nav anatomy. */
const header=document.querySelector('#site-header');
const panel=document.querySelector('#planes-menu');
const triggers=Array.from(document.querySelectorAll('[data-menu-trigger]'));
if(header&&panel&&triggers.length){
  const linkGroups=Array.from(panel.querySelectorAll('[data-menu-content]'));
  const featureCards=Array.from(panel.querySelectorAll('[data-menu-feature]'));
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  let activeCategory='';
  let openedByHover=false;
  let closeTimer=0;
  function openMenu(category,fromHover){
    window.clearTimeout(closeTimer);
    activeCategory=category;
    openedByHover=Boolean(fromHover);
    panel.dataset.category=category;
    panel.hidden=false;
    linkGroups.forEach(function(group){group.hidden=group.dataset.menuContent!==category;});
    featureCards.forEach(function(card){card.hidden=card.dataset.menuFeature!==category;});
    triggers.forEach(function(trigger){trigger.setAttribute('aria-expanded',String(trigger.dataset.menuTrigger===category));});
  }
  function closeMenu(restoreFocus){
    window.clearTimeout(closeTimer);
    if(panel.hidden)return;
    const previous=activeCategory;
    panel.hidden=true;
    activeCategory='';
    openedByHover=false;
    triggers.forEach(function(trigger){trigger.setAttribute('aria-expanded','false');});
    if(restoreFocus){const target=triggers.find(function(trigger){return trigger.dataset.menuTrigger===previous;});if(target)target.focus({preventScroll:true});}
  }
  triggers.forEach(function(trigger){
    const category=trigger.dataset.menuTrigger;
    trigger.addEventListener('click',function(event){
      event.preventDefault();
      if(activeCategory===category&&!panel.hidden){if(openedByHover){openedByHover=false;return;}closeMenu(false);}
      else openMenu(category,false);
    });
    trigger.addEventListener('pointerenter',function(){if(finePointer.matches)openMenu(category,true);});
    trigger.addEventListener('keydown',function(event){
      if(event.key==='ArrowDown'){event.preventDefault();openMenu(category,false);const first=panel.querySelector('[data-menu-content="'+category+'"] a');if(first)first.focus();return;}
      if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const index=triggers.indexOf(trigger);const next=(index+(event.key==='ArrowRight'?1:-1)+triggers.length)%triggers.length;triggers[next].focus();openMenu(triggers[next].dataset.menuTrigger,false);}
    });
  });
  header.addEventListener('pointerenter',function(){window.clearTimeout(closeTimer);});
  header.addEventListener('pointerleave',function(){if(finePointer.matches)closeTimer=window.setTimeout(function(){closeMenu(false);},140);});
  header.addEventListener('focusout',function(event){if(event.relatedTarget&&header.contains(event.relatedTarget))return;window.setTimeout(function(){if(!header.contains(document.activeElement))closeMenu(false);},0);});
  document.addEventListener('pointerdown',function(event){if(!header.contains(event.target))closeMenu(false);});
  document.addEventListener('keydown',function(event){if(event.key==='Escape'&&!panel.hidden){event.preventDefault();closeMenu(true);}});
  panel.querySelectorAll('a').forEach(function(link){link.addEventListener('click',function(){closeMenu(false);});});
  document.documentElement.dataset.planesNavigation='ready';
}
