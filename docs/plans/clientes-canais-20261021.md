> Plano original de 21/10/2026, copiado da pasta de trabalho em 22/10/2026 (lá se chamava `clientes.md`); os comentários do código e o `SOURCES.md` das fotos citam este arquivo. É histórico: os storyboards, os sites e as telas mudaram depois. O guia atual é [`docs/secao-canais.md`](../secao-canais.md), e o código vale mais que este plano.

# Clientes, jornada e UI compacta: "Sua oferta. Em cada canal." (v2)

Leitura e proposta de 21/10/2026. Só leitura: nada em `/home/user/portifolio` foi alterado. Base: `build.md`, `mapa.md`, `origem.md`, `v2/logos.md`, `v2/ref/`, o código atual (`campaign-channels.js`, `experience-player.js`, `positioning.js`) e o estúdio da Fatos (`/home/user/roblox/src/lib/estudio.ts`, `public/estudio/`, `LogosFicticios.tsx`).

## 0. Resumo

- **Oito tipos de cliente**, um anunciante fictício por tipo, cobrindo os 16 posicionamentos das 11 abas. Cada posicionamento tem o seu cliente "mais natural", e cada aba mostra pelo menos um cliente diferente das vizinhas.
- **Três nomes da Fatos colidem com empresas reais do mesmo ramo no Brasil** e não devem ir para o portfólio público: Arco (concessionárias "Arco Motos" e "Renault Arco"), Rota Viva (agências "Rota Viva Turismo" e o selo "Rota Viva Veadeiros", em Goiás, mesmo estado de Pirenópolis) e Kairo ("Kairo Informática", Curitiba). As **fotos** desses anunciantes continuam utilizáveis com nomes novos. O cenário **Casa Costa** também colide com lançamentos imobiliários reais (seção 2.3).
- **Cada storyboard mostra a jornada inteira dentro do aparelho**: gancho no primeiro segundo, um momento de retenção, o toque no CTA (com o dedo marcado) e a próxima tela nativa (formulário instantâneo, conversa no WhatsApp com mensagem pronta, rota no Maps, carrinho, App Store, folha de ligação etc.).
- **O bloco "Posicionamento" (6 itens de texto) sai.** No lugar entram: logo oficial e chips de formato, um chip de cliente ("Exemplo: restaurante, marca fictícia"), uma barra de jornada em 3 passos (Atenção, Retenção, Conversão) sincronizada com o storyboard, um ponto numerado sobre o mock por passo (no máximo 6 palavras por rótulo) e uma única frase curta. Abaixo do mock, a 390 px, o texto cai de cerca de 700 px de altura para cerca de 210 px.
- Nada de preço, métrica, avaliação, contagem ou depoimento. Rótulo de anúncio como cada plataforma mostra em pt-BR. Avisos de setor (CRO, CRECI, registro de incorporação, mensagem de trânsito, "Investimentos envolvem riscos.") entram como marcadores, sem inventar número de registro.

## 1. Tipos de cliente que o dono atende

O que o repositório mostra (serviços: direção criativa, identidade, conteúdo, campanhas, sites e landing pages, aplicativos, sistemas e automações):

| Tipo | Evidência no repositório | Entra? |
|---|---|---|
| Restaurante e comércio local | Catálogo do WhatsApp e respostas rápidas para "vender uma oferta" (`catalogo-whatsapp.txt:280`); agendamento de "Aula avulsa, Consultoria, Oficina" do Ateliê Exemplo (`deck-demos.js:79`); o contato do dono é pelo WhatsApp | Sim |
| Clínica e saúde | Não aparece com esse nome. Entra por ser o cliente típico de agendamento por busca e WhatsApp, que é exatamente o que o portfólio vende em "Sites e landing pages" e "Sistemas e automações" | Sim (declarado como inferência) |
| Imobiliária e arquitetura | Casa Costa ("Arquitetura em diálogo", `static-r8/casa-costa.webp`), forma.arquitetura no catálogo | Sim |
| Varejo e e-commerce | "Lojas e e-commerce" e "Conversar sobre uma loja" (`deck-demos.js`), NATURAIS (`08-ecommerce-cena.webp`), "Página de produto e loja virtual também entram" (`catalogo-whatsapp.txt:280`) | Sim |
| Turismo e hospedagem | Trilhas e Trilha do Arco (app de percursos), Rota Viva no estúdio da Fatos | Sim |
| Educação e cursos | Aulas e oficinas do Ateliê Exemplo; banco de talentos com "Redação e roteiro" e "Edição de vídeo" para cursos e criadores | Sim |
| Serviços B2B e finanças | "Sistemas e automações" para "equipes que repetem tarefas" (`catalogo-whatsapp.txt:509`), demo "Preparar proposta para um novo cliente" (`index.html:193`), Arrimo Patrimônio no estúdio | Sim |
| Automotivo | Só no estúdio da Fatos (Arco, SUV elétrico) | Sim (alcance) |
| Criadores de conteúdo | `/criadores` e `/criadores/ao-vivo` | Indireto: a live do YouTube mostra um criador com publi identificada |
| Mídia e editorial | Fatos (estudo editorial) | Indireto: o publieditorial mostra o lado do veículo |

## 2. Anunciantes fictícios

### 2.1 Os oito

| Tipo (chip) | Marca | O que anuncia | Domínio e @ | Origem e imagens | Logo |
|---|---|---|---|---|---|
| Restaurante | **Tacho Miúdo** | Cozinha brasileira, feijoada no tacho aos sábados, encomendas | `tachomiudo.exemplo`, `@tachomiudo` | Nova. Fotos do Pexels em `/assets/portfolio/canais/restaurante-*.webp` e mapa `/assets/portfolio/canais/mapa-cidade.svg` (seção 7.1) | Novo: círculo terracota `#a4462a` com "tm" minúsculo branco; nome em Inter 600 |
| Clínica odontológica | **Seixo Odontologia** | Avaliação com hora marcada | `seixo.exemplo`, `@seixoodontologia` | Nova. `/assets/portfolio/canais/clinica-consultorio-4x5.webp` e `/assets/portfolio/canais/clinica-recepcao-4x5.webp` (Pexels) | Novo: círculo `#2f6f73` com uma elipse branca (seixo); "seixo" minúsculo |
| Incorporadora | **Morada Falésia** | Casas na falésia, visita ao decorado | `moradafalesia.exemplo` | Reaproveita `portfolio/smiile-architecture-coast.webp` (foto limpa, sem o texto "Casa Costa"). Sala: `/assets/portfolio/canais/incorporadora-sala-mar-1x1.webp` e `-4x5.webp`, recortes da mesma foto | Novo: círculo `#1f4e5f` com linha de falésia branca; nome em Newsreader |
| Loja de tecnologia | **Teclaria** | Notebook de marca própria "Teclaria Pro 15" | `teclaria.exemplo`, `@teclaria` | Foto do Kairo, já no repositório: `/assets/portfolio/campanha-nerd.webp` (mesmo md5 de `roblox/public/estudio/campanha-nerd.webp`; não duplicada) | Novo: quadrado arredondado `#5b3df5` com uma tecla em contorno branco |
| Agência de viagens | **Bandeirola Viagens** | Festas tradicionais em grupo pequeno, guia da cidade e hotel no centro | `bandeirola.exemplo` | Foto da Rota Viva, copiada: `/assets/portfolio/canais/campanha-crencas.webp` (rua histórica com bandeirolas, sem pessoas) | Novo: círculo `#d9822b` com três bandeirinhas brancas |
| Escola de idiomas | **Sotaque Livre Idiomas** | Aula experimental e app de prática de conversação | `sotaquelivre.exemplo`, `@sotaquelivre` | Nova. Cartões tipográficos em HTML. Fotos: `/assets/portfolio/canais/escola-fones-caderno-4x5.webp` e `/assets/portfolio/canais/escola-fones-caderno-9x16.webp` (Pexels) | Novo: quadrado arredondado coral `#e5533d` com balão de fala branco |
| Gestora de patrimônio | **Arrimo Patrimônio** (Fatos) | Especialista que explica cada decisão antes de assinar | `arrimo.exemplo` | Copiada: `/assets/portfolio/canais/campanha-negocios.webp`. **Usar `/assets/portfolio/canais/campanha-negocios-sem-grafico.webp`** (720 x 913, já sem a tela do notebook, que mostra um gráfico subindo): `object-position` 16:9 `center 11%`, 1:1 `center 31%`, 4:5 `center 100%` | O da Fatos: `LogoFicticio id="arrimo"` em `roblox/src/components/islands/estudio/LogosFicticios.tsx` (portar como SVG inline), círculo `#0f1a2c`, logo `#d8b866`; PNG de referência em `roblox/docs/circulos/circulo_arrimo.png` |
| Concessionária | **Ondara Elétricos** | Test drive de SUV elétrico (modelo sem nome) | `ondara.exemplo` | Foto do Arco, copiada: `/assets/portfolio/canais/campanha-esportes.webp` (SUV carregando no estacionamento do estádio, placa em branco). 16:9 `center 32%` | Novo: círculo `#0f6b5c` com uma onda branca. O logo "arco" da Fatos não serve (tem o nome) |

