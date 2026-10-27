# WhatsApp / WhatsApp Business Platform: advanced automation (window 2026-06-29 to 2026-10-27)

Research date: 2026-10-27. Primary source is Meta's developer changelog (https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog) and pricing page (https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing, "Updated: Sep 30, 2026"). Items dated before 2026-06-29 are labelled **[CONTEXT]**.

## Q1. What did Meta ship or announce for the WhatsApp Business Platform in this window?

### Takeaway
The window was dominated by four structural changes: (1) **Meta Business Agent** became a fifth, token-billed message category and arrived with a new **Conversation Routing / thread control** layer for AI-to-human and partner-to-partner handoff; (2) **service messages and in-window utility messages became paid on 2026-10-01**, while the CTWA **free entry point (FEP) window was extended from 72h to up to 7 days**; (3) Brazil payments gained **Pix "APPSWITCH" redirect** and **one-click card payment (`offsite_card_pay`)**, plus BRL billing; (4) **usernames/BSUID** went live, which breaks phone-number-keyed integrations. Calling API matured (recording, transcription, voicemail GA, SIP hardening), and the Marketing Messages API **max price** feature entered open beta.

### Cited Findings

**Meta Business Agent (AI agent) and Conversation Routing**
- [CONTEXT] 2026-06-03, Conversations 2026 (London): Meta announced "Meta Business Agent" and the "Meta Business Agent Platform" (enterprise agentic platform that connects to "hundreds of systems like Shopify and Zendesk"). Stated capabilities: answering questions, product recommendations from the catalog, "Books appointments and qualifies incoming leads", "Closes sales", and letting the business "decide when a team member steps in". "More than one million businesses are already using a Meta Business Agent on WhatsApp and Messenger." Getting started is free, with paid subscriptions "in the coming months". — [WhatsApp Business blog](https://whatsappbusiness.com/blog/introducing-meta-business-agent-ai/); [TechCrunch, 2026-06-03](https://techcrunch.com/2026/06/03/metas-ai-agent-for-whatsapp-business-is-now-available-globally/)
- Pricing page: "Meta has 5 different message categories on the WhatsApp Business Platform, with the introduction of Meta Business Agent as of July 1, 2026." Non-template messages are now either **Service** ("powered by a 3rd-party AI solution or people") or **Meta Business Agent** ("powered by the Meta Business Agent Platform"). — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- Meta Business Agent billing: "One global rate of $2.00 USD per 1 million (M) tokens. One message typically consumes 20,000–25,000 tokens… approximately 4–5 cents (USD) per message". No free tier, and it **remains charged inside the FEP window**. Meta's own Brazil comparison estimates ~$968 per 10k messages for a third-party high-complexity AI plus service delivery (0.68¢ per message delivery in Brazil) versus ~$400–500 for Meta Business Agent. — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- Date conflict: Meta's pricing page says the category was introduced on July 1, 2026. Third parties say token billing started **August 1, 2026**. — [Messangi](https://www.messangi.com/whatsapp-business-whatsapp-business-pricing-updates-2026/); [Invent citing TechCrunch](https://www.useinvent.com/blog/meta-business-agent-what-it-is-and-the-alternative-you-own)
- 2026-08-04: Meta added **Standby Webhooks**, so an app can "passively observe conversation activity — standby inbound messages, message echoes, and status receipts — when Meta Business Agent is the active handler". — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- 2026-09-23: Meta published the **Conversation Routing** docs ("controls how inbound messages are routed to partners when more than one partner shares a WhatsApp account"). They cover thread lifecycle, standby partners, **Thread control** ("transfer, release, and take thread ownership") and **Conversation context**, described as "the AI-generated conversation summary delivered on handover and incoming message webhooks". — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- 2026-09-25 / 09-30 / 10-08 / 10-12: `pass`/`release`/`take` now return a `request_id`. Meta added a guide on preparing integrations "before enabling Meta Business Agent", added error **131070** (a non-owner app sends a Service message), and added a Routing Roles API (`GET /<PHONE_NUMBER_ID>/routing_roles`). Thread control requires acceptance of the "Meta Business Agents and Platform Terms of Service". — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

**Pricing (GA, effective dates)**
- Effective **2026-10-01**: "Meta resumed charging… Service messages, which became free as of Nov. 1, 2024" and "Utility messages sent in response to users (thus in an open customer service window)". The webhook `pricing.type` changes from `free_customer_service` to `regular`. Meta added a free tier of **1,000 service messages per business phone number per month**, with no roll-over. Without a payment method, service messages stop after the free tier. — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- Reactions are the only service message type that stays free for all businesses. Governments and non-profits keep free service messages through 2027-12-31 (field `service_pricing_policy`, added 2026-10-30 per changelog). — [Changelog, 2026-09-29](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- 2026-09-28: "a free entry point (FEP) window may now remain open for up to 7 days, rather than 72 hours, for conversations started from an ad that clicks to WhatsApp". It applies only when the user is on the Android or iOS app (not desktop or web). In the FEP window, marketing, utility, authentication and service messages are free. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog); [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing). Some BSP material still says 72h, which is now outdated: [Zenvia](https://zenvia.com/en/new-whatsapp-business-pricing-rules-for-2026/)
- Brazil list rates (USD, from 2026-10-01): marketing $0.0625, utility, authentication and service $0.0068 each. — [SleekFlow table](https://sleekflow.io/en-us/blog/whatsapp-business-price); [Kemeny Studio](https://kemenystudio.com/whatsapp-service-message-pricing). BRL equivalents per a BSP: marketing R$0.3217; utility, authentication and service R$0.0350. Utility and authentication get volume tiers of -5% to -25%. — [ChatMaxima](https://chatmaxima.com/whatsapp-api-pricing/brazil/) (third-party; verify against Meta's BRL CSV)
- **BRL billing**: rollout began 2026-07-01, and "As of July 16, 2026, all eligible Solution Providers and directly-integrated businesses can create new Messaging accounts in BRL". Invoicing is by Facebook Brasil. Migration is mandatory **by 2027-06-30**, after which non-BRL accounts of eligible customers stop delivering. Currency Migration API available. — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)

**Marketing Messages API for WhatsApp (formerly "Marketing Messages Lite API")**
- [CONTEXT] Renamed and GA on 2025-11-19. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Max price** (bid per marketing message):
  - Limited Beta began 2026-05-15 [CONTEXT].
  - Jul 17: "duplicate an approved marketing template… at a different max price" without re-review (`source_template_id`).
  - Jul 31: per-country multipliers (`bid_country_multiplier_overrides`). The cap was raised to 240 countries on Oct 19.
  - Aug 31: templates can switch between rate-card and max-price pricing.
  - Sep 11: guidance on `bid_amount` per 1,000 deliveries plus a `per_message_bid_multiplier` below 1.
  - Oct 1: **Open Beta**.
  - Oct 7: WhatsApp Manager UI in open beta.
  - Oct 15: max price billing SKU on the Nov 1 invoice.
  - Error 131065 is returned where max price delivery is unavailable.
  - Source: [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- 2026-09-23: `landing_page_view` webhook fires when a link in a marketing message opens a landing page in the WhatsApp In-App Browser. 2026-09-24: guidance on routing templates between the Cloud API and MM API endpoints. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

**Payments in Brazil (Pix, order_details / order_status)**
- Flow: the business sends an interactive `order_details` message. The buyer pays by Pix (copies the code, or WhatsApp opens the bank app) or by a payment link. The business confirms payment and sends `order_status`. — [Payments API – Brazil](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/overview)
- 2026-09-10: `payment_settings.type` options are `pix_dynamic_code`, `payment_link`, `boleto` and `offsite_card_pay` (one-click payment). 2026-10-05: Payment request CTA templates for Brazil add one-click payment plus `currency` and `total_amount` fields (required for one-click, optional for Pix). — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **2026-10-16: "Pix with redirect"**. Set `flow_type: "APPSWITCH"` inside `pix_dynamic_code` and "the buyer picks their bank inside WhatsApp and authorizes the payment in the bank app". `COPYPASTE` or an absent field keeps the old experience. "you continue to confirm the payment and send the `order_status` message". — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog); [Offsite Pix docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/payments/payments-br/offsite-pix/)
- [CONTEXT] Mexico payments docs were added 2026-05-12, so the Brazil model is being generalized as a "Global Payments API". — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

**Business Calling API**
- Availability: user-initiated calling works wherever Cloud API is available. Business-initiated calling works everywhere except the US, Canada, Egypt, Vietnam and Nigeria, so it is **available in Brazil** by exclusion. Production call permission requests are limited to **1 per day and 2 per week**. Permission gets a reconsider prompt after 2 consecutive unanswered calls and is auto-revoked after 4. Signaling options are Graph API + webhooks or SIP over TLS. Media is WebRTC (ICE+DTLS+SRTP) or SDES SRTP, with the OPUS codec. Video and screen share are "planned". — [Cloud API Calling](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling)
- [CONTEXT] Voicemail GA on 2026-06-25. SIP call webhooks added 2026-06-26. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- 2026-06-30: **Call recording** and **Call transcription** guides published (work on business- and user-initiated calls, with a required customer announcement). Aug 31: known issue where a network change truncates recordings. Sep 22 and Oct 9: SIP mTLS clarifications and a required IP allowlist. Oct 5: the "Incoming Call" entry point was renamed to "Call" in Conversation Routing, and only the Call primary can accept or initiate calls. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Twilio lists Brazil connectivity at $0.00/min inbound and $0.0108/min outbound (Meta fee). — [Twilio pricing](https://www.twilio.com/en-us/whatsapp/pricing)

**Usernames / BSUID**
- 2026-06-29: businesses can reserve and adopt a **business username**. Sending to a BSUID is supported "starting July 2026". The **`REQUEST_CONTACT_INFO`** button (label not customizable) arrived in early July 2026. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- BSUIDs have appeared in webhooks since April 2026. When a user adopts a username, webhooks carry the username and BSUID but may omit the phone number. — [BSUID docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/); [Twilio changelog](https://www.twilio.com/en-us/changelog/whatsapp-usernames--new-business-scoped-user-id--bsuid--field-re)
- August 2026 changes: `user_changed_user_id` system webhook (Aug 11); `user_id` and `parent_user_id` on `user_preferences` (Aug 17); **contact book** GET and DELETE endpoints (Aug 24–25). Sep 15: `business_username_updates` gained `context: revoked`. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

**Account model, Direct Send, Groups, other**
- New account model: the WABA splits into a "WhatsApp account (WAAC)" and a "Messaging account" (documented Aug 4). Phase 1 GA rollout started 2026-09-23 and reaches all businesses "by mid-October 2026". `messaging_account_id` is needed when a token can reach more than one Messaging account. Phone number migration is not supported on the new model. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Direct Send**:
  - Jul 30: utility message with a "Call on WhatsApp (voice call) button".
  - Jul 31: utility messaging **GA**. Authentication remains beta.
  - Oct 8: portfolios with a 100k or unlimited messaging limit are eligible.
  - Oct 14: interactive OTP without a pre-created template.
  - Oct 15: pacing.
  - Source: [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog). Precise semantics were not researched further; see the Gaps section.
- Groups API: [CONTEXT] introduced before the window. 2026-09-10: Groups API pricing updated for the Oct 1 changes; 1:1 and group sends share the 1,000 free service-message allowance per [ChatMaxima](https://chatmaxima.com/whatsapp-api-pricing/brazil/). 2026-10-15: mark group messages as read individually. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- 2026-07-03: the **In-App Signup API is NOT available in Brazil** (also excluded: EEA, UK, Japan, South Korea, Nigeria, South Africa, Turkey). — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Coexistence (WhatsApp Business app plus Cloud API on the same number): Aug 19 beta "WhatsApp Business app login" onboarding. Oct 20: **Embedded Signup v5**, with Business app onboarding on by default. Oct 15: Embedded Signup v2 and v3 deprecated. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Flows: [CONTEXT] **Data API 4.0** (Nov 2025) added platform-side signature verification and an optional "Flow Token Signature" for endpoint requests. Flow JSON 6.x and 7.0 added CalendarPicker, NavigationList, ChipsSelector, Image Carousel, `update_data` action and nested expressions. Flows can be sent alongside other template buttons. No major Flows release was found inside the window. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- [CONTEXT] CTWA **Welcome Message Sequences** and the `ctwa_clid` field in the `referral` object of the messages webhook. — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

### Inferences
- The most "new and defensible" demo in this window combines four things: an AI agent with **Conversation Routing thread control** (AI-to-human handoff carrying an AI summary), **7-day FEP-aware cost logic**, **Pix APPSWITCH + order_status**, and **BSUID-first identity**. Most portfolios and many BSPs have not implemented these yet; all of them are documented between July and October 2026.
- Since 2026-10-01 every reply costs money in Brazil (after 1,000 per month per number), except inside the FEP window. This makes CTWA entry and per-message cost-awareness a real engineering concern rather than a footnote.

### Gaps
- Meta Business Agent: there is no explicit confirmation that the Business Agent Platform (API-level, enterprise) is generally available for Brazilian WABAs, nor of its exact UI labels in Portuguese. A Brazilian SMB testimonial (Miss Bonita Lingerie) appears on the [product page](https://whatsappbusiness.com/products/business-app-ai-agent/), which suggests app-level availability in Brazil.
- The exact Oct 2026 marketing rate change for Brazil was not confirmed from Meta's CSV. Third-party tables show $0.0625.
- Whether max price (MM API) is available for Brazil recipients was not verified (error 131065 exists for unsupported countries).
- Status ads, Channels and promoted channels: no developer-platform changes were found in the changelog for the window. Not researched further.

## Q2. Which advanced automation patterns are the highest-impact?

### Takeaway
Meta's own docs and success stories describe the same end-to-end pattern: **CTWA ad → (FEP window opens) → AI agent qualifies → Flow/catalog/carousel for selection or booking → order_details with Pix → order_status updates → CAPI events (`LeadSubmitted`, `Purchase`) back to Ads → human handoff via thread control / calling**. Abandoned-cart reminders are explicitly modelled by Meta as marketing templates.

### Cited Findings
- Magalu ("Lu's Brain", 2025-10-21 to 12-03) is the canonical Brazilian reference:
  - Journey: marketing messages as the entry point, then an AI shopping agent (text, image and voice search), card carousels, WhatsApp Flows product pages (images, installments, reviews from the catalog), then payments on WhatsApp with Pix, then real-time shipping updates.
  - Results: "3X higher conversion rate than Magalu's app and ecommerce site", "85-point NPS", "75% of payments were made using the integrated Pix copy-and-paste feature".
  - Source: [WhatsApp success story: Magalu](https://whatsappbusiness.com/resources/success-stories/magalu/)
- Meta's pricing example models the sequence explicitly: a cart-abandonment reminder (Marketing) leads to Meta Business Agent answers, then "Meta Business Agent hands off to customer service representative" (Service), then an order confirmation (Utility). Started from CTWA, 3 of those 5 messages would be free. — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- CAPI for Business Messaging: send events with `action_source: "business_messaging"`, `messaging_channel: "whatsapp"`, and `ctwa_clid` taken from the webhook `referral` object. Supported events include `Purchase`, `LeadSubmitted` and `OrderDelivered`. A fallback matches on hashed `em`/`ph` plus `page_id`. Doc updated 2026-09-28. — [Meta CAPI for Business Messaging](https://developers.facebook.com/documentation/ads-commerce/conversions-api/business-messaging); AWS notes "Meta validates this value; it cannot be fabricated" — [AWS docs](https://docs.aws.amazon.com/social-messaging/latest/userguide/conversions-api.html)
- Banco Mercantil (Brazil) used CTWA for acquisition, then Platform automation of onboarding ("Mel" assistant), marketing messages "to retarget leads and share abandoned cart reminders", and utility messages for loan status. — [Meta success story](https://www.facebook.com/business/success/banco-mercantil-bm-success-story)
- Calling as handoff: SICAR (LatAm) ran chat → call permission → call in the same thread. Cartão de Todos (Brazil, via Zenvia) ran calls inside WhatsApp. — [Ominiflow summary of Meta stories](https://ominiflow.com/blog/whatsapp-success-stories)
- Cost-aware re-engagement: inside the FEP window (up to 7 days from the CTWA reply), marketing, utility and service messages are free. Outside it, re-engagement needs a paid template; inside the 24h customer service window, free-form replies are now paid service messages (after 1,000 per month). — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)

### Inferences
- A strong portfolio demo would implement:
  - CTWA webhook capture of `ctwa_clid` and opening of an FEP timer (7d).
  - An AI qualifier (own LLM = "Service" category; or Meta Business Agent with the app in standby).
  - A Flow with a data_exchange endpoint (encrypted) for quote or booking.
  - `order_details` with `pix_dynamic_code` + `APPSWITCH`.
  - PSP webhook → `order_status`.
  - CAPI `LeadSubmitted`/`Purchase` with value.
  - Thread-control `pass` to a human with the AI summary.
  - BSUID-keyed CRM.
- Abandoned-cart recovery should route through the Marketing Messages API (delivery optimization, max price) rather than Cloud API marketing sends.

### Gaps
- No Meta-published Brazilian benchmark isolates the uplift of CAPI feedback on CTWA CPL or ROAS within the window.

## Q3. Quantitative evidence (conversion, retention, CPL, ROAS), especially Brazil

### Takeaway
Credible numbers come mainly from Meta's success-stories hub (self-reported, partner-assisted). Brazil has strong commerce and calling evidence (Magalu 3x conversion; Cartão de Todos +26% conversion). I found no BSP-published Brazilian CPL or ROAS figures dated inside the window.

### Cited Findings
- Magalu (Brazil): 3x conversion vs app/site, 85 NPS, 75% of payments via in-thread Pix (six weeks, Oct–Dec 2025). — [Meta success story](https://whatsappbusiness.com/resources/success-stories/magalu/)
- Cartão de Todos (Brazil, Zenvia, Business Calling): "26% conversion lift; ~50% faster conversion; +9 NPS" (window 2025-05-09 to 06-08). — [Ominiflow citing Meta](https://ominiflow.com/blog/whatsapp-success-stories); original at [whatsappbusiness.com](https://whatsappbusiness.com/resources/success-stories/cartao-de-todos/) (not fetched directly)
- SICAR (LatAm, calling): "20% faster resolution; 35% higher first-contact resolution". Avista (Colombia): "79% less customer time spent; 340 advisor hours saved in two months" (AI voice, then human). — [Ominiflow citing Meta](https://ominiflow.com/blog/whatsapp-success-stories)
- Meta's hub lists 119 success stories as of August 2026. Non-Brazil examples: Domino's Indonesia +72% sales and 6.3x ROI; PolicyBazaar 5x premiums, 3x sales, +30% conversion; TriHealth -49% cost per purchase (marketing messages). — [Ominiflow](https://ominiflow.com/blog/whatsapp-success-stories)
- Gupshup / Arha Media (India): 38% read rate, 4–5% conversion on churned-user win-back, +10% re-subscriptions via in-chat payments. — [Gupshup](https://www.gupshup.ai/resources/blog/click-to-chat-ads-conversions/)
- Meta's cost model for AI in Brazil: ~4–5¢ per message for Meta Business Agent vs ~9–10¢ for third-party AI plus service delivery (Meta's own estimate, so not neutral). — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- Market weight: one vendor claims Brazil accounts for 32.9% of WhatsApp Business integrations worldwide. The source is low-authority and unverified. — [Whatsable](https://whatsable.app/blog/whatsapp-business-availability-by-region-2026-guide)

### Inferences
- For a Brazilian portfolio pitch, quote Magalu (Pix + AI + Flows) and Cartão de Todos (calling) as Meta-published evidence, and label them "self-reported by brand/partner".

### Gaps
- No fresh (Jul–Oct 2026) case studies were found from Blip/Take, Zenvia, Infobip, 360dialog, Sinch or Twilio with Brazilian CPL or ROAS numbers. Mobile Time and Meio & Mensagem searches returned no relevant window-specific data.

## Q4. Policy constraints a demo must respect

### Takeaway
Since 2026-01-15, "AI Providers" may not distribute general-purpose assistants as the *primary* functionality. Business-grounded AI agents are allowed. In Brazil, AI Providers have been permitted, but their service messages are **charged**, since 2026-03-11. Templates are subject to automatic re-categorization. Calling has strict permission caps.

### Cited Findings
- WhatsApp Business Solution Terms bar AI Providers from using the platform "when such technologies are the primary (rather than incidental or ancillary) functionality being made available", effective 2026-01-15. — [SumGenius quoting terms](https://sumgenius.ai/blog/whatsapp-business-ai-bot-rules-2026/); [respond.io](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban); [TechCrunch via dig.watch](https://dig.watch/updates/meta-changes-whatsapp-terms-to-block-third-party-ai-assistants)
- AI Providers pricing policy: Brazil (+55) is in scope effective **2026-03-11**, and Meta charges per published AI Provider rates. The 2026-05-12 changelog says "Charges for non-template messages delivered to users in Brazil remain in effect", while EU/EEA charges were dropped from May 13. Türkiye was added 2026-10-15. — [Meta AI Providers](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers); [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog). The background (likely a regulatory exception in Brazil and Italy/EU) is not confirmed in these sources.
- Templates: "A template whose category was confirmed by a review remains subject to automatic category updates" if its sent messages do not meet the category guidelines (2026-09-15). — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Calling: production accounts may send 1 call-permission request per day and 2 per week. Permission is auto-revoked after 4 consecutive unanswered or rejected calls. Recording and transcription require a customer announcement. — [Calling docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling); [Changelog 2026-06-30](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Usernames: a business must not assume an E.164 phone number. Use `REQUEST_CONTACT_INFO` to ask for the phone number. — [BSUID docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/)
- Payment method required: without one, service messages stop after the 1,000 free tier (from 2026-10-01). — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- Thread control and standby require acceptance of the Meta Business Agents and Platform ToS. — [Changelog 2026-10-08](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

### Inferences
- A demo agent must be scoped to one business (catalog, booking, FAQ), with an explicit human handoff. An "ask me anything" bot risks the AI Provider classification and, in Brazil, AI Provider charges.

### Gaps
- Not researched in depth in this pass: opt-in rules, quality rating thresholds, messaging-limit tiers and marketing frequency caps (per-user marketing message limits) for 2026.

## Q5. What makes an implementation hard to copy (high barrier)?

### Takeaway
The barriers are in cryptography, state machines and cross-system reconciliation. Prompts and UI are easy to copy; these are not.

### Cited Findings
- **Flows endpoints**: an encrypted data_exchange endpoint, plus Data API 4.0 with an optional Flow Token Signature that verifies requests come from the user who received the Flow. Meta ships encryption examples (C#, Go). — [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **CAPI matching**: `ctwa_clid` must be captured from the referral webhook and preserved to the downstream Lead or Purchase event. Meta validates it. Community reports say "The ctwa_clid piece is where most CAPI setups fall apart". — [Meta CAPI BM](https://developers.facebook.com/documentation/ads-commerce/conversions-api/business-messaging); [AWS](https://docs.aws.amazon.com/social-messaging/latest/userguide/conversions-api.html); [Facebook dev group](https://www.facebook.com/groups/1844616979220134/posts/2965419860473168/)
- **Payment reconciliation**: Meta does not confirm Pix payments. The business must reconcile with its PSP and then send `order_status` ("you continue to confirm the payment and send the `order_status` message"). It must also support `pix_dynamic_code` (COPYPASTE/APPSWITCH), `boleto`, `payment_link` and `offsite_card_pay`. — [Changelog 2026-10-16](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Calling**: WebRTC (ICE/DTLS/SRTP, OPUS) or SIP over TLS with an IP allowlist (mTLS only when Meta is the client). WACID must be correlated with the SIP Call-ID. Permission state machine; recording and transcription. — [Calling docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling); [Changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Conversation Routing**: ownership states, `pass`/`take`/`release`, standby webhooks and AI conversation-context summaries across partners and Meta Business Agent. — [Changelog 2026-09-23](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Identity**: BSUID and parent BSUID, change events (`user_changed_user_id`), contact book. — [Changelog Aug 2026](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- **Cost engine**: per-message pricing webhooks (`pricing.type`, `category`, new `subtype`), FEP tracking per business–user pair across Messaging accounts, 1,000 free service-message counter, and max-price bidding. — [Meta pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)

### Inferences
- The most defensible portfolio piece is a live "unit economics" dashboard: cost per conversation by category versus FEP savings versus CAPI-attributed revenue. It shows engineering plus business understanding that simple bots cannot.

### Gaps
- Not verified: Pix APPSWITCH bank coverage, and whether one-click card (`offsite_card_pay`) needs a specific PSP onboarding in Brazil.
