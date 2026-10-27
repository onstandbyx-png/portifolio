# Automações complexas de voz com IA (inbound/outbound, telefonia, voz em apps de mensagem) — janela 2026-06-29 a 2026-10-27

Notas de pesquisa. Data de corte: 2026-10-27. Itens anteriores à janela estão marcados como **[contexto]**. As fontes são em sua maioria primárias (blogs, changelogs e fóruns oficiais dos fornecedores, Anatel/DOU, Planalto, Teletime). Os números de impacto vêm quase todos de fornecedores e devem ser tratados como marketing.

## 1. Plataformas e modelos lançados/anunciados na janela (latência, barge-in, tool calling, PT-BR, preço)

### Takeaway
A janela foi dominada por modelos speech-to-speech de "segunda geração" com raciocínio e tool calling assíncrono. Os destaques são OpenAI gpt-realtime-2.1 (jul), GPT-Live-1 full-duplex (set), Google Gemini 3.8 Live (set) e ElevenLabs Eleven v4 / tool calls paralelos (set–out). O preço por minuto de áudio caiu para a faixa de US$0,02–0,05 no nível do modelo, e as plataformas completas ficam entre US$0,06 e US$0,31/min. Com isso, o gargalo deixou de ser o modelo e passou a ser a orquestração, a telefonia e as evals.

