# Portfólio · Ideia → Execução

Recriação orientada pelo código real de `onstandbyx-png/smiile-` no commit `b6a2e0d8312f91268a4d190b1a7a082ee1b59b38`, em especial `sites/smiile-landing/src/components/CapabilityDeck.tsx` e sua seção `#categorias`.

## Original e adaptação
- O mecanismo de categorias usa o scroll NATIVO da página, calculando o estado dos cards por progresso vertical, sem sequestrar wheel/touch.
- Em dispositivos móveis, cartões aparecem em fluxo vertical em vez de travar o scroll.
- Cartões têm frente/verso, navegação por etapas, progresso, animações de profundidade e alternativa de movimento reduzido.
- A estrutura editorial e imagens são provenientes dos projetos do usuário: [smiile landing](https://smiile-landing-preview.up.railway.app/?v=b6a2e0d#categorias) e [mídia kit Fatos](https://midia-kit-production-c234.up.railway.app/).
- Copy e imagens de campanha indicadas como *exemplos conceituais* não representam Ads veiculados ou resultados comprovados.
- As fontes Fatos/smiile são referenciadas por URL pública no HTML para que as composições possam ser inspecionadas diretamente na origem. Para uso autônomo de longo prazo, vendorizá-las após definir licença/atribuição.

## Execução local
```sh
npm run check
npm start
# http://localhost:3000/
```

## Railway
Aponte o Railway para `onstandbyx-png/portifolio` após conceder acesso da integração GitHub ao repositório e publicar esses arquivos. O projeto usa `npm start`, lê `PORT` e expõe `/health`. Alternativamente, a prévia está implantada como **Railway Function** no projeto `portifolio-preview`, serviço `portfolio-b6a2e0d-preview`. O Function usa o mesmo HTML incorporado ao código Bun e não sincroniza automaticamente com o repositório.

## Avisos
O site é um portfolio em estágio de preview. Antes da publicação comercial, definir identidade e contato aprovados, dados reais de Ads e aprovação de uso comercial das marcas.