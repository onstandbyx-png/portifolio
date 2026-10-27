# Fidelidade por rede: especificação para reconstruir os fluxos do portfólio

**Data de referência:** terça-feira, 27/10/2026. **Aparelho do mock:** iPhone 17 Pro Max em tela de 412 × 895 px (lógico).
**Para quem é:** quem vai reescrever os mocks em `public/assets/showcase/campaign-channels.js`, `automation-flows.js` e `lab-telas.js`.

## 0. Como ler este documento

**Marcadores usados em cada afirmação**

| Marcador | Significado |
|---|---|
| **[OK]** | Confirmado em fonte oficial ou pelo verificador, com texto literal quando é string de interface. |
| **[CORRIGIDO]** | O verificador corrigiu a afirmação original; vale a versão corrigida que está aqui. |
| **[OBS]** | Padrão observado de interface, sem documento oficial. Usar, mas não tratar como regra. |
| **[?]** | Não confirmado (em pt-BR, no Brasil ou em 2026). Usar só se não houver alternativa e deixar fácil de trocar. |

**Fontes:** cada seção termina com a lista de fontes (URL e data). As referências no texto usam o prefixo da seção, por exemplo [IG3] ou [WA2].

**De onde vem o conteúdo**
- Instagram e Facebook/Messenger: especificação pesquisada e checada por um verificador em 27/10/2026. As afirmações refutadas foram retiradas e as correções foram aplicadas.
- TikTok e YouTube: especificação pesquisada em 27/10/2026. O veredito do verificador chegou truncado, então reconferi hoje os pontos que mudam o mock (tempos de CTA do TikTok, botão Pular, banner complementar, Shorts). O que não reconferi está marcado [OBS] ou [?].
- Demais canais (LinkedIn, Google, SEO, ChatGPT, Maps, WhatsApp, Telegram, RCS, voz, Pix Automático, e-mail, artigo): páginas oficiais lidas nesta sessão (Apple pt-BR, Meta for Developers, Google Ads Help, BCB, Telegram, LinkedIn, Mobile Time, Meio & Mensagem) e as notas de pesquisa de 27/10/2026 já salvas no repositório em `research_notes/Automações complexas por canal/`.

**Limites desta rodada**
- O orçamento de buscas na web e os créditos do Firecrawl acabaram durante a pesquisa. Por isso o resto foi feito lendo diretamente páginas oficiais já conhecidas.
- Não houve acesso a capturas de tela atuais. Medidas em px sem fonte são estimativas de layout, não números da plataforma.

**Escala do mock:** o iPhone 17 Pro Max tem 440 × 956 pt; o mock de 412 × 895 é a mesma tela × 0,936. Para converter uma medida em pt, multiplique por 0,936. Essas dimensões vêm das especificações conhecidas da Apple e não foram reverificadas nesta sessão.

---

## 1. Moldura comum: iPhone e iOS (vale para todas as telas)

### 1.1 Layout e proporções
- **Versão do sistema.** Em out/2026, o sistema atual é o iOS 27. O Manual de Uso da Apple já lista iOS 27, iPhone 18 Pro e iPhone Duo [IOS1] [OK]. O iPhone 17 Pro Max é o modelo do ano anterior, o que é coerente com um usuário comum.
- **Área segura superior.** Status bar com Dynamic Island: cerca de 62 pt, ou ~58 px no mock [OBS]. A hora da status bar deve bater com a hora das mensagens da cena.
- **Indicador home.** Cerca de 34 pt, ou ~32 px [OBS]. Nenhum botão de CTA pode ficar embaixo dele.
- **Voltar ao app anterior.** Quando o fluxo troca de app (Instagram para WhatsApp, WhatsApp para o banco), o iOS mostra no canto superior esquerdo o atalho "◀ Nome do app de origem" [OBS]. O repo já faz isso em `cm-crumb`, e deve continuar.
- **Navegadores dentro dos apps.** Instagram, Facebook, TikTok e o ChatGPT abrem links num navegador próprio, que sobe como modal, e não no Safari. O Safari só aparece quando o usuário escolhe "abrir no navegador". Ver seções 2.8, 3.2 e 4.1.

### 1.2 Erros a evitar
- **Dia da semana errado ou data no passado.** Hoje é terça, 27/10/2026, e há dois erros no repo hoje:
  - Test drive marcado para "sábado, 24 de outubro", que já passou (`waChamada`).
  - Tela bloqueada com "terça-feira, 4 de novembro", quando 04/11/2026 é quarta-feira (`pixAuto`).
- **Hora fixa.** Todas as mensagens às 10:09, com a status bar marcando outra hora. Ver o modelo de dados na seção 18.

### Fontes
- [IOS1] Apple, Manual de Uso do iPhone (pt-BR), índice com seletor iOS 27 / iOS 26: https://support.apple.com/pt-br/guide/iphone/iph3c9951d7/ios (acessado em 27/10/2026)

---

## 2. Instagram

### 2.1 Moldura do app Instagram (abas, cabeçalho)
**Layout**
- **Barra superior do Início:** cerca de 44 px, com o wordmark e o coração de notificações à direita [OBS]. Logo abaixo ficam os Stories, com avatares de 64 px e anel em gradiente.
- **Barra inferior:** ~48 px + indicador home, cinco abas **só com ícones**, sem texto: Início, Reels, Mensagens, Explorar/Pesquisa, Perfil. Reels é a 2ª aba e Mensagens a 3ª, no centro. Dá para deslizar de uma aba para a outra [CORRIGIDO] [IG1][IG2].
- **Botão Criar (+):** a posição no canto superior esquerdo **não está confirmada**. A Storrito afirma isso, mas os guias oficiais de 2026 citam "+ no canto superior direito" (Stories) e "+ na parte inferior" (Reels) [CORRIGIDO] [IG3]. No mock, não desenhe o + em posição nenhuma. Para abrir a câmera, use o gesto de deslizar o feed para a direita, que está confirmado.
- **Cores observadas** [OBS]:

  | Uso | Cor |
  |---|---|
  | Texto, tema claro | #000 |
  | Texto, tema escuro | #F5F5F5 |
  | Texto secundário | #737373 |
  | Divisória | #DBDBDB |
  | Azul de ação | #0095F6 |
  | Vermelho (curtida e badge) | #FF3040 |

- **Tipografia:** SF Pro nos textos de interface [OBS].

**Textos pt-BR**
- Abas: "Início", "Reels", "Mensagens", "Explorar", "Perfil" [OK, Canaltech, IG2].
- Aviso de migração de layout: "Atualizar agora" / "Deixar para depois" [OK, IG2]. Só faz sentido em out/2025, não use em 2026.

**Transições:** tocar numa aba troca o conteúdo na hora, sem animação de push. O deslize horizontal entre abas é novo [OK, IG1].

**Erros a evitar**
- Pôr o + no centro da barra inferior (layout de 2023–2025).
- Incluir a aba "Loja", que saiu em 2023 [IG4].
- Pôr legenda de texto sob os ícones.
- Deixar o ícone do Direct no canto superior direito em vez da aba central.

### 2.2 Anúncio em carrossel no Feed (no repo: `igFeed`, Speak Up Idiomas)
**Layout, de cima para baixo, em 412 px**
1. **Cabeçalho (~54 px).** Avatar de 32 px, nome de usuário em negrito de 13–14 px e, embaixo, **"Anúncio"** em cinza de 12 px. Na direita, o "•••". Sem data nem hora [OK, IG5][OBS].
2. **Mídia.** Proporção 4:5 (412 × 515) quando o carrossel só tem imagens, e **1:1 (412 × 412) se houver qualquer vídeo**. Todos os cards têm a mesma proporção. São de 2 a 10 cards, e cada um tem link, título e CTA próprios [OK, IG6]. Ao deslizar, aparece no canto superior direito a pílula "1/5", que some depois de 2–3 s [OBS].
3. **Barra de CTA.** Ocupa a largura toda logo abaixo da mídia, com ~44 px: o texto da CTA à esquerda e "›" à direita. **Não pode ficar flutuando sobre a imagem** [OK, IG5: "poderão conter um botão de chamada para ação sob a imagem"].
4. **Linha de ações (~44 px).** Curtir, comentar, compartilhar e, à direita, salvar. Os pontos do carrossel ficam centralizados nesta linha, com o ponto ativo em azul [OBS].
5. **Curtidas, legenda e comentários.** "1.284 curtidas", depois a legenda com o usuário em negrito, cortada em ~2 linhas com "… mais" (recomendado: até 125 caracteres [OK, IG6]), e por fim "Ver todos os 12 comentários" [OBS].

**Textos pt-BR**
- Rótulo do anúncio: **"Anúncio"**. A página da Meta diz: "Anúncios que antes eram identificados com o rótulo 'Patrocinado' passarão a ter o rótulo 'Anúncio'" e "Todos os anúncios do Instagram terão um rótulo Anúncio" [OK, IG5][IG7].
- Menu "•••" ("Opções"): "Tenho interesse", "Não tenho interesse", "Denunciar anúncio". As subtelas são "O que tornou esse anúncio desinteressante?" e "Por que você está denunciando este anúncio?" [OK, IG8].
- CTAs oficiais, que só podem vir da lista da Meta [OK, IG9]: "Saiba mais", "Comprar agora", "Cadastrar-se", "Inscrever-se agora", "Pedir agora", "Obter oferta", "Obter cotação", "Ver detalhes", "Reservar agora", "Solicitar horário" (destino Site), "Ver menu", "Enviar mensagem", "Enviar mensagem pelo WhatsApp", "Assinar", "Baixar", "Assistir mais", "Ligar agora" (só em alguns objetivos).
- Atenção às variantes da própria Meta [CORRIGIDO]:
  - "Enviar mensagem do WhatsApp" (tabela de Vendas) e "Enviar mensagem pelo WhatsApp" (Reconhecimento e Engajamento).
  - "Fale conosco" e "Falar conosco".
  - A tabela do objetivo Tráfego está em inglês até na página pt-BR, então os textos desse objetivo não têm confirmação em pt-BR.

**Jornada (Speak Up Idiomas, objetivo Leads ou Vendas, destino Site)**
1. **Quadro 1.** Marina rola o Feed e vê o card 1 com o gancho ("Você entende a série sem legenda?"). Embaixo, "Anúncio" e a barra "Inscrever-se agora" [OK no repo].
2. **Quadro 2.** Ela desliza até o card 3, onde a barra ganha destaque de cor depois de 3–4 s. O destaque é aproximado: só há registro histórico de ~4 s, e não está confirmado para 2026 [OBS, IG10].
3. **Quadro 3.** Ela toca, e o navegador do Instagram sobe de baixo para cima em ~300 ms, com barra de progresso azul.
4. **Quadros 4 e 5.** Na página da escola, ela escolhe o nível e o horário (quinta, 29/10, 19h) e confirma.
5. **Quadro 6.** Ela fecha com "X" e volta ao Feed **na mesma posição**.

**Bastidor**
- O Pixel e a Conversions API disparam PageView, ViewContent e Lead (ou Schedule, que é um evento padrão da Meta), com `event_id` para eliminar duplicidade.
- Depois, a confirmação sai por e-mail e por template de utilidade do WhatsApp, fora do Instagram.

**Erros a evitar**
- Usar "Patrocinado" como rótulo, que hoje está em `lab-telas.js` em todas as telas do Instagram.
- Inventar CTA. No repo há "Agendar aula" (story), "Ver cardápio" (Reels), "Ver cardápio de sábado" (Live) e "Agendar avaliação" (Explorar).
- Pôr vídeo num carrossel 4:5.
- Pôr data ou hora no cabeçalho.
- Mostrar checkout nativo do Instagram para uma loja brasileira. Os cartões virtuais anunciados em jun/2026 não estão confirmados no Brasil [IG11].

### 2.3 Anúncio no Reels (no repo: `igReels`, Casa Amaro)
**Layout**
- **Vídeo.** 9:16 em tela cheia, entre reels orgânicos. Resolução recomendada 1440 × 2560 [OK, IG12].
- **Coluna direita.** Fica na metade inferior: curtir, comentar, compartilhar (cada um com contagem), "•••" e o quadrado do áudio [OBS].
- **Bloco inferior esquerdo.** Avatar de 28–32 px, nome e o botão "Seguir" em pílula; abaixo, "Anúncio"; depois a legenda de 1–2 linhas com "… mais" (texto principal recomendado: 44 caracteres [OK, IG12]); por fim, a linha de áudio.
- **CTA.** Barra arredondada quase da largura toda, com margens de ~12 px e ~40 px de altura, translúcida [OBS].
- **Zonas seguras oficiais** [OK, IG12]. São áreas que o criativo deixa livres de texto e logo, porque a interface e a CTA cobrem essas faixas:

  | Faixa | Proporção | No mock |
  |---|---|---|
  | Topo | 14% | ~125 px |
  | Base | 35% | ~313 px |
  | Cada lateral | 6% | ~25 px |

**Textos pt-BR**
- Rótulo "Anúncio" [OK].
- Para restaurante, as CTAs oficiais adequadas são **"Ver menu"**, "Reservar agora" e "Pedir agora" [OK, IG9]. "Ver cardápio" não existe.
- A linha de áudio deve dizer "Áudio original" [OBS]. O anúncio de Reels **não pode usar música licenciada**, efeito de câmera, GIF nem etiqueta de produto [OK, IG12].

**Transições**
- Deslizar para cima troca para o próximo reel com snap de ~300 ms.
- Toque duplo curte: o coração aparece no centro por ~600 ms. Tocar e segurar pausa.
- Ao terminar, o vídeo volta ao início em loop.
- A CTA fica visível desde o começo e ganha cor em ~3–4 s [OBS].
- Toque na CTA abre o navegador interno como modal.

**Erros a evitar**
- Texto do criativo dentro dos 35% inferiores.
- Nome de música famosa na linha de áudio.
- Esquecer a coluna de ações.

### 2.4 Anúncio no Stories (no repo: `igstory`, Speak Up Idiomas)
**Layout**
- Visualizador em tela cheia, 9:16 (1080 × 1920). Imagem fica 5 s na tela por padrão [OK, IG13].
- Topo: barras de progresso segmentadas de ~2 px. Cabeçalho com avatar de 32 px, nome e **"Anúncio" no lugar onde o story orgânico mostra o tempo**. À direita, "•••" e "X".
- Base: a **"figurinha de chamada para ação padrão"**. Ela é colocada automaticamente na parte inferior (pílula branca com o texto da CTA) e pode ser reposicionada em criativos 9:16 [OK, IG14].
- Zonas seguras: deixar ~14% do topo e ~20% da base livres [OK, IG14].

**Textos pt-BR**
- "figurinhas de chamada para ação padrão", que é o termo oficial [OK, IG14].
- A "figurinha de link" (ícone de corrente) **só existe em stories orgânicos** [OK, IG14].
- CTA para a escola: "Reservar agora", "Cadastrar-se" ou "Saiba mais". **"Agendar aula" não existe.**