Fotos da Fatos: geradas no Higgsfield, sem pessoas e sem marcas reais (`roblox/CLAUDE.md`). Destino final no portfólio: `public/assets/portfolio/canais/`, com `SOURCES.md` (origem, autor, licença, data, recorte e o que cada foto mostra). Outros recortes úteis: Bandeirola 1:1 `center 8%`, 1,91:1 `center 9%`; Teclaria 1:1 `center 18%`, 16:9 `center 19%`. O 9:16 inteiro do SUV e do notebook tem a metade de baixo escura, boa para a interface do TikTok e do Shorts.

Logos novos: forma geométrica simples e o nome em texto, no mesmo espírito de `LogosFicticios.tsx` (nada de anéis entrelaçados, maçã, estrela, arcos duplos ou mascotes). Dentro do aparelho, o avatar é `span` com CSS ou SVG inline.

### 2.2 Verificação dos nomes (busca em 21/10/2026, TinyFish com local BR e pt, e WebSearch)

| Nome | Resultado | Decisão |
|---|---|---|
| Tacho Miúdo | Nenhum negócio (só a expressão num blog de 2018) | Usar |
| Seixo Odontologia, Clínica Seixo | Nenhum no Brasil (há "Seixo da Beira", lugar em Portugal) | Usar |
| Morada Falésia | Nenhum resultado. Existe "AP Victoria Falésia Residências" em Albufeira, Portugal (nome diferente, outro país) | Usar |
| Teclaria | Nenhum negócio (só a conjugação do verbo teclar) | Usar |
| Bandeirola Viagens | Nenhum resultado | Usar |
| Sotaque Livre Idiomas | Nenhuma escola (há um grupo musical "Trio Sotaque Livre") | Usar |
| Ondara Elétricos | Nenhum no Brasil. Existe "Ondara Motors", concessionária na cidade de Ondara, Espanha | Usar "Ondara Elétricos", nunca "Ondara Motors" |
| Arrimo Patrimônio | Nenhuma gestora. Há "Arrimo, gestão de conflitos" (cursos, Campinas), outro ramo | Usar, com a ressalva registrada |
| Arco (automotivo) | "Arco Motos" (concessionária Honda, PE) e "Concessionária Renault Arco" (São Paulo) | Não usar no portfólio |
| Rota Viva (turismo) | "Rota Viva Turismo" (CNPJ em Urandi, BA, e @rotaviva_ba), rotavivaturismo.com.br, "Rota Viva Veadeiros" (selo de turismo em Goiás) | Não usar |
| Kairo (informática) | "Kairo Informática" (Curitiba, monta computadores), "KAIRO PC" (México) | Não usar |
| Casa Costa (imobiliário) | Lançamento "Casa Costa" em Ilhabela (Curio Collection by Hilton), "Casa Costa" em Porto Alegre (Foxter), "Casa Costa Construtora e Incorporadora" (CNPJ, Francisco Morato) | Não usar como anunciante imobiliário nesta seção |
| Rejeitados na busca | Brasa Mansa (restaurante em Itajaí), Clínica Nácar (São Paulo e Foz), Calmaria Odontologia (Rio), Clínica Orvalho (psicologia, SP), Clínica Moara (várias), Movera (mobilidade elétrica), Zênite (várias de TI), Alvor (mecânica no RS), Voltaia (imobiliária na Itália), Ravina Motors (Índia), Linguar (app de idiomas, perto de "Linguarê") | Descartados |

Pendente antes de publicar: busca no INPI (marcas registradas nas classes 35, 36, 37, 39, 41, 43 e 44), que não consegui consultar daqui.

### 2.3 Fora do escopo, mas importante

- **Casa Costa** é usada no resto do portfólio (card de Trabalhos, catálogo do WhatsApp, `static-r8/casa-costa.webp`) como "cenário fictício do projeto smiile". A busca acima mostra empreendimentos e uma incorporadora reais com esse nome. O próprio catálogo já listava a pendência ("Confirmar que Casa Costa e forma.arquitetura não coincidem com negócio real", `catalogo-whatsapp.txt:329`). Agora há resposta: coincide.
- Os mesmos nomes (Arco, Rota Viva e Kairo) estão no estúdio da Fatos (`roblox`). O `CLAUDE.md` de lá já marca "confirmar os nomes das marcas fictícias (Arco na categoria automotiva)" como pendência.

## 3. Matriz: posicionamento, cliente e conversão

| Aba | Posicionamento | Cliente (tipo) | Conversão dentro do mock | Próxima tela nativa |
|---|---|---|---|---|
| Instagram | Feed (carrossel 4:5) | Sotaque Livre (escola de idiomas) | Barra "Inscrever-se agora" | Navegador do Instagram: nível e horário, aula experimental agendada |
| Instagram | Reels 9:16 | Tacho Miúdo (restaurante) | "Ver cardápio" | Navegador do Instagram: cardápio, reserva de mesa |
| Facebook | Feed (carrossel, anúncio de cadastro) | Morada Falésia (incorporadora) | "Agendar agora" | Formulário instantâneo pré-preenchido, tela de obrigado |
| TikTok | In-Feed 9:16 | Teclaria (loja de tecnologia) | "Comprar agora" | Página do produto no navegador do TikTok, "Adicionado ao carrinho" |
| YouTube | Anúncio no vídeo 16:9 | Ondara Elétricos (concessionária) | "Agendar" no player | Página de test drive: dia e período |
| YouTube | Shorts 9:16 | Sotaque Livre (app) | "Instalar" | Folha da App Store: "Obter", depois "Abrir" |
| YouTube | Live (criador com publi) | Teclaria com um criador fictício | Link na mensagem fixada | Página "Avise-me quando chegar" |
| LinkedIn | Documento com formulário de leads | Arrimo Patrimônio (gestora) | "Desbloquear" no documento | Formulário com dados do perfil, documento liberado |
| Google Ads | Pesquisa | Seixo Odontologia (clínica) | Botão "Ligar" do anúncio | Folha de ligação do iOS |
| Google Ads | Display responsivo | Bandeirola Viagens (agência) | Seta do anúncio | Página de saídas, pré-reserva |
| SEO | Orgânico | Morada Falésia (incorporadora) | "Receber as plantas em PDF" | Campo de e-mail, "Enviamos as plantas" |
| ChatGPT | Cartão abaixo da resposta | Bandeirola Viagens (agência) | Toque no cartão | Página "Monte seu roteiro", roteiro sugerido |
| Google Maps | Pin e ficha patrocinados | Tacho Miúdo (restaurante) | "Rotas" | Tela de rota com "Iniciar" |
| WhatsApp Business | Clique para conversar | Seixo Odontologia (clínica) | "Enviar mensagem pelo WhatsApp" | Conversa com mensagem pronta, botões de horário |
| WhatsApp Business | Catálogo (não é anúncio) | Tacho Miúdo (restaurante) | "Conversar com a empresa" no item | Conversa com o item anexado |
| Publieditorial | Artigo em revista parceira | Arrimo Patrimônio (gestora) | "Agendar conversa" no bloco da marca | Agenda de 30 minutos, conversa agendada |

Contagem por tipo: restaurante 3, clínica 2, incorporadora 2, loja de tecnologia 2, agência 2, escola 2, gestora 2, concessionária 1. Cada aba com mais de um formato mostra clientes diferentes por formato (Instagram: escola e restaurante; YouTube: concessionária, escola e loja; Google Ads: clínica e agência; WhatsApp: clínica e restaurante).

## 4. Storyboards

Convenções:
- Duração padrão: Atenção 1,4 s; Retenção 2,0 s; toque 1,2 s (o dedo aparece aos 0,7 s); próxima tela 1,8 s; confirmação 2,4 s. Total de 7 a 9 s, finito, para no último quadro com "Rever".
- Passo da jornada por quadro: Q1 = Atenção, Q2 = Retenção, Q3 em diante = Conversão.
- Transição dentro do aparelho: `corte` (vídeo vertical, o `--corte` atual), `deslize` (carrossel com mola), `empurrar` (página nova entra da direita, 360 ms, `cubic-bezier(.32,.72,0,1)`), `folha` (sobe de baixo, 420 ms, mesma curva, fundo a 40%) e `digitar` (busca, 40 ms por letra).
- "Dedo" = marcador de toque no CTA (seção 5.5). "(conferir)" = rótulo a confirmar no app antes de publicar.
- Âncora do ponto numerado: elemento do mock com `data-hs="1|2|3"`. O ponto é posicionado pelo retângulo desse elemento.
- Textos de pessoa nos formulários são marcadores genéricos ("Seu nome", "voce@exemplo.com", "(11) 90000-0000"), nunca um nome inventado.

### 4.1 Instagram, Feed: Sotaque Livre Idiomas (escola de idiomas)

