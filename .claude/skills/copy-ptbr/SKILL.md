---
name: copy-ptbr
description: Escreve, edita e revisa copy em português do Brasil para o portfólio (hero, cases, CTAs, briefing, alt text, mensagens de erro) com afirmações honestas e verificáveis. Use ao criar ou mudar qualquer texto visível do site, em public/assets/content/portfolio-copy.js, index.html ou módulos de showcase.
when_to_use: Pedidos como "reescrever headline", "melhorar texto do case", "copy do CTA", "revisar textos" ou "deixar menos genérico".
---

# Copy pt-BR do portfólio

Palavras existem para o visitante entender e agir. Copy é conteúdo de design, não enfeite.

## Limites de verdade (checar sempre)

- Nenhum número de alcance, vendas, ROAS, conversão, cliente ou depoimento sem comprovante no repositório.
- Estudo conceitual é chamado de estudo. Mock de anúncio não é campanha veiculada.
- Fatos Desconhecidos: experiência editorial (pesquisa, pauta, roteiro, direção narrativa). Nunca "rede de mídia à venda" nem autoria integral de todo o material.
- Contato: "abrir conversa no WhatsApp", "preparar e-mail". Nunca "mensagem enviada".

## Voz

- Concreta e ativa: verbo + objeto. "Ver o roteiro", não "Saiba mais". Sentence case.
- Do ponto de vista de quem contrata: o problema da marca primeiro, a entrega depois. Nomeie coisas como o cliente nomeia (campanha, site, roteiro), não pela arquitetura (módulo, WebGL, pipeline).
- Uma função por elemento. Um CTA diz exatamente o que acontece e mantém o nome no fluxo inteiro.
- Erro e vazio orientam o próximo passo, sem pedir desculpas.

## Sinais de texto genérico a cortar

- Tríades de adjetivos ("criativo, estratégico e inovador"), "não é só X, é Y", "no mundo de hoje", "potencialize", "alavanque", "soluções".
- Destacar uma única palavra do título em cor/itálico; rótulos em CAIXA ALTA acima de tudo; "→" em todo link; meta separada por "·" sem necessidade.
- Frases que valem para qualquer portfólio. Teste: trocar o nome do profissional ainda faria sentido? Então reescreva com o detalhe específico do trabalho.

## Processo

1. Leia o texto atual e onde aparece (componente, viewport 320 px incluído).
2. Proponha 2–3 alternativas curtas com o motivo de cada uma; recomende uma.
3. Ao aplicar, ajuste testes que fixam a copy (`grep -rn "<trecho>" tests/`) apenas se a mudança for intencional, e diga isso no commit.
4. Peça ao subagente `revisor-copy` uma auditoria quando a mudança tocar várias seções.

Base adaptada de `coreyhaines31/marketingskills` (copywriting, copy-editing; MIT) e da seção de escrita de `anthropics/skills/frontend-design` (Apache-2.0).