**Transições**
- O anúncio entra entre stories de contas diferentes com o cubo 3D de ~350 ms [OBS].
- Toque na metade direita avança, na esquerda volta. Segurar pausa e esconde a interface. Arrastar para baixo fecha.
- Toque na figurinha abre o navegador interno, subindo de baixo.

**Erros a evitar**
- Usar "Arraste para cima" ou desenhar seta de swipe-up (o gesto foi substituído em 2021).
- Usar a figurinha de link em anúncio.
- Mostrar "2 h" ao lado do nome.
- Pôr texto nos 20% de baixo.
- Combinar enquete e CTA.

**Disponibilidade:** a figurinha de CTA ainda está sendo liberada aos poucos [CORRIGIDO]. A Meta diz: "Talvez ele ainda não esteja disponível para você".

### 2.5 Live e anúncio de Live (no repo: `iglive`, Casa Amaro)
**Contexto [CORRIGIDO]**
- Os anúncios de vídeo ao vivo chegaram ao Instagram com **disponibilidade global a partir de 29/09/2026** [IG15]. Não é um lançamento só do Brasil.
- O mínimo de 1 mil seguidores e o ROAS mediano de 3,3x vêm só da imprensa brasileira [IG16][IG17]. O ROAS aparece só na Fast Company Brasil, que cita a youPIX.

**Layout**
- **No anúncio.** A própria transmissão é o criativo e aparece no Feed, Reels ou Stories, com o selo "AO VIVO" e "Anúncio" sob o nome [?: o desenho exato da unidade de anúncio não está documentado].
- **No visualizador da Live.** No topo: avatar, nome, selo "AO VIVO" (retângulo em gradiente magenta/vermelho, ~11 px, caixa alta), contagem de espectadores e "X". No terço inferior esquerdo: comentários com fade no topo. Na direita, corações flutuando. Na base: campo de comentário [OBS].

**Jornada (Casa Amaro, sexta 30/10/2026, 19h, live "Feijoada de sábado")**
1. Marina, que não segue a página, vê no Reels a unidade "AO VIVO" com "Anúncio" e toca para entrar.
2. A apresentadora pede: "Comenta FEIJOADA que eu te mando o link da encomenda".
3. Marina comenta "FEIJOADA". Em segundos chega uma DM em **"Solicitações"**, com texto e botão "Quero o link".
4. Ela toca no botão, o que abre a janela de 24 h. Chega um card com "Ver menu" (URL) e "Falar com a casa" (postback).
5. Ela toca em "Ver menu", e o navegador interno abre a página de encomenda e retirada.

**Bastidor**
- O webhook `live_comments` entrega cada comentário da live.
- A resposta privada é uma só por comentário e **só pode ser enviada enquanto a live está no ar** [OK, IG18].
- Depois da live, nada automático é enviado sem nova interação da pessoa.

**Erros a evitar**
- **"Sacola" ou carrinho dentro da Live do Instagram**, que é o que o repo faz hoje no passo de conversão. As ferramentas de compra em live anunciadas são do Facebook; a imprensa ressalta que promover a live "não significa confirmar a disponibilidade de todas as ferramentas de compra" [IG17].
- CTA "Ver cardápio de sábado". Use "Ver menu".
- DM enviada depois do fim da live.

### 2.6 Explorar (no repo: `igexplore`, Vilela Odontologia)
**Layout**
- Grade de 3 colunas com campo "Pesquisar" no topo [OBS].
- O anúncio é **um bloco 1×1 na grade, só com o logotipo da conta e o rótulo "Anúncio"**, sem CTA nem texto [OK, IG19].

**Transição [OK, IG19]**
- Desde jan/2026, tocar em qualquer bloco abre um **visualizador imersivo de Reels** em tela cheia (zoom a partir do bloco, ~300 ms [OBS]).
- Ali, os anúncios seguintes são do posicionamento Reels, com o layout da seção 2.3.
- Voltar retorna à grade na mesma posição.

**Erros a evitar** (os três primeiros estão no repo hoje)
- Usar "Patrocinado".
- Abrir um "post aberto" em sheet ao tocar no bloco.
- Usar a CTA "Agendar avaliação". O correto é "Solicitar horário" (destino Site) ou "Saiba mais".
- Bloco maior que 1×1.

### 2.7 Comentário com palavra-chave que vira Direct (no repo: `igDirect`, Ponto Tech)
**Layout**
- **Comentários.** Sheet que sobe a 75–90% da altura, com alça e o título "Comentários". Cada comentário tem avatar de 32 px, @ em negrito, tempo, texto, "Responder" e coração. A resposta pública da marca fica aninhada, com recuo de ~44 px. Na base, o campo "Adicione um comentário…" [OBS].
- **Direct.** Bolha recebida cinza #EFEFEF (claro) ou #262626 (escuro). A bolha enviada usa o gradiente ou o tema do usuário. Abaixo da última enviada aparece "Visto". O campo de texto é "Mensagem…" [OBS].
- **Respostas rápidas.** Pílulas acima do campo de texto.
- **Card (modelo genérico).** Imagem ~1,91:1, título em negrito e até 3 botões [OK, IG20].

**Regras que aparecem na interface** [OK, IG18][IG21]
- É **uma resposta privada por comentário**, em até 7 dias do comentário. A mensagem inclui um link para o post comentado.
- Se a pessoa não segue a conta, a DM cai em **"Solicitações"**.
- Mensagens seguintes só depois que o usuário responder ou tocar num botão de postback ou resposta rápida, e em até 24 h dessa interação.
- Botão de URL **não** abre a janela de conversa.
- Respostas rápidas: no máximo 13, com 20 caracteres cada. Telefone e e-mail como resposta rápida estão desativados.
- Texto da mensagem: até 1000 bytes.
- Modelo genérico: até 10 cards, título e subtítulo com 80 caracteres, até 3 botões (só postback e web_url).

**Jornada (Ponto Tech, terça 27/10/2026)**

| Hora | O que acontece |
|---|---|
| 12:10 | Marina comenta "BRANCO" no Reel. |
| 12:10 | Resposta pública aninhada, variando o texto: "@marina.alves te mandei no Direct". |
| 12:10 | DM em Solicitações: "Oi, Marina! Aqui é a assistente automática da Ponto Tech. Toque abaixo para entrar na lista de espera do Creator 15 branco." Botão "Entrar na lista" (postback). |
| 12:14 | Ela aceita a solicitação e toca no botão, o que abre a janela de 24 h. Chega um card com "Ver especificações" (URL) e "Falar com vendedor" (postback). Depois, a resposta rápida "Quer o aviso por aqui?" com "Sim" e "Não". |
| Novembro | Quando o produto voltar, **a janela de 24 h já terá fechado**. Mensagem automática de marketing fora da janela não é permitida no Instagram. O aviso de reposição deve ir por e-mail, WhatsApp (template de marketing com opt-in) ou RCS. A tag HUMAN_AGENT serve só para resposta humana em até 7 dias. |

**Erros a evitar**
- **Contradição de tempo no repo:** o criativo diz "O branco volta em novembro", mas a DM de reposição chega "Hoje 18:40". Escolha uma das duas versões:
  - (a) reposição no mesmo dia, dentro de 24 h;
  - (b) reposição em novembro, por outro canal.
- O rótulo "Resposta automática" acima da bolha não existe no Instagram. O aviso de automação vai no próprio texto.
- Respostas públicas idênticas.
- Mandar várias DMs sem interação.
- Apresentar a palavra-chave em anúncio como recurso padrão. O "Reply to Keywords" (até 5 palavras-chave, uma única DM para todas) está em teste só para alguns anunciantes desde 25/08/2026 [OK, IG22].

### 2.8 Direct por clique em anúncio e navegador interno (apoio a `waAd`, `igDirect` e todos os CTAs para site)
**Clique para Direct** [OK, IG23][IG21]
- CTA "Enviar mensagem".
- A conversa abre com a miniatura do anúncio, a saudação e as perguntas, configuradas no Gerenciador em "Saudação" e "Perguntas".
- A mensagem do usuário **não é enviada sozinha**: ele precisa tocar numa opção ou digitar.
- A primeira mensagem vinda do anúncio abre uma janela de **até 7 dias**.
- Não pode ser direcionado a menores de 18.
- Perguntas frequentes da conta: no máximo 4.

**Navegador interno**
- Modal que sobe de baixo.
- Cabeçalho: "X" à esquerda; no centro, o título da página em negrito e, embaixo, o domínio com cadeado; "•••" à direita. Barra de progresso fina [OBS, IG24].
- O menu "Opções" leva a "Configurações do navegador" [OK, IG24]. O rótulo exato de "Abrir no navegador externo" em pt-BR não está confirmado [?].

**Erros a evitar**
- Abrir o Safari direto.
- Barra de endereço editável estilo Safari.
- Transição de push lateral para o navegador.

