# Other channels (non-WhatsApp/Meta/Telegram/voice) and portfolio gap analysis — window 2026-06-29 to 2026-10-27

Scope note: research was capped at about 18 tool calls across 12 channels, so depth varies. Many 2026 claims come from vendor or agency blogs. Each one is flagged as such. Items dated before 2026-06-29 are labelled CONTEXT.

## Q1. Per channel: the most complex, high-conversion or high-retention automations realistic in Brazil now, what is new in the window, and the evidence

### Takeaway
In Brazil, the strongest new automation layers in the window are **RCS for Business**, now reaching every iPhone carrier and tied into Google Search and Ads, and **Pix Automático plus Pix por aproximação/Open Finance**, which handle recurring billing and retention. Google AI Max is GA in Brazil, but AI Mode/AI Overviews ads, UCP agentic checkout and Business Agent are **not yet available in Brazil**. ChatGPT ads **are live in Brazil** (Aug 2026, per third-party trackers). The marketplace APIs (Mercado Livre) are moving *against* templated auto-messages.

### Cited Findings

**RCS Business Messaging (Brazil) and SMS**
- Brazil had **145 million active RCS users** (+10M vs end-2025), and about **1,000 companies** used RCS for business, mostly large enterprises: Casas Bahia, iFood, Cyrela, Pernambucanas, Serasa, Drogasil, Globoplay, Bradesco, Leroy Merlin, Sam's Club, Motorola and others. Kaio Marin (Google Brasil) gave the figures at an event of Blip, Zenvia, Sinch, Infobip, Pontaltech and Grupo Ótima. Dated 2026-06-12 (CONTEXT, 2 weeks before the window) — [Mobile Time](https://www.mobiletime.com.br/noticias/12/06/2026/rcs-145-mi-brasil/)
- Google Search entry points that open an RCS conversation:
  - **Feature Snippets**: queries like "ligar para" or "chat" lead to RCS contact. Android now, iOS "by end of 2027".
  - **Mega Sitelinks (MSL)**: brand-name queries.
  - **Web Results**: generic intent like "comprar" or "contratar". Released end of May 2026.
  - Source: [Mobile Time, 2026-06-12](https://www.mobiletime.com.br/noticias/12/06/2026/rcs-145-mi-brasil/)
- **Message Ads** (RCS inside Google Ads) is in test in Brazil, with 3 formats: *RCS estendido*, *botão* (a search button that opens an RCS chat) and *message-forward* (multiple contact options plus a mini-site in Search). The first tests use button and message-forward. Planned by end-2026: an **RCS chat button in AI Mode** (conversation with Gemini), the **Android dialer** opening an RCS chat instead of a call, and an **RCS chat button in Google Maps** — [Mobile Time](https://www.mobiletime.com.br/noticias/12/06/2026/rcs-145-mi-brasil/). A vendor separately says Message Ads is a "piloto" whose availability depends on Google's timeline — [Pontaltech](https://pontaltech.com.br/blog/rcs/novidades-rcs-2026-o-que-muda-para-empresas/). Uncertain: I found no confirmation of GA or pricing within the window.
- iPhone RCS by carrier:
  - **Vivo**: first in LatAm, with iOS 26 (Sep 2025) — [Telesíntese](https://telesintese.com.br/rcs-chega-ao-ios-26-no-brasil-com-a-vivo/)
  - **TIM**: around iOS 26.2 (Nov 2025) — [Mobile Time](https://www.mobiletime.com.br/noticias/17/11/2025/claro-tim-rcs-ios/)
  - **E2E encryption** for TIM and Vivo on iOS 26.5 (May 2026, beta) — [MacMagazine 2026-05-19](https://macmagazine.com.br/post/2026/05/19/operadoras-tim-e-vivo-agora-suportam-mensagens-criptografadas-via-rcs-no-ios-26-5/)
  - **Claro: IN WINDOW.** Released RCS for iPhone on **2026-09-17**, after appearing in iOS 27 beta 5 (2026-08-10). This makes all three major carriers live. Claro reported about 300k RCS messages/month and expects +15% from iPhones. Single source, a tech blog — [Anti/Hype](https://antihype.com.br/c/software/rcs-claro-iphone-ios-27/)
- Conversion or retention evidence: I found no Brazil-specific, independently sourced RCS conversion stats in the window. Vendor blogs (e.g. [Pushfy](https://pushfy.com/rcs-business-messaging-no-brasil-em-2026-cobertura-real-adocao-setorial-e-como-calcular-se-vale-migrar-do-sms-agora/)) discuss ROI against SMS, but I did not verify them.

**Apple Messages for Business**
- **IN WINDOW / just before**:
  - 2026-06-04: Apple approved **Poke** as the first standalone third-party AI agent on Messages for Business.
  - Conditions: live human handoff, AI clearly labelled as AI, link previews instead of inline links, Apple button style guide.
  - Approval took "a couple of months".
  - Poke migrates existing users through invitations.
  - Source: [TechCrunch](https://techcrunch.com/2026/06/04/apple-approves-poke-as-the-first-ai-agent-on-its-messages-for-business-platform/)
- Apple policy doc v3.1 is dated 2026-07-21 (IN WINDOW). Apple can disable the service at any time and currently does not accept businesses that operate primarily in health — [Apple policies](https://register.apple.com/resources/messages/messaging-documentation/policies) (via search summary, not fetched)
- **"AMB invitations"**: approved brands can invite opted-in customers into a conversation. No Brazil-specific confirmation — [Messaging Advisory](https://www.messagingadvisory.com/apple-1)
- Brazil availability: launched in Brazil in 2019 (CONTEXT) and supports Apple Pay inside the chat (vendor claim) — [Infobip](https://www.infobip.com/pt/blog/apple-message-for-business). A Brazilian vendor calls the channel premium with uncertain ROI next to WhatsApp — [SocialHub](https://www.socialhub.pro/blog/apple-business-messages-brasil-2026-vale-a-pena-2/). Uncertain: I could not confirm current BR onboarding status from Apple.

**Google (Ads, AI Max, Business Profile, AI Mode, Merchant Center)**
- **AI Max for Search** went GA in April 2026 (CONTEXT). Dynamic Search Ads are being deprecated, and **auto-migration of campaigns to AI Max started September 2026** (IN WINDOW). On **2026-10-08**, Google began showing a **preview of up to 10 AI Max headlines/descriptions** before you switch it on. **AI Brief** (natural-language steering of AI Max) was announced for Portuguese on **2026-09-23**, but one blog lists Brazil as "em breve, sem data" — the sources conflict. All of this comes from agency blogs — [Degrau Publicidade](https://www.degraupublicidade.com.br/anuncios-no-modo-ia-do-google/), [Tudo sobre CDP](https://www.tudosobrecdp.com.br/performance/google-ai-max-portugues-relatorios-jornada-anuncios/), [Agência Lastro](https://agencialastro.com.br/ai-max-google-ads/)
- **Ads in AI Overviews / AI Mode are not available in Brazil/Portuguese.** As of 2026-10-02, AI Overviews ads ran in English in 12 countries, and AI Mode ads were still in test — [Degrau Publicidade, citing the Google Ads help center](https://www.degraupublicidade.com.br/anuncios-no-modo-ia-do-google/). Uncertain: secondary source.
- **Universal Commerce Protocol (UCP) / agentic checkout** in AI Mode and Gemini:
  - Announced January 2026. Live for select **US** merchants, with Canada, Australia and the UK expected by end-2026.
  - Setup: the `native_commerce` attribute in a supplemental feed, Google Pay support, an interest form and a Merchant Center sandbox.
  - **Business Agent** is a branded AI sales associate inside Search, activated in Merchant Center. US launch partners: Lowe's, Michaels, Poshmark, Reebok.
  - **Brazil is not listed.**
  - Sources: [Google blog](https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/), [ALM Corp](https://almcorp.com/blog/google-universal-commerce-protocol-ucp-explained/), [commercetools](https://commercetools.com/blog/google-ucp-merchant-guide-to-agentic-commerce)
- Google Business Profile booking or chat: I found no in-window source. In Brazil the effective "chat from Maps" path is the planned **RCS chat button in Maps** (above). (CONTEXT, from my knowledge and not re-verified: GBP chat/Business Messages was shut down in 2024.)
- Google Ads lead form + webhook: no in-window changes found (gap).

**YouTube**
- The **YouTube Shopping Affiliate Program** launched in Brazil on 2025-11-04 with Mercado Livre and Shopee (CONTEXT) — [YouTube Blog](https://blog.youtube/intl/pt-br/news-and-events/yt-shopping-afiliados-brasil/), [Exame](https://exame.com/marketing/youtube-shopping-inicia-operacao-no-brasil-com-mercado-livre-e-shopee-como-parceiros/)
- **IN WINDOW**: Amazon joined YouTube Shopping in Brazil. The date is Sep 2026 per [Central do Varejo](https://centraldovarejo.com.br/amazon-lanca-videos-de-criadores-no-site-e-passa-a-integrar-o-youtube-shopping-no-brasil/) and 2026-10-07 per [EcomSmart](https://ecomsmart.com.br/youtube-shopping-lojistas/) — dates conflict. The Studio AI assistant will build media kits, and commercial proposals to brands from 2027.
- I found no in-window YouTube lead-form ad news for Brazil (gap).

**TikTok**
- TikTok Business Center offers **4 types of automated direct messages**, available only to accounts with advanced access and a **Verified Business Account (VBA)**. Help page updated May 2026 — [TikTok Ads help (PT)](https://ads.tiktok.com/help/article/navigate-auto-message-business-accounts?lang=pt). (CONTEXT, from knowledge and not re-verified this window: the 4 types are welcome message, suggested questions, keyword auto-reply and chat prompts.)
- TikTok Shop Brazil: 57.8% of Brazilian users bought in Shop after discovering the product on the platform, per TikTok Brasil via a trade site. The number of creators reportedly grew 46x in 2026 — [Eletrolar Show](https://eletrolarshow.com.br/tiktok-shop-cresce-brasil-criadores-46-vezes-2026/), [Serasa Experian](https://www.serasaexperian.com.br/conteudos/tiktok-shop/). Uncertain: secondary sources.
- TikTok Instant Messaging Ads and Search Ads: I found no in-window Brazil sources (gap).

**LinkedIn**
- Lead Gen Forms:
  - Up to 3 custom questions and 12 selectable fields.
  - Native sync to CRM/MAP/CDP: Salesforce, HubSpot, Dynamics 365, Marketo, Eloqua.
  - Hidden fields for UTM/campaign IDs.
  - Forms can attach to message and **conversation ads**.
  - Sources: [LinkedIn Help](https://www.linkedin.com/help/lms/answer/a423447), [LeadsBridge](https://leadsbridge.com/blog/the-best-linkedin-crm-integrations/), [LeadSync](https://leadsync.me/blog/linkedin-lead-gen-forms/)
- Lead retention conflicts: 90 days in the download UI versus a 1-year storage limit, depending on the source. A booking step after submit (Sep 2025) is a vendor claim I could not verify.
- I found no in-window Conversation Ads or InMail-limit changes (gap).

**E-mail and lifecycle**
- Gmail bulk-sender rules (5,000+/day to Gmail):
  - SPF, DKIM and DMARC with From-domain alignment.
  - One-click unsubscribe per RFC 8058, honoured within 48h.
  - Spam rate under 0.3% (target under 0.1%).
  - Enforcement escalated to **permanent 550 rejections** from Nov 2025.
  - Microsoft (Outlook/Hotmail) enforcement is dated May 2025 or "April/May 2026" depending on the source — the sources conflict.
  - Sources (vendor guides): [Red Sift](https://redsift.com/guides/bulk-email-sender-requirements), [PowerDMARC](https://powerdmarc.com/bulk-email-sender-requirements/), [AutoSPF](https://autospf.com/blog/google-yahoo-bulk-sender-mandate-changes-over-two-years/)
- BIMI and AMP: no in-window sources found (gap). (CONTEXT, unverified: BIMI requires DMARC p=quarantine/reject plus a VMC/CMC certificate for the Gmail logo.)

**Pix Automático, Pix por aproximação and Open Finance**
- Pix Automático had about **1k receivers at end-2025 and 14k by Aug 2026** (BCB, Márcia Vicari, Febraban Tech, 2026-08-24). She said "estamos em um processo de teste ainda". Public utilities (concessionárias) are starting to join. The next Pix cycle covers duplicata escritural, cross-border Pix, and future Pix receivables as credit collateral — [Finsiders, 2026-08-25](https://finsidersbrasil.com.br/pagamentos/pix/bc-ve-maior-adocao-do-pix-automatico-nos-proximos-meses/)
- **IN WINDOW**: Resolução BCB nº 587 (Sep 2026) allows scheduling Pix Automático from **contas-salário from 2027-07-01** — [Mix Vale, 2026-10-06](https://www.mixvale.com.br/2026/10/06/pix-automatico-em-contas-salario-comeca-a-valer-em-2027/), [Mix Vale, 2026-10-20](https://www.mixvale.com.br/2026/10/20/banco-central-libera-pix-automatico-no-salario-e-pune-instituicoes/)
- A secondary site citing BCB data analysed by EBANX reports 177% average monthly growth in active users, and 64% of payers being new subscribers of digital platforms. This metric is not comparable with the receiver counts — [PIX Fácil](https://pixfacil.co/guia/pix-automatico-1-ano-balanco-2026-vale-a-pena). Low confidence.
- Since **2026-06-22**, when users link an account to **Pix por aproximação** (wallet) or to Open Finance automatic transfers, they can optionally consent to share **saldo e limite** in the same step — [Agência Brasil](https://agenciabrasil.ebc.com.br/radioagencia-nacional/economia/audio/2026-06/banco-central-da-mais-um-passo-na-integracao-entre-pix-e-open-finance)
- **IN WINDOW**: Pix por aproximação reportedly dropped the fixed R$500 per-transaction cap and now follows customer-set limits, including JSR (Jornada Sem Redirecionamento) payments. Single secondary source — [Mix Vale, 2026-10-01](https://www.mixvale.com.br/2026/10/01/pix-por-aproximacao-deixa-de-ter-teto-de-r-500-por-operacao/). Verify with BCB.

**Marketplaces and delivery**
- The Mercado Livre post-sale messaging API (`post_sale` tag) supports listing, reading, sending and attachments. Attachments not linked to a message within 48h are deleted — [ML Developers](https://developers.mercadolivre.com.br/pt_br/mensagens-post-venda)
- Since 2026-02-02, ML has gradually routed Brazil buyer-seller communication through **AI messaging agents**, starting with Full logistics. **Automated, repetitive or template messages are prohibited and can be sanctioned.** Secondary source — [Capturama](https://capturama.com.br/marketplaces/mercado-livre/mensagens-pos-venda/)
- Shopee: a developer issue says Shopee Open Platform does not expose chat to apps in Brazil (not official) — [GitHub issue](https://github.com/GustavoHMS21/GSeller/issues/52)
- iFood: I found nothing on a messaging API (gap).

**Kwai**
- Formats: in-feed, reserve (app-open) and takeover. Conversion buttons go to a site, app, e-commerce store or live. There is a native lead form, and a vendor claims competitive CPL in low-ticket niches. Kwai Creative Exchange (KCX) launched Feb 2026 (CONTEXT). Kwai Shop was at the E-commerce Brasil 2026 forum — [Divulga na Web](https://www.divulganaweb.com.br/redes-sociais-influenciadores/kwai-ads-como-anunciar-quanto-custa-2026/), [Meio & Mensagem](https://www.meioemensagem.com.br/midia/kwai-lanca-formato), [Nuvemshop](https://www.nuvemshop.com.br/blog/como-vender-no-kwai/). Low confidence; mostly vendor blogs.

**ChatGPT ads and Apps SDK**
- ChatGPT ads in Brazil:
  - Announced around 2026-05-08. The pilot reportedly went live on **2026-08-04**, making Brazil the 8th market.
  - Ads sit below the completed answer and are tied to the ChatGPT Go plan (R$39.99, reported).
  - Aug 2026 additions: **conversion-optimised bidding** (sales, sign-ups), a **carousel** of multiple products from one advertiser, and **product-feed campaigns** (up to 2M SKUs).
  - The Ad Tools Terms include a "Sponsored Agents" section.
  - Third-party trackers only — [Unite.AI](https://www.unite.ai/chatgpt-ads-arrive-in-brazil-as-openai-adds-conversion-tools-and-carousels/), [choice.marketing](https://www.choice.marketing/blog/chatgpt-ads-2026-field-guide/), [OpenAI, "Testing ads in ChatGPT"](https://openai.com/index/testing-ads-in-chatgpt/)
- Apps SDK and Instant Checkout in Brazil: no source found (gap).

**Push / in-app / Open Finance-triggered journeys**
- No dedicated in-window sources. The only one is the Open Finance saldo/limite consent change above, which enables balance-aware payment journeys.

### Inferences
- **RCS in Brazil** is the most "defensible and new" channel for the portfolio:
  - All three carriers now support iPhone (since Sep 2026).
  - It reaches 145M users.
  - Google is wiring it into Search, Ads, Maps and AI Mode.
  - Adoption is mostly large enterprise (about 1,000 brands), so SMB demos are still differentiating.
  - Realistic complex flow: Google Search **button/message-forward ad**, then a verified-brand RCS chat with carousel and suggested replies, then Pix copia-e-cola or a payment link, then a delivery-status rich card with SMS fallback.
- **Pix Automático** is early (14k receivers), but it is the clearest *retention* automation unique to Brazil:
  - Journey: authorisation once in the bank app, then automatic monthly debit with no new consent per charge.
  - Fits subscriptions, gyms, schools, SaaS and utilities.
  - Pair it with dunning across e-mail/RCS/WhatsApp.
- **Google AI Max** is the only "AI ads" layer actually live for Brazilian SMBs. AI Mode ads, UCP checkout and Business Agent remain US/English-first, so a portfolio demo of them should be labelled "em breve/EUA".
- **Mercado Livre** is moving to AI-mediated messaging and bans templated auto-messages, so the defensible marketplace automation is **API-driven order/stock/ads ops plus off-platform post-sale** (where allowed), not chat bots.
- **ChatGPT ads** in Brazil now support conversion bidding and a product carousel. The portfolio's existing ChatGPT ad demo could be upgraded to a carousel plus a conversion pixel.

### Gaps
- No independently sourced Brazil conversion or retention metrics for RCS, Apple Messages for Business, Pix Automático (beyond receiver counts) or Kwai.
- No in-window data on Google Ads lead form webhooks, GBP booking, TikTok Instant Messaging Ads or Search Ads in Brazil, LinkedIn Conversation Ads or InMail limits, BIMI/AMP, the iFood API, ChatGPT Apps SDK or Instant Checkout in Brazil, or push/in-app.
- RCS Message Ads GA status and pricing in Brazil are unconfirmed.
- The Claro iPhone RCS date (2026-09-17) has a single source.

## Q2. Which channels or automation layers are missing from the portfolio and worth adding, ranked

### Takeaway
Ranked by relevance to Brazilian SMBs × defensibility/technical barrier, the top gaps are:

1. RCS for Business with a Google Search entry
2. Pix Automático recurring billing with a dunning journey
3. A CRM/CAPI feedback loop (offline conversions)
4. E-mail lifecycle that meets Gmail/Yahoo rules
5. A multi-step AI agent with human handoff

Lower: Google AI Max, ChatGPT carousel, TikTok DM automation, Kwai, Mercado Livre ops, Apple Messages for Business (niche), and UCP/AI Mode (not in Brazil yet).

### Cited Findings
- RCS reach: 145M users, about 1k mostly large companies, Search/Ads/Maps/AI Mode integration — [Mobile Time](https://www.mobiletime.com.br/noticias/12/06/2026/rcs-145-mi-brasil/). All three carriers support iPhone — [Anti/Hype](https://antihype.com.br/c/software/rcs-claro-iphone-ios-27/)
- Pix Automático: 14k receivers, BCB expects growth, utilities joining — [Finsiders](https://finsidersbrasil.com.br/pagamentos/pix/bc-ve-maior-adocao-do-pix-automatico-nos-proximos-meses/)
- E-mail: permanent 550 rejections for non-compliant bulk senders — [Red Sift](https://redsift.com/guides/bulk-email-sender-requirements)
- AI agents in messaging require human handoff and AI labelling (Apple's precedent) — [TechCrunch](https://techcrunch.com/2026/06/04/apple-approves-poke-as-the-first-ai-agent-on-its-messages-for-business-platform/)
- The ML ban on templated messages reduces the value of a "marketplace bot" demo — [Capturama](https://capturama.com.br/marketplaces/mercado-livre/mensagens-pos-venda/)
- AI Mode ads and UCP are not available in Brazil — [Degrau](https://www.degraupublicidade.com.br/anuncios-no-modo-ia-do-google/), [ALM Corp](https://almcorp.com/blog/google-universal-commerce-protocol-ucp-explained/)

### Inferences
Ranking table (SMB relevance / defensibility = barrier for competitors to copy):

| # | Gap | SMB relevance (BR) | Defensibility / tech barrier | Status in BR |
|---|---|---|---|---|
| 1 | RCS for Business (verified sender, carousel, suggested replies, SMS fallback) plus Google Search entry (Message Ads button) | High (retail, services, clinics*) | High: brand verification, aggregator (Zenvia/Sinch/Infobip/Pontaltech), and few SMB agencies offer it | Live; ads in pilot |
| 2 | Pix Automático recurring billing plus retention/dunning | High (subscriptions, gyms, schools, SaaS, delivery clubs) | High: needs a PSP/bank API with Pix Automático (Jornadas 1–4) and webhooks | Live, early adoption |
| 3 | CRM + CAPI/offline-conversion loop (lead → sale → Meta CAPI / Google Enhanced Conversions / LinkedIn CAPI) | High for paid-traffic clients | Medium-high: server-side integration, data hygiene, LGPD | Live (sources not gathered in window — gap) |
| 4 | E-mail lifecycle (welcome, abandoned cart, win-back) with SPF/DKIM/DMARC/BIMI and one-click unsubscribe | Medium | Medium: deliverability know-how | Live |
| 5 | Multi-step AI agent (qualify → quote → book → pay → handoff), channel-agnostic | High | High | Live (WhatsApp covered elsewhere) |
| 6 | Google AI Max + lead form → webhook → CRM | Medium-high | Medium | Live (AI Max GA) |
| 7 | ChatGPT ads upgrade: product carousel + conversion optimisation | Medium (novelty) | Medium | Live pilot (Aug 2026) |
| 8 | TikTok Business Messaging auto-replies (VBA) + TikTok Shop | Medium (fashion, beauty) | Low-medium | Live |
| 9 | Kwai ads with native lead form | Medium (low-ticket, interior) | Low | Live |
| 10 | Mercado Livre API ops (stock, price, post-sale within rules) | Medium for sellers | Medium | Live, but templated messages banned |
| 11 | Apple Messages for Business | Low (iOS share, premium) | High | Uncertain onboarding |
| 12 | Google UCP agentic checkout / Business Agent / AI Mode ads | Future | High | Not in BR — "em breve" |

*Clinics: Apple does not accept primarily-health businesses on AMB. The RCS health policy was not checked.

### Gaps
- No sources were gathered on CAPI/Enhanced Conversions changes in the window (possibly covered by the Meta researcher).
- Market-share data for iOS vs Android in Brazil was not fetched.

## Q3. Concrete demo suggestions per gap (iPhone storyboard, fictitious brands)

### Takeaway
Six storyboards cover the top gaps with exact UI elements. Each one relies only on features documented above, and features not live in Brazil are labelled as such.

### Cited Findings (feature basis for each demo)
- RCS Search entry points (button, message-forward, MSL) and the planned Maps/AI Mode chat buttons — [Mobile Time](https://www.mobiletime.com.br/noticias/12/06/2026/rcs-145-mi-brasil/)
- Pix Automático authorisation-once and recurring model; contas-salário from 2027 — [Mix Vale](https://www.mixvale.com.br/2026/10/06/pix-automatico-em-contas-salario-comeca-a-valer-em-2027/)
- Pix por aproximação: the balance-sharing consent and the end of the R$500 cap — [Agência Brasil](https://agenciabrasil.ebc.com.br/radioagencia-nacional/economia/audio/2026-06/banco-central-da-mais-um-passo-na-integracao-entre-pix-e-open-finance), [Mix Vale](https://www.mixvale.com.br/2026/10/01/pix-por-aproximacao-deixa-de-ter-teto-de-r-500-por-operacao/)
- ChatGPT carousel and conversion optimisation — [Unite.AI](https://www.unite.ai/chatgpt-ads-arrive-in-brazil-as-openai-adds-conversion-tools-and-carousels/)
- AI agent label and human handoff norms — [TechCrunch](https://techcrunch.com/2026/06/04/apple-approves-poke-as-the-first-ai-agent-on-its-messages-for-business-platform/)
- Gmail one-click unsubscribe and authentication — [PowerDMARC](https://powerdmarc.com/bulk-email-sender-requirements/)

### Inferences (storyboards)
1. **RCS — "Ótica Lumen" (fictitious optician)**
   - The user searches "ótica perto de mim" on Google on an iPhone and sees a Message Ads **button "Conversar"**.
   - The native Messages app opens with a verified-brand header (logo plus check).
   - A rich card carousel of frames, each with "Ver" and "Provar em casa".
   - Suggested replies: "Agendar exame" / "Falar com atendente".
   - A date picker, then a confirmation card plus an "Adicionar ao calendário" suggested action.
   - The reminder on D-1 arrives as RCS, with SMS fallback shown in grey for non-RCS phones.
   - Tag the ad step "piloto Google no Brasil".
2. **Pix Automático — "Studio Ritmo" (fictitious gym)**
   - Sign-up on the site, then "Assinar com Pix Automático".
   - A bank-app screen titled "Autorizar Pix Automático" shows recebedor, valor fixo R$129,90, periodicidade mensal and a cap.
   - The user taps "Autorizar".
   - Monthly: a push notification "Seu Pix Automático de R$129,90 será debitado amanhã".
   - On failure (insufficient balance), a dunning sequence of RCS/e-mail/WhatsApp messages offers a Pix copia-e-cola.
   - Win-back on cancel, with a "Pausar 1 mês" offer.
   - Retention dashboard mock: MRR and churn.
3. **CRM + CAPI loop — "Imobiliária Vértice" (fictitious real estate agency)**
   - A Meta/LinkedIn/Google lead form arrives in the CRM, and a broker gets a push notification.
   - Pipeline stages: "Visita agendada" → "Proposta" → "Vendido".
   - Each stage fires a server event back to the ad platforms (CAPI / Enhanced Conversions / LinkedIn CAPI).
   - The campaign panel then shows "otimizando para vendas".
   - Visual: a split screen of the iPhone and an ad-platform graph.
4. **E-mail lifecycle — "Café Montanha" (fictitious coffee club)**
   - iOS Mail inbox with the brand logo shown (BIMI) and a "Cancelar inscrição" link at the top (one-click unsubscribe).
   - Sequence: welcome → day 3 recipe → abandoned cart with an "Item no carrinho" card → day 30 replenishment ("Seu café acaba em 5 dias").
   - Footnote: SPF/DKIM/DMARC badges.
5. **Multi-step AI agent — "Clínica Veterinária Patas" (fictitious vet clinic)**
   - The AI is labelled "Assistente virtual (IA)".
   - It triages symptoms, quotes a consult, books a slot, charges via Pix and hands off to a human ("Transferindo para Dra. Ana").
   - Shown on RCS or WhatsApp to show it works on any channel.
6. **ChatGPT ads upgrade — "Bike Sul" (fictitious bike shop)**
   - A ChatGPT answer about "melhor bike urbana até R$3 mil".
   - Below the answer: a **Sponsored carousel** of 3 SKUs from the feed.
   - Tap → product page → conversion event labelled "otimização por compras".

Lower priority:
7. **TikTok DM auto-reply — "Ateliê Flor"**: welcome message plus suggested questions plus keyword reply "PREÇO", leading to a TikTok Shop product card.
8. **Kwai lead form — "Crédito Fácil Norte"**: in-feed video with a native form and an instant WhatsApp/RCS follow-up.
9. **"Coming soon" card**: Google AI Mode with Business Agent and UCP checkout, labelled "disponível nos EUA".

### Gaps
- Exact current Apple and Google RCS UI strings (button labels like "Conversar") are illustrative and were not verified in Brazilian Portuguese.
- The Pix Automático bank UI labels vary by bank. Check the BCB Pix Automático manual for the standard field names (not fetched).
