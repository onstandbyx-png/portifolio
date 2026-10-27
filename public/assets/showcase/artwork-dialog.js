/** Enlarge authored static artwork without pretending to run the interface. */
const artwork = {
  casa: {file:'casa-costa', title:'Casa Costa · Interface final', alt:'Interface editorial Casa Costa, com fotografia de arquitetura e hierarquia para conhecer o lugar.', credit:'Estudo conceitual do projeto smiile. Direção visual e interface.'},
  trilhas: {file:'trilhas', title:'Trilhas · Interface do aplicativo', alt:'Interface Trilhas, com busca, fotografia da paisagem e apresentação do percurso.', credit:'Estudo conceitual do projeto smiile. Direção visual e UX/UI.'},
};
export function mountArtworkDialog() {
  if (document.querySelector('#artwork-dialog')) return;
  const dialog=document.createElement('dialog');
  dialog.id='artwork-dialog';dialog.className='artwork-dialog';
  dialog.setAttribute('aria-labelledby','artwork-title');
  dialog.innerHTML='<div class="artwork-inner"><header><h2 id="artwork-title"></h2><button type="button" data-art-close aria-label="Fechar imagem ampliada">Fechar ×</button></header><figure><img width="960" height="1200" alt="" loading="lazy" decoding="async" fetchpriority="low"><figcaption></figcaption></figure></div>';
  document.body.append(dialog);
  let opener=null;
  // Keep keyboard navigation within the image viewer, including its single-
  // control layout. Escape continues to use the browser's native close action.
  dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
    const first=controls[0],last=controls.at(-1);
    if(!first)return;
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
  dialog.querySelector('[data-art-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    document.documentElement.classList.remove('has-artwork-dialog');
    if(opener?.isConnected)opener.focus({preventScroll:true});
    opener=null;
  });
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[data-art-open]');
    if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const art=artwork[link.dataset.artOpen];
    if(!art||typeof dialog.showModal!=='function')return;
    event.preventDefault();opener=link;
    dialog.querySelector('h2').textContent=art.title;
    const image=dialog.querySelector('img');image.alt=art.alt;
    image.src='/assets/portfolio/static-r8/'+art.file+'.webp';
    dialog.querySelector('figcaption').textContent=art.credit;
    document.documentElement.classList.add('has-artwork-dialog');
    dialog.showModal();dialog.scrollTop=0;
    dialog.querySelector('[data-art-close]').focus({preventScroll:true});
  });
}
