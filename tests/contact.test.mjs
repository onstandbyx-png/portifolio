import test from 'node:test';
import assert from 'node:assert/strict';
await import('../public/assets/profile.js');
const {contactDestination,buildBrief,createContactHref}=globalThis.PORTFOLIO_CONTACT;

test('Um contato ausente ou inválido não produz um destino inventado',()=>{
  assert.equal(contactDestination({}),null);
  assert.equal(createContactHref({email:'destino\n@example.com',whatsapp:'javascript:alert(1)'},'Oi'),null);
  assert.equal(createContactHref({whatsapp:'0000'},'Oi'),null);
});

test('WhatsApp usa código do país e codifica o briefing sem alterar acentos ou pontuação',()=>{
  const message=buildBrief('Sites e experiências digitais','Preciso de um site & app? Prazo: março.','Da ideia à experiência.');
  const result=createContactHref({whatsapp:'+55 (11) 98556-8208',email:'exemplo@example.com',preferredChannel:'whatsapp'},message);
  const url=new URL(result.href);
  assert.equal(result.channel,'whatsapp');
  assert.equal(url.origin,'https://wa.me');
  assert.equal(url.pathname,'/5511985568208');
  assert.equal(url.searchParams.get('text'),message);
  assert.match(message,/Referência do portfólio: Da ideia à experiência\./);
  assert(!/Enviado/.test(message));
});

test('E-mail mantém destinatário e resumo, sem permitir quebra de headers',()=>{
  const message=buildBrief('Conteúdo','Linha 1\nLinha 2 & mais contexto');
  const result=createContactHref({email:'projeto+site@example.com',preferredChannel:'email'},message);
  assert.equal(result.channel,'email');
  const url=new URL(result.href);
  assert.equal(decodeURIComponent(url.pathname),'projeto+site@example.com');
  assert.equal(url.searchParams.get('body'),message);
  assert.equal(url.searchParams.get('subject'),'Vamos conversar sobre um projeto');
  assert.equal(url.searchParams.size,2);
});

test('Canal alternativo funciona quando o preferido não está configurado',()=>{
  assert.equal(createContactHref({email:'projeto@example.com',preferredChannel:'whatsapp'}).channel,'email');
  assert.equal(createContactHref({whatsapp:'5511985568208',preferredChannel:'email'}).channel,'whatsapp');
  assert(!createContactHref({email:'projeto@example.com'}).href.includes('?'));
});

test('Os canais confirmados de Smile N produzem os destinos reais esperados',()=>{
  const profile=globalThis.PORTFOLIO_PROFILE;
  assert.equal(profile.name,'Smile N');
  const message=buildBrief('Projeto integrado','Uma campanha, seu site e um fluxo de atendimento.');
  const whatsapp=new URL(createContactHref(profile,message).href);
  assert.equal(whatsapp.origin+whatsapp.pathname,'https://wa.me/5511985568208');
  assert.equal(whatsapp.searchParams.get('text'),message);
  const email=new URL(createContactHref({...profile,preferredChannel:'email'},message).href);
  assert.equal(email.protocol,'mailto:');
  assert.equal(decodeURIComponent(email.pathname),'smillepls@gmail.com');
  assert.equal(email.searchParams.get('body'),message);
});
