/* Mounts the parallel pages' components with the same modules the preview uses. */
import {mountFlip} from '/assets/pages/flip.js';
import {mountDeck} from '/assets/pages/deck.js';
import {mountBuilder} from '/assets/pages/builder.js';
import {mountCompare} from '/assets/pages/compare.js';
import {createNotebook, createPhone, createTablet} from '/assets/pages/devices.js';

mountFlip(document.getElementById('k-flip'));
mountFlip(document.getElementById('k-flip-stack'));
mountDeck(document.getElementById('k-deck'));
mountCompare(document.getElementById('k-compare'));

const form = document.getElementById('k-form');
form.addEventListener('submit', event => event.preventDefault());
mountBuilder(form, {summary: document.getElementById('k-resumo'), describe: v => ({
  lines: [v.plataforma && `Plataforma: ${v.plataforma}`, v.preciso.length ? `Preciso de: ${v.preciso.join(', ')}` : '', v.maior ? 'Maior de 18 anos' : ''],
  count: (v.plataforma ? 1 : 0) + v.preciso.length
})});

const screen = (title, line) => `<div class="lab-k-screen"><b>${title}</b><span>${line}</span></div>`;
const devices = document.getElementById('k-devices');
devices.append(
  createPhone({content: screen('Ateliê Exemplo', 'Prévia no celular')}).root,
  createNotebook({content: screen('Ateliê Exemplo', 'Cena no notebook')}).root,
  createTablet({content: screen('Ateliê Exemplo', 'Cena no tablet')}).root
);
