# Smile N · do anúncio ao caixa.

Portfólio de direção criativa, campanhas e automação. O visitante vê o trabalho funcionando: anúncios em 16 canais, a conversa com IA que passa para uma pessoa, o Pix conferido e o resultado de volta no anúncio, tudo dentro de um iPhone desenhado em HTML e CSS, com o registro do sistema ao lado.

## Conteúdo

- **Hero:** a jornada viva de uma campanha (peça, conversa, registro) em sete canais.
- **Mural:** telas reais dos fluxos, cada uma com link para a jornada inteira.
- **Campanhas e anúncios:** 16 canais e 30 formatos, cada um a jornada de um anunciante fictício, de um dos 8 tipos de cliente atendidos.
- **Sites e lojas:** o caminho do primeiro toque à confirmação.
- **Sistemas e automações:** 8 automações (agente com Pix, ligação com IA, chamada no WhatsApp, Direct, Pix Automático, RCS, régua de e-mail e Telegram), com caminhos de falha.
- **Serviços e contato.** Páginas paralelas: `/criadores`, `/criadores/ao-vivo`, `/vagas`, `/privacidade` e `/creditos`.

Todas as marcas dos exemplos são fictícias e vêm de um só arquivo (`public/assets/showcase/marcas.js`). Nenhum número de resultado é apresentado; valores aparecem mascarados. As fotos e vídeos são de banco com licença aberta, com origem e licença em `scripts/assets/acervo.json` e na página `/creditos`.

O [guia da seção de canais](docs/secao-canais.md) explica o comportamento, os dados, os fluxos e como alterar cada parte.

## Executar

```bash
npm ci
npm run check          # estrutura
npm test               # testes unitários (tests/*.test.mjs)
npm run build          # o que o Railway roda
npm start
npm run test:browser   # suítes de navegador, uma por vez (Playwright)
```

Inspecione as capturas em `qa/` junto dos testes: asserts verdes não comprovam composição visual.

## Limites

O contato abre WhatsApp ou e-mail, sem afirmar envio. Os mocks de anúncio não significam publicação, e a política de segurança só aceita arquivos do próprio site.