### Cited Findings
**OpenAI**
- 2026-07-06: lançamento de `gpt-realtime-2.1` e `gpt-realtime-2.1-mini`. A OpenAI diz ter reduzido a latência p95 "em pelo menos 25%" em todos os modelos Realtime via caching. O 2.1 traz melhorias em reconhecimento alfanumérico, tratamento de silêncio/ruído e comportamento de interrupção (barge-in), além de reasoning effort configurável e tool use. Preço por 1M tokens: 2.1 com áudio de entrada a US$32 e saída a US$64 (entrada cacheada a US$0,40); mini com entrada a US$10 e saída a US$20 — [OpenAI Community, 2026-07-06](https://community.openai.com/t/new-realtime-models-on-the-api-gpt-realtime-2-1-and-gpt-realtime-2-1-mini/1385896)
- 2026-09-10: `GPT-Live-1` na API. É full-duplex: escuta e fala ao mesmo tempo e lida com pausas, interrupções e backchannels. Delega raciocínio e ações a um modelo/agente de backend. Números reportados pela OpenAI:
  - latência de turn-taking de 0,798 s, contra 1,41 s do gpt-realtime-2.1;
  - 83,6% das tarefas Tau3 resolvidas na 1ª tentativa (pareado com GPT-6 Astra), contra 45,7% do realtime-2.1;
  - 87% de sucesso em tool calling (Full Duplex Bench v3).

  Conecta via WebRTC, WebSocket ou **Telephony/SIP**. Traz keyword biasing, turn detection explícito e 12 vozes novas. Custa **US$0,05/min** cobrado por segundo, com backend cobrado à parte. Interromper a fala não cancela automaticamente o trabalho em background — [OpenAI Community, 2026-09-10](https://community.openai.com/t/introducing-gpt-live-1-in-the-api/1396471)
- Um tópico "GPT-Live-1.1 is rolling out with new voices and better accents" aparece no fórum por volta de outubro de 2026. Não li o conteúdo, então os detalhes não foram verificados — [OpenAI Community (lista de tópicos relacionados)](https://community.openai.com/t/introducing-gpt-live-1-in-the-api/1396471)
- Sinal de risco para PT-BR: há um tópico do fórum sobre "regressão em agentes de voz de produção não-inglês" com gpt-realtime-mini, com atividade em 17 de setembro. O ponto é a necessidade de pinning de versão e evals por idioma. Também apareceu um aviso de depreciação do `gpt-realtime` original (set/2026) — [OpenAI Community (tópicos relacionados)](https://community.openai.com/t/new-realtime-models-on-the-api-gpt-realtime-2-1-and-gpt-realtime-2-1-mini/1385896)
- **[contexto]** GPT-Realtime-2 com raciocínio "classe GPT-5", GPT-Realtime-Translate (70+ idiomas de entrada) e GPT-Realtime-Whisper foram anunciados em maio de 2026 — [OpenAI](https://openai.com/index/advancing-voice-intelligence-with-new-models-in-the-api/). O gpt-realtime com suporte a SIP é de 2025-08-28 — [OpenAI](https://openai.com/index/introducing-gpt-realtime/)

**Google**
- 2026-09-15: Gemini 3.8 Live e 3.8 Live Extended Thinking. Recursos:
  - function calling **assíncrono**, que executa ferramentas enquanto continua falando;
  - precisão alfanumérica;
  - 97+ idiomas;
  - reasoning configurável;
  - 1º lugar no Speech-to-Speech leaderboard da Artificial Analysis, segundo o Google.

  Preço: US$0,005/min de áudio de entrada e US$0,018/min de saída (estimativa baseada em US$3 e US$12 por 1M tokens). Parceiros de integração: LiveKit, Pipecat, Agora, Voximplant e Vercel. O Gemini 3.5 Transcribe tem WER de 4,0% em streaming, 85+ idiomas e vocabulário customizado de até 1.000 termos — [Google blog, 2026-09-15](https://blog.google/innovation-and-ai/technology/developers-tools/build-real-time-voice-applications-gemini-audio/)
- No Vertex/Gemini Enterprise, `gemini-3.8-live` está listado como GA, com VAD, affective dialog, proactive audio, tool use e live avatar — [Google Cloud docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/live-api)

**ElevenLabs (ElevenAgents)**
- 2026-09-07: answering machine detection (AMD) via Twilio em chamadas outbound e batch calls. Há um modo `detect_message_end` para deixar recado após o bip e um webhook `answering_machine_detection` — [ElevenLabs changelog 2026-09-07](https://elevenlabs.io/docs/changelog/2026/9/7)
- 2026-09-21: tool calls paralelos e alertas no Slack. 2026-09-28: Eleven v4 e v4 Turbo, com voice cloning melhorado. 2026-10-05: o TTS padrão dos agentes passa de `eleven_flash_v2` para `eleven_v4_turbo`, e chegam "procedures" estruturadas validadas no save. 2026-10-19: ações de AMD (desligar se for máquina/fax) e novos LLMs (gemini-4-argon, claude-opus-4-6) — [Releasebot (agregador)](https://releasebot.io/updates/eleven-labs); [ElevenLabs changelog 2026-10-05](https://elevenlabs.io/docs/changelog/2026/10/5)
- Transferência via SIP REFER com a opção `sip_refer_play_dialtone`, para silenciar a perna original durante a transferência — [ElevenLabs changelog](https://elevenlabs.io/docs/changelog)
- O site PT da ElevenLabs anuncia agentes "em mais de 90 idiomas" por telefone e web — [ElevenLabs PT](https://elevenlabs.io/pt/voice-agents)

**Plataformas de orquestração e preços (comparativo publicado por fornecedor concorrente)**
- Preços listados em 2026-10-03:

  | Plataforma | Preço por minuto |
  |---|---|
  | Cartesia Managed Agents | US$0,06 + US$0,014 por número |
  | Vapi | US$0,05 de hosting + modelos ao custo |
  | Retell | US$0,07–0,31 (a estimativa padrão de ~US$0,11 inclui telefonia de US$0,015) |
  | Bland | US$0,12–0,14 com modelos incluídos |
  | LiveKit Cloud | US$0,01 por sessão + modelos |
  | Pipecat | grátis (open source) |
  | ElevenLabs | US$0,08 + LLM |

  — [Cartesia, out/2026](https://www.cartesia.ai/learn/ai-voice-agent-platforms) (viés: a Cartesia é parte interessada)
- Na leitura do board Coval de 2026-09-08, o Deepgram Aura-2 teve TTFA mediano de 290 ms e WER de 5,0%. O Nova-3 STT custa US$0,0043/min — [Gradium (fornecedor concorrente)](https://gradium.ai/content/best-api-build-ai-voice-agent-2026)
- **[contexto, mai/2026]** A Vapi levantou uma Série B de US$50M (valuation de ~US$500M), tem mais de 1 bilhão de chamadas e processa 1–5M chamadas/dia. A Amazon Ring passa 100% das chamadas inbound pela Vapi após avaliar mais de 40 fornecedores — [TechCrunch, 2026-05-12](https://techcrunch.com/2026/05/12/vapi-hits-500m-valuation-as-amazon-ring-chose-its-ai-platform-over-40-rivals/)
- **[contexto, jun/2026]** A Five9 lançou o release "Voice AI Agents" com handoff humano contextual — citado em [Macronet](https://macronetservices.com/ai-voice-agents-contact-centers-2026/)

**Voz dentro de apps de mensagem (WhatsApp/Meta)**
- A WhatsApp Business Calling API (VoIP, inbound e outbound) está documentada pela Meta. Agentes de IA conectam via WebRTC/SIP. O Pipecat tem integração nativa — [Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling); [Pipecat docs](https://docs.pipecat.ai/pipecat/features/whatsapp). Lançamento original **[contexto, 2025]**: [WhatsApp Business blog](https://whatsappbusiness.com/blog/whatsapp-business-calling-api/)
- Há intermediários que roteiam chamadas do WhatsApp para Vapi/Retell via WebSocket. O custo por minuto da Meta é cobrado direto na WABA — [Zernio](https://zernio.com/blog/whatsapp-calling-api); o mesmo vale para Synthflow e respond.io — [respond.io](https://respond.io/blog/whatsapp-ai-voice-agent)
- **[contexto, 2026-06-03]** No Conversations 2026, a Meta lançou o **Meta Business Agent**, agente de IA grátis no WhatsApp/Messenger/Instagram que agenda, qualifica leads, vende e faz handoff para humano, com mais de 1M de empresas no piloto. Lançou também o **Meta Business Agent Platform** para enterprise. A fonte secundária **não menciona voz** — [AiChat (resumo de terceiro)](https://www.aichat.com/blog/meta-conversations-2026-announcements)

### Inferences
- Duas arquiteturas competem:
  - **S2S "puro"** (gpt-realtime-2.1, Gemini 3.8 Live): menor latência, menos controle;
  - **"camada conversacional + backend delegado"** (GPT-Live-1, procedures da ElevenLabs): melhor tool use e auditabilidade.

  A tendência de out/2026 favorece a segunda para fluxos complexos.
- Em custo, um agente usando Gemini 3.8 Live pode ficar abaixo de US$0,03/min só de modelo. A telefonia BR e a orquestração passam a dominar o custo.
- AMD, transferência via SIP REFER e batch calling estão virando commodity. O diferencial competitivo passa a ser evals, guardrails e integração com CRM/agenda.

### Gaps
- Não verifiquei lançamentos na janela para Twilio ConversationRelay, Retell, Bland, Sesame, LiveKit Agents, Pipecat (além da integração Gemini), Deepgram ou Cartesia (exceto o comparativo de preços). Ficaram sem busca dedicada por limite de tool calls.
- Não encontrei benchmark independente de qualidade de voz em **PT-BR** para nenhum modelo da janela. Os fornecedores citam apenas contagem de idiomas.
- Não encontrei anúncio da Meta de agente de **voz** nativo (Business AI respondendo chamadas do WhatsApp). O Meta Business Agent parece ser só texto, mas não está confirmado.
- Não confirmei o preço por minuto da WhatsApp Business Calling para o Brasil.

## 2. Fluxos complexos de maior impacto

### Takeaway
Os fluxos de maior impacto documentados são quatro: speed-to-lead (<60 s), agendamento com tool calls de calendário, confirmação/lembrete para reduzir no-show e reativação de base. Todos dependem de tool calling durante a chamada, AMD/voicemail, transferência a humano com contexto e pós-chamada estruturado (resumo para o CRM e follow-up por WhatsApp). As peças técnicas para isso foram lançadas na janela.

### Cited Findings
- Habilitadores técnicos lançados na janela:
  - function calling assíncrono, em que o agente consulta a agenda enquanto fala — [Google, 2026-09-15](https://blog.google/innovation-and-ai/technology/developers-tools/build-real-time-voice-applications-gemini-audio/);
  - tool calls paralelos — [Releasebot/ElevenLabs, 2026-09-21](https://releasebot.io/updates/eleven-labs);
  - delegação a backend sem cancelar a tarefa quando o cliente interrompe — [OpenAI GPT-Live-1](https://community.openai.com/t/introducing-gpt-live-1-in-the-api/1396471);
  - AMD com regra de deixar recado ou desligar, para campanhas outbound de reativação e cobrança — [ElevenLabs 2026-09-07](https://elevenlabs.io/docs/changelog/2026/9/7);
  - precisão alfanumérica (códigos de confirmação, CPF, protocolo), melhorada em gpt-realtime-2.1 e Gemini 3.8 Live — [OpenAI](https://community.openai.com/t/new-realtime-models-on-the-api-gpt-realtime-2-1-and-gpt-realtime-2-1-mini/1385896); [Google](https://blog.google/innovation-and-ai/technology/developers-tools/build-real-time-voice-applications-gemini-audio/).
- A Vapi lista entre os casos de uso suporte inbound, **cobrança outbound**, triagem de candidatos e navegação autônoma de URA. Os setores com mais tração são financeiro, saúde, seguros e automotivo. O Kavak (presente no Brasil) aparece como cliente — [Yahoo/GlobeNewswire, 2026-05-12 [contexto]](https://finance.yahoo.com/sectors/technology/articles/vapi-raises-50m-series-b-130000518.html); [TechCrunch](https://techcrunch.com/2026/05/12/vapi-hits-500m-valuation-as-amazon-ring-chose-its-ai-platform-over-40-rivals/)
- Transferência a humano com contexto passou a ser exigência regulatória no SAC brasileiro. O Decreto 13.135/2026 proíbe exigir que o consumidor reinicie o contato e exige que o atendente tenha acesso ao histórico (arts. 7º e 18). Ver a seção 4 — [Conjur, 2026-10-17](https://conjur.com.br/2026-out-17/o-novo-decreto-do-sac-atendimento-humano-inteligencia-artificial-e-os-limites-da-regulacao/)
- O Meta Business Agent já oferece agendamento, qualificação e handoff no WhatsApp em texto, o que se presta ao follow-up pós-chamada no mesmo canal — [AiChat [contexto jun/2026]](https://www.aichat.com/blog/meta-conversations-2026-announcements)

### Inferences
- O fluxo de maior valor demonstrável em portfólio no Brasil, seguindo as fontes, tem cinco passos:
  1. formulário ou lead de anúncio Click-to-WhatsApp;
  2. chamada de IA em menos de 60 s, por PSTN ou por chamada WhatsApp;
  3. qualificação e agendamento com tool call de calendário;
  4. resumo estruturado gravado no CRM;
  5. confirmação por template de WhatsApp, lembrete D-1 e transferência quente quando houver intenção alta.
- Cobrança e reativação de base antiga são os fluxos mais arriscados no Brasil. São outbound em volume, o que esbarra nos limites da Anatel (10 mil chamadas/dia por usuário e 1 mil por acesso; ver seção 4) e nos filtros antispam das operadoras.

### Gaps
- Não encontrei especificação pública de "post-call summary para CRM e depois WhatsApp" de nenhum fornecedor dentro da janela. A inferência foi montada a partir das peças disponíveis.

## 3. Evidência quantitativa (Brasil priorizado)

### Takeaway
Não encontrei case quantitativo brasileiro verificável publicado na janela. A evidência disponível é global, vem de fornecedores e não é auditada. Os números típicos são de +30% a +50% de pipeline qualificado e cerca de 31% de redução de no-show, e devem ser apresentados como alegação de fornecedor.

### Cited Findings
- A Bland afirma que empresas com voz IA na qualificação inbound tiveram de +30% a +50% de pipeline qualificado com o mesmo gasto em mídia. Não há metodologia publicada — [Bland blog](https://www.bland.ai/blog/ai-voice-agents-for-marketing)
- Uma consultoria (NAITIVE) relata um caso SaaS em que a resposta caiu de 4–6 h para menos de 60 s e o lead-to-demo subiu de 12% para 17% (+40%). Cita também "31% de queda em no-shows" e ROI de 11x. É fonte de vendedor, sem datas nem nomes — [NAITIVE blog](https://blog.naitive.cloud/voice-ai-roi-sales-case-study-analysis/)
- A Blazeo relata um caso de home services com chamada em 20 s após o formulário e +220% de conversão lead→agendamento. É fonte de vendedor — [Blazeo](https://www.blazeo.com/blog/voice-ai-lead-engagement/)
- A Synthflow cita um BPO de US$230M que automatizou mais de 600 mil chamadas/mês com mais de 40 agentes em 60 dias — [Synthflow](https://synthflow.ai/whatsapp-business-calls)
- A Amazon Ring passa 100% do inbound pela Vapi. Esta é a evidência de escala mais crível, por vir de reportagem do TechCrunch — [TechCrunch, 2026-05-12 [contexto]](https://techcrunch.com/2026/05/12/vapi-hits-500m-valuation-as-amazon-ring-chose-its-ai-platform-over-40-rivals/)
- Contexto Brasil sobre saturação do canal: em 2025 foram registradas 161,16 bilhões de chamadas curtas (até 6 s), muitas feitas por robôs — [Convergência Digital](https://convergenciadigital.com.br/governo/telemarketing-abusivo-brasil-registra-mais-de-126-bilhoes-de-ligacoes-feitas-por-robos/)
- Ecossistema BR de agentes de voz em PT (sem métricas verificadas): Vozis ("até mil ligações ao mesmo tempo") — [vozis.ai](https://vozis.ai/); PitchYes, que se compara com Prospct.ai, 3C Plus e Viver de IA — [pitchyes.com.br](https://www.pitchyes.com.br/)

### Inferences
- A estatística clássica de speed-to-lead da HBR ("100x" em 5 min, "7x" em 1 h) é de 2011 e muitas vezes é citada de forma distorcida. Use-a apenas como contexto histórico.
- A alta saturação de robocalls no Brasil sugere taxas de atendimento baixas para outbound frio. Chamadas disparadas por uma ação do próprio lead (speed-to-lead, confirmação) devem ter desempenho muito melhor que prospecção fria. Isso é inferência, não dado.

### Gaps
- Não encontrei case brasileiro com métricas (no-show, conversão, cobrança) publicado entre jun e out de 2026. Mobile Time e Convergência Digital não foram varridos especificamente para cases.
- Não encontrei relatório de analista (Gartner/Forrester/IDC) da janela com números de voz IA.

## 4. Restrições regulatórias brasileiras (e o EU AI Act como contexto)

### Takeaway
O período de out/2026 é o mais movimentado da história recente para chamadas automatizadas no Brasil. Quatro atos se somaram:
- **MP 1396/2026** (13/out), sobre autenticação e bloqueio de chamadas;
- **Despacho Anatel 100/2026** (19/out), com limites de 1 mil chamadas/dia por acesso e 10 mil/dia por usuário e bloqueio de 15 dias, em vigor a partir de **12/nov/2026**;
- **Despacho 82/2026** (17/ago), que padroniza os antispam das operadoras, ativados por padrão;
- **Decreto 13.135/2026** (SAC), que admite IA mas exige caminho para humano já no 1º nível.

O 0303 deixou de ser obrigatório em ago/2025.

### Cited Findings
- **Despacho Decisório 100/2026 (DOU de 2026-10-19, vigência a partir de 2026-11-12):** é uso abusivo ultrapassar no mesmo dia **1 mil ligações por acesso** ou **10 mil chamadas** distribuídas por vários números. Também é abusivo quando as chamadas curtas (não completadas, caixa postal ou até 6 s) somam **85% ou mais** do total. A operadora notifica em até 10 dias e bloqueia em até 5 dias. O bloqueio dura 15 dias, atinge todos os acessos e impede ativar novos números, e a operadora pode cobrar o serviço durante o bloqueio. Os relatórios mensais incluem "grandes usuários" com mais de 100 mil chamadas/mês — [Teletime, 2026-10-19](https://teletime.com.br/19/10/2026/operadoras-bloqueio-chamadas-abusivas/); [DOU](https://www.in.gov.br/web/dou/-/despacho-decisorio-n-100/2026-738848915)
- **MP 1396/2026** (publicada na semana de 13/out): combate a fraudes e chamadas abusivas, com identificação e autenticação de chamadas pelas operadoras e bloqueio de chamadas e mensagens com códigos irregulares. Recebeu cerca de 49–50 emendas, entre elas exceções para instituições autorizadas pelo BC (prevenção a fraude, confirmação de operações), "plataformas de consentimento para a realização de chamadas" e a Anatel definindo critérios de proteção de dados ouvindo a ANPD. Tranca a pauta em 27/nov/2026 e caduca em 22/mar/2027 se não for votada — [Teletime, 2026-10-20](https://teletime.com.br/20/10/2026/quase-50-ementas-sao-apresentadas-a-mp-das-chamadas-abusivas/). Segundo o MCom, a MP antecipa a autenticação de chamadas antes prevista para 2028. Só vi a manchete — [Teletime, 2026-10-13](https://teletime.com.br/13/10/2026/mcom-mp-antecipa-autenticacao/)
- **Despacho Decisório 82/2026 (DOU de 2026-08-17):** princípios para os antispam próprios das operadoras. Ficam ativados **por padrão** para toda a base, com opt-out para o consumidor. O critério é a "compatibilidade entre volume e duração das chamadas e a finalidade" do serviço. Quem origina chamadas e foi bloqueado pode pedir desbloqueio, com resposta em 10 dias corridos — [Anatel, 2026-08-17](https://www.gov.br/anatel/pt-br/assuntos/noticias/anatel-estabelece-regras-para-ampliacao-dos-mecanismos-de-bloqueio-automatico-de-chamadas-abusivas-pelas-prestadoras)
- **[contexto, mai/2026]** O Despacho 75/2026 prorrogou até 31/out/2028 a cautelar de bloqueio para quem faz ao menos 100 mil chamadas/dia com 85% ou mais curtas, alcançando 29 prestadoras — [Teletime, 2026-05-27](https://teletime.com.br/27/05/2026/robocall-anatel-2028/)
- **[contexto, ago/2025]** A Anatel tornou o **0303 facultativo** porque o prefixo estigmatizava as chamadas. A autenticação (Origem Verificada/STIR-SHAKEN) é exigida para quem faz mais de 500 mil chamadas/mês — [Agência Brasil](https://agenciabrasil.ebc.com.br/geral/noticia/2025-08/anatel-revoga-obrigatoriedade-do-uso-do-prefixo-0303-em-ligacoes); [Teletime 2025-08-07](https://teletime.com.br/07/08/2025/anatel-flexibiliza-uso-do-prefixo-0303-para-chamadas-massivas/); [Callix](https://www.callix.com.br/melhores-praticas/prefixo-0303-o-que-muda-e-como-adequar-a-sua-empresa-de-telemarketing/)
- **Decreto 13.135, de 9/out/2026 (DOU de 13/out, substitui o Decreto 11.034/2022):**
  - admite IA na triagem, distribuição e resolução, desde que preservada a alternativa humana;
  - cancelamento e acesso a humano devem estar disponíveis desde o 1º nível (arts. 13 e 16);
  - atendimento telefônico humano por pelo menos 8 h/dia;
  - proibido exigir que o consumidor reinicie o contato (art. 7º); o atendente deve ter acesso ao histórico (art. 18);
  - se a chamada humana cair, retorno em até 300 s;
  - limite de 5 níveis de atendimento;
  - retenção de registros reduzida de 2 anos para 6 meses.

  Fontes: [Conjur, 2026-10-17](https://conjur.com.br/2026-out-17/o-novo-decreto-do-sac-atendimento-humano-inteligencia-artificial-e-os-limites-da-regulacao/); [Planalto](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2026/decreto/d13135.htm); [Migalhas](https://www.migalhas.com.br/depeso/466876/novo-decreto-do-sac-automacao-admitida-e-atendimento-humano); o limite de 5 níveis está em [LinkedIn (Pulse)](https://pt.linkedin.com/pulse/novo-decreto-do-sac-n%C2%BA-131352026-o-4nshf). A data de entrada em vigor aparece truncada ("2 de ...") num post de Instagram e não foi verificada.
- O Não Me Perturbe, a LGPD (base legal para gravação e transcrição, e consentimento para clonagem de voz como dado biométrico) e a divulgação de que se trata de IA **não foram verificados nesta sessão** com fontes da janela.

### Inferences
- Para um agente outbound de IA no Brasil a partir de 12/nov/2026:
  - fique abaixo de 1 mil chamadas/dia por número e 10 mil/dia por CNPJ/usuário;
  - evite mais de 85% de chamadas curtas, o que exige AMD bem calibrado, já que voicemail conta como "curta";
  - autentique a origem;
  - prefira chamadas disparadas pelo próprio lead, com consentimento registrado.

  Chamadas via WhatsApp Calling não passam pela rede de voz das operadoras. É provável que fiquem fora desses despachos, mas seguem sujeitas às políticas da Meta, à LGPD e ao CDC. Isso é uma inferência jurídica a validar.
- O Decreto 13.135 torna obrigatória para SAC a "transferência a humano com contexto", que já era boa prática.

### Gaps
- EU AI Act art. 50 (transparência: informar o usuário de que interage com IA e marcar conteúdo sintético; aplicação prevista para ago/2026). Não pesquisei se houve adiamento pelo "digital omnibus" na janela, então trate como incerto.
- Não encontrei norma brasileira específica que obrigue anunciar "você está falando com uma IA" em ligações. O PL 2338/2023 (marco de IA) não foi verificado nesta sessão.
- O texto integral da MP 1396/2026 não foi lido. Não sei se ela trata de IA ou de consentimento prévio.

## 5. O que torna uma implementação de alta barreira

### Takeaway
A barreira técnica migrou do modelo para a engenharia de sistema. Os pontos principais são:
- latência de turno abaixo de ~800 ms medida no p95 (não na média);
- barge-in robusto em PSTN ruidosa;
- tool calls assíncronos sem "silêncio morto";
- AMD, transferência via SIP REFER e telefonia brasileira (SIP trunk com DID nacional, autenticação, limites da Anatel);
- evals e regressão por idioma;
- consentimento para clonagem de voz.

### Cited Findings
- Latência: o GPT-Live-1 reporta turn-taking de 0,798 s contra 1,41 s do realtime-2.1 — [OpenAI](https://community.openai.com/t/introducing-gpt-live-1-in-the-api/1396471). A OpenAI reduziu o p95 em pelo menos 25% via caching — [OpenAI](https://community.openai.com/t/new-realtime-models-on-the-api-gpt-realtime-2-1-and-gpt-realtime-2-1-mini/1385896). O Deepgram Aura-2 tem TTFA de 290 ms mediano, com spread P25–P75 de 231 ms — [Gradium](https://gradium.ai/content/best-api-build-ai-voice-agent-2026)
- Ruído e silêncio, alfanuméricos e interrupções são as áreas explicitamente "consertadas" nos releases de jul–set, ou seja, eram pontos de falha em produção — [OpenAI](https://community.openai.com/t/new-realtime-models-on-the-api-gpt-realtime-2-1-and-gpt-realtime-2-1-mini/1385896); [Google](https://blog.google/innovation-and-ai/technology/developers-tools/build-real-time-voice-applications-gemini-audio/)
- Regressão em idiomas não-ingleses entre versões de modelo foi relatada por desenvolvedores — [OpenAI Community (tópico relacionado)](https://community.openai.com/t/new-realtime-models-on-the-api-gpt-realtime-2-1-and-gpt-realtime-2-1-mini/1385896)
- Governança como diferencial: o CEO da Vapi diz que a próxima fase da voz IA será "definida por governança e previsibilidade" — [GlobeNewswire/Yahoo](https://finance.yahoo.com/sectors/technology/articles/vapi-raises-50m-series-b-130000518.html). A ElevenLabs lançou branches, merge proposals, testes e procedures validadas — [ElevenLabs changelog 2026-10-05](https://elevenlabs.io/docs/changelog/2026/10/5)
- Telefonia: as plataformas oferecem SIP trunk BYOC (Retell nativo, Vapi BYO) — [Retell](https://www.retellai.com/blog/vapi-ai-review); [Kalem](https://kalem.me/best-ai-voice-agent). A autenticação de chamadas é exigida para alto volume no Brasil e deve ser antecipada pela MP 1396 — [Teletime](https://teletime.com.br/13/10/2026/mcom-mp-antecipa-autenticacao/)
- Clonagem de voz: o Eleven v4 traz "voice cloning melhorado" — [Releasebot](https://releasebot.io/updates/eleven-labs). Não encontrei requisitos novos de consentimento na janela.

### Inferences
- Um portfólio "alta barreira" deve mostrar quatro coisas:
  - dashboard de latência p50/p95 por turno;
  - suíte de evals em PT-BR (alfanuméricos como CPF/CEP/datas, barge-in, ruído, tentativa de prompt injection);
  - AMD com taxa de chamadas curtas abaixo de 85%;
  - transferência quente com resumo, compliance com o Decreto 13.135 e limites do Despacho 100/2026.

### Gaps
- Não há dados sobre a qualidade e o custo de SIP trunks brasileiros (latência até us-east e disponibilidade de PoPs dos fornecedores na América do Sul).
- Não verifiquei se OpenAI, Google ou ElevenLabs têm processamento de mídia em região brasileira, relevante para latência e transferência internacional pela LGPD.
