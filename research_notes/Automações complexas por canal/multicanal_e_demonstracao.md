# Multichannel automation and orchestration (AI agents, CRM, MCP, agentic commerce) and how to demonstrate it on a portfolio, 2026-06-29 to 2026-10-27

Research date: 2026-10-27. About 20 searches and scrapes. Dates are publication dates of the cited page unless marked otherwise. Items before 2026-06-29 are marked **[context, pre-window]**.

---

## Q1. Which multichannel orchestration capabilities are most relevant and defensible for SMB and mid-market companies in Brazil in this window?

### Takeaway
For Brazilian SMB and mid-market companies, the defensible core is WhatsApp-first lead routing and qualification, handled by an AI agent with human handoff and synced to a CRM (RD Station, Kommo, HubSpot). Instagram and Messenger now sit on the same Meta agent layer. Closed-loop measurement is becoming important because WhatsApp AI replies now carry a per-token cost and ChatGPT Ads has become a paid channel in Brazil. Agentic checkout is not yet defensible for Brazil. The defensible commerce work is clean product feeds and measurement of AI-referred traffic.

### Cited Findings
- **Meta Business Agent** became globally available on 3 June 2026 **[context, pre-window]**. It covers WhatsApp, Messenger and Instagram. It answers in the customer's language, recommends products, books appointments, processes transactions and hands off to human agents. Pricing changes for agent replies took effect in August and October 2026. WhatsApp Business app users get the agent in premium subscriptions, while API users pay per token. (Omnichat blog, 2026-08-20) — [Omnichat](https://blog.omnichat.ai/meta-business-agent-platform-explained-features-pricing-and-what-the-2026-whatsapp-changes-mean-for-your-business/)
- Another source dates the **Meta Business Agent Platform** launch to 1 July 2026, with new AI charges on WhatsApp. This is secondary and I did not verify it against Meta's own pages. — [Zernio](https://zernio.com/blog/meta-business-agent-pricing)
- Meta's developer docs say an app can "step into a WhatsApp conversation the agent is handling, then hand it back when you are done." This is the official handoff pattern between Meta's agent and an external system. — [Meta for Developers](https://developers.facebook.com/documentation/meta-business-agent/capabilities)
- Meta's benchmark for 1,000 AI replies to users in **Brazil**, as reported by Wati (Aug 2026): about US$27 for a low-complexity service-message setup, about US$97 for higher-complexity third-party AI, and US$40–50 for Meta Business Agent. This is Wati's summary of Meta figures, and I did not see the primary Meta source. — [Wati](https://www.wati.io/en/blog/meta-whatsapp-ai-token-pricing/)
- Brazilian WhatsApp automation market (Administradores.com.br, 2026): **RD Station Conversas** uses the official API, costs R$989/month plus a credit wallet, includes AI agents in every plan with unlimited users, and has support in Portuguese. **Kommo** is a messenger-centric sales CRM billed per user in USD. **Weni** is a Brazilian AI-agent platform for WhatsApp aimed at retail and e-commerce. **SendPulse** offers in-chat payment buttons through Mercado Pago and PayPal. — [Administradores](https://www.administradores.com.br/noticias/melhores-ferramentas-de-automacao-de-marketing-para-whatsapp-no-brasil-em-2026)
- Brazilian agencies market "Kommo/Pipedrive/Ploomes/RD Station + an AI agent that answers on WhatsApp in seconds, qualifies, and works 24h, with text and audio". This shows that the commodity offer in Brazil is already the single-channel WhatsApp agent combined with a CRM. — [Instagram reel](https://www.instagram.com/reel/Dd7XxL2KT5c/); [Instagram post](https://www.instagram.com/p/De6vzr9lUPA/)
- **ChatGPT Ads launched in Brazil.** Meio & Mensagem reported on 2026-08-04 that Brazil was the 8th market. Ads appear only on the Free and Go plans. The pilot involves WPP and Publicis. Ads are shown only for questions with direct commercial intent and are clearly labelled. — [Meio & Mensagem](https://www.meioemensagem.com.br/midia/chatgpt-comeca-a-exibir-anuncios-aos-usuarios-do-brasil); also [E-Commerce Brasil](https://www.ecommercebrasil.com.br/artigos/chatgpt-ads-chega-ao-brasil-o-que-muda-para-o-e-commerce-e-para-o-trafego-pago)
- Agencies are told to instrument AI-referred traffic now: "Tag and segment AI-referred sessions today so that in six months you have a baseline." They are also told to fix product feeds first, because scraped price and stock data is what made Instant Checkout fail. (Crux Digits, 2026-08-18; written for Dutch merchants, but the reasoning is not market-specific.) — [Crux Digits](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/)
- Omnichannel versus multichannel, as vendors define it: omnichannel means one unified profile and one journey, "so an action in one channel changes what happens in the next – a cart abandoned on mobile suppresses the discount SMS once the customer buys through the email." — [Maestra](https://maestra.io/blog/comparisons/omnichannel-marketing-platforms-comparison)
- Measurement argument: single-channel attribution erases mid-funnel contribution, and incrementality or holdout lift is the causal measure. (Insider One, a vendor, 2026.) — [Insider One](https://insiderone.com/omnichannel-marketing-metrics/)

### Inferences
- The most defensible showcase for Brazil is a **WhatsApp and Instagram intake agent** with these parts:
  - (a) It qualifies and routes leads into a CRM (RD Station, Kommo or HubSpot).
  - (b) It hands off to a human using the official handoff pattern.
  - (c) It escalates to email or voice by rule.
  - (d) It reports conversions back to ad platforms (Meta CAPI, Google offline conversions, and ChatGPT Ads once measurement allows).
  - (e) It tracks AI-reply cost per conversation, since WhatsApp AI replies are now metered.
- Cost-awareness is a new differentiator. A demo can show the per-conversation cost of routing to Meta Business Agent versus a third-party LLM, using Meta's Brazil benchmarks.
- Agentic checkout (ACP/UCP/AP2) should be shown as "ready for" or as a design exercise, not as a live production capability for Brazil. See Q2.

### Gaps
- I found no Brazil-specific primary data on how widely Meta Business Agent has been adopted, or on its effect on conversion.
- I did not verify RD Station or Kommo product launches inside the window from their own changelogs. The RD Station Conversas details come from a third-party comparison.
- I did not verify Pix-based agentic payment (for example, Pix Automático combined with agents) in this window.

---

## Q2. Which tools and protocols shipped in the window? (date, source, status)

### Takeaway
The window is dominated by four things:
- ChatGPT Ads spreading to new markets, including Brazil.
- CRM vendors opening MCP servers and agent builders (HubSpot Fall Spotlight, Salesforce Dreamforce).
- n8n launching standalone "Agents".
- A new dated UCP spec cut.

OpenAI's Instant Checkout had already been **wound down in March 2026**. The ACP specification remains in maintenance, but the ChatGPT checkout product built on it was withdrawn.

### Cited Findings: Agentic commerce protocols
- **Instant Checkout (OpenAI) was wound down.** It launched in Sep 2025 with Shopify, Etsy and Walmart **[context]**. CNBC confirmed on 2026-03-20 that it had ended **[context, pre-window]**. Walmart said in-ChatGPT conversion was about one third of its own site. Shopify participation was about 30 merchants as of Feb 2026, according to Forrester. The stated cause was poor scraped product data. — [Crux Digits, 2026-08-18](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/), citing [CNBC](https://www.cnbc.com/2026/03/20/open-ai-agentic-shopping-etsy-shopify-walmart-amazon.html); also [Intellias](https://intellias.com/agentic-checkout/) ("OpenAI stopped offering Instant Checkout in March 2026… now pursuing product discovery… alongside merchants' own ChatGPT apps").
  - **Conflict:** a LinkedIn article claims that "Google's Universal Cart and OpenAI's Instant Checkout are live now". It is lower quality and undated, so treat it as unreliable. — [LinkedIn](https://www.linkedin.com/pulse/agentic-checkout-just-left-pilot-phase-heres-who-actually-live-2dyxc)
- **ACP (Agentic Commerce Protocol, OpenAI and Stripe)** is Apache-2.0 and maintained on GitHub with dated stable cuts. The 2026-04-17 cut covers cart, feed, orders, authentication and an MCP hook **[context, pre-window]**. Status: the spec is alive, and only the ChatGPT Instant Checkout deployment was withdrawn. — [Crux Digits](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/); [ACP GitHub](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol); [Pento](https://www.pento.ai/blog/acp-vs-ucp) (Instant Checkout charged a 4% fee and handled single items only)
- **UCP (Universal Commerce Protocol, Google and Shopify)** was announced on 2026-01-11 at NRF **[context]**, and the March 2026 update added Cart, Catalog and Identity Linking **[context]**. **A spec version dated 2026-08-25 is published (in window).** It covers payment handlers for Google Pay and Shop Pay and an AP2 mandate scenario for autonomous agents. — [ucp.dev 2026-08-25 spec](http://ucp.dev/2026-08-25/specification/overview/); [Google Developers UCP overview](https://developers.google.com/pay/api/universal-commerce-protocol/overview)
- **AP2 (Agent Payments Protocol, Google)** uses signed Checkout and Payment Mandates as verifiable credentials. It was contributed to the **FIDO Alliance on 2026-04-28** together with Mastercard Verifiable Intent **[context, pre-window]**. A Google Codelab (Next '26) shows ADK + UCP + AP2 working together. — [Crux Digits](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/); [FIDO](https://fidoalliance.org/fido-alliance-to-develop-standards-for-trusted-ai-agent-interactions/); [Google Codelab](https://codelabs.developers.google.com/next26/adk-agent-commerce)
- The Agentic AI Foundation (AAIF) explainer on UCP and AP2 lists a session at AGNTCon/MCPCon North America by Google Commerce. The date is not verified, though it is likely in window. — [AAIF](https://aaif.io/blog/how-does-agentic-commerce-work)
- **Adyen Agentic** (Feed, Cart, Payments) launched on 2026-06-16 **[context, just pre-window]**. It translates across UCP, AP2, ACP and Meta AI checkout. It had limited availability for US enterprise merchants at launch. — [Crux Digits](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/), citing [Adyen](https://www.adyen.com/press-and-media/adyen-agentic)

### Cited Findings: Ads in ChatGPT
- Timeline:
  - US launch in Feb 2026 and Canada in Apr 2026, per Parkour3 (secondary) **[context]**.
  - **Brazil: 2026-08-04**, the 8th market, per Meio & Mensagem.
  - **Europe: 2026-08-18**.
  - "Reimagining advertising with AI": **2026-09-16**.
  - **SE Asia and Taiwan: 2026-09-23**.
  - **26 new countries on 2026-10-21**, for a total of 89 countries, including 14 more Latin American countries. As of that date, more than 100,000 advertisers had used ChatGPT Ads, and ChatGPT had 1.2B weekly users.
  - Ads appear only on the Free and Go plans. Access is through partners or self-serve **Ads Manager**.
  - Sources: [OpenAI 2026-10-21](https://openai.com/index/chatgpt-ads-expands-26-new-countries/); [Meio & Mensagem 2026-08-04](https://www.meioemensagem.com.br/midia/chatgpt-comeca-a-exibir-anuncios-aos-usuarios-do-brasil); [Parkour3](https://www.parkour3.com/en/blog/chatgpt-ads-what-you-need-to-know-before-launching-your-campaign)
- OpenAI also announced a new visual ad format and expanded measurement partnerships. The date was not captured, but it is likely in window. — [OpenAI](https://openai.com/index/new-chatgpt-ads-format-and-measurement/)
- AdExchanger reports that ChatGPT Ads reached a US$1B run rate. The date was not captured. — [AdExchanger](https://www.adexchanger.com/ai/chatgpt-ads-hit-a-1-billion-run-rate-heres-what-advertisers-say-will-get-them-to-spend-more/)
- Amazon is piloting ChatGPT Ads buying through Amazon DSP as a managed service. The date was not captured. — [Marketing Dive](https://www.marketingdive.com/news/amazon-pilots-ad-services-in-chatgpt-what-marketers-need-to-know/829945/)
- Parkour3 says ChatGPT Ads can be managed from inside HubSpot. This is a secondary claim and I did not verify it. — [Parkour3](https://www.parkour3.com/en/blog/chatgpt-ads-what-you-need-to-know-before-launching-your-campaign)

### Cited Findings: CRM agents and MCP
- **HubSpot Fall 2026 Spotlight ("UNBOUND 2026")** happened on about **2026-09-16** and shipped 134 updates:
  - a rebuilt Breeze Assistant that orchestrates agents
  - a self-updating Smart CRM
  - Agent Builder
  - a marketing-focused Agent Hub with four new agents, including a Campaign agent
  - Revenue Agent
  - an expanded **MCP server** with read and write access across landing pages, campaigns, quotes, custom objects, workflows and more
  - developers can add an `mcp-server` component to an app to expose their own remote MCP tools inside HubSpot Agents
  - Sources: [HubSpot dev changelog](https://developers.hubspot.com/changelog/fall-2026-spotlight); [Vantage Point](https://vantagepoint.io/blog/hs/hubspot-unbound-2026-everything-announced); [Orchestra guide](https://www.getorchestra.io/guides/ai-agent-business) (date 2026-09-16); [LinkedIn summary](https://www.linkedin.com/posts/remingtonbegg_unbound26-activity-7506195885517828096-taSF)
  - SaaStr reports that HubSpot's price increases fall mainly on its own agents (Breeze credits, per-resolution pricing), while "their MCP server is still free for the agents you bring." — [SaaStr](https://www.saastr.com/almost-every-pre-ai-vendor-we-use-is-raising-prices-for-agent-access-they-may-be-building-an-agentic-death-spiral/)
- **Salesforce Dreamforce 2026**, blog dated **2026-09-28**, announced:
  - **AIforce**, which gives AI models access to Salesforce data and permissions across platforms
  - Agentforce Coworker
  - job-ready agents for sales and service
  - **long-horizon agents**
  - a CRM reasoning model, "Koa"
  - AI Skills
  - **multi-agent orchestration**
  - an Engagement Agent
  - Agibank, a Brazilian bank, was cited as an Agentforce service customer
  - The GA or beta status of each item was not captured.
  - Sources: [Salesforce blog](https://www.salesforce.com/blog/dreamforce-2026-announcements/); [Salesforce+](https://www.salesforce.com/plus/experience/dreamforce_2026/series/dreamforce_2026_must-see_moments/episode/episode-s1e2); [Reddit recap](https://www.reddit.com/r/salesforce/comments/1whd58b/dreamforce_2026_day_1_quick_recap_of_main_keynote/)
  - An Instagram source says Salesforce "now scores every MCP server" in its partner program. Low confidence. — [Instagram](https://www.instagram.com/reel/DewzJ3rCMWi/)
- Parloa, a competitor, mentions a "pending Salesforce acquisition" of Intercom/Fin. **Unverified and possibly wrong. Do not use without a primary source.** — [Parloa](https://www.parloa.com/knowledge-hub/decagon-alternatives/)

### Cited Findings: Automation platforms
- **n8n Agents** ("agents you set up once and use anywhere"):
  - Announced in the community on 2026-08-05 with a phased rollout.
  - Formal changelog release on **2026-09-21 in n8n 2.40**. The legacy AI Agent node keeps working.
  - Also: n8n Assistant on self-hosted n8n (2026-08-18, v2.35); AI models and tools with no provider credentials, through Gateway credits (2026-09-02, v2.36).
  - Recent releases (2.41–2.44) added:
    - an agent **trace view**
    - human-in-the-loop (HITL) approvals for Slack and Telegram (v2.35)
    - background sub-agent approvals escalated to parent chats
    - MCP servers, sub-agents, skills, channels and schedules as agent configuration
    - instance-level MCP with callback URL allow-lists
    - Browser Use for all users (v2.43)
    - policy-locked model providers
  - Sources: [n8n changelog](https://docs.n8n.io/changelog); [n8n release notes](https://docs.n8n.io/changelog/release-notes); [n8n community post](https://community.n8n.io/t/introducing-n8n-agents-a-new-way-to-build-agents-you-set-up-once-and-use-anywhere/306323?tl=en); [Releasebot](https://releasebot.io/updates/n8n)
- Zapier, Make, Clay, RD Station and Kommo: **I found no primary in-window launch posts** in this pass. See Gaps.

### Inferences
- The protocol layer has split into three parts. UCP covers the session, ACP the purchase API, and AP2 the authorization signature. The products built on them have retreated toward discovery and ads. For a portfolio in Oct 2026, "agentic commerce" is best shown as discovery, feed quality and handoff to the merchant's checkout, with UCP's `requires_escalation`/`continue_url` as the honest end state. A fully autonomous purchase should not be the headline.
- Converging on MCP is the strongest cross-vendor signal: HubSpot's MCP server and MCP components, Salesforce AIforce, n8n's instance-level MCP, and ACP's MCP hook. An "agent that operates the CRM through MCP" is a credible and current demo theme.

### Gaps
- Exact GA dates for individual Dreamforce items, and whether they are available in Brazil.
- In-window launches from Zapier (Agents/MCP), Make (AI Agents), Clay and Kommo: not verified.
- The date of OpenAI's "new ChatGPT ads format and measurement" post, and whether conversion APIs or closed-loop measurement exist for ChatGPT Ads in Brazil.
- Google AI Mode ads and agentic checkout status in Brazil: not researched in this pass.

---

## Q3. What evidence exists on conversion or retention lift from omnichannel orchestration versus single-channel automation, with priority on Brazil?

### Takeaway
The evidence is weak and almost entirely vendor-sourced. I found no independent, in-window, Brazil-specific study that quantifies omnichannel lift over single-channel automation. The strongest relevant hard data point is negative: agentic checkout inside ChatGPT converted at about a third of the retailer's own site.

### Cited Findings
- Braze, a vendor, says coordinated in-product and out-of-product channels "significantly outperform" single-channel on retention, engagement and ROI. In its Floward case, WhatsApp produced the highest revenue and conversion of any channel. No controlled number was given. — [Braze](https://www.braze.com/resources/articles/multichannel-marketing)
- SaleCycle, a vendor, repeats the widely circulated claim of "89% vs 33%" customer retention for strong omnichannel versus disconnected approaches. It is an old, uncited statistic and **should be treated as unreliable**. SaleCycle also cites NA-KD: +25% customer lifetime value (CLV) and 72× ROI within 12 months using a CDP and omnichannel journeys. This is a vendor case. — [SaleCycle](https://www.salecycle.com/blog/omnichannel-marketing-strategy-platforms)
- Sortment cites "73% of consumers use multiple channels" through a stats aggregator (wifitalents). This is low quality. — [Sortment](https://sortment.com/blogs/omnichannel-marketing-tools)
- Insider One (Sep 2026) argues that only holdout or incrementality tests measure the causal lift of journeys. It is a vendor, but the methodology point is sound. — [Insider One](https://insiderone.com/omnichannel-marketing-metrics/)
- Negative evidence: Walmart's in-ChatGPT checkout conversion was about one third of its site. A Semrush US survey found 22% of consumers had bought inside an AI tool, while 50% had bought after researching with one. — [Crux Digits](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/)
- AI support resolution claims are vendor-defined and not comparable. Fin claims a 76% average across 12,000+ customers. Sierra's customers cite 70–90% in specific deployments. Decagon publishes no aggregate figure. — [Fin](https://fin.ai/learn/sierra-vs-decagon-vs-ada); [Drag](https://www.dragapp.com/blog/ai-support-agents-compared/)

### Inferences
- A portfolio should not claim generic omnichannel lift percentages. The honest approach is to show how lift would be measured, with holdout groups, incrementality tests and conversions sent back to the ad platforms, and to label any numbers as illustrative.

### Gaps
- No Brazilian benchmark was found in Mobile Time, E-Commerce Brasil or ABComm on WhatsApp-plus-email orchestration lift in the window. A dedicated search of Mobile Time and Opinion Box ("Panorama Mobile Time/Opinion Box: Mensageria") is needed.
- No academic or independent RCT evidence was found in the window.

---

## Q4. How do leading vendors and studios visually demonstrate complex automations, and what makes a demo credible without real client data?

### Takeaway
The leading AI-agent vendors have converged on four artifacts:
- **simulation and testing suites** with synthetic personas
- **trace or reasoning-path views**
- **versioning and A/B testing**
- **always-on QA monitors**

These artifacts turn "watch the agent decide" into something you can inspect. Automation platforms such as n8n show trace views and human-in-the-loop approval cards. Credibility comes from showing the mechanism, the failure paths and the guardrails, not from logos or large percentages.

### Cited Findings
- **Decagon** markets:
  - Git-based versioning, scheduled simulations, and live A/B testing with custom traffic routing
  - granular intent tagging and **full reasoning-path tracing**
  - "Watchtower", which reviews every conversation against custom criteria in real time
  - Sources: [Decagon vs Sierra](https://decagon.ai/vs/sierra)
  - Parloa describes Decagon's "Agent Operating Procedures (AOPs)" and "**Trace View** reasoning visibility" as the way CX teams configure and audit agents. — [Parloa](https://www.parloa.com/knowledge-hub/decagon-alternatives/)
- Decagon also offers end-to-end simulated conversations with **AI-generated mock customer personas**. — [Fin comparison page](https://fin.ai/learn/sierra-vs-decagon-vs-ada)
- **Intercom Fin** offers **Simulations** for testing Procedures before launch, and **batch testing** that can simulate different users. — [Fin testing](https://fin.ai/testing) via [Fin comparison](https://fin.ai/learn/sierra-vs-decagon-vs-ada); [Intercom Help: Batch test Fin](https://www.intercom.com/help/en/articles/10521711-batch-test-fin-ai-agent)
- **Sierra** has a comparable suite of versioning, simulations and A/B experimentation, as described by Decagon. — [Decagon vs Sierra](https://decagon.ai/vs/sierra)
- Comparison sites stress that "published results" are each vendor's own claim with its own definition of resolution. This is a credibility pitfall to avoid. — [Drag](https://www.dragapp.com/blog/ai-support-agents-compared/); [Fin](https://fin.ai/learn/sierra-vs-decagon-vs-ada)
- **n8n** agent builder UI patterns (2026):
  - an agent instructions and **trace view** (#39104)
  - a "Test agent" preview with queued messages
  - approval cards (Deny / Ask for edits / Approve) for plan review
  - HITL approvals in Slack and Telegram
  - a "Finish setup" checklist
  - These are the visual primitives an agency can mimic in a demo. — [n8n release notes](https://docs.n8n.io/changelog/release-notes); [Releasebot](https://releasebot.io/updates/n8n)
- The **Google Codelab** demonstrates agentic commerce with a fictitious "CineAgent" booking agent and sample merchant JSON in a TEST environment. Vendors themselves use fictitious brands plus visible protocol payloads as credible demos. — [Google Codelab](https://codelabs.developers.google.com/next26/adk-agent-commerce); [ucp.dev spec examples use "Example Merchant"](http://ucp.dev/2026-08-25/specification/overview/)
- **Salesforce Dreamforce 2026** keynote demos (for example, "Agentforce Inbound Pipeline & Operations Agents Demo") follow a scripted live-demo format. — [YouTube keynote](https://www.youtube.com/watch?v=wYFt9NCYaVI)
- Crux Digits, an agency, sells "a clickable MVP by the second call". This shows agencies positioning working prototypes as proof. — [Crux Digits](https://cruxdigits.nl/blog/agentic-commerce-protocols-ucp-acp-ap2/)

### Inferences
Patterns that make a portfolio demo defensible without client data:
1. A **live sandbox** with a fictitious brand that the visitor can message, for example a WhatsApp test number or a web chat. It shows the real tool calls.
2. An **event log or trace panel** next to the chat. It shows the classified intent, the CRM lookup or upsert through MCP, the routing rule fired, the handoff, and the conversion event sent to Meta CAPI. Each step carries a timestamp, latency and cost.
3. An **architecture diagram** of the channels, orchestrator (n8n or a custom layer), CRM, CDP or profile store, and ad-platform feedback.
4. **Simulation results**, such as N synthetic personas run through the flow, with pass, fail and escalation rates. This mirrors Decagon and Fin practice and is more honest than invented ROI.
5. **Before/after** numbers framed as process metrics you can measure in the sandbox (time to first response, steps automated, handoff rate), not business lift.
6. **Visible failure paths and guardrails**: refusal, escalation to a human, approval gates, and UCP-style `requires_escalation` handoff for checkout.

### Gaps
- I did not directly review the portfolio pages of Zapier, Clay or Vercel v0 showcases, or Cannes Lions 2026 Creative Commerce or CX case pages, within the tool budget. Agency-specific practice beyond vendors needs a follow-up search.
- Sierra's own demo pages were not scraped. Its description comes from a competitor (Decagon).

---

## Q5. Which honest-disclosure norms apply to simulated demos (illustrative data, fictitious brands)?

### Takeaway
The firm baseline is the US FTC Endorsement Guides (16 CFR 255, revised 2023):
- dramatizations and actors must not be passed off as real customers
- disclosures must be "clear and conspicuous" (unavoidable, and visible on mobile)
- "results not typical" disclaimers do not cure atypical results claims

In practice this means any simulated demo should be labelled **prominently and close to the claim** as using simulated data and a fictitious brand. Any metric should be either measured, with its method stated, or explicitly marked illustrative. Brazilian CONAR and CDC (consumer code) rules were not verified in this pass.

### Cited Findings
- "Clear and conspicuous" means difficult to miss and easily understandable. A disclosure in both visual and audio form is more likely to qualify. A disclosure hidden behind a "more" link, or one that works on desktop but not on a smartphone, is not clear and conspicuous. — [Federal Register, 16 CFR 255, 2023-07-26](https://www.federalregister.gov/documents/2023/07/26/2023-14795/guides-concerning-the-use-of-endorsements-and-testimonials-in-advertising) **[context, pre-window but in force]**
- An "obviously fictional dramatization" is not an endorsement. If actors are used where viewers may think they are real customers (the "hidden camera" example), that must be disclosed clearly. — [Federal Register](https://www.federalregister.gov/documents/2023/07/26/2023-14795/guides-concerning-the-use-of-endorsements-and-testimonials-in-advertising)
- Statements like "Results not typical" or "Individual results may vary" do not change the impression that the shown results are typical. The advertiser must disclose generally expected results and have substantiation for them. — [FTC FAQ](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking); [Hinch Newman via JD Supra](https://www.jdsupra.com/legalnews/ftc-updates-endorsement-guides-and-faq-7369826/)
- Using images or likenesses that misrepresent the endorser or the result (stock photos standing in for real outcomes) is deceptive. — [Federal Register §255.1(g)](https://www.federalregister.gov/documents/2023/07/26/2023-14795/guides-concerning-the-use-of-endorsements-and-testimonials-in-advertising)
- Fake reviews and testimonials are endorsements and are deceptive. — [Federal Register](https://www.federalregister.gov/documents/2023/07/26/2023-14795/guides-concerning-the-use-of-endorsements-and-testimonials-in-advertising)
- OpenAI's ad principles require that ads are "clearly labeled and separate from ChatGPT's answers", and Meio & Mensagem describes this as "independência de resposta". This is a platform-level norm relevant to any ChatGPT Ads demo. — [OpenAI](https://openai.com/index/chatgpt-ads-expands-26-new-countries/); [Meio & Mensagem](https://www.meioemensagem.com.br/midia/chatgpt-comeca-a-exibir-anuncios-aos-usuarios-do-brasil)
- Vendor protocol documentation itself uses obviously fictitious names ("Example Merchant", "CineAgent") and TEST environments. — [ucp.dev](http://ucp.dev/2026-08-25/specification/overview/); [Google Codelab](https://codelabs.developers.google.com/next26/adk-agent-commerce)

### Inferences
Disclosure checklist for a portfolio demo:
- Put a persistent "Demo: fictitious brand, simulated data" badge in the demo frame. It should be visible on mobile and not hidden in a footer.
- Mark every number as either "measured in sandbox (method: X, n=Y, date)" or "illustrative".
- Never show real or lookalike client logos.
- Never present synthetic chats as real customer testimonials.
- Avoid names that resemble real brands, to steer clear of impersonation.

### Gaps
- Brazilian rules were not verified in this pass. This includes the CONAR Código Brasileiro de Autorregulamentação Publicitária (articles on testimonials and "apresentação verdadeira"), the CDC art. 37 (misleading advertising), and any 2026 CONAR guidance on AI-generated content. These should be checked before publishing in Brazil.
- No industry standard specific to "simulated AI demo" disclosure was found.