Frase: "Uma escola de idiomas leva do carrossel à aula experimental."
Identificação: "Patrocinado" abaixo do nome. Formato: carrossel 4:5, 3 cartões, com barra de CTA.

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Cabeçalho do post: avatar SL, "sotaquelivre", "Patrocinado". Cartão 1, fundo coral: **"Você entende a série sem legenda?"**. Contador "1/3" no canto da imagem. Barra cinza "Inscrever-se agora ›" | HTML tipográfico | entra |
| 2 | Retenção | Desliza para o cartão 2: "Três expressões que a legenda traduz errado". Desliza para o 3: "I'm looking forward to it." / "Mal posso esperar." A barra de CTA acende na cor da marca depois de alguns segundos no post (conferir). Pontos do carrossel acompanham. Legenda: "**sotaquelivre** Aula experimental com horário marcado. Escolha o nível e o horário no link." | HTML | deslize |
| 3 | Conversão | Dedo na barra "Inscrever-se agora" | igual | toque |
| 4 | Conversão | Navegador do Instagram (X, "sotaquelivre.exemplo", "…"). "Aula experimental". "Qual é o seu nível?" [Começando] [Intermediário, marcado] [Avançado]. "Escolha um horário" [Ter 19h] [Qui 19h, marcado] [Sáb 10h]. Botão "Agendar aula experimental" pressionado | HTML | empurrar |
| 5 | Conversão | "Aula experimental agendada". "Quinta, 19h. O link da aula chega por e-mail." Botão "Adicionar ao calendário" | HTML | no lugar |

Pontos: 1 "Pergunta que o aluno reconhece" (título do cartão 1); 2 "Deslizar revela a resposta" (pontos do carrossel); 3 "Nível e horário em dois toques" (botão "Agendar").

### 4.2 Instagram, Reels: Tacho Miúdo (restaurante)

Frase: "Um restaurante leva do Reels à reserva de mesa."
Identificação: "Patrocinado" abaixo do nome.

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Tela cheia. Texto na tela, longe das bordas: **"Sábado tem feijoada no tacho."** Embaixo: avatar tm, "tachomiudo", "Patrocinado", legenda cortada, botão translúcido "Ver cardápio". Trilho de ações só com ícones | `/assets/portfolio/canais/restaurante-feijoada-panela-9x16.webp` | entra |
| 2 | Retenção | Corte para o prato servido: "Fogo baixo desde cedo." Barra de progresso do vídeo anda. O botão "Ver cardápio" ganha cor (conferir) | `/assets/portfolio/canais/restaurante-feijoada-prato-9x16.webp` | corte |
| 3 | Conversão | Dedo em "Ver cardápio" | igual | toque |
| 4 | Conversão | Navegador do Instagram, "tachomiudo.exemplo". "Cardápio de sábado": Feijoada no tacho; Escondidinho de carne-seca; Pudim de leite (sem preço). Botão fixo "Reservar mesa", pressionado | HTML, miniaturas `/assets/portfolio/canais/restaurante-feijoada-panela-1x1.webp`, `restaurante-escondidinho-1x1.webp`, `restaurante-pudim-1x1.webp` | empurrar |
| 5 | Conversão | Folha "Reservar mesa": "Pessoas" [2, marcado] [4] [6]; "Horário" [12h] [13h, marcado] [14h]; botão "Pedir reserva". Estado final: "Pedido de reserva enviado. O restaurante confirma pelo WhatsApp." | HTML | folha |

Pontos: 1 "Tacho fervendo no primeiro segundo" (texto na tela); 2 "Corte curto segura até a mesa" (barra de progresso); 3 "Cardápio e reserva sem sair" (botão "Pedir reserva").

CTA "Ver cardápio" está na lista oficial da Meta em pt-BR ("Ver cardápio", "Pedir agora", "Agendar agora"…). "Reservar agora" não aparece na lista do feed, por isso a reserva fica no site do restaurante.

### 4.3 Facebook, Feed: Morada Falésia (incorporadora)

Frase: "Uma incorporadora recebe o pedido de visita sem sair do Facebook."
Identificação: "Patrocinado" com o globo, abaixo do nome da página. Formato: anúncio de cadastro em carrossel 1:1.

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Página "Morada Falésia", "Patrocinado" e globo. Texto: "Casas na falésia com a sala voltada para o mar. Agende uma visita ao decorado." Cartão 1: fachada sobre o mar; abaixo, "Formulário no Facebook" (conferir), título "Casa na falésia", botão "Agendar agora" | `/assets/portfolio/smiile-architecture-coast.webp` 1:1 (cover) | entra |
| 2 | Retenção | Carrossel desliza: cartão 2 "Sala voltada para o mar"; cartão 3 "Plantas de 3 e 4 quartos" | Cartão 2: `/assets/portfolio/canais/incorporadora-sala-mar-1x1.webp`; cartão 3: planta em SVG/HTML | deslize |
| 3 | Conversão | Dedo em "Agendar agora" | igual | toque |
| 4 | Conversão | Formulário instantâneo em tela cheia: capa, "Morada Falésia", "Visita ao decorado". "Seus dados" já preenchidos: Nome completo "Seu nome"; E-mail "voce@exemplo.com"; Telefone "(11) 90000-0000". "Quando prefere visitar?" [Durante a semana] [Fim de semana, marcado]. "Ao tocar em Enviar, você envia suas informações para Morada Falésia, que as usa conforme a própria política de privacidade." Botão "Enviar", pressionado | HTML | folha |
| 5 | Conversão | "Obrigado! Recebemos seu pedido de visita. Um corretor entra em contato para combinar o horário." Botão "Ver site". Rodapé pequeno: "Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui." | HTML | no lugar |

Pontos: 1 "Vista do mar no primeiro cartão"; 2 "Deslizar mostra sala e planta"; 3 "Formulário já vem preenchido".

### 4.4 TikTok, In-Feed: Teclaria (loja de tecnologia)

Frase: "Uma loja de tecnologia leva do vídeo ao carrinho."
Identificação: "Patrocinado" junto da legenda.

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | "Seguindo" / "Para você". Texto no estilo nativo do TikTok: **"Joga à noite e edita de dia?"** Trilho de ações sem números. "teclaria", legenda "Um notebook para os dois turnos.", "Patrocinado", barra translúcida "Comprar agora" | `/assets/portfolio/campanha-nerd.webp` 9:16 | entra |
| 2 | Retenção | Corte para o close da tela e do teclado: "De noite, o jogo. De dia, a edição." A barra "Comprar agora" acende na cor do botão do TikTok (conferir o tempo) | mesmo arquivo, `object-position` em 1:1 `center 18%` ampliado | corte |
| 3 | Conversão | Dedo em "Comprar agora" | igual | toque |
| 4 | Conversão | Navegador do TikTok em folha (X, "teclaria.exemplo"). Foto do produto, "Teclaria Pro 15". "Memória" [16 GB] [32 GB, marcado]. "Cor" [Grafite, marcado] [Branco]. Botão "Adicionar ao carrinho", pressionado. Sem preço | recorte 1:1 | folha |
| 5 | Conversão | Aviso nativo do site: "Adicionado ao carrinho" e "Ver carrinho" | igual | no lugar |

Pontos: 1 "Pergunta nativa no primeiro segundo"; 2 "Corte mostra os dois usos"; 3 "Do vídeo ao carrinho".

### 4.5 YouTube, Anúncio no vídeo: Ondara Elétricos (concessionária)

Frase: "Uma concessionária leva do anúncio ao test drive."
Identificação: "Patrocinado" e o domínio no canto do player (conferir a ordem atual).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | App do YouTube (logo oficial no cabeçalho). Player 16:9: SUV carregando ao pôr do sol. Texto no vídeo: **"Saiu do jogo. Quanto de carga sobra?"** No player: "Patrocinado", "ondara.exemplo", botão "Agendar". Abaixo, cartão complementar: avatar, "Ondara Elétricos", "Patrocinado", botão "Agendar" | `/assets/portfolio/canais/campanha-esportes.webp` 16:9 `center 32%` | entra |
| 2 | Retenção | Painel do carro em ilustração HTML, com uma barra "Carga para a volta" sem número: "O painel mostra antes de você sair." Aos 5 s aparece "Pular" no canto (conferir rótulo) e o botão "Agendar" ganha cor | HTML sobre a foto escurecida | corte |
| 3 | Conversão | Dedo em "Agendar" no player | igual | toque |
| 4 | Conversão | Navegador, "ondara.exemplo". "Test drive do SUV elétrico". "Escolha o dia" [Sáb, marcado] [Dom]. "Período" [Manhã, marcado] [Tarde]. Campo "Seu WhatsApp" com "(11) 90000-0000". Botão "Solicitar test drive", pressionado | HTML, faixa da foto no topo | empurrar |
| 5 | Conversão | "Pedido enviado. A Ondara confirma o horário com você." Rodapé: mensagem educativa de trânsito (CTB, art. 77-B), texto oficial a definir | HTML | no lugar |

Pontos: 1 "Mensagem antes do botão Pular"; 2 "Painel responde à dúvida"; 3 "Dia e período, sem ligação".
Alternativa nativa: o recurso de formulário de lead do Google Ads abre um formulário dentro do YouTube. Não usei para não repetir o formulário do Facebook e do LinkedIn.

### 4.6 YouTube, Shorts: Sotaque Livre (app da escola)

Frase: "Uma escola de idiomas leva do Shorts ao app instalado."
Identificação: "Patrocinado" junto do nome.

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Shorts escuro, glifo do Shorts na aba (ver `logos.md`). Texto: **"Pare de traduzir na cabeça."** Embaixo: "Sotaque Livre", "Patrocinado", botão branco "Instalar" | `/assets/portfolio/canais/escola-fones-caderno-9x16.webp` | entra |
| 2 | Retenção | Exercício na tela: "Complete: I'm looking forward ___ it." Um instante depois, "to" aparece com um sinal de certo | `escola-fones-caderno-9x16.webp` escurecida e HTML | corte |
| 3 | Conversão | Dedo em "Instalar" | igual | toque |
| 4 | Conversão | Folha da App Store: ícone SL, "Sotaque Livre", "Conversação todos os dias", botão "Obter", pressionado. Duas capturas do app em miniatura (HTML). Sem avaliação, sem estrelas e sem logo da Apple | HTML | folha |
| 5 | Conversão | "Obter" vira o círculo de progresso e depois "Abrir" | igual | no lugar |

