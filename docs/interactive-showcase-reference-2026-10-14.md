# Experiências visuais adaptadas das referências

Revisão de alta fidelidade do portfólio, mantendo os módulos existentes da smiile.

## Origem e adaptação

- **Ecossistema Fatos / Baralho:** inspirado em \`src/components/islands/Baralho.tsx\` e \`src/styles/baralho.css\` do repositório \`onstandbyx-png/roblox\`. A cópia é uma implementação independente para o portfólio: composição em leque, profundidade, frente/verso, setas e gesto horizontal com limiar de movimento, sem reaproveitar estatísticas editoriais como resultados pessoais.
- **Fatos / mock social:** hierarquia visual e geometria da publicação inspiradas em \`src/styles/estudio-instagram.css\`. As imagens usam os arquivos originais do próprio portfólio, não endpoints externos autenticados. Todos os exemplos são identificados como estudos conceituais.
- **smiile / zoom cinematográfico:** inspirado em \`ScrollZoomPreview\` e na sequência “Uma ideia, muitas formas” do commit \`b6a2e0d\`. Os estados se transformam conforme a rolagem natural. \`prefers-reduced-motion\` desativa a animação, mas não as opções de navegação.
- **Trabalhos:** comparação entre cartões e tabela, semelhante à alternância disponível no mídia kit, mas com atribuições e entregas, não métricas da rede.

## Comportamentos e limites

O sistema usa \`Web Animations API\`, CSS transform, Observer para ativação e \`touch-action:pan-y\` para preservar a rolagem móvel. Todas as demonstrações funcionam sem contas conectadas e não iniciam campanhas, transferências ou consultas externas.

## QA

\`npm run check && npm run build\` verifica a instalação e o JS. O workflow \`.github/workflows/verify.yml\` executa Playwright nas larguras 1440, 390 e 320, preservando capturas em \`qa/\`.