### Fontes Instagram
- [IG1] Adam Mosseri, vídeo/post sobre as novas abas (18/10/2025): https://www.facebook.com/adam/videos/if-you-havent-already-youll-soon-see-the-option-to-try-new-instagram-tabs-the-fi/1489446455641580/
- [IG2] Canaltech, "Instagram remodela visual do app com abas e novos gestos" (20/10/2025): https://canaltech.com.br/apps/atualizou-ai-instagram-remodela-visual-do-app-com-abas-e-novos-gestos/
- [IG3] Instagram, guias oficiais de Stories e Reels (pt-BR, 2026, lidos em 27/10/2026): https://about.instagram.com/blog/tips-and-tricks/how-to-use-instagram-stories/?locale=pt_BR ; https://about.instagram.com/blog/tips-and-tricks/how-to-make-instagram-reels/?locale=pt_BR. Fonte contrária: Storrito (sem data, descreve mar/2026): https://storrito.com/resources/what-instagrams-navigation-redesign-actually-changed/
- [IG4] TechCrunch, remoção da aba Loja (09/01/2023, histórico): https://techcrunch.com/2023/01/09/instagram-is-removing-the-shop-tab-moving-reels-from-the-center-spot-in-design-overhaul-next-month/
- [IG5] Meta, "Sobre os formatos de anúncios no Instagram" (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/877053729032543
- [IG6] Meta Ads Guide, carrossel no Feed do Instagram (acessado em 27/10/2026): https://www.facebook.com/business/ads-guide/update/carousel/instagram-feed/outcome-awareness
- [IG7] Social Media Today, troca de "Sponsored" por "Ad" (16/03/2026): https://www.socialmediatoday.com/news/meta-is-switching-up-its-ad-transparency-labels-in-stream/814890/
- [IG8] Instagram Help, feedback sobre anúncios (pt-BR, acessado em 27/10/2026): https://help.instagram.com/615366948510230/?locale=pt_BR
- [IG9] Meta, "Botões de chamada para ação disponíveis no Gerenciador de Anúncios" (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/410873986524407
- [IG10] MediaPost, destaque da CTA após ~4 s (2016, histórico): https://www.mediapost.com/publications/article/284988/
- [IG11] Meta, Cannes 2026 "discovery into purchase" (17/06/2026): https://www.facebook.com/business/news/cannes-2026-discovery-into-purchase
- [IG12] Meta Ads Guide, vídeo no Instagram Reels (acessado em 27/10/2026): https://www.facebook.com/business/ads-guide/update/video/instagram-reels
- [IG13] Meta, requisitos de design do Stories (pt-BR): https://pt-br.facebook.com/business/help/2222978001316177
- [IG14] Meta, figurinha de link e figurinhas de CTA padrão (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/529979981436890
- [IG15] Meta, IAB Global Creator Week (15/09/2026): https://www.facebook.com/business/news/iab-global-creator-week-making-it-easier-for-businesses-to-partner-with-creators
- [IG16] Mobile Time (29/09/2026): https://www.mobiletime.com.br/noticias/29/09/2026/instagram-live-ads-bra/
- [IG17] Fast Company Brasil (05/10/2026): https://fastcompanybrasil.com/tech/instagram-live-video-ads-chega-ao-brasil-nova-forma-publicidade/
- [IG18] Meta for Developers, Private Replies (atualizado em 30/06/2026): https://developers.facebook.com/documentation/instagram-platform/private-replies
- [IG19] Meta, "Sobre anúncios no Explorar do Instagram" (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/468874930636689
- [IG20] Meta for Developers, Generic Template IG (atualizado em 30/06/2026): https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api/generic-template
- [IG21] Meta for Developers, Messaging API IG (atualizado em 28/09/2026), Quick Replies (05/10/2026) e Ice Breakers (30/06/2026): https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-instagram-login/messaging-api
- [IG22] Social Media Today (25/08/2026): https://www.socialmediatoday.com/news/meta-tests-auto-dm-response-for-instagram-ad-comments/828791/ ; Jon Loomer (25/08/2026): https://www.jonloomer.com/reply-to-keywords-meta-ads-feature/
- [IG23] Meta, "Como criar anúncios de clique para o Instagram Direct" (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/198088077975174 ; modelo de mensagem: https://pt-br.facebook.com/business/help/287043621933356
- [IG24] Instagram Help, configurações do navegador: https://help.instagram.com/1255727395294269/ ; guias de terceiros (2026): https://www.flyn.to/blog/instagram-in-app-browser , https://u2l.ai/blog/instagram-in-app-browser

---

## 3. Facebook (e Messenger, como apoio)

### 3.0 Rótulo de anúncio no Facebook [CORRIGIDO]
- A página pt-BR atual da Meta diz: "Atualizamos a forma como os anúncios são rotulados no Facebook e no Instagram. Anúncios que antes eram identificados com o rótulo 'Patrocinado' passarão a ter o rótulo 'Anúncio'". Mas ressalva que "esse recurso pode não estar disponível na sua região" [FB1].
- Recomendação para out/2026: **"Anúncio" nos dois apps**, com uma nota fora do celular explicando que a troca é gradual.
- O que não pode é misturar os dois rótulos no mesmo portfólio. Hoje, `lab-telas.js` usa "Patrocinado" e o ChatGPT usa "Anúncio".

### 3.1 Carrossel no Feed com formulário instantâneo (no repo: `fbFeed`, Atlântica Incorporadora)
**Layout**
- **Barra de abas no iOS.** Fica **embaixo**: Início, Reels, Amigos, Marketplace, Notificações, Menu [OBS]. "Vídeo" virou "Reels" [CORRIGIDO]: o anúncio de 17/06/2025 falava em "nos próximos meses", não em junho [FB2].
- **Cabeçalho do post (~56 px).** Avatar de ~40 px. Nome de exibição da Página em negrito (**não** o @). Na 2ª linha, em cinza #65676B: "Anúncio ·" seguido do ícone de globo. À direita, "…" e "X".
- **Texto principal.** Recomendado: 80 caracteres. Corta em ~3 linhas com "… Ver mais" [OBS].
- **Cards.** De 2 a 10, em 1:1 (1080 × 1080), cada um com ~80% da largura para o próximo aparecer na borda, com espaço de ~8 px entre eles [OK, FB3].
- **Rodapé de cada card.** Título em negrito (recomendado: 20 caracteres), descrição opcional (18 caracteres) e, à direita, a CTA em **cinza #E4E6EB, com texto escuro, ~32–36 px de altura e raio de ~6 px**.
- **Card final opcional.** Foto da Página e "Ver mais" [OK, FB4].
- **Ações:** "Curtir · Comentar · Compartilhar" [OBS].

**CTAs válidas para o formulário instantâneo** [OK, FB5]
- "Inscrever-se agora", "Reservar agora", "Baixar", "Obter oferta", "Obter cotação", "Saiba mais", "Ver detalhes", "Cadastrar-se", "Assinar".
- **"Agendar agora" não é CTA de anúncio.** É botão de *Página* [FB6].
- Para a incorporadora, use "Saiba mais" ou "Obter cotação".

**Formulário instantâneo (modal nativo, não página web)** [OK, FB7–FB12]
- **Partes:** Introdução (opcional), Perguntas, Política de privacidade (obrigatória) e Conclusão.
- **Tipos:** "Mais volume (padrão)", "Maior intenção" e "Criativo avançado".
  - "Maior intenção" acrescenta um texto sob os campos avisando que a empresa pode entrar em contato, além de uma **tela de revisão**.
  - Só roda no feed do Facebook e do Instagram em celular.
- **Preenchimento automático.** Inclui "número do WhatsApp" e "CPF (Brasil)", com uma só pergunta de documento por formulário.
- **Edição.** Todos os campos podem ser editados, menos data de nascimento.
- **Perguntas proibidas:** renda, saúde, documentos como pergunta personalizada, entre outras.
- **Verificação por SMS** (opcional). Exige o código, não aceita telefone fixo e não pede de novo por 90 dias.
- **Botão de envio:** "Enviar". O texto de consentimento ao lado é [OBS, cópia pt-BR antiga; em 2026 pode dizer "A Meta"]: "Ao clicar em Enviar, você concorda em enviar suas informações para a Página [Nome]…".
- **Ações na tela de conclusão:**
  - "Ir para o site", "Resgatar código promocional", "Ver arquivo", "Ligar para a empresa", "Marcar horário", "Conversar no WhatsApp".
  - **Desde 23/06/2026,** "Marcar horário" pode abrir um **calendário embutido** (Calendly ou HighLevel; HubSpot desde agosto), com nome, e-mail e telefone já preenchidos.
  - Isso vale só no app do Facebook, e a disponibilidade global estava prevista para outubro [OK, FB13]. No Instagram, vira botão "Book time" que abre o navegador interno ([?] pt-BR).
- **Agente de IA conversacional para leads (Lead Capture AI):** **só em inglês**. Não mostrar em pt-BR [FB14].

**Jornada (Atlântica, objetivo Leads, "Maximizar o número de leads qualificados")**
1. Marina desliza até o card "Plantas de 3 e 4 quartos" e toca em "Saiba mais".
2. O modal sobe em ~300 ms e mostra a Introdução ("Visita ao decorado com hora marcada").
3. Pergunta: "Quantos quartos?", com as opções 3 e 4.
4. Contato já preenchido.
5. Código por SMS.
6. Tela de revisão e "Enviar".
7. Conclusão "Pronto! Escolha um horário", com "Marcar horário" e o calendário: sábado, 31/10/2026, às 10h.

**Bastidor**
- Webhook `leadgen` em segundos, seguido de `GET /{leadgen_id}`. O lead entra no CRM, guardando o lead_id de 15–17 dígitos.
- O corretor chama no WhatsApp com template.
- O CRM devolve as etapas pela **Conversions API para CRM**: `action_source: "system_generated"`, `custom_data.event_source: "crm"`, `lead_event_source` com o nome do CRM e eventos no máximo 7 dias depois de acontecerem.
- Etapas: "Lead do Facebook", "Lead qualificado", "Visita agendada" e "Convertido".
- Requisitos: pelo menos 200 leads/mês, envio diário, etapa-alvo dentro de 28 dias, conversão entre 1% e 40% e 2–4 semanas de aprendizado [OK, FB15].
- Desde abril/2026, a meta "leads qualificados" exige CAPI em campanhas novas; as campanhas existentes são afetadas desde agosto/2026 [OK, FB16].

**Erros a evitar**
- CTA "Agendar agora", que está hoje em `fbFeed` e `fbpost`.
- Formulário com aparência de site ou com barra de URL.
- Cada card abrindo um formulário diferente.
- Tela de revisão num formulário "Mais volume".
- Rótulo do anúncio desenhado como pílula colorida.

### 3.2 Post com link, imagem única (no repo: `fbpost`, Atlântica)
**Layout**
- Imagem 4:5 (1440 × 1800), que ocupa 412 × 515 no mock [OK, FB17].
- Barra de link em cinza #F0F2F5: domínio **em caixa alta** ("ATLANTICA.EXEMPLO"), título em negrito (recomendado: 27 caracteres) e CTA cinza à direita.
- Imagem, barra e botão levam ao mesmo link.

**Comportamento**
- O toque abre o navegador do Facebook, que sobe de baixo com barra de progresso.
- **Variante nova (07/05/2026):** "anúncio de site que leva a mensagem". A CTA não é de mensagem (por exemplo "Saiba mais"), e um rodapé fixo no navegador traz o botão que abre WhatsApp, Messenger ou Direct [OK, FB18]. O texto desse rodapé em pt-BR não está confirmado [?].

**Erros a evitar**
- CTA azul.
- Imagem 1,91:1 como padrão.
- "Agendar agora".
- Abrir o Safari.

### 3.3 Vídeo e Reels no Facebook (no repo: `fbvid`, Casa Amaro)
**Layout**
- Visualizador do Reels em 9:16.
- Zonas seguras: 14% no topo, 35% na base e 6% nas laterais. São 40% na base se houver rótulos [OK, FB19].
- Embaixo à esquerda: avatar, **nome "Casa Amaro"** (não "casaamaro"), "Anúncio", legenda e barra de CTA. Na direita, a coluna de ações.

**Textos e transições**
- CTA "Reservar agora" (não existe "Reservar mesa") [OK, FB5].
- Pula-se deslizando. **Não existe botão "Pular"** no anúncio de Reels.

### 3.4 Anúncio in-stream em reels, os "intervalos comerciais" (no repo: `fbbreak`, Speak Up)
**Regras confirmadas** [OK, FB20][FB21]
- **O anúncio toca dentro do mesmo player** do conteúdo, que pode ser tela cheia ou o player do feed.
- **Proporções:** 4:5 (recomendada para vídeo), 1:1 ou 1,91:1. **Não usar 9:16** [FB22].
- **Quando entra:**
  - o intervalo só começa depois de **pelo menos 15 s** de conteúdo;
  - o primeiro anúncio "costuma ser veiculado após um minuto de vídeo".
- **Pular:**
  - "pulável": controle de pular depois de **5 s**;
  - "não pulável" (o padrão): até **15 s**, sem botão.
- **Anúncios com mais de 15 s:** são cortados em 15 s; o resto continua num **cartão de contexto abaixo do vídeo**.
- **Depois do anúncio:** o conteúdo volta sozinho de onde parou.

**Textos:** o controle deve dizer "Pular" (talvez "Pular anúncio") e a contagem, "0:12" [?, pt-BR do espectador não confirmado]. O nome do posicionamento no Gerenciador é "reels in-stream do Facebook" [OK].

**Jornada**
1. Marina assiste a um reel de culinária por ~1 min. O intervalo começa no mesmo player, com o anúncio 4:5 de 12 s da Speak Up.
2. "Pular" aparece aos 5 s; ela não pula.
3. Ela toca em "Cadastrar-se" na área de contexto, e o formulário instantâneo abre.
4. Ao fechar, o reel continua.

**Erros a evitar**
- Sheet separado em 9:16 por cima do vídeo, que é o que o repo faz hoje.
- Intervalo começando no segundo 0.
- "Pular em 5" em todo anúncio.
- Mostrar o intervalo de rolagem travada com contagem regressiva, que **só existe para quem mora na UE/EEE/Suíça** e escolheu anúncios menos personalizados [OK, FB23].

### 3.5 Messenger e Meta Business Agent (não aparecem no portfólio; use se forem adicionados)

**Messenger por clique em anúncio** [OK, FB24]
- Texto automático padrão (EN): "Hello! Can I get more info on this?" O equivalente em pt-BR não está confirmado [?].
- Ice breakers: título até 80 caracteres e resposta até 300.
- A janela de conversa dura até 7 dias a partir da 1ª mensagem.
- Desde 27/04/2026, as tags CONFIRMED_EVENT_UPDATE, ACCOUNT_UPDATE e POST_PURCHASE_UPDATE retornam erro 100.

**Status das mensagens no Messenger:** "Enviando", "Enviada", entregue e "Visualizada", esta última indicada pela foto da pessoa [OK, FB25]. **Nunca use os dois tiques do WhatsApp no Messenger.**

**Meta Business Agent**
- Aviso de IA [OK, FB26]: "Esta empresa usa a IA da Meta para gerar mensagens. Ao conversar, você concorda com os Termos da IA."
- Quando um humano responde, a IA para.
- O cliente pede uma pessoa escrevendo na conversa; não há botão para isso.
- As mensagens de ausência ficam pausadas enquanto a IA atende.
- Na caixa da empresa, a conversa aparece como "Resposta do Business Agent".

### Fontes Facebook/Messenger
- [FB1] Meta, rótulos e "Sobre este anúncio" (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/1010479435004531
- [FB2] Social Media Today, vídeos viram Reels (17/06/2025, histórico): https://www.socialmediatoday.com/news/facebook-renames-all-videos-reels/750973/
- [FB3] Meta Ads Guide, carrossel no Feed do Facebook (em cache em 26/10/2026): https://www.facebook.com/business/ads-guide/update/carousel/facebook-feed
- [FB4] Meta, card final "Ver mais" (pt-BR): https://pt-br.facebook.com/business/help/1174990279685960
- [FB5] Meta, CTAs por objetivo (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/410873986524407
- [FB6] Nuvemshop, botões de Página e CTAs (sem data): https://www.nuvemshop.com.br/blog/como-criar-call-to-action-eficientes-facebook/
- [FB7] Meta, formulários instantâneos (acessado em 27/10/2026): https://www.facebook.com/business/help/761812391313386
- [FB8] Meta, tipos de formulário (pt-BR): https://pt-br.facebook.com/business/help/252352181957512
- [FB9] Meta, preenchimento automático com CPF e WhatsApp (pt-BR): https://pt-br.facebook.com/business/help/438193446367413
- [FB10] Meta, perguntas proibidas (pt-BR): https://pt-br.facebook.com/business/help/219356599612120
- [FB11] Meta, verificação por SMS (pt-BR): https://pt-br.facebook.com/business/help/898260175547909
- [FB12] Meta, tela de conclusão e nutrição de leads (pt-BR): https://pt-br.facebook.com/business/help/314132612401196 ; https://pt-br.facebook.com/business/help/650994050545508 ; consentimento pt-BR (cópia antiga, sem data): https://hedgeagro.com.br/formulario-consultoria/
- [FB13] Meta, agendamento direto nos anúncios de cadastro (23/06/2026): https://www.facebook.com/business/news/book-appointments-directly-from-your-lead-ads
- [FB14] AdsUploader, atualizações Meta Ads (15/10/2026, secundária): https://adsuploader.com/blog/meta-ads-updates-2026
- [FB15] Meta for Developers, Conversion Leads Integration (atualizado em 19/10/2026) e Payload (28/06/2026): https://developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration ; https://developers.facebook.com/documentation/ads-commerce/conversions-api/conversion-leads-integration/payload-specification
- [FB16] Meta, meta de leads qualificados (EN, acessado em 27/10/2026): https://www.facebook.com/business/help/782657799338685
- [FB17] Meta Ads Guide, imagem no Feed do Facebook (em cache em 26/10/2026): https://www.facebook.com/business/ads-guide/update/image/facebook-feed
- [FB18] Meta for Developers, Website ads that click to message (atualizado em 07/05/2026): https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-creative/messaging-ads/website-ads-click-to-message
- [FB19] Meta, zonas seguras (pt-BR): https://pt-br.facebook.com/business/help/980593475366490 ; Ads Guide Facebook Reels: https://www.facebook.com/business/ads-guide/update/video/facebook-facebook-reels
- [FB20] Meta Ads Guide, in-stream do Facebook (acessado em 27/10/2026): https://www.facebook.com/business/ads-guide/update/video/facebook-instream-video
- [FB21] Meta, anúncios in-stream para reels (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/902459833240201
- [FB22] Meta, proporções do in-stream para reels: https://www.facebook.com/business/help/682655495435254
- [FB23] Meta, intervalos comerciais só na UE/EEE/Suíça (pt-BR, acessado em 27/10/2026): https://pt-br.facebook.com/business/help/506807668829263
- [FB24] Meta for Developers, Click to Messenger (atualizado em 21/05/2026) e Send Messages (atualizado em 28/09/2026): https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-creative/messaging-ads/click-to-messenger ; https://developers.facebook.com/documentation/business-messaging/messenger-platform/send-messages
- [FB25] Messenger Help, status das mensagens (pt-BR): https://m.facebook.com/help/messenger-app/926389207386625?locale=pt_BR
- [FB26] Meta, Business Agent (pt-BR): https://pt-br.facebook.com/business/help/1505847033372169 ; https://pt-br.facebook.com/business/help/834508185328904 ; https://pt-br.facebook.com/business/help/1105546398456682

---

## 4. TikTok: In-Feed para site com checkout Pix (no repo: `ttFeed`, Ponto Tech)

### 4.1 Layout e proporções
- **Vídeo.** 9:16 em tela cheia. No topo, as abas do feed "Seguindo" e "Para você" (y ≈ 70–100 px) [OBS].
- **Coluna direita** (x ≈ 352–404, a partir de ~45% da altura): avatar de ~48 px, curtir, comentar, favoritar, compartilhar e o disco de som girando.
- **Bloco inferior esquerdo** (~75% da largura):
  - nome em negrito, até 20 caracteres;
  - legenda em branco;
  - tag pequena "Patrocinado";
  - linha de som.
- **Regras de legenda:**
  - Fora do Spark Ads, a legenda **não tem link, @ ou hashtag clicável**; mantenha ~100 caracteres para não cortar.
  - No Spark Ads, a legenda vai até 150 caracteres e 4 linhas [TT1].
- **Barra de CTA.** Largura total, com margens de ~12 px e ~40 px de altura. **Começa transparente ou cinza e depois se enche de uma cor que o sistema tira da paleta do vídeo**, não da cor da marca [OK, TT2].
- **Barra inferior:** "Início", "Amigos", "+", "Caixa de entrada", "Perfil". Algumas contas têm a aba "Loja" [OBS, TT3].

### 4.2 Textos pt-BR
- "Patrocinado". A newsroom diz "Sponsored" ou "Ad", e a tradução "Patrocinado" está [?] numa doc oficial pt-BR.
- "Para você" e "Seguindo" [OBS].
- **Textos das CTAs** [?]: não há lista oficial pt-BR. Os candidatos são "Comprar agora" ou "Compre agora", "Saiba mais", "Baixar", "Inscreva-se" e "Peça agora". A Ajuda pt-BR usa os termos "botão de call-to-action" e "cor de fundo do CTA" [OK, TT2].
- A linha de som "Música promocional – pontotech", que está no repo, é plausível para anúncio sem Spark [OBS].

### 4.3 Tempos da CTA (tabela oficial, atualizada em fev/2025) [OK, TT4]

| Compra | O texto da CTA aparece | A cor de fundo aparece |
|---|---|---|
| Leilão oCPM (o caso comum de PME) | aos 3, 4 ou 5 s | aos 4, 5, 6 ou 7 s |
| Leilão CPM/CPC | o tempo todo | aos 5 s |
| Leilão CPV | aos 5 ou 6 s | entre 4 e 8 s |
| Reserva In-Feed | o tempo todo | aos 2 s |
| TopView | aos 3 s | aos 5 s |

No oCPM e no CPV o tempo exato é escolhido para cada pessoa, a partir do histórico de visualização. **No mock:** o texto entra com fade aos 3 s e a cor faz crossfade aos 5 s, em ~300 ms.

### 4.4 Jornada e bastidor (Ponto Tech)
1. Marina rola o "Para você", e o 4º item é o anúncio com "Patrocinado".
2. Aos 3 s aparece "Comprar agora" [?]; aos 5 s a barra se enche de cor.
3. Ela toca, e o navegador do TikTok abre com o **nome da conta como título**. A página carrega quase na hora, porque o TikTok pré-carrega a landing page [OK, TT5].
4. Produto → carrinho → checkout com CEP, endereço e CPF → Pix. Aparece o QR e "Pix copia e cola", com contagem regressiva definida pelo PSP (ex.: 30 min) e "Aguardando pagamento".
5. Ela copia o código, paga no app do banco e volta. A página consulta o status e mostra "Pedido confirmado #1043".
6. Em segundos chega um template de utilidade do WhatsApp da loja e o recibo por e-mail.

**Bastidor**
- Pixel e Events API com os eventos ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo e **Purchase**. Use "Purchase", não "CompletePayment" [OK, TT6].
- **O Purchase sai do servidor, quando o webhook do PSP confirma o Pix**, com o mesmo `event_id` do evento de navegador. O TikTok descarta duplicatas com o mesmo `event_id` dentro de 48 h [OK, TT7].
- O link chega com `ttclid`. Filtre o tráfego de pré-carregamento com `crawler=tiktok_preloading` [OK, TT5].

### 4.5 Erros a evitar
- CTA cheia de cor desde o segundo 0.
- CTA na cor da marca.
- Hashtags na legenda sem Spark. O repo tem "#setup #edição": **ou o anúncio vira Spark** (post do perfil), **ou as hashtags saem**.
- Disparar o Purchase quando o QR aparece.
- Botão "Pular" (no TikTok, pula-se deslizando).
- Confundir TikTok Shop com anúncio para site. No **TikTok Shop**, o checkout é nativo, com Pix, boleto e cartão dentro do app; o comprador tem de ter 18+; mandar o comprador pagar fora é sinal de fraude [TT8]. Não misture os dois fluxos.

### Fontes TikTok
- [TT1] TikTok Ads, TopView e regras de legenda (sem data): https://ads.tiktok.com/help/article/tiktok-reservation-topview ; especificações de vídeo (jun/2026): https://ads.tiktok.com/help/article/video-ads-specifications?lang=en
- [TT2] TikTok Ads Help pt, comportamento do botão de CTA (abr/2025): https://ads.tiktok.com/help/article/in-app-behavior-call-to-action-button?lang=pt
- [TT3] Game Overdrive, guia TikTok Shop (09/10/2026): https://gameoverdrive.com.br/como-comprar-tiktok-shop-passo-a-passo/
- [TT4] TikTok Ads Help, tempos de CTA (atualizado em fev/2025, lido em 27/10/2026): https://ads.tiktok.com/help/article/available-timing-of-call-to-action-content-and-background-color?lang=en
- [TT5] TikTok Ads Help, pré-carregamento de conteúdo web: https://ads.tiktok.com/help/article/preloading-web-content?lang=en
- [TT6] TikTok Ads Help, eventos padrão (abr/2026): https://ads.tiktok.com/help/article/standard-events-parameters?lang=en
- [TT7] TikTok Ads Help, deduplicação de eventos: https://ads.tiktok.com/help/article/event-deduplication
- [TT8] TikTok Newsroom pt-BR, TikTok Shop no Brasil (08/05/2025) e segurança (31/07/2025): https://newsroom.tiktok.com/tiktok-shop-chega-ao-brasil?lang=pt-BR ; https://newsroom.tiktok.com/tiktok-shop-seguranca-ompras-prioridade?lang=pt-BR

---

## 5. YouTube

### 5.1 In-stream pulável (no repo: `ytInstream`, EcoDrive Elétricos)
**Layout, em retrato**
- **Player.** 16:9 com a largura toda no topo (412 × 232).
- **Card de ação logo abaixo (~64–72 px).** Logo do anunciante, título, a linha "Patrocinado · ecodrive.exemplo" e, à direita, o botão de CTA em pílula.
- **Sobreposições no player:**
  - embaixo à esquerda, "Patrocinado: 1 de 2 · 0:08" (posição no bloco de anúncios e tempo restante), com o controle (i) ou ⋮;
  - o link "Visitar anunciante ↗";
  - embaixo à direita, a pílula "Pular ▸|";
  - **barra de progresso amarela** (no conteúdo ela é vermelha).
- O texto "Patrocinado: 1 de 2 · 0:08" e o link "Visitar anunciante" vêm de OCR de páginas reais em pt-BR [OBS, YT1].

**Regras** [OK, YT2][YT3]
- O botão Pular aparece **aos 5 s**. A Ajuda pt-BR ainda diz que "uma contagem regressiva aparece durante os primeiros 5 segundos". Desde out/2024, o YouTube trocou o relógio por uma barra de progresso, com a justificativa de "reduzir elementos no player".
- **Conclusão para o mock:** sem texto grande "Pular em 4". Use uma barra discreta ou contagem pequena, e a pílula aos 5 s.
- Visualização conta aos 30 s ou no fim. O criativo precisa de pelo menos 12 s para contar visualizações.
- **Banner complementar só no computador.** Não aparece no celular.
- Texto da CTA [OK, YT4]: enum do Google Ads (LEARN_MORE, BOOK_NOW, SHOP_NOW, SIGN_UP…). Texto personalizado vai até **10 caracteres**: "Agendar" (7) serve.

**Jornada**
1. Marina abre um vídeo de futebol. O pre-roll começa com "Patrocinado: 1 de 2 · 0:20" (bloco de dois anúncios; o formato com um anúncio só não está confirmado [?]).
2. Nos 5 s iniciais, a oferta aparece no criativo.
3. A pílula "Pular" aparece; ela continua assistindo.
4. Toca em "Agendar". O anúncio pausa e a landing abre num navegador interno (comportamento exato no iOS [?]).
5. Ela fecha e volta ao anúncio pausado.

**Bastidor**
- Clique com `gclid`; no iOS, `wbraid` ou `gbraid` [YT5].
- Tag do Google e conversões otimizadas. O test drive confirmado entra por importação offline.

**Erros a evitar**
- "Pular em 4" em texto grande.
- Barra vermelha durante o anúncio.
- "Visitar site" no lugar de "Visitar anunciante".
- Banner complementar no celular.
- CTA com mais de 10 caracteres.

### 5.2 Shorts para instalar app (no repo: `ytShorts`, Speak Up)
**Layout e regras** [OK, YT6]
- Player do Shorts em 9:16.
- **Coluna direita:** "Gostei", "Não gostei", "Comentar", "Compartilhar". Os comentários só aparecem se o canal estiver vinculado ao Google Ads.
- **A CTA aparece aos 3 s** em Performance Max, Geração de Demanda e campanhas para apps. Em campanhas de visualização e alcance aparece **aos 10 s**.
- **Clique em Shorts = clique no botão de CTA.**
- Duração:
  - o anúncio pode ter até 3 min, mas **só os primeiros 60 s** rodam no feed;
  - aos 50 s aparece uma sobreposição que leva à página de exibição.
- **Textos do card:** descrição até 90 caracteres; título recomendado de 40 caracteres para o card de CTA.

**Textos**
- "Gostei", "Não gostei", "Comentar", "Compartilhar" [OK].
- O rótulo de anúncio no Shorts não está documentado. Usar "Patrocinado" [?].
- CTA de app: "Instalar" [?].
- **Na App Store, o botão é "Obter"**, que vira "Abrir" depois de instalado [OBS].

**Transições**
- Pula-se deslizando. Não há "Pular" nem 5 s.
- A CTA entra aos 3 s com slide e fade.
- Toque na CTA abre a ficha da App Store como sheet sobre o YouTube [OBS: padrão StoreKit, sem doc específica do YouTube].
- Depois vem "Obter", a confirmação pelo botão lateral e Face ID, o anel de progresso e "Abrir".

**Erros a evitar**
- "Remixar" na coluna, que está no repo hoje. **Não aparece na lista oficial do anúncio.**
- "Comentários" em vez de "Comentar".
- CTA visível no segundo 0.
- "Instalar" dentro da App Store.

### 5.3 Live com promoção paga (no repo: `ytLive`, Ponto Tech)
**Natureza.** Não é unidade de anúncio. É conteúdo do criador com **divulgação de promoção paga**:
- o YouTube mostra automaticamente um aviso **por 10 segundos no início do vídeo**;
- a política vale para "vídeos, descrições, comentários, transmissões ao vivo, Shorts" [OK, YT7].

**Textos**
- "Inclui promoção paga" [OBS: a frase não aparece no texto da página, que mostra o aviso como imagem].
- "#publi" no título e na descrição, conforme a boa prática brasileira [OBS].
- "Chat ao vivo" e mensagem fixada pelo canal com o link [OBS].
- O placeholder "Diga algo…" não está confirmado [?].

**Erros a evitar**
- Selo "Patrocinado" numa live de criador.
- Aviso de promoção paga parado na tela o tempo todo. Ele dura ~10 s no início.
- Link que abre checkout dentro do YouTube. Use a lista de espera no site.

### Fontes YouTube
- [YT1] OCR de páginas reais pt-BR (2024–2026): https://m.youtube.com/watch?v=3x7dc4NxAbk ; https://pt.scribd.com/document/1021013310/30-Min-Melhores-mu-sicas-Racionais-Mcs-YouTube ; https://www.threads.com/@carinhadoti/post/Dbv-7atH3Kc/
- [YT2] Google Ads Help pt-BR, anúncios in-stream (©2026, lido em 27/10/2026): https://support.google.com/google-ads/answer/6244557?hl=pt-BR
- [YT3] 9to5Google, mudança no botão Pular (10/10/2024): https://9to5google.com/2024/10/10/youtube-skip-ad-button-changes/
- [YT4] Google Ads API, CallToActionType v26 (atualizado em 13/10/2026): https://developers.google.com/google-ads/api/reference/rpc/v26/CallToActionTypeEnum.CallToActionType
- [YT5] Google Ads API, ClickConversion (iOS gbraid/wbraid): https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
- [YT6] Google Ads Help pt-BR, anúncios no YouTube Shorts (©2026, lido em 27/10/2026): https://support.google.com/google-ads/answer/16041697?hl=pt-BR
- [YT7] YouTube Help pt-BR, promoções pagas (lido em 27/10/2026): https://support.google.com/youtube/answer/154235?hl=pt-BR

---

## 6. LinkedIn: anúncio de documento com formulário de geração de leads (no repo: `liFeed`, Valore Patrimônio)

### 6.1 Layout
- **Cabeçalho do post.** Logo quadrado de ~48 px, nome da empresa em negrito e, embaixo, **"Promovido"** em cinza. À direita, "+ Seguir" [OBS].
- **Texto introdutório:** até 150 caracteres, cortado com "…mais".
- **Visualizador do documento.** As páginas aparecem dentro do post e passam deslizando, com contador "1 de 4". Título do documento: até 70 caracteres.
- **Especificações do arquivo** [OK, LI1]: PDF, DOC, DOCX, PPT ou PPTX; até 100 MB; até 300 páginas; recomendado ter menos de 10.
- **Bloqueio por formulário.** Depois das páginas de prévia, as seguintes aparecem desfocadas com um aviso para liberar o conteúdo. O texto e o rótulo do botão desse aviso **não estão confirmados** [?]. O repo usa "Desbloquear" e "Para continuar lendo, envie suas informações".
- **Ações:** "Gostei", "Comentar", "Compartilhar", "Enviar" [OBS].

### 6.2 Formulário de geração de leads [OK, LI2]
- **Modal nativo.** Leva o logo e a imagem do anunciante, até **3 perguntas personalizadas e 12 campos selecionáveis** (múltipla escolha ou texto de uma linha) e preenche os campos automaticamente com o perfil.
- **Privacidade.** Exige URL da política de privacidade e texto personalizado. O usuário pode apagar os dados enviados.
- **Depois do envio.** Vem uma página de agradecimento personalizada com botões de CTA selecionáveis.
- **Leads.** Saem em CSV ou sincronizados com CRM, automação de marketing ou CDP. Também aparecem no Campaign Manager.
- **Textos da interface do formulário** ("Enviar", rótulos dos campos, "Obrigado") [?]: não confirmados em pt-BR.

### 6.3 Jornada
1. Marina vê o post "Promovido" e passa as páginas 1 a 3.
2. Na página 4, desfocada, toca no botão de liberar.
3. O formulário sobe com nome, e-mail e empresa já preenchidos, mais uma pergunta: "Qual o seu momento?" (opções: "Empresa e família no mesmo patrimônio" e outras).
4. Ela envia, e a tela de agradecimento libera o documento completo, com a CTA "Visitar site".
5. **Bastidor:** o lead entra no CRM, que inicia a sequência de e-mails da seção 15, com a primeira mensagem na hora ("Seu guia chegou").

### 6.4 Erros a evitar
- Usar "Patrocinado" no LinkedIn. O rótulo é "Promovido".
- Abrir um site externo para o formulário.
- Mais de 3 perguntas personalizadas.
- Pedir no formulário dados que o LinkedIn já preenche.

### Fontes LinkedIn
- [LI1] LinkedIn Ads Guide, Document Ads (lido em 27/10/2026): https://business.linkedin.com/marketing-solutions/success/ads-guide/document-ads
- [LI2] LinkedIn Help pt-BR, Lead Gen Forms (lido em 27/10/2026): https://www.linkedin.com/help/lms/answer/a423447?lang=pt-BR

---

## 7. Google Ads

### 7.1 Pesquisa com ligação (no repo: `gSearch`, Vilela Odontologia)
**Layout da página de resultados no celular**
- **Caixa de busca.** Logo à esquerda da caixa, como está no repo [OBS]. Logo abaixo, as abas: "Modo IA", "Todas", "Mapas", "Imagens", "Notícias" [OBS]. O repo já tem a aba "Modo IA"; a data de lançamento em pt-BR não foi reverificada nesta sessão [?].
- **Bloco de anúncios.**
  - Desde out/2025 os anúncios de texto vêm **agrupados sob o rótulo "Resultados patrocinados"**, com o botão "Ocultar resultados patrocinados" no fim do bloco [?: anúncio do Google em inglês de out/2025, não reverificado nesta sessão]. O repo usa "Resultado patrocinado" no singular; não está confirmado se o rótulo muda quando há um anúncio só, então prefira o plural.
  - Cada anúncio leva favicon, nome do anunciante, URL exibido, título em azul (até 3 títulos de 30 caracteres), descrição (até 90) e sitelinks [OBS].
- **Recurso de ligação** [OK, GA1]:
  - Em aparelhos que fazem ligação, "um botão clicável será exibido abaixo do anúncio responsivo de pesquisa".
  - No computador o texto é "Ligue para nós"; **no celular o rótulo não está documentado** ("Ligar" [?]).
  - Com o relatório de chamadas ligado, aparece o número de encaminhamento do Google.
  - O horário de exibição pode ser programado.

**Transição no iOS.** O toque num link de telefone mostra a confirmação do sistema, com o número e as opções "Ligar" e "Cancelar". Depois vem a tela de chamada [OBS]. O repo faz isso certo.

**Bastidor**
- O relatório de chamadas registra duração e conversão por ligação, por exemplo ligações de 60 s ou mais [OBS].
- O agendamento entra como conversão offline.

**Erros a evitar**
- Placeholder legal "[RT e CRO]" no texto do anúncio. Em clínica, o anúncio de odontologia deve trazer nome e número de inscrição do responsável técnico, conforme a regra do CFO (não verificado nesta sessão [?]). Use um texto fictício completo, por exemplo "RT: Dra. Ana Vilela, CRO-SP 00000".
- Rótulo de anúncio em verde ou amarelo, que é o estilo antigo.

### 7.2 Display (no repo: `gDisplay`, Destino Certo Viagens)
**Layout.** Anúncio responsivo de display dentro de um artigo de portal: imagem, título que alterna entre combinações de assets, nome da empresa e botão de seta. No canto, o ícone AdChoices (triângulo "i") e o "x" para fechar, com as opções "Interromper a exibição deste anúncio" e "Por que este anúncio?" [OBS]. Os textos exatos dessas opções não estão confirmados em pt-BR [?].

**Erros a evitar**
- Pôr só "Anúncio ✕" sem o ícone AdChoices.
- Abrir a landing dentro de um navegador de app. O display em portal web abre no próprio Safari, e o repo usa `safari()` corretamente.

### Fontes Google Ads
- [GA1] Google Ads Help pt-BR, recursos de ligação (lido em 27/10/2026): https://support.google.com/google-ads/answer/2453991?hl=pt-BR

---

## 8. SEO: resultado orgânico (no repo: `seoOrganic`, Atlântica)

**Layout.** O resultado orgânico tem:
- favicon, nome do site e trilha da URL ("atlantica.exemplo › plantas");
- título em azul;
- 2 linhas de trecho;
- miniatura opcional à direita;
- links de site em lista com chevrons [OBS].

Não há rótulo de anúncio. Para buscas transacionais e locais como "casa na falésia à venda", é comum o resultado vir abaixo de anúncios, do pacote do Maps e, às vezes, da "Visão geral criada por IA" [OBS; o nome pt-BR é de 2024 e não foi reverificado nesta sessão].

**Jornada.** Busca → resultado → página de plantas → "Receber as plantas em PDF" → e-mail. É o fluxo do repo. **No bastidor**, o formulário do site dispara o evento Lead (GA4 e Meta CAPI) e cai no mesmo CRM da seção 3.1.

**Erros a evitar**
- Selo "Orgânico" dentro da tela. O selo do repo fica fora do celular, e deve continuar assim.
- Pôr a data do post no trecho de uma página institucional.
- Mostrar a "Visão geral criada por IA" sempre. Ela não aparece em toda busca.

---

## 9. ChatGPT: anúncio abaixo da resposta (no repo: `gptAnswer`, Destino Certo Viagens)

### 9.1 Regras e layout [OK, GPT1][GPT2]
- **Disponibilidade.** Os anúncios começaram a aparecer no Brasil em **04/08/2026**, com o Brasil como 8º mercado. Só os planos **Free e Go** veem anúncios. Plus, Pro, Business, Enterprise e Education não veem.
- **Posição.** "A resposta orgânica aparece primeiro e não é alterada pela publicidade". Depois vem **uma linha cinza divisória**, e o anúncio fica abaixo dela.
- **Rótulo.** Cada anúncio traz um marcador como "patrocinado" ou "anúncios" [OK, M&M]. **Use "Patrocinado".**
- **Quando aparece.** Só em perguntas com intenção comercial direta (estimativa de ~20% das perguntas). Não aparece em perguntas pessoais nem em conselhos de relacionamento.
- **Quem não vê:**
  - contas identificadas como de menores de 18;
  - conversas sobre temas sensíveis (saúde, saúde mental, política);
  - quem usa o plano Free e opta por não ver anúncios, aceitando limites menores de mensagens.
- **Formatos novos (ago/2026)** [OK, GPT2]:
  - **carrossel** com vários produtos do mesmo anunciante;
  - otimização por conversão (vendas, cadastros);
  - compra por CPM e CPC.
- **Toque no anúncio.** O comportamento não está documentado nas fontes lidas [?]. Use navegador interno (sheet), como no repo.

### 9.2 Jornada
1. Marina pergunta sobre festas de junho e o ChatGPT responde normalmente.
2. Abaixo da linha cinza aparece o card "Patrocinado": imagem, "Destino Certo Viagens", título e descrição. O menu ⋯ abre as opções de controle; os textos dessas opções não estão confirmados [?].
3. Ela toca, e o navegador interno abre a página de saída.
4. **Bastidor:** pixel ou integração de conversão do Ads Manager (beta). Os anunciantes recebem só dados agregados [OK, GPT2].

### 9.3 Erros a evitar
- **A frase do repo "Para a sua viagem para ver as cavalhadas, aqui está uma opção para considerar"**, que soa escrita pelo modelo e liga a resposta ao anúncio. Isso contraria a separação entre resposta e anúncio. **Remover:** o anúncio entra sozinho depois da divisória.
- Usar o rótulo "Anúncio". O repo usa a pílula "Anúncio"; troque por "Patrocinado".
- Anúncio no meio da resposta.
- Anúncio em conversa sobre saúde.

### Fontes ChatGPT
- [GPT1] Meio & Mensagem, "ChatGPT começa a exibir anúncios aos usuários do Brasil" (04/08/2026): https://www.meioemensagem.com.br/midia/chatgpt-comeca-a-exibir-anuncios-aos-usuarios-do-brasil
- [GPT2] Unite.AI (ago/2026; cita a página de disponibilidade do Ads Manager, atualizada em 06/08/2026): https://www.unite.ai/chatgpt-ads-arrive-in-brazil-as-openai-adds-conversion-tools-and-carousels/

---

## 10. Google Maps: alfinete promovido (no repo: `mapsLocal`, Casa Amaro)

**Regras** [OK, MAP1]
- Os anúncios aparecem como **"alfinetes quadrados"** no endereço e/ou na lista de resultados do Maps, mas não necessariamente nos dois ao mesmo tempo.
- Requisito: recursos de local, de preferência com o Perfil da Empresa vinculado.
- Cobrança:
  - CPC para clique no alfinete, no título que abre o Perfil e nos botões de ação;
  - CPM quando aparece o alfinete com logotipo, em Performance Max com metas de loja.
- O rótulo **"Patrocinado"** está confirmado na lista ampliada de lugares da Pesquisa. No Maps é o padrão observado [OBS].
- Botões de ação citados: **"Ligar", "Rotas", "Site"**.

**Layout.** Mapa em tela cheia, campo de busca em cima e chips de filtro. O alfinete promovido é **quadrado**, com o ícone da categoria ou o logo, e os orgânicos são em gota. Embaixo, um sheet arrastável que tem dois estados:
- **meio:** nome, categoria, "Aberto";
- **cheio:** fotos, chips "Rotas" (primário), "Ligar", "Site", "Salvar", "Compartilhar" e o texto do anúncio.

**Jornada.** "feijoada perto de mim" → alfinete quadrado "Casa Amaro" → sheet com "Patrocinado" → "Rotas" → modo carro → "Iniciar". É o que o repo já faz.

**Erros a evitar**
- Alfinete promovido em forma de gota.
- Botão "Reservar" sem integração de reserva configurada no Perfil [OBS].
- Falar em "chat do Maps". O chat por RCS no Maps é só um plano para o fim de 2026 [OK, RCS2].

### Fontes Maps
- [MAP1] Google Ads Help pt-BR, anúncios locais no Maps (lido em 27/10/2026): https://support.google.com/google-ads/answer/3246303?hl=pt-BR

---

## 11. WhatsApp Business

### 11.0 Limites e regras que aparecem na interface (vale para 11.1–11.4)

| Elemento | Limite | Fonte |
|---|---|---|
| Botões de resposta | até **3**, título com até **20 caracteres**; corpo até 1024; rodapé até 60 | [OK, WA1] |
| Mensagem de lista | 1 botão de até **20 caracteres**; até **10 linhas** no total (somando as seções); título da seção e da linha até 24; descrição da linha até 72; cabeçalho até 60; corpo até 4096; rodapé até 60 | [OK, WA2] |
| CTA de Flow | recomendado até 30 caracteres, sem emoji | [OK, WA3] |
| Multiproduto | até 30 produtos em seções; carrossel de produtos com até 10 cards | [OK, WA4] |
| `order_details` (Pix) | corpo 1024, rodapé 60, nome do item 60; validade mínima de 300 s; `currency` BRL; valores inteiros em centavos | [OK, WA5] |
| Status do pedido | `pending`, `processing`, `partially_shipped`, `shipped`, `completed`, `canceled`; o pagamento capturado acrescenta à bolha o rótulo "pago" com marca verde | [OK, WA5] |
| Janela FEP por anúncio | **até 7 dias** (antes eram 72 h) em conversas iniciadas por anúncio que leva ao WhatsApp, só no app Android ou iOS | [OK, WA6] |
| Mensagens de serviço | pagas no Brasil desde **01/10/2026**, depois de 1.000 grátis por número por mês | [OK, WA6] |

### 11.1 Anúncio que leva ao WhatsApp (no repo: `waAd`, Vilela Odontologia)
**Layout do chat**
- **Cabeçalho:** "‹", avatar, nome da empresa e "Conta comercial" [OBS], com vídeo e telefone à direita.
- **Corpo:** fundo com textura (o "papel de parede" do WhatsApp) e marcador de dia "Hoje".
- **Bolhas:** a enviada é verde-clara e fica à direita, com hora e tiques; a recebida é branca e fica à esquerda.
- **Ao chegar pelo anúncio:**
  - **o campo de texto vem pré-preenchido** com o texto definido no anúncio e uma **prévia do anúncio** acima;
  - **o usuário precisa tocar em enviar**;
  - a mensagem enviada leva a citação do anúncio [OBS].
- **Lista:** o botão (ex.: "Ver opções") abre uma janela com as opções agrupadas por seção. A pessoa escolhe uma e a escolha volta como resposta [OK, WA2]. A janela ter botão de opção e "Enviar" é padrão observado [OBS].
- **Botões de resposta:** ficam **presos embaixo da bolha da mensagem**, até 3, em linhas separadas por divisória [OBS]. Não são chips soltos.

**Texto de sistema [?]**
- O repo mostra "As mensagens são protegidas com a criptografia de ponta a ponta."
- Em conversas com empresas que usam a Cloud API, o WhatsApp mostra outro aviso, de que a empresa usa um serviço seguro da Meta para gerenciar a conversa [OBS; texto pt-BR não confirmado].
- **Recomendação:** use esse aviso nas cenas com automação via API.

**Jornada (Vilela, terça 27/10/2026, 10:09)**
1. Marina toca em "Enviar mensagem pelo WhatsApp" no anúncio do Instagram e o app troca. Aparece "◀ Instagram".
2. O campo vem com "Olá! Quero agendar uma avaliação." Ela toca em enviar.
3. Primeira resposta, com aviso de automação no próprio texto: "Oi, Marina! Sou a assistente virtual da Vilela Odontologia…". Vem com o botão de lista "Ver opções".
4. Ela escolhe "Avaliação odontológica".
5. Botões de resposta: "Manhã", "Tarde", "Noite".
6. Botões com horários. Exemplos dentro do limite de 20 caracteres: "Qui 29/10, 9h", "Sex 30/10, 10h30", "Outro dia".
7. Confirmação. **Bastidor:** chega o `referral` com `ctwa_clid`, a janela FEP de 7 dias começa a contar, e a CAPI para mensagens envia `LeadSubmitted` com `action_source: "business_messaging"` e o `ctwa_clid` [WA7].

**Erros a evitar** (estão no repo hoje)
- **"Sex, 30 de out, 10h30" tem 21 caracteres** e estoura o limite de 20.
- **O rótulo "Mensagem automática" em cima das bolhas não existe no WhatsApp.** O aviso de automação vai no texto da primeira mensagem. A única marca da plataforma é **"IA"**, e só nas mensagens do **Meta Business Agent** [OK, FB26].
- Botões de resposta desenhados como chips soltos fora da bolha.

### 11.2 Catálogo, carrinho e pedido (no repo: `waCatalog`, Casa Amaro)
**Fluxo** [OBS; os textos "Ver carrinho", "Fazer pedido" e "Ver itens enviados" estão no repo e batem com a interface observada, mas não estão confirmados em documento]
1. Perfil comercial.
2. "Catálogo", com "Ver tudo".
3. Coleções.
4. Item: foto, nome, descrição, preço e "Adicionar ao carrinho".
5. Barra "Ver carrinho · 1 item".
6. Sheet do carrinho com quantidade, observação e "Fazer pedido".
7. A bolha enviada é o pedido, com "Ver itens enviados".

**Bastidor.** A empresa recebe o webhook do pedido com a lista de itens. A resposta certa é um `order_details` com o total e o Pix (seção 11.3), não um texto "Resumo do pedido" com botão "Confirmar pedido".

**Erros a evitar**
- O item sem preço, como está no repo. Mostre um preço fictício, por exemplo "R$ 189,90", ou avise fora do celular que os preços estão ocultos.
- Fechar o pedido sem pagamento nem status. Pedido para sábado com retirada deve receber o `order_details` e depois `order_status` `processing` → `completed`.

### 11.3 Agente de IA, Flow, passagem para humano, `order_details` com Pix e `order_status` (no repo: `waAgente`, Destino Certo Viagens)
**Agente**
- **Escopo.** Um agente de terceiros pode atender, desde que fique restrito ao negócio. Desde 15/01/2026, IA de uso geral como função principal é proibida [OK, WA8].
- **Custo.** No Brasil, as mensagens do agente via API são cobradas como serviço. O Meta Business Agent é cobrado por token: US$ 2 por 1 milhão de tokens, cerca de US$ 0,04–0,05 por mensagem, **sem gratuidade nem dentro da FEP** [OK, WA6].

**Flow**
- O botão (≤ 30 caracteres) abre o Flow em tela cheia, com título e "X" no topo e o botão principal no rodapé ("Continuar" / "Enviar").
- O rodapé "Gerenciado pela empresa" que o repo usa é padrão observado [OBS].
- Ao concluir, volta ao chat uma bolha de resposta com o resumo [OBS].
- Com `data_exchange`, cada tela é validada no servidor [OK, WA3].

**Passagem para humano**
- O Conversation Routing (docs de 23/09/2026) tem `pass`, `take` e `release`, e entrega um **resumo gerado por IA** quando a conversa muda de dono [OK, WA9].
- O cliente não vê esse resumo. O atendente se apresenta pelo nome, e o repo faz isso certo.

**Pagamento Pix com troca para o app do banco (APPSWITCH, 16/10/2026)** [OK, WA10]
1. A mensagem `order_details` chega com o botão de pagar. No modo copia e cola, o botão é "Copy Pix code" (EN). No APPSWITCH, é "Pay with Pix" (EN). Em pt-BR, provavelmente "Copiar código Pix" e "Pagar com Pix" [?].
2. A pessoa escolhe o banco numa lista com busca. Ao lado da lista também há a opção de copiar o código Pix.
3. **No primeiro pagamento, ela informa o CPF uma vez e aceita os termos de pagamentos do WhatsApp.**
4. Tela de revisão com `merchant_name` e o total.
5. O WhatsApp abre o app do banco já na tela de confirmação. Ela confirma.
6. Ela volta ao WhatsApp, que mostra o resultado.
7. **A Meta não confirma o pagamento.** A empresa concilia com o PSP e envia o `order_status`. Pagamento capturado faz aparecer na bolha o rótulo "pago" com marca verde.

**Quando cai no copia e cola:**
- WhatsApp Web, Desktop ou o app WhatsApp Business;
- banco fora da lista;
- pessoa não elegível.

**Para expirar o código:**
- enviar `canceled` ou definir `expiration` (mínimo 300 s);
- o botão vira "View details" (EN; "Ver detalhes" [?]);
- **expirar também no PSP**, porque quem já copiou o código ainda consegue pagar.

**Acesso ao APPSWITCH:** exige cadastro manual ou adesão ao Meta Business Agent [OK, WA10].

**Ajustes no repo (`waAgente`)**
- Incluir o passo de CPF e termos no primeiro uso.
- Usar "Pagar com Pix" [?] no botão do APPSWITCH. Hoje está "Revisar e pagar", que é só o nome técnico da ação (`review_and_pay`).
- A troca para o banco deve **abrir o app do banco já na confirmação**, depois da revisão no WhatsApp.
- Depois do pagamento, mostrar "pago" com marca verde na bolha do pedido e uma mensagem de `order_status`.
- Mostrar um valor fictício em vez de "R$ ••••", ou explicar a máscara fora do celular.
- **Datas da viagem:** "12 a 15 de junho (quinta a domingo)" não bate com 2027, porque 12/06/2027 é sábado. Use "10 a 13 de junho" (qui–dom) e "17 a 20 de junho" (qui–dom).

### 11.4 Ligação iniciada pela empresa, com permissão (no repo: `waChamada`, EcoDrive)
**Regras** [OK, WA11]
- **Como pedir.** O pedido de permissão vai por mensagem interativa, dentro da janela de 24 h, ou por template, fora dela.
- **O que o usuário escolhe.** Pode **permitir por um tempo (7 dias)**, **permitir sempre**, recusar ou não responder. A empresa não controla a permissão.
- **Limites de pedido.** No máximo **1 por 24 h e 2 por 7 dias** por número da empresa. Os contadores zeram depois de uma chamada atendida.
- **Limite de chamadas.** Até 100 chamadas conectadas a cada 24 h.
- **Chamadas não atendidas:**
  - **2 seguidas** fazem aparecer uma mensagem do sistema pedindo que o usuário reconsidere a permissão;
  - **4 seguidas** revogam a permissão.
- **Nenhum webhook** avisa quando a permissão temporária expira.
- **Títulos das telas.** "Allow calls" e "Temporarily allow calls" (EN). Em pt-BR, provavelmente "Permitir chamadas" e "Permitir chamadas temporariamente" [?].
- **Gravação e transcrição pela empresa.** Existem desde 30/06/2026 e **exigem aviso ao cliente** no início [OK, WA12].

**Ajustes no repo**
- O cartão de permissão deve oferecer a escolha temporária ou permanente, não só "Permitir chamadas" / "Agora não".
- **Tirar as "Legendas ao vivo" da tela da chamada.** O WhatsApp não tem legenda em chamada de voz documentada, e as Legendas ao Vivo do iOS **não funcionam em português** (seção 14). Leve a transcrição para o painel de bastidor, fora do celular.
- Se a chamada for gravada ou transcrita, a primeira fala do agente inclui o aviso, por exemplo "esta ligação é gravada para registro do agendamento".
- **Data:** "sábado, 24 de outubro" já passou. Use **sábado, 31/10/2026, às 9h**.

### Fontes WhatsApp
- [WA1] Meta for Developers, mensagens com botões de resposta (lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/interactive-reply-buttons-messages
- [WA2] Meta for Developers, mensagens de lista (lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/interactive-list-messages
- [WA3] Meta for Developers, envio de Flow (lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/flows/guides/sendingaflow
- [WA4] Meta for Developers, compartilhar produtos (lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/catalogs/sell-products-and-services/share-products
- [WA5] Meta for Developers, Payments BR, Orders (lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/orders
- [WA6] Meta for Developers, preços (atualizado em 30/09/2026) e changelog (FEP de 7 dias, 28/09/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing ; https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
- [WA7] Meta for Developers, CAPI for Business Messaging (atualizado em 28/09/2026): https://developers.facebook.com/documentation/ads-commerce/conversions-api/business-messaging
- [WA8] SumGenius, citando os Business Solution Terms (vigência em 15/01/2026): https://sumgenius.ai/blog/whatsapp-business-ai-bot-rules-2026/
- [WA9] Meta changelog, Conversation Routing (23/09/2026) e erro 131070 (out/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
- [WA10] Meta for Developers, Offsite Pix e Pix com redirecionamento (16/10/2026, lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/offsite-pix/
- [WA11] Meta for Developers, permissões de chamada (lido em 27/10/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/user-call-permissions
- [WA12] Meta changelog, gravação e transcrição de chamadas (30/06/2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog

---

## 12. Telegram: canal, botões, mensagem efêmera, Mini App e assinatura em Stars (no repo: `tgClube`, Speak Up)

### 12.1 O que existe e quando surgiu [OK]
- **Bot API 10.2 (14/07/2026)** [TG1]:
  - **mensagens efêmeras**, que em grupo só o usuário e o bot veem;
  - **Communities**;
  - webhook `BotSubscriptionUpdated` para mudanças de assinatura;
  - proteção de origem dos Mini Apps, ligada para todos em 20/07/2026.
- **Botões dentro das mensagens e mensagens de boas-vindas (blog de 25/08/2026)** [TG2]:
  - vários botões na mesma mensagem, em grupos, canais ou chats privados;
  - várias pessoas podem interagir com a mesma mensagem, cada uma na sua sessão;
  - combinados com mensagens efêmeras, permitem fluxos como quiz, pesquisa e "ver e pedir produtos";
  - **só novos membros veem** a mensagem de boas-vindas.
- **Stars** [TG3]:
  - **bens e serviços digitais dentro do Telegram têm de ser vendidos em Stars** (`XTR`), "independentemente de qualquer outro portal web";
  - a fatura tem um botão **"Pay"** em destaque (EN; em pt-BR "Pagar" [?]), que abre a tela de pagamento do próprio Telegram;
  - o bot tem **10 s** para responder ao `pre_checkout_query`;
  - um recibo aparece no chat;
  - o bot **tem de responder a `/paysupport`**;
  - reembolso por `refundStarPayment`.
- **Assinatura de canal.** É feita com `createChatSubscriptionInviteLink`: preço de 1 a 10.000 Stars, período sempre de 30 dias (2592000 s) [TG4, notas de 27/10/2026].

### 12.2 Layout
**Canal**
- Cabeçalho com nome e "N inscritos" [OBS]. O repo usa "comunidade", que só serve se o protótipo for de fato uma Community; se não, use "inscritos".
- Post com imagem e texto, hora e visualizações (ícone de olho).
- Abaixo do post, os botões em grade, com cantos arredondados e fundo translúcido [OBS].

**Mini App**
- Abre num sheet de tela quase cheia.
- No topo, "Fechar" à esquerda, o nome do bot no centro e "⋯" à direita [OBS].

**Mensagem efêmera.** O texto "Só você vê esta mensagem" está [?]: a documentação oficial descreve a função, não o rótulo.

### 12.3 Jornada
1. Desafio no canal.
2. Marina toca em "Responder" e recebe uma mensagem efêmera com as opções.
3. Ela acerta e vê "Ver o plano".
4. O Mini App abre com o plano, e ela toca em "Assinar por 30 dias".
5. A fatura em Stars mostra "Pay/Pagar" e a confirmação do Telegram. Depois chegam o recibo e o convite para o grupo.

**Bastidor**
- `successful_payment` com o `telegram_payment_charge_id` guardado.
- `BotSubscriptionUpdated` revoga o acesso quando a assinatura não renova.

### 12.4 Erros a evitar
- **"Prefere Pix? Assine pelo site da escola." dentro do Mini App, como está no repo.** Para produto digital, o Telegram exige Stars e diz que "não pode mostrar" o bot ou Mini App a usuários de celular se ele vender por outros meios [OK, TG3]. Tire a frase. A opção Pix fica no site da escola, sem ser anunciada dentro do Telegram.
- Mensagem efêmera em canal sem botão de origem. Ela nasce da interação com o botão ou o comando.
- Disparo em massa sem respeitar os limites (~30 mensagens/s em broadcast, 20 por minuto em grupos) [TG5].

### Fontes Telegram
- [TG1] Telegram Bot API changelog (lido em 27/10/2026): https://core.telegram.org/bots/api-changelog
- [TG2] Telegram blog, "Welcome Messages, Buttons in Messages and Signed Gifts" (25/08/2026): https://telegram.org/blog/welcome-messages-buttons-TG-13
- [TG3] Telegram, pagamentos em Stars (lido em 27/10/2026): https://core.telegram.org/bots/payments-stars
- [TG4] Telegram Bot API reference, `createChatSubscriptionInviteLink`: https://core.telegram.org/bots/api (via notas de pesquisa de 27/10/2026)
- [TG5] Telegram Bots FAQ, limites: https://core.telegram.org/bots/faq

---

## 13. RCS: da busca à conversa verificada (no repo: `rcsChat`, Ponto Tech)

### 13.1 Situação no Brasil [OK, RCS2]
- 145 milhões de usuários ativos de RCS e cerca de 1 mil empresas usando o canal, segundo o Google Brasil em 12/06/2026.
- **Message Ads** (RCS na Busca) estão **em teste no Brasil**, nos formatos "RCS estendido", "botão" e "message-forward". Os testes começaram pelos dois últimos. "O botão na busca clicável leva o usuário para uma conversa com a empresa no RCS."
- **O texto do botão não foi divulgado.** O "Conversar" do repo é [?].
- Os snippets da Busca que levam ao RCS estão no Android e **só chegam ao iOS até o fim de 2027**.
- Planejado para o fim de 2026: botão de chat RCS no Maps e no Modo IA.
- iPhone com RCS nas três operadoras: Claro desde 17/09/2026, segundo uma única fonte [RCS3].

### 13.2 Limites da mensagem [OK, RCS1, doc atualizada em 13/10/2026]
- Texto até 3072 caracteres.
- **Até 11 sugestões por mensagem**, com **25 caracteres** cada. No máximo 4 delas podem ser fixas.
- **Carrossel de 2 a 10 cards.**
- Altura da mídia: 112, 168 ou 264 DP. O card vai de 112 a 344 DP.
- **"Para compatibilidade com iOS, use mídia com altura Tall."**
- Ações sugeridas: discar, ver local, compartilhar local, abrir URL, **abrir URL em webview (Full, Half ou Tall)** e criar evento na agenda.
- **Selo de verificado.** Agentes verificados ganham automaticamente a marca ao lado do nome, protegida contra imitação e impossível de adicionar à mão [OK, RCS4].
- **Banner** em 45:14 e logo para recorte arredondado.
- **Plano B por SMS:** só depois de checar a entrega e tentar revogar a mensagem original.

### 13.3 Jornada (como deve ficar no mock)
1. Busca no Google e anúncio com o botão de chat, com a nota fora do celular: "piloto do Google no Brasil; entrada no iPhone não confirmada".
2. Abre o app de mensagens com o nome da marca, o logo e a marca de verificado.
3. Card de boas-vindas com sugestões ("Para edição de vídeo", "Para jogos", "Falar com vendedor"), cada uma com até 25 caracteres.
4. Carrossel de 2 produtos. Cada card tem "Comprar" e "Detalhes" (ações de abrir URL).
5. **Pagamento:** "Pagar com Pix" é uma ação de **abrir URL**, em webview ou navegador, que abre a página de pagamento do PSP. Ali aparecem o QR e o copia e cola.
6. Volta ao chat. A empresa envia o card "Pagamento confirmado" quando o webhook do PSP chega.
7. Depois vem o card de acompanhamento da entrega, com SMS como plano B.

### 13.4 Erros a evitar
- **"Você paga com Pix sem sair da conversa"**, como diz o repo. O RCS não tem pagamento nativo; o Pix acontece num link ou webview do PSP. Ajuste a frase para "pague com Pix pelo link seguro".
- Sugestões com mais de 25 caracteres.
- Carrossel de 1 card.
- **Contradição de produto no repo:** o RCS vende o "Notebook Creator 15… branco" agora, mas o fluxo do Instagram diz que o branco só volta em novembro. Escolha uma das duas versões:
  - (a) o RCS vende outra cor;
  - (b) o RCS acontece em novembro.

### Fontes RCS
- [RCS1] Google, RCS Business Messaging, envio de mensagens (atualizado em 13/10/2026): https://developers.google.com/business-communications/rcs-business-messaging/guides/build/messages/send
- [RCS2] Mobile Time, "RCS 145 mi Brasil" (12/06/2026): https://www.mobiletime.com.br/noticias/12/06/2026/rcs-145-mi-brasil/
- [RCS3] Anti/Hype, Claro e RCS no iPhone (fonte única): https://antihype.com.br/c/software/rcs-claro-iphone-ios-27/
- [RCS4] Google, boas práticas de RBM (atualizado em 22/05/2026): https://developers.google.com/business-communications/rcs-business-messaging/guides/learn/best-practices

---

## 14. Ligação com IA no iPhone (no repo: `vozIA`, Vilela Odontologia)

### 14.1 O que o iOS mostra de verdade (Manual da Apple pt-BR e página de disponibilidade, lidos em 27/10/2026)
- **Ligação recebida:**
  - aceitar ou recusar;
  - "Digite para responder", que manda uma mensagem a quem liga e mostra a resposta por escrito;
  - pelo banner da ligação, "Correio de Voz" e "Mensagem" [OK, VOZ1].
- **Filtragem de Ligações** para números desconhecidos, em Ajustes > Apps > Telefone [OK, VOZ2]:
  - as opções são **"Nunca"**, **"Perguntar Motivo da Ligação"** e **"Silenciar"**;
  - a Siri atende no idioma do aparelho;
  - funciona em **Português (Brasil)** [OK, VOZ3].
- **Identificação de Ligação Comercial.** O nome é identificado pelo Apple Business Connect ou pela operadora [OK, VOZ2]. A disponibilidade no Brasil não está confirmada [?].
- **Legendas ao Vivo:** **não funcionam em português.** A lista de idiomas tem alemão, cantonês, coreano, espanhol, francês, inglês, japonês e mandarim [OK, VOZ3].
- **Gravação de Ligação** [OK, VOZ4][VOZ3]:
  - os dois participantes ouvem o aviso de que a ligação está sendo gravada;
  - a gravação fica em Notas > "Gravações de Ligações";
  - a **transcrição funciona em Português (Brasil)**.
- **Tradução ao Vivo em ligações:** funciona em Português (Brasil), com Apple Intelligence [OK, VOZ5].
- **Contexto da Chamada:** com Apple Intelligence, um cartão pode mostrar pedidos e números de confirmação vindos do Mail, Mensagens, Carteira ou Calendário quando a empresa liga ou é chamada. O ajuste é "Mostrar ao Ligar" [OK, VOZ6]. A disponibilidade em pt-BR desse recurso não foi conferida [?].
- **Botões durante a ligação no iOS 26/27:** os rótulos exatos não foram confirmados [?]. O repo usa "silenciar, teclado, áudio, adicionar, FaceTime, contatos", que é o padrão até o iOS 18.

### 14.2 Regras do Brasil (notas de 27/10/2026)
- **Despacho Anatel 100/2026, em vigor a partir de 12/11/2026.** É abuso passar de **1 mil ligações por dia por linha** ou **10 mil por usuário**, ou ter **85% ou mais de chamadas curtas** (até 6 s ou caixa postal). A punição é bloqueio por 15 dias [VOZ7].
- **Decreto 13.135/2026 (SAC).** Permite IA, mas exige que o humano esteja acessível desde o 1º nível, sem obrigar o consumidor a repetir o atendimento, e com o atendente vendo o histórico [VOZ8].
- **Aviso de IA.** Não há norma brasileira verificada que obrigue dizer "é uma IA" na ligação. É boa prática, e o repo já faz [?].

### 14.3 Jornada (Vilela, terça 27/10/2026)
1. Marina pede a ligação no site, marcando o consentimento: "Aceito receber uma ligação agora. Ela pode ser atendida por uma assistente virtual."
2. Em até 60 s o iPhone toca. A tela mostra **só o que o iOS mostra**: o nome identificado ou o número, mais "celular" ou a cidade.
3. Ela atende. A primeira fala do agente se apresenta como IA e oferece a recepção.
4. O agente consulta a agenda (bastidor) e marca quinta, 29/10, às 9h.
5. A ligação termina e a confirmação chega por template de utilidade do WhatsApp.

### 14.4 Erros a evitar (estão no repo hoje)
- **Subtítulo "Assistente virtual · ligação pode ser gravada" na tela da chamada recebida.** A empresa não consegue escrever nada na tela de ligação do iOS. O aviso tem de ser **falado**.
- **"Legendas ao vivo" em português dentro da tela de ligação.** O recurso não existe em pt-BR. Mostre a transcrição como **painel de bastidor fora do celular**, ou use a Gravação de Ligação com o aviso falado e a transcrição em Notas depois da chamada.
- Ligar mais de 3 vezes para um lead que não atende, o que conta como chamada curta para a Anatel.

### Fontes voz
- [VOZ1] Apple pt-BR, atender ou recusar ligações: https://support.apple.com/pt-br/guide/iphone/iph3c9947bf/ios
- [VOZ2] Apple pt-BR, filtrar e bloquear ligações: https://support.apple.com/pt-br/guide/iphone/iphe4b3f7823/ios
- [VOZ3] Apple, disponibilidade de recursos do iOS (Brasil, lido em 27/10/2026): https://www.apple.com/br/ios/feature-availability/
- [VOZ4] Apple pt-BR, gravar e transcrever uma ligação: https://support.apple.com/pt-br/guide/iphone/iph57c6590e9/ios ; Legendas ao Vivo: https://support.apple.com/pt-br/guide/iphone/iphe0990f7bb/ios
- [VOZ5] Apple pt-BR, traduções em chamadas telefônicas: https://support.apple.com/pt-br/guide/iphone/ly3pl0v38sek/ios
- [VOZ6] Apple pt-BR, durante uma ligação / fazer uma ligação: https://support.apple.com/pt-br/guide/iphone/iph3c9951d7/ios ; https://support.apple.com/pt-br/guide/iphone/iph3c993cbc/ios
- [VOZ7] Teletime, bloqueio de chamadas abusivas (19/10/2026): https://teletime.com.br/19/10/2026/operadoras-bloqueio-chamadas-abusivas/
- [VOZ8] Conjur, novo Decreto do SAC (17/10/2026): https://conjur.com.br/2026-out-17/o-novo-decreto-do-sac-atendimento-humano-inteligencia-artificial-e-os-limites-da-regulacao/

---

## 15. Pix Automático (no repo: `pixAuto`, Speak Up Idiomas)

### 15.1 Regras oficiais (BCB, lido em 27/10/2026) [OK, PIX1]
- **Autorização única.** O pagador autoriza **uma única vez**, define **o valor máximo de cada pagamento** e decide se aceita usar **linha de crédito** quando faltar saldo.
- **Cobrança antecipada.** Nos dias anteriores ao pagamento, a empresa envia a cobrança ao banco do pagador. O banco **agenda e notifica**, e o pagador confere no app antes do débito.
- **O que o pagador pode fazer no app** [OK, PIX2]:
  - consultar e cancelar autorizações e débitos agendados;
  - escolher se recebe ou não as notificações de agendamento;
  - ver o histórico;
  - gerenciar um limite exclusivo do Pix Automático, que não consome o limite Pix comum.
- **Lançamento:** 16/06/2025 [OK, PIX3].
- **Prazos.** O intervalo de 2 a 10 dias antes do vencimento para enviar a cobrança, e os horários de cancelamento, não foram lidos no regulamento nesta sessão [?].

### 15.2 Bastidor (API Pix Automático de um PSP) [OK, PIX4]
- **Quatro jornadas de autorização:**
  - **Jornada 1:** solicitação enviada ao app do banco, para negociação feita fora do Pix (por exemplo, no WhatsApp);
  - **Jornada 2:** QR Code para cobranças futuras;
  - **Jornada 3:** QR Code com o primeiro pagamento imediato junto da autorização;
  - **Jornada 4:** fatura com QR Code.
- **Retentativa.** `politicaRetentativa` pode ser `NAO_PERMITE` ou `PERMITE_3R_7D` (3 retentativas em 7 dias, interpretação do nome).
- **Status:**
  - recorrência: `CRIADA` → `APROVADA`;
  - cobrança: `CRIADA` / `ATIVA` / `CANCELADA`;
  - tentativa: `SOLICITADA` / `AGENDADA` / `EXPIRADA` / `CANCELADA`.
- **Campos da recorrência:** vínculo (contrato, devedor, objeto), `dataInicial`, `dataFinal`, `periodicidade`, `valorRec` (valor fixo) ou `valorMinimoRecebedor` (valor variável).

### 15.3 Layout da autorização no banco (fictício)
- Título "Autorizar Pix Automático" e as linhas: Recebedor, CNPJ, Objeto ("Plano mensal de conversação"), Periodicidade ("Mensal"), Valor (fixo, ex.: "R$ 189,00"), Data do 1º pagamento, Data final ("Sem data final"), **Valor máximo** (campo que o pagador preenche) e o interruptor "Usar limite de crédito se faltar saldo".
- Botão de confirmação com senha ou Face ID.
- **Os rótulos variam de banco para banco.** O Nubank usa "Ler QR Code" / "Pix Automático" e o botão "Cadastrar" [OBS, PIX5].

### 15.4 Jornada com as datas corrigidas
- **Sexta, 30/10/2026:** Marina assina no site da Speak Up pela Jornada 3: paga a 1ª mensalidade na hora e autoriza as próximas.
- **Início de novembro:** chega a notificação de agendamento do banco. O 1º débito recorrente fica para quinta, 03/12/2026.
- **Quinta, 03/12, 9h:** o débito falha por falta de saldo. O banco avisa.
- **Mesmo dia, 10h:** a escola manda um template de utilidade no WhatsApp com "Tentar amanhã", "Pausar 1 mês" e "Falar com a escola".
- **Sexta, 04/12:** a retentativa entra pela regra `PERMITE_3R_7D`. Se Marina escolher "Pausar 1 mês", a escola cancela a cobrança e mantém a autorização.

### 15.5 Erros a evitar
- **"terça-feira, 4 de novembro" na tela bloqueada.** Em 2026, o dia 04/11 é quarta-feira.
- Notificação de banco com o nome da escola como remetente. O banco é quem avisa; a escola fala pelo próprio canal.
- Mostrar "Limite máximo: Você define" como dado já preenchido. É um campo do pagador e deve aparecer como campo editável.
- Retentativa oferecida sem a política permitir.

### Fontes Pix Automático
- [PIX1] BCB, Pix Automático (lido em 27/10/2026): https://www.bcb.gov.br/estabilidadefinanceira/pix-automatico
- [PIX2] BCB, Pix Automático, pagadores: https://www.bcb.gov.br/estabilidadefinanceira/pix-automatico-pagadores
- [PIX3] BCB, Pix Automático, participantes (cronograma; lançamento em 16/jun/25): https://www.bcb.gov.br/estabilidadefinanceira/pix-automatico-participantes
- [PIX4] Efí, API Pix Automático (lido em 27/10/2026): https://dev.efipay.com.br/docs/api-pix/pix-automatico
- [PIX5] Nubank, blog sobre Pix Automático (atualizado em 16/06/2025): https://blog.nubank.com.br/pix-automatico/
- Contexto de adoção: Finsiders (25/08/2026), 14 mil recebedores: https://finsidersbrasil.com.br/pagamentos/pix/bc-ve-maior-adocao-do-pix-automatico-nos-proximos-meses/

---

## 16. E-mail: régua de relacionamento no Mail do iOS (no repo: `emailRegua`, Valore Patrimônio)

### 16.1 O que o Mail do iOS faz em 2026 [OK, MAIL1][MAIL2]
- **Categorias automáticas:**
  - **"Principal"**: mensagens pessoais e informações relevantes;
  - **"Transações"**: confirmações, recibos e avisos de envio;
  - **"Atualizações"**: notícias, boletins e atualizações sociais;
  - **"Promoções"**: cupons e ofertas.
- **Disponibilidade:** "não disponível em todos os países ou regiões". No Brasil, não confirmado [?].
- **Agrupamento:** em Transações, Atualizações e Promoções, as mensagens se agrupam por remetente. Uma mensagem relevante dessas categorias também pode aparecer em Principal.
- **Resumo por Apple Intelligence:** "Um breve resumo aparece automaticamente abaixo de cada e-mail na sua caixa de entrada". Funciona no iPhone 15 Pro ou mais novo e o português é um idioma aceito; a disponibilidade desse recurso em pt-BR não foi conferida [?].
- **Contador de não lidas:** o número na Tela de Início conta só a categoria Principal.

### 16.2 Layout
- Topo: "‹ Caixas", título "Caixa de Entrada" e "Editar". Abaixo, a fileira de categorias com ícones [OBS].
- **Linhas da lista:** remetente em negrito, assunto, prévia de 2 linhas (ou o resumo de IA) e a hora.
- **Mensagem aberta:** assunto, remetente com avatar ou logo, "para mim · 9:12", corpo, botão e rodapé com o link de descadastro.
- **Para envio em volume ao Gmail** [OK, MAIL3, guia de fornecedor]:
  - SPF, DKIM e DMARC alinhados;
  - **descadastro em um clique** (RFC 8058) atendido em até 48 h;
  - taxa de spam abaixo de 0,3%.

### 16.3 Jornada (Valore, com as mesmas datas do repo)

| Quando | E-mail | Categoria provável |
|---|---|---|
| Seg, 19/10/2026 | "Seu guia chegou" (logo após o formulário do LinkedIn) | Transações ou Principal |
| Qui, 22/10/2026 | "Três perguntas antes de separar o patrimônio" | Atualizações |
| Ter, 27/10/2026, 9:12 | "Marina, quer revisar o seu caso em 30 minutos?" | Atualizações |

- Clique em "Agendar conversa" leva à página de agenda. Depois que ela marca, a régua **suprime** os e-mails seguintes.
- **Bastidor:** eventos de abertura e clique (a abertura não é confiável no Apple Mail, por causa da proteção de privacidade [OBS]), o CRM muda a etapa e a CAPI do LinkedIn ou da Meta recebe a conversão.

### 16.4 Erros a evitar
- **Selo de verificado ao lado do remetente no Mail do iOS**, como está no repo. Esse selo é do Gmail com BIMI e VMC [OBS, não reverificado nesta sessão]. No Mail do iOS use logo ou avatar sem a marca.
- Régua de marketing caindo em "Principal" sem explicação. Mostre a categoria, ou desative as categorias e diga isso fora do celular.
- Prévia comum quando a cena simula um iPhone 17 Pro Max com Apple Intelligence. Decida: ou mostra o resumo de IA, ou avisa que o recurso está desligado.

### Fontes e-mail
- [MAIL1] Apple pt-BR, categorizar e-mails no Mail: https://support.apple.com/pt-br/guide/iphone/iphfe4a36baf/ios
- [MAIL2] Apple pt-BR, conferir e-mails no Mail: https://support.apple.com/pt-br/guide/iphone/iph461684497/ios
- [MAIL3] Red Sift, requisitos para envio em volume (guia de fornecedor, 2026): https://redsift.com/guides/bulk-email-sender-requirements

---

## 17. Artigo patrocinado (publieditorial) (no repo: `blogArticle`, Valore Patrimônio)

**Regra de base [OK, ART1]:** o CDC, art. 36, diz que "A publicidade deve ser veiculada de tal forma que o consumidor, fácil e imediatamente, a identifique como tal." O Código do CONAR (identificação de publicidade e matéria paga) não foi relido nesta sessão [?].

**Layout recomendado**
- Faixa **"Publicidade"** ou "Conteúdo patrocinado" **acima do título**, em destaque e não em cinza claro.
- Depois do título, a linha "Oferecido por Valore Patrimônio", com o logo.
- Assinatura da autoria por estúdio de conteúdo ou pela marca, **não pela "Redação"**.
- Bloco de oferta com o botão, e o aviso de risco ("Investimentos envolvem riscos").
- "Leia também" com conteúdo editorial separado visualmente.

**Erro a evitar.** A assinatura **"Redação, em parceria com Valore Patrimônio"**, que está no repo, sugere que a redação escreveu o texto pago. Troque por "Estúdio Revista Exemplo para Valore Patrimônio" ou equivalente.

### Fontes artigo
- [ART1] Planalto, Código de Defesa do Consumidor, art. 36 e art. 49 (lido em 27/10/2026): https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm

---

## 18. Visão transversal: modelo de dados único para as marcas fictícias

### 18.1 A cliente e o aparelho

| Campo | Valor |
|---|---|
| Nome | Marina Alves (protagonista de todas as jornadas) |
| Usuário | @marina.alves (Instagram, TikTok, Threads) |
| E-mail | marina.alves@exemplo.com |
| Celular | (11) 9••••-••00 (sempre mascarado) |
| CPF | não mostrado; quando pedido, "•••.•••.•••-00" |
| Cidade | São Paulo, Pinheiros |
| Aparelho | iPhone 17 Pro Max, iOS 27, tema claro (escuro só no Instagram e no TikTok à noite) |
| Banco | "Banco Exemplo" (fictício, já no repo) |
| Operadora | não citar marca |

### 18.2 As marcas (as do repo) e o papel de cada uma

| Chave | Marca | Canais no portfólio | Fato central (uma única verdade por marca) |
|---|---|---|---|
| `educacao` | Speak Up Idiomas | IG Feed e Story, FB in-stream, Shorts, Telegram, Pix Automático | Aula experimental **quinta, 29/10/2026, 19h**, on-line; plano mensal B1 às quintas, 19h, a partir de 05/11 |
| `clinica` | Vilela Odontologia | IG Explorar, Google Pesquisa, WhatsApp por anúncio, Voz IA | Avaliação **quinta, 29/10/2026, 9h**, Rua Exemplo, 120, Pinheiros. **Uma só consulta**; as outras demos aparecem como "caminho alternativo" |
| `incorporadora` | Atlântica Incorporadora | FB carrossel e post, SEO | Visita ao decorado **sábado, 31/10/2026, 10h**; plantas de 3 e 4 quartos |
| `restaurante` | Casa Amaro | IG Reels e Live, FB vídeo, Maps, WhatsApp catálogo | Feijoada aos sábados; encomenda "Feijoada completa para 4" para **sábado, 31/10/2026, retirada às 12h**; live na **sexta, 30/10, às 19h** |
| `varejo` | Ponto Tech | TikTok, YouTube Live, comentário → Direct, RCS | Notebook Creator 15: **branco em lista de espera até 16/11/2026**; RCS vende o **grafite** agora ou fica para depois de 16/11 |
| `automotivo` | EcoDrive Elétricos | YouTube in-stream, WhatsApp ligação | Test drive **sábado, 31/10/2026, 9h**, loja Pinheiros |
| `turismo` | Destino Certo Viagens | Display, ChatGPT, WhatsApp agente e Pix | Festa do Divino: saídas **10–13/06/2027** e **17–20/06/2027** (qui–dom); pré-reserva com sinal por Pix |
| `financas` | Valore Patrimônio | LinkedIn Documento, e-mail, artigo | Guia baixado na **seg, 19/10**; conversa marcada para **terça, 03/11/2026, 15h** |

### 18.3 Regras de consistência
1. **"Hoje" é terça, 27/10/2026.** As cenas do dia ficam entre 9h e 21h, e a status bar mostra a hora da última mensagem.
2. **Datas de semana conferidas:**

   | Data | Dia |
   |---|---|
   | 29/10 | quinta |
   | 30/10 | sexta |
   | 31/10 | sábado |
   | 03/11 | terça |
   | 04/11 | quarta |
   | 05/11 | quinta |
   | 27/11 | sexta (Black Friday) |
   | 03/12 | quinta |

3. **Uma ação aparece com o mesmo horário em todos os canais** (a avaliação da Vilela é sempre às 9h de 29/10).
4. **Janelas de conversa respeitadas:**
   - Instagram: 24 h, ou até 7 dias vindo de anúncio de clique para Direct;
   - WhatsApp: FEP de até 7 dias e serviço de 24 h;
   - Messenger: até 7 dias vindo de anúncio.

   Tudo o que vier depois disso é template ou outro canal.
5. **Rótulos de anúncio por rede, sem misturar:**

   | Rede | Rótulo |
   |---|---|
   | Instagram | "Anúncio" |
   | Facebook | "Anúncio" (ou "Patrocinado" com a nota de transição; um só no portfólio inteiro) |
   | TikTok | "Patrocinado" |
   | YouTube | "Patrocinado" |
   | Google | "Patrocinado" / "Resultados patrocinados" |
   | Maps | "Patrocinado" |
   | LinkedIn | "Promovido" |
   | ChatGPT | "Patrocinado" |
   | Live de criador | "Inclui promoção paga" + #publi |
   | Artigo | "Publicidade" |

6. **Valores.** Ou todos fictícios e visíveis (preferível, com "valores ilustrativos" fora do celular), ou todos mascarados. Não misturar.
7. **Identificação de automação.** Vai no texto da 1ª mensagem ou na 1ª fala. Rótulo de plataforma ("IA") só onde a plataforma o aplica (Meta Business Agent).

---

## 19. Melhorias priorizadas para os fluxos do portfólio

### P0: erros que um especialista percebe na hora (corrigir antes de mostrar)
1. **Rótulos do Instagram.** Trocar "Patrocinado" por "Anúncio" em `lab-telas.js`: feed, story, live e Reels. Decidir o rótulo do Facebook e aplicar igual em todas as telas. No ChatGPT, trocar a pílula "Anúncio" por "Patrocinado".
2. **CTAs inventadas → textos da lista oficial:**

   | Hoje | Trocar por |
   |---|---|
   | "Agendar aula" (IG Story) | "Reservar agora" ou "Cadastrar-se" |
   | "Ver cardápio" (IG Reels) | "Ver menu" |
   | "Ver cardápio de sábado" (IG Live) | "Ver menu" |
   | "Agendar avaliação" (Explorar) | "Solicitar horário" |
   | "Agendar agora" (FB carrossel e post) | "Saiba mais" ou "Obter cotação" |
   | "Reservar mesa" (FB vídeo) | "Reservar agora" |

3. **Tirar "Legendas ao vivo" das duas ligações** (`vozIA`, `waChamada`) e o subtítulo inventado da tela de chamada do iOS. Levar a transcrição para o painel de bastidor.
4. **Datas impossíveis:** test drive em 24/10 (já passou) → 31/10; "terça, 4 de novembro" → quarta (ou mudar a data); saída "12 a 15 de junho (qui–dom)" → 10–13/06/2027.
5. **Contradições entre canais:** o Creator 15 branco está em lista de espera (Instagram) e à venda (RCS); o aviso de reposição chega "Hoje 18:40", mas o produto volta em novembro.
6. **Rótulos de automação que as plataformas não usam:** "Mensagem automática" (WhatsApp) e "Resposta automática" (Instagram). Trocar pelo aviso no próprio texto.
7. **Facebook in-stream:** o anúncio vai dentro do mesmo player, em 4:5 ou 1:1, depois de pelo menos 15 s (~1 min) de conteúdo. "Pular" aos 5 s, ou sem botão se for não pulável.
8. **Explorar:** bloco 1×1 só com logo e "Anúncio"; o toque abre o visualizador imersivo de Reels.
9. **Live do Instagram:** tirar "Sacola"; CTA "Ver menu"; DM por comentário só durante a live.
10. **Telegram:** remover "Prefere Pix? Assine pelo site" de dentro do Mini App.
11. **WhatsApp:** botões com até 20 caracteres e presos à bolha; resolver "Sex, 30 de out, 10h30" (21 caracteres).

### P1: fidelidade de fluxo (o que faz parecer real)
12. **WhatsApp Pix com troca de app:** botão "Pagar com Pix" [?] → lista de bancos com busca (e a opção de copiar o código) → CPF e termos só no 1º uso → revisão com `merchant_name` → app do banco já na confirmação → volta ao WhatsApp → bolha com "pago" e marca verde → `order_status`.
13. **Catálogo do WhatsApp:** fechar o pedido com `order_details` + `order_status` em vez de "Resumo do pedido / Confirmar pedido"; mostrar preços.
14. **Permissão de ligação no WhatsApp:** escolha temporária (7 dias) ou permanente; aviso falado de gravação ou transcrição; limites de pedido no bastidor.
15. **YouTube in-stream:** "Patrocinado: 1 de 2 · 0:20" num bloco de dois anúncios (o formato com um anúncio só não está confirmado [?]), "Visitar anunciante", barra amarela e "Pular" aos 5 s, sem texto grande de contagem.
16. **Shorts:** coluna "Gostei / Não gostei / Comentar / Compartilhar", sem "Remixar"; CTA aos 3 s.
17. **TikTok:** CTA aos 3 s e cor aos 5 s, com a cor tirada do vídeo; legenda sem hashtags (ou transformar em Spark); `Purchase` vindo do servidor quando o PSP confirma o Pix.
18. **ChatGPT:** tirar a frase de ligação escrita pelo "modelo"; manter a divisória cinza; pensar numa variante em carrossel com 2–3 roteiros do mesmo anunciante.
19. **RCS:** botão da Busca marcado como piloto, com a entrada no iPhone não confirmada; Pix por link; sugestões até 25 caracteres; carrossel com 2 cards ou mais.
20. **E-mail:** sem selo de verificado no Mail do iOS; categoria ("Atualizações" ou "Promoções") visível ou desligada de forma explícita; decidir sobre o resumo de IA.
21. **Artigo:** faixa "Publicidade" acima do título; assinatura do estúdio, não da redação.
22. **Formulário instantâneo do Facebook:** tipo "Maior intenção" com tela de revisão, código por SMS e conclusão com "Marcar horário" mostrando o calendário embutido (só no app do Facebook).

### P2: profundidade de bastidor (o que diferencia o portfólio)
23. **Registro de eventos por fluxo, com nome técnico e tempo:**
    - `leadgen` → CRM → CAPI para CRM (`system_generated`, etapas);
    - `referral.ctwa_clid` → `LeadSubmitted` / `Purchase` (`business_messaging`);
    - webhook do PSP → `order_status`;
    - `politicaRetentativa` / status da cobrança (Pix Automático);
    - `BotSubscriptionUpdated` (Telegram);
    - `live_comments` → resposta privada (Instagram).
24. **Relógios de janela visíveis no bastidor:** 24 h (Instagram/WhatsApp), FEP de 7 dias, permissão de ligação de 7 dias, Pix com validade mínima de 300 s.
25. **Custo por conversa** no WhatsApp: serviço pago desde 01/10/2026, depois de 1.000 grátis; Meta Business Agent por token; FEP grátis.
26. **Painel de conformidade da voz:** limites da Anatel a partir de 12/11/2026, taxa de chamadas curtas abaixo de 85%, passagem para humano com histórico (Decreto 13.135/2026).
27. **Um caminho de falha em cada fluxo**, como o repo já faz no `agente-falha`: Pix expirado, permissão de ligação revogada após 4 chamadas não atendidas, débito do Pix Automático recusado, SMS como plano B do RCS.

---

## 20. Anexo: tabela rápida de limites para o mock

| Superfície | Limite | Fonte |
|---|---|---|
| Carrossel do Instagram | 2–10 cards; 4:5 só com imagens, 1:1 com vídeo; texto de 125 | IG6 |
| Reels (IG) | texto de 44; zonas seguras 14/35/6%; sem música licenciada | IG12 |
| Stories (IG) | figurinha de CTA na base; 14% em cima e 20% embaixo livres; 5 s por imagem | IG13, IG14 |
| Respostas rápidas do Instagram | 13 × 20 caracteres; ice breakers ≤ 4; card ≤ 10 com 3 botões | IG20, IG21 |
| Carrossel do Facebook | 2–10 em 1:1; texto de 80; título de 20; descrição de 18 | FB3 |
| Post com link do Facebook | 4:5 (1440 × 1800); título de 27 | FB17 |
| In-stream do Facebook | intervalo depois de 15 s (~1 min); pular aos 5 s; não pulável até 15 s; 4:5 ou 1:1 | FB20–22 |
| Ice breakers do Messenger | título de 80; resposta de 300 | FB24 |
| CTA do TikTok (oCPM) | texto aos 3–5 s; cor aos 4–7 s | TT4 |
| YouTube in-stream | pular aos 5 s; visualização aos 30 s; criativo de 12 s ou mais; CTA de 10 caracteres | YT2, YT4 |
| YouTube Shorts | CTA aos 3 s (PMax, Geração de Demanda, apps) ou 10 s (visualização/alcance); 60 s no feed; descrição de 90 | YT6 |
| LinkedIn Documento | título de 70; texto de 150; 100 MB; ≤ 300 páginas | LI1 |
| Lead Gen do LinkedIn | 3 perguntas personalizadas + 12 campos | LI2 |
| Botões de resposta do WhatsApp | 3 × 20 caracteres | WA1 |
| Lista do WhatsApp | botão de 20; 10 linhas; título de 24; descrição de 72 | WA2 |
| CTA de Flow do WhatsApp | ≤ 30 caracteres | WA3 |
| `order_details` do WhatsApp | corpo de 1024; item de 60; validade ≥ 300 s | WA5 |
| RCS | 11 sugestões × 25 caracteres; carrossel de 2–10; mídia Tall no iOS | RCS1 |
| Fatura em Stars (Telegram) | resposta ao pré-checkout em 10 s; `/paysupport` obrigatório | TG3 |