Pontos: 1 "Frase curta antes da marca"; 2 "Exercício segura até a resposta"; 3 "Instalar sem sair do vídeo".

### 4.7 YouTube, Live: Teclaria com um criador

Frase: "Uma marca de tecnologia entra na live com publi identificada."
Identificação: "Inclui promoção paga" no vídeo, nos primeiros segundos, "#publi" na cartela e o aviso falado do criador. Tipo de cliente do dono também presente aqui: o criador (`/criadores/ao-vivo`).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Player 16:9 com selo "Ao vivo". Faixa escura "Inclui promoção paga" sobre o vídeo. Canal "@canalexemplo". Chat abaixo com apelidos genéricos ("@jogador1: qual é esse notebook?") | `/assets/portfolio/campanha-nerd.webp` 16:9 `center 19%` | entra |
| 2 | Retenção | Cartela no terço inferior: "#publi Teclaria" e "O notebook deste setup". O chat continua rolando | igual | no lugar |
| 3 | Conversão | Mensagem fixada do criador no topo do chat: "Lista de espera do Teclaria Pro 15 branco: teclaria.exemplo/branco". Dedo no link | igual | toque |
| 4 | Conversão | Navegador: "Teclaria Pro 15 branco". "Avise-me quando chegar." Campo "voce@exemplo.com". Botão "Quero ser avisado", pressionado. Estado final: "Pronto. Você recebe só esse aviso." | HTML | empurrar |

Pontos: 1 "Aviso de publi logo no começo"; 2 "Criador mostra o setup em uso"; 3 "Link fixado leva à lista".

### 4.8 LinkedIn, Feed: Arrimo Patrimônio (gestora de patrimônio)

Frase: "Uma gestora entrega o guia em troca do contato."
Identificação: "Promovido" abaixo do nome. Formato: anúncio de documento com formulário de geração de leads (conferir o rótulo "Desbloquear").

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Cabeçalho do LinkedIn com o [in] oficial. "Arrimo Patrimônio", "Promovido". Texto: **"Empresa e família no mesmo patrimônio? Três sinais de que é hora de separar."** Capa do documento: "Guia: patrimônio da empresa e da família" | `/assets/portfolio/canais/campanha-negocios-sem-grafico.webp` 4:5 `center 100%` | entra |
| 2 | Retenção | As páginas deslizam no próprio feed: "1. Contas que se misturam"; "2. Sucessão sem plano". Contador de páginas | HTML | deslize |
| 3 | Conversão | Página-portão: "Para continuar lendo, envie suas informações." Dedo em "Desbloquear" | HTML | toque |
| 4 | Conversão | Folha do formulário: logo, "Guia: patrimônio da empresa e da família". Campos do perfil já preenchidos: Nome, Sobrenome, E-mail, Cargo, Empresa (valores genéricos). "Suas informações serão enviadas para Arrimo Patrimônio." Botão "Enviar", pressionado | HTML | folha |
| 5 | Conversão | Documento liberado e faixa "Informações enviadas para Arrimo Patrimônio", com "Visitar site". Rodapé: "Investimentos envolvem riscos." | HTML | no lugar |

Pontos: 1 "Problema do sócio na primeira frase"; 2 "Páginas de amostra no feed"; 3 "Formulário com dados do perfil".
Referência do fluxo: `v2/ref/linkedin/li-lead-gen.gif` (post, formulário pré-preenchido, confirmação dentro do próprio anúncio com "Visit company website").

### 4.9 Google Ads, Pesquisa: Seixo Odontologia (clínica)

Frase: "Uma clínica responde à busca com uma ligação."
Identificação: "Resultados patrocinados" agrupados, com "Ocultar resultados patrocinados" no fim do grupo (formato de out. 2025; conferir o texto em pt-BR).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Safari com a barra compacta do iOS 26. Campo de busca: "dentista perto de mim" sendo digitado. Abas "Todos", "Mapas", "Imagens" | nenhuma | digitar |
| 2 | Retenção | "Resultados patrocinados". Anúncio: favicon SO, "Seixo Odontologia", "seixo.exemplo". Título azul: **"Avaliação com hora marcada"**. Descrição: "Consulta de avaliação para planejar o tratamento com calma. Agende pelo site ou ligue. [RT e CRO]". Sitelinks "Agendar avaliação", "Especialidades", "Como chegar". Botão "Ligar" | nenhuma | rolagem curta |
| 3 | Conversão | Dedo em "Ligar" | igual | toque |
| 4 | Conversão | Folha de ação do iOS: "Ligar (11) 0000-0000" e "Cancelar". "Ligar" pressionado | nenhuma | folha |

Pontos: 1 "Busca já diz a intenção"; 2 "Título responde à busca"; 3 "Ligar com um toque".
"[RT e CRO]" é marcador do nome e do registro do responsável técnico (Código de Ética Odontológica do CFO). Não inventar número.

### 4.10 Google Ads, Display: Bandeirola Viagens (agência)

Frase: "Uma agência lembra quem já viu o roteiro."
Identificação: rótulo "Anúncio" com um ícone "i" genérico no canto (não desenhar o ícone do AdChoices).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Safari num portal fictício ("Portal Exemplo"), matéria "O que ver nas festas de junho no interior". No meio do texto, anúncio responsivo 1,91:1: foto da rua com bandeirolas, **"Festa do Divino em grupo pequeno"**, "Bandeirola Viagens", botão de seta | `/assets/portfolio/canais/campanha-crencas.webp` 1,91:1 `center 9%` | entra |
| 2 | Retenção | O anúncio troca o título, como o Google combina recursos: "Guia da cidade e hotel no centro" | igual | troca suave |
| 3 | Conversão | Dedo no botão de seta | igual | toque |
| 4 | Conversão | "bandeirola.exemplo": "Festa do Divino em grupo pequeno". "Próximas saídas" [Maio] [Junho, marcado]. "Grupo pequeno, guia da cidade e hotel no centro." Botão "Garantir minha vaga", pressionado | faixa 1,91:1 da mesma foto | empurrar |
| 5 | Conversão | Campos "Seu nome" e "Seu WhatsApp" preenchidos com marcadores. "Pré-reserva recebida. Falamos com você pelo WhatsApp para confirmar." | HTML | no lugar |

Pontos: 1 "Banner no assunto da matéria"; 2 "Título muda, oferta continua"; 3 "Data escolhida, vaga pré-reservada".

### 4.11 SEO, Orgânico: Morada Falésia (incorporadora)

Frase: "Uma incorporadora aparece na busca sem pagar pelo clique."
Identificação: nenhuma, porque não é anúncio. Chip no cabeçalho: "Orgânico, sem anúncio".

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Safari, busca "casa na falésia à venda". Grupo patrocinado esmaecido (esqueleto). Resultado orgânico: favicon MF, "Morada Falésia", "moradafalesia.exemplo › plantas". Título azul **"Casas na falésia com vista para o mar"**. Descrição: "Plantas de 3 e 4 quartos, sala voltada para o mar e visita ao decorado com hora marcada." Miniatura. Sitelinks "Plantas", "Localização", "Agendar visita" | miniatura 1:1 de `/assets/portfolio/smiile-architecture-coast.webp` | digitar e entra |
| 2 | Retenção | Dedo em "Plantas" e a página abre: "Plantas". Seletor [3 quartos, marcado] [4 quartos] e a planta muda | planta em SVG/HTML | empurrar |
| 3 | Conversão | Botão "Receber as plantas em PDF". Dedo nele | igual | toque |
| 4 | Conversão | Campo "Seu e-mail" com "voce@exemplo.com" e botão "Enviar". Estado final: "Enviamos as plantas para o seu e-mail." | HTML | no lugar |

Pontos: 1 "Título com o que foi buscado"; 2 "Plantas que dá para comparar"; 3 "PDF em troca do e-mail".

### 4.12 ChatGPT, Resposta: Bandeirola Viagens (agência)

Frase: "Uma agência aparece depois da resposta, separada dela."
Identificação: etiqueta "Anúncio" no cartão. O formato atual mostra "Ad" à direita do cartão (`v2/ref/chatgpt/rotulo-ad-2026-06.png`). O texto em pt-BR e a disponibilidade no Brasil ficam a conferir. Viagem é categoria permitida. Saúde não é (sem anúncios em conversas de saúde), por isso a clínica não aparece aqui.

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Pergunta à direita: "Quero ver uma festa tradicional no interior em junho. Por onde começo?" Resposta em três itens curtos e a fileira de ações (copiar, ouvir, joinhas, regenerar, compartilhar) | nenhuma | entra |
| 2 | Retenção | Divisor e frase cinza da plataforma: "Para viajar com guia e grupo pequeno:". Cartão: imagem 1:1, favicon BV, "Bandeirola Viagens", "Anúncio", título **"Festas tradicionais em grupo pequeno"**, "Roteiros com guia da cidade e hotel no centro." Abaixo: "Os anúncios não influenciam as respostas do ChatGPT." (conferir o texto oficial) | `/assets/portfolio/canais/campanha-crencas.webp` 1:1 `center 8%` | rolagem curta |
| 3 | Conversão | Dedo no cartão | igual | toque |
| 4 | Conversão | Navegador interno, "bandeirola.exemplo". "Monte seu roteiro". "Quantos dias?" [3, marcado] [5]. "O que você quer ver?" [Festas, marcado] [Cidades históricas]. Botão "Ver roteiro sugerido", pressionado | HTML | empurrar |
| 5 | Conversão | "Roteiro sugerido: 3 dias em Pirenópolis". "Dia 1: chegada e centro histórico"; "Dia 2: mascarados nas ruas"; "Dia 3: Cavalhadas". Botão "Falar com um consultor" | HTML | no lugar |

Pontos: 1 "Cartão separado da resposta"; 2 "Perguntas curtas montam o roteiro"; 3 "Roteiro pronto e consultor".
Fatos usados (do texto da Fatos em `estudio.ts`): na Festa do Divino de Pirenópolis, os mascarados saem no sábado e as Cavalhadas vão de domingo a terça.

### 4.13 Google Maps, Local: Tacho Miúdo (restaurante)

Frase: "Um restaurante aparece no mapa e traça a rota."
Identificação: "Patrocinado" e "⋮" no topo da ficha, e pin quadrado destacado (ref. `v2/ref/maps/shopify-promoted-pin.png` e os esquemas pt-BR em `google-ajuda-local-*`).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Mapa urbano ilustrativo. Campo de busca "feijoada perto de mim". Pins genéricos e um pin quadrado destacado com garfo e faca, com o nome "Tacho Miúdo" ao lado | `/assets/portfolio/canais/mapa-cidade.svg` (pins em HTML; pontos sugeridos no comentário do arquivo) | entra |
| 2 | Retenção | A ficha sobe: "Patrocinado ⋮", **"Tacho Miúdo"**, "Restaurante", "Aberto". Caixa do anúncio: "Feijoada no tacho aos sábados", "tachomiudo.exemplo", "Acessar site" (conferir). Botões [Rotas] [Reservar] [Ligar] [Compartilhar]. Fotos. **Sem nota, sem estrelas e sem número de avaliações** | `/assets/portfolio/canais/restaurante-fachada-4x3.webp` e `restaurante-feijoada-prato-1x1.webp` | folha |
| 3 | Conversão | Dedo em "Rotas" | igual | toque |
| 4 | Conversão | Tela de rota: "Seu local" e "Tacho Miúdo", ícones de carro, transporte e a pé sem tempos, linha da rota no mapa, botão "Iniciar" pressionado | `/assets/portfolio/canais/mapa-cidade.svg`, rota `M108,544 L108,464 L180,464 L180,304 L252,304 L252,224` | empurrar |

Pontos: 1 "Pin destacado no caminho"; 2 "Ficha mostra prato e horário"; 3 "Rota traçada com um toque".

### 4.14 WhatsApp Business, Clique para conversar: Seixo Odontologia (clínica)

Frase: "Uma clínica começa o agendamento numa conversa."
Identificação: "Patrocinado" no anúncio. Na conversa, o anúncio de origem aparece citado (conferir como o app mostra hoje).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Feed do Instagram: avatar SO, "seixoodontologia", "Patrocinado". Imagem 4:5 com **"Avaliação com hora marcada"**. Barra "Enviar mensagem pelo WhatsApp" (CTA oficial da Meta em pt-BR), com o glifo oficial do WhatsApp ao lado da palavra | `/assets/portfolio/canais/clinica-consultorio-4x5.webp` | entra |
| 2 | Retenção | A legenda abre: "Conte o que você sente e escolha o horário pela conversa." A barra acende (conferir) | igual | no lugar |
| 3 | Conversão | Dedo na barra | igual | toque |
| 4 | Conversão | WhatsApp: "Seixo Odontologia", "Conta comercial". Cartão do anúncio citado. Campo com a mensagem pronta "Olá! Quero agendar uma avaliação." e o botão de enviar pressionado | miniatura de `clinica-consultorio-4x5.webp` | empurrar |
| 5 | Conversão | Mensagem enviada. Resposta automática: "Olá! Que bom falar com você. Qual horário fica melhor para a avaliação?" Botões [Quinta, 9h] [Sexta, 14h] [Outro horário]. "Quinta, 9h" tocado | HTML | no lugar |

Pontos: 1 "Hora marcada na própria imagem"; 2 "Legenda convida a contar mais"; 3 "Mensagem pronta e horário".
Botões de resposta exigem a Plataforma do WhatsApp Business (API). No app comum a saudação é só texto. Dá para dizer isso no chip de formato ("Clique para conversar") sem texto extra.

### 4.15 WhatsApp Business, Catálogo: Tacho Miúdo (restaurante)

Frase: "Um restaurante recebe encomendas pelo catálogo."
Identificação: chip "Catálogo, não é anúncio".

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Perfil comercial: "Tacho Miúdo", "Conta comercial", "Restaurante". Seção "Catálogo" com três miniaturas e "Ver tudo" | `/assets/portfolio/canais/restaurante-feijoada-panela-1x1.webp`, `restaurante-escondidinho-1x1.webp`, `restaurante-pudim-1x1.webp` | entra |
| 2 | Retenção | Catálogo com coleções "Encomendas de sábado" e "Doces". Itens com foto 1:1, nome e descrição curta, sem preço ("Doces": Pudim de leite) | as três fotos `restaurante-*-1x1.webp` | empurrar |
| 3 | Conversão | Item "Feijoada no tacho para 4": foto grande, "Carnes separadas, arroz, couve e farofa. Encomenda até sexta." Dedo em "Conversar com a empresa" (conferir rótulo atual; o carrinho fica desligado) | `/assets/portfolio/canais/restaurante-feijoada-panela-1x1.webp` | empurrar e toque |
| 4 | Conversão | Conversa com o item anexado e o texto "Olá! Quero encomendar este item para sábado." enviado. Resposta: "Anotado! Retira no local ou prefere entrega?" [Retirar] [Entrega] | miniatura de `restaurante-feijoada-panela-1x1.webp` | empurrar |

Pontos: 1 "Vitrine dentro do perfil"; 2 "Itens organizados por ocasião"; 3 "Item vai junto na mensagem".

### 4.16 Publieditorial, Artigo: Arrimo Patrimônio (gestora de patrimônio)

Frase: "Uma gestora explica antes de vender, sempre identificada."
Identificação: "Conteúdo patrocinado por Arrimo Patrimônio" acima do título (CONAR).

| Q | Passo | Tela e textos | Imagem | Transição |
|---|---|---|---|---|
| 1 | Atenção | Safari, "Revista Exemplo" (veículo fictício). "Conteúdo patrocinado por Arrimo Patrimônio". Título **"Por onde começar a organizar o patrimônio da família"**. Imagem de abertura | `/assets/portfolio/canais/campanha-negocios-sem-grafico.webp` 16:9 `center 11%` | entra |
| 2 | Retenção | Barra de progresso de leitura no topo enche. Intertítulos passam: "1. Separe o que é da empresa"; "2. Escreva os objetivos"; "3. Pergunte antes de assinar" | HTML | rolagem |
| 3 | Conversão | Bloco "Oferecido por Arrimo Patrimônio" com o logo: "Um especialista explica cada decisão antes de você assinar." Dedo em "Agendar conversa" | HTML | toque |
| 4 | Conversão | "arrimo.exemplo": "Agendar conversa", "30 minutos, por vídeo". Dias [Ter, marcado] [Qua]. Horários [10h, marcado] [15h]. "Confirmar". Estado final: "Conversa agendada. O convite chega por e-mail." Rodapé: "Investimentos envolvem riscos." | HTML | empurrar |

Pontos: 1 "Aviso de patrocínio antes do título"; 2 "Leitura útil, marca no fim"; 3 "Conversa marcada pelo próprio bloco".

## 5. UI compacta que substitui o "Posicionamento"

### 5.1 O que sai e o que fica

Sai:
- O `dl.cx-positioning` (Onde aparece, Formato, No primeiro segundo, Chamada, Identificação, O que muda, O que foi otimizado), gerado por `positionRows()`.
- O parágrafo longo `.cx-contribution`.
- O `h3` da nota ("Levar o interesse direto para a conversa.") e o kicker "A decisão por trás da peça".
- No resumo lateral: o parágrafo `delivery`, a linha "Veiculação" e o wordmark da Meta (a Meta exige aprovação para o logo, ver `logos.md`).

Fica:
- O link `a[data-contact-service="Campanhas e anúncios"]` "Conversar sobre uma campanha ↓".
- "Recolocar a peça".
- O botão `.campaign-decision` ("Ver o anúncio no canal" / "Voltar à peça").
- `[data-campaign-benefit]`.

### 5.2 Anatomia do verso (`.cx-player`)

```
[logo] Instagram                          (Pausar)
[Feed] [Reels]                 Patrocinado
Exemplo: escola de idiomas, marca fictícia
┌──────── iPhone 17 Pro Max laranja ────────┐
│   mock com o quadro atual                 │
│   (1) ← um ponto numerado por vez         │
│   ◎ dedo, só no quadro do toque           │
└───────────────────────────────────────────┘
 1 Atenção     │ 2 Retenção     │ 3 Conversão
 Pergunta que  │ Deslizar       │ Nível e horário
 o aluno…      │ revela a…      │ em dois toques
 ▬▬▬▬▬▬▬▬      │ ▬▬▬───         │ ───────
Uma escola de idiomas leva do carrossel à aula experimental.
Exemplo ilustrativo, marca fictícia. Interface aproximada.
Conversar sobre uma campanha ↓
              [ Recolocar a peça ]
```

- **Cabeçalho, linha 1:** logo oficial do canal com `logoSvg(CHANNEL_LOGO[id],{altura:20})` e o nome em texto (Facebook: logo sozinho com `rotulo`, sem a palavra colada, regra da marca). À direita, o botão Reproduzir/Pausar/Rever (o `[data-cx-play]` de hoje), 44 × 44, só com ícone e `aria-label`.
- **Linha 2:** chips de formato (as `.cx-placement` de hoje, com `aria-pressed`) e, alinhado à direita, o chip de identificação ("Patrocinado", "Promovido", "Anúncio", "Inclui promoção paga", "Orgânico, sem anúncio", "Catálogo, não é anúncio", "Conteúdo patrocinado"). O chip de identificação é texto, não botão.
- **Linha 3:** chip do cliente, em contorno, 13 px: "Exemplo: <tipo>, marca fictícia". Os textos estão na seção 5.8.
- **Mock:** o aparelho atual (`.ch-iphone`) com um ponto numerado (seção 5.5).
- **Barra de jornada:** 3 passos (seção 5.4).
- **Uma frase** (a "Frase" de cada storyboard), 15 px, no máximo 2 linhas a 390 px.
- **Linha miúda**, 12 px e cor suave: "Exemplo ilustrativo, marca fictícia. Interface aproximada." Quando a imagem vier da Fatos ou for gerada, acrescentar "Imagens geradas por IA."
- **O link de contato e "Recolocar a peça"**, como hoje.

### 5.3 Leiaute

A 390 px (verso com 358 px úteis, margens de 16 px):
- Linha 1 com 44 px de altura. Linha 2 com 36 px (os 3 chips do YouTube cabem: "Anúncio no vídeo", "Shorts" e "Live" somam cerca de 280 px; se não couberem, a linha rola por dentro, sem rolar a página). A identificação desce para a linha 3, ao lado do chip do cliente, quando não cabe.
- Aparelho com `width:min(100%,300px)`, centralizado.
- Jornada em grade de 3 colunas iguais (`gap:8px`). Cada passo tem no mínimo 64 px de altura: trilho de 3 px no topo, número e fase (14 px, 600) e rótulo (12,5 px, até 2 linhas).
- Altura total abaixo do aparelho: cerca de 210 px (jornada 72, frase 44, linha miúda 18, link 44, respiros). Hoje são cerca de 700 px.

A 1280 px (verso com cerca de 640 px; consulta de contêiner `min-width:560px`):
- Cabeçalho em toda a largura.
- Duas colunas: aparelho fixo em 300 px à esquerda; à direita, coluna flexível com `padding-top:24px`.
- Na coluna direita, a jornada vira uma lista vertical: trilho de 3 px à esquerda de cada passo, número 26 px, fase 15 px, rótulo 14 px, 72 px por passo. Depois a frase, a linha miúda e o link.
- O resumo lateral (seção 5.7) continua à direita do cartão.

Sem rolagem horizontal da página em nenhuma largura. A rolagem interna só existe na linha de chips.

### 5.4 Barra de jornada (`ol.cx-journey`)

- Sempre 3 passos, na ordem Atenção, Retenção, Conversão. Cada passo é `button` dentro de `li`, com o número (decorativo), a fase e o rótulo (até 6 palavras).
- Estados:
  - **Por vir:** número em contorno; texto `#5f6a5a` (contraste de 4,5:1 ou mais sobre o fundo `#f4f6ef`); trilho vazio.
  - **Ativo:** `aria-current="step"`; número preenchido `#294c36` com algarismo branco; fase em 600; o trilho enche de forma linear durante a soma dos quadros do passo.
  - **Feito:** número preenchido claro `#8fa886`; trilho cheio; texto acessível acrescenta "concluído".
  - **Hover e foco:** fundo `#eef2e8`; foco `outline:3px solid #406fca; outline-offset:2px`, como as abas.
- O estado não depende só da cor: preenchimento, peso e `aria-current` mudam juntos.
- **Clique num passo:** para a reprodução, vai ao primeiro quadro do passo (Conversão vai ao quadro do toque) e atualiza o ponto. Setas esquerda e direita no passo focado movem entre passos (`tabindex` móvel).
- **Fim da sequência:** os 3 passos ficam "feitos", o último quadro (a próxima tela) fica parado e o botão vira "Rever".
- **Os controles ← → ↻ atuais** podem sair: a jornada e o botão do cabeçalho cobrem o mesmo. O toque nas metades do mock e o arraste continuam navegando quadro a quadro.

### 5.5 Pontos numerados e dedo

- **Um ponto por vez:** só o ponto do passo ativo aparece. Círculo de 26 px com o número, fundo `#294c36`, aro branco de 2 px e sombra leve. Fica sobre o elemento `data-hs` do quadro atual, no canto superior direito do retângulo, deslocado 6 px para dentro. Nunca no canto do grip (72 × 72 no alto à direita da folha, que fica fora do verso aberto) e nunca sobre o rótulo de anúncio.
- Os pontos são `aria-hidden="true"` e `pointer-events:none`: são eco visual do rótulo do passo, não controles.
- Hover ou foco num passo dá ao ponto correspondente escala 1,1 e um anel.
- **Dedo:** círculo de 36 px, `rgba(255,255,255,.55)`, aro branco de 2 px e sombra, no centro do CTA, só no quadro do toque. O CTA fica 8% mais escuro por 180 ms (estado pressionado nativo).
- **Posição:** calculada por `getBoundingClientRect()` do alvo em relação a `.ch-iphone-tela`, no `paintFrame()` e num `ResizeObserver` da tela. Em porcentagem, para escalar com o `cqi`.

### 5.6 Movimento e movimento reduzido

Com movimento (`motion.available()`):
- **Autoplay** como hoje: ao abrir a folha, ao trocar de canal com ela aberta ou ao entrar na tela, se ainda não tocou e o visitante não pausou. Para fora da tela, com a aba oculta, com a pausa global e com a folha fechada.
- **Troca de canal:** mantém o fantasma de 30 px e 300 ms e a mola de 42 px e 620 ms. A jornada e a frase sobem 16 px em sequência (80 ms + 45 ms por item), como os textos laterais do e02.
- **Ponto:** entra com a mola 'snappy' (escala de .6 a 1, 420 ms) e um único anel (escala de 1 a 1,6, opacidade de .5 a 0, 900 ms).
- **Dedo:** escala de .5 a 1 e opacidade de 0 a 1 em 160 ms, depois uma onda (anel de 1 a 1,8, opacidade de .6 a 0, 420 ms). Então vem a transição do quadro.
- **Transições dentro do aparelho:** as da seção 4.
- **Trilho:** enche em `scaleX`, ligado ao `elapsed` que já existe.

Com `prefers-reduced-motion`, pausa global ou aba oculta:
- Sem autoplay. Abre no quadro 1, com o passo 1 ativo e "Reproduzir" escondido ou mudado para "Próximo quadro".
- Os 3 passos viram etapas estáticas. Clicar em Atenção mostra o Q1. Clicar em Retenção mostra o Q2. Clicar em Conversão mostra o quadro do toque, com o dedo **parado** (anel fixo de 3 px, sem onda). "Próximo quadro", setas e toque nas metades avançam até a próxima tela.
- Troca instantânea (sem mola, deslize, empurrar ou folha), sem anel no ponto e com a busca já digitada inteira.
- O trilho do passo ativo aparece cheio.

### 5.7 Resumo lateral compacto (`aside.campaign-summary`)

```
[logo] Instagram
Prender no feed e levar à ação.            ← [data-campaign-benefit]
[Feed 4:5] [Reels 9:16] [Patrocinado]
Exemplo: escola de idiomas, marca fictícia
( Ver o anúncio no canal )   Conversar sobre uma campanha ↓
```

- Frases de benefício por canal (até 7 palavras):

  | Canal | Frase |
  |---|---|
  | Instagram | "Prender no feed e levar à ação." |
  | Facebook | "Receber o pedido sem sair do app." |
  | TikTok | "Do vídeo ao carrinho em um toque." |
  | YouTube | "Ganhar os primeiros segundos." (mantida) |
  | LinkedIn | "Falar com quem decide." (mantida) |
  | Google Ads | "Responder a quem já procura." (mantida; teste a exige) |
  | SEO | "Ser encontrado sem pagar pelo clique." (mantida) |
  | ChatGPT | "Aparecer depois da resposta." (mantida) |
  | Google Maps | "Ser a escolha no caminho." (mantida) |
  | WhatsApp | "Transformar interesse em conversa." (mantida) |
  | Publieditorial | "Explicar antes de vender, sempre identificado." |

- O chip do cliente segue o formato escolhido no verso. Com a folha fechada, mostra o cliente do primeiro formato.
- A 390 px, o resumo vem depois do cartão (o teste exige isso abaixo de 500 px) e fica com cerca de 150 px de altura.

### 5.8 Dados (para `campaign-channels.js`)

```js
export const CLIENTES={
 restaurante:{tipo:'restaurante',marca:'Tacho Miúdo',arroba:'tachomiudo',dominio:'tachomiudo.exemplo',cor:'#a4462a',sigla:'tm'},
 clinica:{tipo:'clínica odontológica',marca:'Seixo Odontologia',arroba:'seixoodontologia',dominio:'seixo.exemplo',cor:'#2f6f73',sigla:'SO'},
 incorporadora:{tipo:'incorporadora',marca:'Morada Falésia',dominio:'moradafalesia.exemplo',cor:'#1f4e5f',sigla:'MF'},
 varejo:{tipo:'loja de tecnologia',marca:'Teclaria',arroba:'teclaria',dominio:'teclaria.exemplo',cor:'#5b3df5',sigla:'T'},
 turismo:{tipo:'agência de viagens',marca:'Bandeirola Viagens',dominio:'bandeirola.exemplo',cor:'#d9822b',sigla:'BV'},
 educacao:{tipo:'escola de idiomas',marca:'Sotaque Livre Idiomas',arroba:'sotaquelivre',dominio:'sotaquelivre.exemplo',cor:'#e5533d',sigla:'SL'},
 financas:{tipo:'gestora de patrimônio',marca:'Arrimo Patrimônio',dominio:'arrimo.exemplo',cor:'#0f1a2c',acento:'#d8b866'},
 automotivo:{tipo:'concessionária',marca:'Ondara Elétricos',dominio:'ondara.exemplo',cor:'#0f6b5c',sigla:'O'}
};
// chip: 'Exemplo: '+CLIENTES[k].tipo+', marca fictícia'

// em cada placement:
journey:{
 cliente:'restaurante',
 frase:'Um restaurante leva do Reels à reserva de mesa.',
 passos:[ // sempre 3
  {fase:'Atenção',rotulo:'Tacho fervendo no primeiro segundo',quadros:[0],hs:1},
  {fase:'Retenção',rotulo:'Corte curto segura até a mesa',quadros:[1],hs:2},
  {fase:'Conversão',rotulo:'Cardápio e reserva sem sair',quadros:[2,3,4],hs:3}
 ],
 quadros:[
  {ms:1400,desc:'Tacho de feijoada fervendo. Texto: Sábado tem feijoada no tacho.'},
  {ms:2000,transicao:'corte',desc:'Prato servido. Texto: Fogo baixo desde cedo.'},
  {ms:1200,toque:'cta',desc:'Toque em Ver cardápio.'},
  {ms:1800,transicao:'empurrar',desc:'Cardápio de sábado com o botão Reservar mesa.'},
  {ms:2400,transicao:'folha',desc:'Reserva para 2 às 13h. Pedido de reserva enviado.'}
 ]
}
```

`desc` alimenta a descrição acessível do quadro e a região viva. `toque` aponta o `data-hs` do CTA.

### 5.9 Acessibilidade

- `ol.cx-journey` com `aria-label="Jornada do anúncio em 3 passos"`. Botões com nome completo: "Passo 1, atenção: Tacho fervendo no primeiro segundo".
- O palco (`figure`) tem `aria-label` com canal, formato e cliente ("Instagram, Reels. Exemplo de restaurante, marca fictícia"). `aria-describedby` aponta para um `p.sr-only` com o `desc` do quadro atual.
- A região viva (`[data-cx-status]`, `polite`) só fala na troca de passo e no fim ("Passo 3 de 3, conversão. Reserva para 2 às 13h. Pedido de reserva enviado."). Fica quieta a cada quadro durante o autoplay.
- Alvos de 44 × 44 ou mais (passos com 64 px ou mais, botão de play com 44). Foco visível em tudo. Ordem de tabulação: logo e nome (não focáveis), chips de formato, play, passos, link e "Recolocar".
- Logo do canal decorativo quando o nome está ao lado. Os glifos dentro do aparelho seguem `logos.md`.
- Contraste: textos do passo de 4,5:1 ou mais; chip do cliente com texto `#3d4639` sobre `#f4f6ef`.
- O verso continua fora de `.sp-campaign-panel`, então o teste "nenhum botão dentro do painel" segue valendo.

## 6. Arte da frente (peel) por canal

A frente mostra a peça do cliente do primeiro formato de cada aba: uma única `img` por painel (contrato do teste) e o texto em HTML na `figcaption`. Sempre com "Exemplo ilustrativo, marca fictícia." Cuidado: `.sp-campaign-panel img` força `aspect-ratio:4/5` e `object-fit:contain` (`static-presentations.css:3-10`, `page-peel.css:54`). As fotos 9:16 precisam de `object-fit:cover` e `object-position`.

| Aba | Peça | Imagem |
|---|---|---|
| Instagram | Sotaque Livre: "Você entende a série sem legenda?" | `/assets/portfolio/canais/escola-fones-caderno-4x5.webp` |
| Facebook | Morada Falésia: "Casas na falésia com a sala voltada para o mar." | `/assets/portfolio/smiile-architecture-coast.webp`, 4:5 em cover |
| TikTok | Teclaria: "Joga à noite e edita de dia?" | `/assets/portfolio/campanha-nerd.webp` |
| YouTube | Ondara Elétricos: "Saiu do jogo. Quanto de carga sobra?" | `/assets/portfolio/canais/campanha-esportes.webp` |
| LinkedIn | Arrimo Patrimônio: "Guia: patrimônio da empresa e da família" | `/assets/portfolio/canais/campanha-negocios-sem-grafico.webp` 4:5 `center 100%` |
| Google Ads | Seixo Odontologia: "Avaliação com hora marcada" | `/assets/portfolio/canais/clinica-consultorio-4x5.webp` |
| SEO | Morada Falésia: "Casas na falésia com vista para o mar" | `/assets/portfolio/canais/incorporadora-sala-mar-4x5.webp` |
| ChatGPT | Bandeirola Viagens: "Festas tradicionais em grupo pequeno" | `/assets/portfolio/canais/campanha-crencas.webp` |
| Google Maps | Tacho Miúdo: "Feijoada no tacho aos sábados" | `/assets/portfolio/canais/restaurante-fachada-4x5.webp` |
| WhatsApp | Seixo Odontologia: "Conte o que sente e escolha o horário" | `/assets/portfolio/canais/clinica-recepcao-4x5.webp` |
| Publieditorial | Arrimo Patrimônio: "Por onde começar a organizar o patrimônio da família" | `/assets/portfolio/canais/campanha-negocios-sem-grafico.webp` 4:5 `center 100%`, o mesmo recorte do LinkedIn. Sem foto nova (os créditos de geração acabaram) |

`fidelity.test.mjs` e `structure.mjs` só exigem que `static-r8/campanha-{meta,google,tiktok}`, `casa-costa` e `trilhas` **existam**, não que sejam usadas.

## 7. Imagens que precisam ser produzidas

Todas sem pessoas, mãos, rostos, texto legível, logos ou marcas, e sem preço. Mesma linguagem das fotos da Fatos (realistas, luz de fim de tarde, contraste alto).

| Id | O que mostra | Proporção e tamanho | Usada em |
|---|---|---|---|
| R1 | Tacho de cobre com feijoada borbulhando e vapor, fogão a lenha desfocado ao fundo | 9:16, 1080 × 1920 | Reels Q1 |
| R2 | Prato de feijoada servido com arroz, couve e farofa em mesa de madeira, salão vazio ao fundo | 9:16, 1080 × 1920 (recortável em 1:1 e 4:5) | Reels Q2, Maps |
| R3 | Fachada de restaurante de esquina com toldo terracota e plantas, sem letreiro, fim de tarde | 4:3, 1440 × 1080 | Maps, frente do Maps |
| R4 | Três itens: feijoada em panela de barro; escondidinho de carne-seca em travessa; doce de leite em pote de vidro com colher de pau | 1:1, 1080 × 1080, um arquivo por item | Catálogo, cardápio |
| C1 | Consultório odontológico claro, cadeira, luz natural, planta, sem tela acesa | 4:5, 1080 × 1350 | WhatsApp Q1, frente do Google Ads |
| C2 | Recepção de clínica com sofá, plantas e balcão de madeira, sem letreiro | 4:5, 1080 × 1350 | Frente do WhatsApp |
| E1 | Mesa com caderno aberto, fones de ouvido e caneca, luz de janela | 4:5, 1080 × 1350 | Frente do Instagram |
| E2 | Fones sobre um caderno com anotações ilegíveis, vista de cima, tons quentes | 9:16, 1080 × 1920 | Shorts |
| M2 | Sala voltada para o mar, janelas do piso ao teto, mesma arquitetura da casa da falésia (concreto, madeira, vegetação) | 4:5, 1080 × 1350 | Facebook Q2, frente do SEO |
| MAP | Mapa urbano ilustrativo: quadras, ruas e uma praça, sem nomes reais e sem os blocos do Google | SVG, 9:16 | Maps (desenhar em SVG; `trail-map.svg` é mapa de trilha e não serve para cidade) |

### 7.1 Arquivos finais (21/10/2026)

Os créditos de geração acabaram, então as imagens vieram de arquivos já existentes e de 8 fotos do Pexels (Pexels License), sem pessoas, marcas ou texto legível. Tudo em `public/assets/portfolio/canais/` (servido em `/assets/portfolio/canais/`), WebP com no máximo 1200 px e 150 KB. Origem, autor, licença, data e recorte de cada arquivo: `public/assets/portfolio/canais/SOURCES.md`.

| Id | Arquivo final | Tamanho | Origem | Observação |
|---|---|---|---|---|
| R1 | `/assets/portfolio/canais/restaurante-feijoada-panela-9x16.webp` | 675 x 1200 | Pexels 34195320, José Roberto Oliveira | Tacho de barro com a concha erguendo linguiça. Sem vapor nem fogão a lenha |
| R2 | `/assets/portfolio/canais/restaurante-feijoada-prato-9x16.webp` e `/assets/portfolio/canais/restaurante-feijoada-prato-1x1.webp` | 675 x 1200; 900 x 900 | Pexels 9494742, Dalila Dalprat | Feijoada completa com couve, farofa, torresmo e laranja. A garrafa com rótulo ficou fora dos dois recortes |
| R3 | `/assets/portfolio/canais/restaurante-fachada-4x5.webp` (frente do Maps) e `/assets/portfolio/canais/restaurante-fachada-4x3.webp` (foto da ficha) | 960 x 1200; 1140 x 855 | Pexels 9538606, Erik Mclean | Fachada de madeira à noite com flores e mesas na calçada. Placa da porta repintada lisa e aviso de papel apagado. Não é esquina nem tem toldo |
| R4 | `/assets/portfolio/canais/restaurante-feijoada-panela-1x1.webp`, `/assets/portfolio/canais/restaurante-escondidinho-1x1.webp`, `/assets/portfolio/canais/restaurante-pudim-1x1.webp` | 900 x 900 cada | Pexels 34195320 (mesma de R1), 36580992 (Caio Niceas), 34234278 (Beatriz Haiana) | O terceiro item virou **Pudim de leite** (no cardápio do Reels e na coleção "Doces" do catálogo), porque não havia foto boa de doce de leite. O escondidinho é um gratinado em panelinha amarela |
| C1 | `/assets/portfolio/canais/clinica-consultorio-4x5.webp` | 960 x 1200 | Pexels 4269361, Cedric Fauntleroy | Consultório branco com janela, sem tela acesa e sem marca no equipamento. Sem planta |
| C2 | `/assets/portfolio/canais/clinica-recepcao-4x5.webp` | 960 x 1200 | Pexels 35056949, Ivanna Lebediuk | Parede terracota, sofá, floreira de madeira com plantas e balcão branco |
| E1 | `/assets/portfolio/canais/escola-fones-caderno-4x5.webp` | 960 x 1200 | Pexels 7658187, Pavel Danilyuk | Fone com microfone e pasta amarela na mesa de madeira, vista de cima. Sem caneca nem janela |
| E2 | `/assets/portfolio/canais/escola-fones-caderno-9x16.webp` | 675 x 1200 | mesma foto de E1 | O fone inteiro na vertical; o caderno com anotações fica fora |
| M2 | `/assets/portfolio/canais/incorporadora-sala-mar-1x1.webp` (cartão 2 do Facebook) e `/assets/portfolio/canais/incorporadora-sala-mar-4x5.webp` (frente do SEO) | 620 x 620; 700 x 875 | Recorte de `/assets/portfolio/smiile-architecture-coast.webp` | Mesma arquitetura do cartão 1, como pedia o plano. Sem ampliação, por isso menor que 1080 |
| MAP | `/assets/portfolio/canais/mapa-cidade.svg` | viewBox 360 x 640 | Desenho original | Quadras, ruas, duas avenidas, duas praças e um lago, sem nomes. Restaurante em 252,224; seu local em 108,544; rota `M108,544 L108,464 L180,464 L180,304 L252,304 L252,224` |
| Fatos | `/assets/portfolio/canais/campanha-crencas.webp`, `/assets/portfolio/canais/campanha-esportes.webp`, `/assets/portfolio/canais/campanha-negocios.webp` | 720 x 1273 | Estúdio Fatos (`roblox/public/estudio/`), cópia sem alteração | Bandeirola, Ondara e Arrimo |
| Fatos | `/assets/portfolio/canais/campanha-negocios-sem-grafico.webp` | 720 x 913 | Recorte de `campanha-negocios.webp` (y de 360 a 1273) | Usar este em vez do original: nenhum enquadramento mostra o gráfico. 16:9 `center 11%`, 1:1 `center 31%`, 4:5 `center 100%` |
| Fatos | `/assets/portfolio/campanha-nerd.webp` | 720 x 1273 | Já no repositório | Teclaria. Não duplicada |

Se faltar uma imagem fiel ao texto, mude o texto do quadro e não a foto: a fachada é de noite e sem toldo, o consultório não tem planta e a mesa da escola não tem caneca.

## 8. Identificação e avisos

| Canal | Rótulo no mock | Fonte ou estado |
|---|---|---|
| Instagram (feed, Reels, anúncio de WhatsApp) | "Patrocinado" abaixo do nome | Padrão da Meta |
| Facebook | "Patrocinado" com globo | Padrão da Meta |
| TikTok | "Patrocinado" | Conferir a posição |
| YouTube, anúncio e Shorts | "Patrocinado" e domínio | Conferir "Pular" |
| YouTube, live de criador | "Inclui promoção paga" (faixa nos primeiros segundos) e "#publi" | `support.google.com/youtube/answer/154235?hl=pt-BR` |
| LinkedIn | "Promovido" | Conferir "Desbloquear" |
| Google, pesquisa | "Resultados patrocinados", agrupado | Conferir o texto de "Ocultar" em pt-BR |
| Google, display | "Anúncio" | Sem desenhar o AdChoices |
| SEO | Nenhum | Resultado orgânico |
| ChatGPT | "Anúncio" | Conferir ("Ad" na versão de jun. 2026) e a disponibilidade no Brasil |
| Google Maps | "Patrocinado ⋮" e pin quadrado | Esquemas pt-BR do Google Ads |
| WhatsApp, catálogo | Nenhum (não é anúncio) | Chip "Catálogo, não é anúncio" |
| Publieditorial | "Conteúdo patrocinado por Arrimo Patrimônio" | CONAR |

Avisos de setor, como marcador, sem número inventado:
- Clínica: nome e CRO do responsável técnico ("[RT e CRO]").
- Incorporadora: "Imagens ilustrativas. CRECI e registro de incorporação aparecem aqui."
- Concessionária: mensagem educativa de trânsito (CTB, art. 77-B, incluído pela Lei 12.006/2009). Texto oficial a definir.
- Gestora: "Investimentos envolvem riscos." Nenhum gráfico de rendimento (por isso o recorte da foto).
- Em todos: "Exemplo ilustrativo, marca fictícia." fora do aparelho.

## 9. Testes desta seção que a mudança toca

- `tests/browser-static-presentations.mjs:166-167`: exige `.cx-positioning dt` com 5 ou mais. Trocar por `.cx-journey li` igual a 3, um `[aria-current="step"]` e o chip do cliente com "marca fictícia".
- `tests/browser-static-presentations.mjs:168`: rótulos `blog:/Conteúdo patrocinado por smiile/` e `seo:/smiile\.exemplo/`. Passam a ser `/Conteúdo patrocinado por Arrimo Patrimônio/` e `/moradafalesia\.exemplo/`.
- `tests/browser-static-presentations.mjs:174`: o orgânico sem "Patrocinado" continua valendo (o grupo esmaecido não pode ter o texto "Patrocinado" dentro de `.cm-g-result--organic`).
- `tests/browser-positioning.mjs:39`: "Responder a quem já procura." foi mantida para o Google.
- `tests/browser-narrative.mjs:121`: lê as notas e espera "Conversar sobre uma campanha". O link fica, mas o `h3` sai. Conferir o que o teste lê depois do build atual.
- `tests/browser-motion-rhythm.mjs:57`: o nome do check cita Casa Costa. Ajustar o texto do check se a frente mudar.
- Storyboard: hoje só formatos com `story` tocam. Com a jornada, todos os 16 tocam. O check "sem autoplay com movimento reduzido" continua valendo e deve cobrir também os formatos de feed.

## 10. Conferir antes de publicar

1. Rótulos no app: barra de CTA que acende no Instagram e no TikTok (tempo e cor), "Formulário no Facebook", "Pular" no YouTube, "Desbloquear" no LinkedIn, "Ocultar resultados patrocinados", "Acessar site" no Maps, "Conversar com a empresa" no catálogo, a citação do anúncio na conversa do WhatsApp, e "Anúncio" e o aviso abaixo do cartão no ChatGPT.
2. Anúncios no ChatGPT no Brasil: disponibilidade e rótulo em pt-BR.
3. INPI para os oito nomes.
4. Casa Costa no restante do portfólio, e Arco, Rota Viva e Kairo no repositório da Fatos (seção 2.3).
5. Glifo do Shorts (Simple Icons) e ícones do Google Ads e do Maps (aprovação do Google), conforme as restrições de `logos.md`.
