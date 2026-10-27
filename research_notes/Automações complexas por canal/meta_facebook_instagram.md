# Advanced automation on Facebook, Messenger, Instagram and the Meta ads stack (window 2026-06-29 to 2026-10-27)

Researcher notes, compiled 2026-10-27. WhatsApp is covered only where it is part of a cross-app Meta flow. Each item is labeled IN-WINDOW or CONTEXT (before 2026-06-29). Source quality is marked: [PRIMARY] means a Meta newsroom, developer changelog, Meta for Business or earnings transcript; [AGENCY] means an agency or martech blog, which is secondary and sometimes unverified; [PRESS] means trade or business press.

## Q1. What did Meta ship or announce in this window? (date, source, status)

### Takeaway
The window brought three changes. First, conversational AI moved into the paid funnel: Meta Business Agent reached Instagram, Messenger got direct checkout tests, ads that open a Messenger or Instagram Direct chat now get a messaging window of up to 7 days, and new API controls govern handoff between Meta's AI and third-party bots. Second, ad delivery shifted to generative ranking and retrieval (Generative Recommender, expanded GEM, Andromeda) and to agentic campaign management (Business Assistant agentic actions, the Ads MCP server). Third, advertiser controls shrank: placement exclusions were removed, Threads became a default placement and product browsing is switched on automatically. Brazil-specific launches in the window are thin. The confirmed one is Instagram Live Ads, launched in Brazil on 2026-09-29.

### Cited Findings

**Conversational / Business AI (Messenger, Instagram, cross-app)**
- CONTEXT (2026-06-03): Meta launched **Meta Business Agent** globally for businesses of all sizes and expanded it to Instagram, alongside WhatsApp and Messenger. It answers business-specific questions, recommends products from the catalog, books appointments, qualifies incoming leads, lets the business decide when a human steps in, and closes sales. Activation is at facebook.com/business/ai and is free to start, with paid subscriptions promised "in the coming months". Meta says more than 1 million businesses use it on WhatsApp and Messenger, and there are more than 1 billion active business threads per day across WhatsApp, Messenger and Instagram. Meta also announced the **Meta Business Agent Platform**, enterprise infrastructure that connects to "hundreds of systems like Shopify, Zendesk, and Shopee" with guardrails and measurement, and that supports Messenger and Instagram. [PRIMARY] — [Meta Newsroom, 2026-06-03](https://about.fb.com/news/2026/06/meta-business-agent/)
- IN-WINDOW (2026-07-29, Q2 call): Zuckerberg said business agents are available globally on WhatsApp and Messenger, with ">1 million businesses using them … every week", and are now rolling out on Instagram. He said monetization will be "a mix of subscriptions, volume-based pricing" and that over time businesses would "only pay us when we achieve results". [PRIMARY transcript via] — [Motley Fool Q2 2026 transcript](https://www.fool.com/earnings/call-transcripts/2026/08/07/meta-meta-q2-2026-earnings-call-transcript/); [Meta IR PDF](https://s21.q4cdn.com/399680738/files/doc_financials/2026/q2/META-Q2-2026-Earnings-Call-Transcript.pdf)
- CONTEXT (Q1 2026 call): there were "more than 10 million conversations each week … through business AIs, up from 1 million at the start of the year". — [Fortune Q1 2026 transcript](https://fortune.com/company/facebook/earnings/q1-2026/)
- IN-WINDOW (Sept 2026, uncertain): an agency blog says the paid Business Agent tiers arrived in September as **Meta One** plans, which "unlock more Business Agent responses". An Instagram post claims Meta One launched in Brazil on 2026-09-15 with plans from R$7 to R$1,999 per month. Both are secondary and unverified; I found no primary confirmation. — [Aurelius Media](https://www.aureliusmedia.co/blog/meta-ads-updates); [Instagram post](https://www.instagram.com/p/DdUsOOGDe9f/?hl=en)
- IN-WINDOW (2026-10-06, Advertising Week NY): Meta is "testing a direct checkout experience in **Meta Business Agent on Messenger**" with Shopify. It will begin testing direct checkout in Meta AI with Adyen, PayPal, Shopify and Stripe "this fall". In Muse, Meta is adding PayPal wallet to the existing checkout options, Link by Stripe and Shop Pay. Status: TEST. [PRIMARY] — [Meta for Business, 2026-10-06](https://www.facebook.com/business/news/advertising-week-new-york-2026)
- IN-WINDOW (2026-09-29): **Muse for Small Business** launched, an agent that connects to Instagram professional insights, Facebook Pages and Meta ad accounts. Meta's Advertising Week post links to about.fb.com/news/2026/09/introducing-muse-small-business/. An agency blog adds Shopify, Klaviyo and Canva connectors; that detail is unverified. — [Meta for Business](https://www.facebook.com/business/news/advertising-week-new-york-2026); [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/)
- IN-WINDOW (2026-10-06, uncertain): an agency blog says Messenger checkout is enabled "through Meta Business Suite by connecting your product catalog to Meta Business Agent under the **Automations** tab". This is not a Meta-confirmed UI path. — [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-launches-generative-video-ads-and-in-conversation-checkout-at-advertising-week-ny-what-ecommerce-brands-must-do-now)

**Messenger Platform and Instagram Messaging API (developer changelog)**
- IN-WINDOW (2026-09-28): the messaging policy now says the standard messaging window "**may extend up to 7 days** for conversations that start from Click-to-Messenger or Click-to-Direct ads". The 7-day period starts with the person's first message after clicking the ad. Conversations from all other entry points keep the 24-hour window. [PRIMARY] — [Messenger Platform changelog](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
- IN-WINDOW (2026-10-18): Meta updated Conversation Routing for Messenger and Instagram to cover how a third-party app takes control of a conversation that **Meta Business AI** owns. The setting "**Take control of conversations with your Business AI**" is off by default and is independent of "Take control of conversations". While it is off, untagged Send API requests fail: error 10 / subcode 2018300 on Messenger, error 100 / subcode 2534037 on Instagram. Apps must "wait for a messaging_handovers webhook event containing pass_thread_control before responding". [PRIMARY] — [Messenger Platform changelog](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
- IN-WINDOW (2026-06-30): the Messenger **image grid template** shows 2 to 6 images in one message, each with its own URL or postback action, plus up to 3 buttons. On the same date, the **Marketing Messages API for Messenger** gained a "Default Budget Mode", so `POST /act_<ID>/message_campaign` works without a daily or lifetime budget. [PRIMARY] — [Messenger Platform changelog](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
- IN-WINDOW (2026-10-21): the delivery estimation guide for the Marketing Messages API for Messenger now covers the custom audience request parameter. [PRIMARY] — same changelog
- CONTEXT (May to June 2026), Marketing Messages API for Messenger:
  - `pixel_id` on campaign creation enables offsite conversion attribution, and insights can return `offsite_conversion.fb_pixel_purchase` and `fb_pixel_lead`.
  - `min_conversation_gap_seconds` blocks a send when there was recent organic thread activity (error 2300052).
  - An Unsubscribe API removes users by phone, email, PSID or subscriber token.
  - Campaigns get `start_time` and `end_time` scheduling.
  - A Partner Billing Flow lets a partner bill sends to its own ad account.
  - [PRIMARY] — same changelog
- CONTEXT (secondary aggregation): Message Tags CONFIRMED_EVENT_UPDATE, ACCOUNT_UPDATE and POST_PURCHASE_UPDATE now fail with error 100, and senders must migrate to Utility Templates or the Marketing Messages API. The Handover Protocol is no longer supported for Instagram (announced 2025-10-23) and was replaced by Conversation Routing. — [Blotato API report](https://www.blotato.com/research/social-media-api-report)

**Instagram Platform API**
- IN-WINDOW (2026-10-20): new `GET /<IG_MEDIA_ID>/ordered_comments` edge returns comments "in Instagram display order" and "can include comments from all of an ad's Instagram media". It is available with Facebook Login only. This matters for comment-to-DM automation on ads that run as several media copies. [PRIMARY] — [Instagram Platform changelog](https://developers.facebook.com/docs/instagram-platform/changelog)
- IN-WINDOW (2026-10-05): **user_phone_number and user_email quick replies were disabled** for Instagram messaging. Requests that use them no longer create contact-capture quick replies, which breaks a common lead-capture step in DM bots. [PRIMARY] — same
- IN-WINDOW (2026-09-28): **caption add-ons** in the Content Publishing API: `poll_attachment`, `is_comment_prompt_used`, `GET /<IG_MEDIA_ID>/prompt_response` and `/poll_attachment`. Feed and Reels only, Facebook Login only. A comment prompt is a native trigger for comment-to-DM flows. Publishes also now return `config_issue` (CAPTION_NOT_ATTACHED, USER_TAGGING_FAILURE). [PRIMARY] — same
- IN-WINDOW (2026-09-22): **Creator Marketplace Messaging API** (`POST /<PAGE_ID>/messages?folder=partnership`, permission `instagram_creator_marketplace_messaging`, creators with 250k followers or fewer). The Discovery API rate limit rose from 1,000 to 5,000 calls per user per hour. [PRIMARY] — same
- IN-WINDOW (2026-09-21): the Message Replies API (reply to a specific past message) now works with the Instagram API with Instagram Login. [PRIMARY] — same
- IN-WINDOW (2026-07-30): `media_url` is omitted for copyrighted or download-disabled media. CONTEXT (2026-06-22): `is_ai_generated` adds the AI info label at publish. [PRIMARY] — same
- IN-WINDOW: Graph API / Marketing API **v26.0 released 2026-07-29**. Removals announced with v26 reached all versions on 2026-10-27; these include the Messenger Stories placement, poll ad creation and Commerce endpoints. Under v25, Advantage+ Shopping and App campaigns can no longer be created or edited through the Marketing API. These details are secondary. — [PostMCP AI](https://www.postmcpai.com/facebook-api-platforms); [Aurelius Media](https://www.aureliusmedia.co/blog/meta-ads-updates); [Graph API changelog](https://developers.facebook.com/docs/graph-api/changelog/)
- Native comment-to-DM: Brazilian creators widely report a free "**comentário para mensagem**" automation under Meta Business Suite > Inbox > **Automações**. Meta is also reported to be testing "**Reply to Keywords**", which sends an automatic DM when someone comments a keyword on an Instagram ad. These are unverified social posts, with no primary Meta doc found. — [Instagram post](https://www.instagram.com/p/DehIOtXhoqk/); [Instagram post](https://www.instagram.com/p/Dcym7e0Eemo/?hl=fa)

**Ads stack: ranking, automation and creative**
- IN-WINDOW (2026-07-29, Q2): Meta introduced the **Meta Generative Recommender**, which uses "LLMs to reason about ad content and user preferences together and predict the best ad for each person". **Advantage+** end-to-end solutions passed **$75B annual revenue run rate**. **9 million** small businesses use at least one AI ad creative tool. Family of Apps "other revenue" passed $1B, up 73%, driven by WhatsApp paid messaging. [PRIMARY transcript] — [Motley Fool Q2](https://www.fool.com/earnings/call-transcripts/2026/08/07/meta-meta-q2-2026-earnings-call-transcript/). One agency source attributes "+8.3% ad clicks, +15.7% conversions on Facebook" to the Q2 call (generative retrieval plus GEM plus sequence learning). I did not find that figure in the transcript excerpt I read, so treat it as unverified. — [Aurelius Media](https://www.aureliusmedia.co/blog/meta-ads-updates)
- IN-WINDOW (2026-10-21, Q3): figures from Susan Li:
  - Generative retrieval on Facebook Feed: "nearly 2% increase conversions".
  - Expanded GEM ("JEM" in the transcript): +1.7% conversions for off-site conversion campaigns and +9.6% app ad conversions.
  - Andromeda improvements: +1.4% conversions.
  - Meta AI Business Assistant adopters: "almost 5% more conversions at the same cost per conversion" and 9% more ad investment.
  - "Nearly 10 million advertisers used at least 1 of these tools".
  - Partnership ads above a $15B run rate (+97% year over year).
  - FoA other revenue $1.1B (+59%), driven by WhatsApp paid messaging.
  - Meta estimates at least 500M self-identified small businesses on its apps.
  - [PRIMARY transcript] — [Motley Fool Q3](https://www.fool.com/earnings/call-transcripts/2026/10/21/meta-meta-q3-2026-earnings-call-transcript/)
- IN-WINDOW (2026-10-06), Advertising Week NY [PRIMARY], [Meta for Business](https://www.facebook.com/business/news/advertising-week-new-york-2026):
  - **Ads Creative Studio** is rolling out more broadly.
  - **Meta AI business assistant** gets Creative Insights and "Deeper Memory and Context". Agentic actions are in TEST: plan or create a campaign, generate creative, update targeting, change budget, plus scheduled tasks and alerts.
  - The **Meta ads MCP Server** now handles creative upload and previews, and agent-staged work "lands as a draft in Ads Manager", gated by advertiser permissions and approval. Brazilian partners include **Blip** and **Reportei**.
  - **AI-enabled audience discovery** reaches Detailed Targeting by end of 2026.
  - **Customer Lifecycle Strategy** is available to all advertisers.
  - Video generation from static assets in Advantage+ creative is generally available (GA).
  - Product images to product video is in beta.
- IN-WINDOW (Aug–Oct 2026), agency-reported, not primary-verified; dates per CTC — [CTC hub](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/):
  - 2026-07-27: Advantage+ Creative rewrites text in uploaded images by default, with up to 8 headline variants.
  - 2026-08-10: exclusion-only custom audiences.
  - 2026-08-21: ad-set placement exclusions removed; value rules remain.
  - 2026-08-26: "Creative Diversity" score (Low / Medium / High).
  - 2026-08-27: Messenger Stories placement removed.
  - 2026-09-15: Creator Marketing Hub.
  - 2026-09-22: Threads ads no longer require an Instagram account.
  - 2026-10-14: product browsing auto-enabled in existing ads on 2026-10-28 (+3% conversions in a 117,700-advertiser test).
  - 2026-10-14: AI-generated landing pages tested on fewer than 5% of impressions, where the pixel and GA4 do not fire.
  - 2026-10-15: Reels Trending Ads expanded to 15 always-on categories; First Impression Ads (US test).
  - 2026-10-19: Threads becomes the default placement in all campaigns.
  - 2026-10-20: GEM paper claims +18.9% conversions. This is a research or offline figure; do not conflate it with the Q3 call numbers.
- IN-WINDOW: Meta's updated Commercial Terms and Self-Serve Ad Terms fold the Ad Creative Generative AI Terms into the Self-Serve Ad Terms. They were first due 2026-10-30 and Meta's help page now says 2026-11-20. — [Meta Business Help](https://www.facebook.com/business/help/2481113349080785); [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/)
- CONTEXT (2026-08-19, secondary): "Meta AI for small businesses" can connect FB and IG accounts, ad campaigns and Google Workspace to audit campaigns. — [Aurelius Media](https://www.aureliusmedia.co/blog/meta-ads-updates)

**Brazil-specific**
- IN-WINDOW (2026-09-29): **Instagram Live Ads launched in Brazil**. Live broadcasts can be boosted to Reels, Stories and Feed, including conversion to app, site or a WhatsApp channel. Live partnership ads run through the Meta Creator Marketing Hub and Meta AI Business Assistant. Eligibility: business or creator accounts with more than 1,000 followers. [PRESS] — [Mobile Time, 2026-09-29](https://www.mobiletime.com.br/noticias/29/09/2026/instagram-live-ads-bra/)

### Inferences
- The 7-day window for ad-originated conversations (2026-09-28) is the most important policy change for Messenger and Instagram Direct automation in the window. AI qualification and follow-up sequences can now run for a week after a click-to-Direct ad without message tags. That makes click-to-message ads plus multi-day nurture far more viable.
- The 2026-10-18 routing rule means third-party bots (ManyChat-type tools, Blip, custom stacks) running on a Page or Instagram account that also has Meta Business AI turned on must explicitly enable "Take control of conversations with your Business AI" and handle `messaging_handovers`. Hybrid Meta-AI-plus-custom-bot setups are now a real integration task that can be shown as defensible engineering.
- Disabling the email and phone quick replies (2026-10-05) pushes lead capture inside DMs toward Meta-native lead flows, free-text extraction with validation, or a WhatsApp handoff.

### Gaps
- No primary source found for: the native Instagram "comment-to-DM" automation UI label and launch date; "Reply to Keywords" on ads; Business Agent availability or pricing in Brazil; the Meta One Brazil launch.
- No primary Meta source in the window for Conversions API Gateway changes, Lead Ads instant-form automation changes, virtual try-on, Marketplace automation or a Threads ads launch date. The Threads items are agency-reported only.
- The Q3 transcript was read through Motley Fool's rendering, which contains transcription errors such as "JEM". The official Meta IR PDF exists but I extracted it only partially.

## Q2. Which complex funnels have the highest impact?

### Takeaway
The best-supported architectures close the loop from conversation or CRM outcomes back to Meta. Two combinations stand out: Conversion Leads optimization with Conversions API for CRM, and click-to-Messenger or click-to-Direct ads with an AI agent, an in-chat transaction and pixel or CAPI attribution. The new 7-day window, checkout inside Business Agent and the pixel-attributed Marketing Messages API make the full chain buildable in 2026. It is still mostly unmeasured as a single end-to-end funnel in public data.

### Cited Findings
- Funnel A, lead ad to CRM to quality signal: Meta states that "Advertisers who combine Conversions API for CRM with the **conversion leads** performance goal … can lower cost per quality lead by **19%** compared to instant form campaigns that use the leads performance goal". [PRIMARY, undated evergreen] — [Meta Blueprint video page](https://www.facebook.com/business/learn/video/conversions-api-CRM). Make.com cites "21% lower cost per quality lead" for the same pairing. — [Make blog](https://www.make.com/en/blog/meta-make-conversions-api-for-crm). The two figures conflict, probably because they come from different Meta studies.
- Funnel A implementation pattern (GoHighLevel docs, updated 2026-06-01): one workflow creates the lead and an opportunity, and a second workflow fires a CAPI lead event when the opportunity moves to a qualifying pipeline stage. — [HighLevel help](https://help.gohighlevel.com/support/solutions/articles/48001233833-facebook-conversion-leads-walkthrough)
- Funnel B, click-to-message ad to Business Agent to checkout: Meta is testing checkout in Business Agent on Messenger (Shopify). [PRIMARY] — [Meta for Business, 2026-10-06](https://www.facebook.com/business/news/advertising-week-new-york-2026). The 7-day window for click-to-Messenger and click-to-Direct conversations allows multi-day qualification. [PRIMARY] — [Messenger changelog](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
- Funnel B retargeting and re-engagement: Marketing Messages for Messenger campaigns accept a `pixel_id`, and insights report `website_purchase_roas` and `fb_pixel_lead` attributed to messages. So "message to site purchase" re-engagement is now attributable. [PRIMARY] — same changelog (2026-05-22)
- Cross-app (WhatsApp), Brazil: **Movida**, a Brazilian car rental company, uses Business Agent on WhatsApp for "the entire booking flow, from vehicle selection and pricing to payment". Results: +44% daily bookings through WhatsApp year over year in a one-month period, 85% of conversations resolved entirely by AI, and returning customers can book "in as few as 3 messages". [PRIMARY, Q2 call] — [Motley Fool Q2](https://www.fool.com/earnings/call-transcripts/2026/08/07/meta-meta-q2-2026-earnings-call-transcript/)
- Funnel C, creator Live to ad to WhatsApp or site: Instagram Live Ads in Brazil can convert to a WhatsApp channel or site, with a median **19%** lift in incremental purchases in a local conversion-lift test. [PRESS citing Meta] — [Mobile Time](https://www.mobiletime.com.br/noticias/29/09/2026/instagram-live-ads-bra/)
- Funnel D, agentic optimization layer: Business Assistant adopters see about 5% more conversions at the same CPA. The Simply Organic Maple case: +57% purchases and -36% cost per purchase after the assistant suggested longer copy. [PRIMARY] — [Motley Fool Q3](https://www.fool.com/earnings/call-transcripts/2026/10/21/meta-meta-q3-2026-earnings-call-transcript/)

### Inferences
- Most defensible portfolio funnel (inference): a click-to-Direct or click-to-Messenger ad, or an organic Reel with `is_comment_prompt_used`, triggers a comment-to-DM via webhook and private reply, or the ad opens the chat directly. An LLM qualifier then runs inside the 7-day window, respecting Business AI routing, and books via calendar. The CRM stage changes are sent to CAPI as custom lead-stage events with `event_id` dedup and hashed email and phone. Meta optimizes for conversion leads or value, and Marketing Messages with `pixel_id` handle re-engagement. Each link is supported by a primary doc above, but no public source measures the full chain.
- For Brazil, the WhatsApp leg (Movida-type) is the proven conversion endpoint. Messenger is weak in Brazil compared with Instagram Direct and WhatsApp; this is an inference from market usage, not sourced here.

### Gaps
- No public end-to-end case was found for "ad → comment-to-DM → AI → booking → CAPI offline feedback".
- No Brazil case for Conversion Leads with CAPI for CRM was found in the window.

## Q3. What quantitative evidence exists (Brazil prioritized)?

### Takeaway
Hard numbers mostly come from Meta itself: earnings calls and Meta-cited tests. Brazil has two Meta-sourced data points (Movida, and the Instagram Live Ads conversion-lift test). Independent agency evidence is anecdotal or comes from vendors with a product to sell.

### Cited Findings
- Brazil, Movida (WhatsApp Business Agent): +44% daily bookings and 85% AI-resolved conversations. — [Motley Fool Q2](https://www.fool.com/earnings/call-transcripts/2026/08/07/meta-meta-q2-2026-earnings-call-transcript/)
- Brazil, Instagram Live Ads: a $100 ad reaches "up to 24x more" engagement on a live, and a local conversion-lift test showed a +19% median lift in incremental purchases. — [Mobile Time](https://www.mobiletime.com.br/noticias/29/09/2026/instagram-live-ads-bra/)
- Global, Meta Q3 2026: GEM +1.7% off-site conversions and +9.6% app conversions; Andromeda +1.4%; generative retrieval about +2%; Business Assistant about +5% conversions at the same CPA. — [Motley Fool Q3](https://www.fool.com/earnings/call-transcripts/2026/10/21/meta-meta-q3-2026-earnings-call-transcript/)
- Global: Advantage+ above a $75B run rate (Q2); 9M SMBs using AI creative tools (Q2); about 10M advertisers using AI tools (Q3). — Motley Fool Q2 and Q3 transcripts above.
- Global: Conversions API for CRM with Conversion Leads gives -19% cost per quality lead (Meta), or -21% (as cited by Make). — [Meta](https://www.facebook.com/business/learn/video/conversions-api-CRM); [Make](https://www.make.com/en/blog/meta-make-conversions-api-for-crm)
- Global: product browsing gave +3% conversions in a 117,700-advertiser experiment. [AGENCY citing Meta] — [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/)
- Health vertical: one vendor claims Event Match Quality recovered from about 5/10 to 8.5–9/10 after payload cleansing, based on 125+ accounts. This is a vendor claim and not independently verified. — [Zappush](https://www.zappush.com/blog/meta-pixel-health-wellness-restrictions-2026-myth-vs-reality)

### Inferences
- For a Brazil-facing pitch, Movida, Live Ads and the -19% CAPI for CRM figure are the most citable numbers. Meta's GEM and Andromeda percentages are platform-wide averages, not something one advertiser can capture.

### Gaps
- No Brazil retention or LTV data for Instagram or Messenger automation was found.
- I did not reach Meio & Mensagem or AdNews articles with numbers in the window; the searches returned mostly social posts.
- No independent benchmark of Business Agent conversion rates against human agents was found.

## Q4. What are the policy constraints?

### Takeaway
The main limits are the messaging window (24h by default, up to 7 days for conversations from click-to-message ads), the human-handoff rules (the HUMAN_AGENT tag, and now Business AI routing), deprecated message tags, sensitive-data rules that suppress lower-funnel events for health and finance advertisers, and the new terms that make advertisers liable for AI-generated creative.

### Cited Findings
- Messaging windows, as listed:
  - The standard window is 24h.
  - Conversations from click-to-Messenger or click-to-Direct ads get up to 7 days from the first message.
  - [PRIMARY] — [Messenger changelog, 2026-09-28](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
  - The Instagram `human_agent` tag allows replies for 7 days; there are also published limits of 100 messages per second and 750 private replies per hour. [secondary] — [PostMCP AI](https://www.postmcpai.com/facebook-api-platforms)
- Business AI coexistence: unless "Take control of conversations with your Business AI" is enabled, untagged sends fail while Meta's AI owns the thread. [PRIMARY] — [Messenger changelog, 2026-10-18](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
- Deprecated message tags: CONFIRMED_EVENT_UPDATE, ACCOUNT_UPDATE and POST_PURCHASE_UPDATE now fail (error 100). Use Utility Templates or the Marketing Messages API instead. — [Blotato](https://www.blotato.com/research/social-media-api-report)
- Contact capture: the Instagram email and phone quick replies are disabled (2026-10-05). [PRIMARY] — [Instagram changelog](https://developers.facebook.com/docs/instagram-platform/changelog)
- Prohibited information and Core Setup: event names, custom conversions, custom audiences, URL parameters and custom data must not reflect prohibited (for example health or financial) information. "Core setup" strips custom parameters and everything in the URL after the domain. [PRIMARY] — [Meta Business Help: About prohibited information](https://www.facebook.com/business/help/361948878201809)
- Health and wellness tiers: the tiers are Core Setup, Mid-Restricted (loses Purchase and Lead optimization) and Full-Restricted (no conversion tracking). CAPI events from a restricted source are removed on receipt, so server-side delivery does not bypass the restriction. [AGENCY] — [SagaPixel](https://sagapixel.com/meta-ads/facebook-ads-3-tiers/); [Zappush](https://www.zappush.com/blog/meta-pixel-health-wellness-restrictions-2026-myth-vs-reality). Caution: Zappush markets "clean intermediary domain" routing to escape classification. That likely conflicts with Meta's Business Tools Terms and should not be recommended.
- AI disclosure and liability:
  - The Instagram Content Publishing API has an `is_ai_generated` AI info label (2026-06-22). [PRIMARY] — [Instagram changelog](https://developers.facebook.com/docs/instagram-platform/changelog)
  - The new Self-Serve Ad Terms fold in the generative AI creative terms (effective 2026-11-20). [PRIMARY] — [Meta Business Help](https://www.facebook.com/business/help/2481113349080785)
  - An agency claims that advertisers are liable for Meta-generated AI content and that "14% of 2026 ad rejections" are tied to undisclosed AI. That figure is unverified. — [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/)
- Agentic actions in Ads Manager and the MCP server are gated by "advertiser-set permissions and explicit approval". [PRIMARY] — [Meta for Business](https://www.facebook.com/business/news/advertising-week-new-york-2026)

### Inferences
- In Brazil, LGPD consent and data-minimization duties apply on top of Meta's rules when CRM data is hashed and sent to CAPI. I did not research this here; flag it for the compliance section.
- In regulated verticals (clinics, financial products), the defensible design is a neutral event taxonomy (`appointment_booked`, not `cardiology_consult`), no free-text or URL leakage, and offline outcomes sent as neutral custom events. Escaping classification through domain tricks is not defensible.

### Gaps
- I did not find a primary Meta doc in the window describing a specific AI-disclosure requirement for Business Agent conversations, for example "you're chatting with AI" labels.
- Finance-vertical event restrictions in Brazil were not confirmed separately from the health restrictions.

## Q5. What makes an implementation high-barrier?

### Takeaway
The barrier sits in signal engineering, not in bot UX. That means server-side CAPI with deduplication and high match quality, CRM-stage events mapped to Conversion Leads, value signals, multi-copy ad comment handling, Business AI routing and handover, Marketing Messages attribution, and sensitive-data-safe payload design. Meta keeps removing manual levers (placements, targeting, Advantage+ API editing), so the input signals and creative are what remain under the advertiser's control.

### Cited Findings
- The Dataset Quality API now returns per-event-type Event Match Quality (EMQ) and an "ACR" metric, Additional Conversions Reported by CAPI over the pixel alone. [AGENCY citing Meta docs] — [LeadDistro](https://www.leaddistro.ai/blog/meta-conversions-api-lead-generation)
- The Pixel ID is now called a "Dataset ID", and the old Offline Conversions API is gone; offline events route through CAPI. [AGENCY] — [LeadsBridge](https://leadsbridge.com/blog/facebook-conversions-api/)
- A CRM loop needs the raw lead ID or the Meta lead ID echoed back, plus stage events. Low-volume accounts (60–80 qualified leads per month) struggle to exit learning. [community, anecdotal] — [Reddit r/FacebookAds](https://www.reddit.com/r/FacebookAds/comments/1vtdofi/conversion_leads_capi_for_crm_why_do_i_have_to/)
- `ordered_comments` covers all of an ad's Instagram media copies, which is needed for reliable comment-triggered automation on ads. [PRIMARY] — [Instagram changelog](https://developers.facebook.com/docs/instagram-platform/changelog)
- Routing and handover: `messaging_handovers` / `pass_thread_control` and specific error subcodes when Business AI owns a thread. [PRIMARY] — [Messenger changelog](https://developers.facebook.com/documentation/business-messaging/messenger-platform/changelog)
- Marketing Messages API: `pixel_id` attribution, `min_conversation_gap_seconds`, the Unsubscribe API, a delivery estimate with custom audiences, and partner billing through a BISU asset-connection that requires App Review for `business_management`. [PRIMARY] — same changelog
- AI-generated landing pages (test on fewer than 5% of impressions) and in-app product browsing (auto-on 2026-10-28) do not fire the browser pixel or GA4. That strengthens the case for server-side or offline truth. [AGENCY] — [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/)
- Meta's ads MCP Server lets an external agent stage drafts in Ads Manager. Brazilian partners Blip and Reportei have integrated it. [PRIMARY] — [Meta for Business](https://www.facebook.com/business/news/advertising-week-new-york-2026)
- Creative inputs matter because the Generative Recommender groups near-duplicate creatives, and Meta added a Creative Diversity score. [AGENCY] — [CTC](https://commonthreadco.com/blogs/coachs-corner/meta-ads-changes-2026/)

### Inferences
- High-barrier checklist for a portfolio demo:
  1. Shared `event_id` for pixel and CAPI deduplication.
  2. EMQ of 8 or higher through hashed email, phone, `fbp`/`fbc` and the lead ID.
  3. CRM stage to CAPI custom events with Conversion Leads optimization.
  4. Value-based bidding fed by predicted or actual deal value.
  5. Webhook-driven comment-to-DM using `ordered_comments` and private replies within rate limits.
  6. Business AI and third-party bot handover that respects the 24h and 7-day windows.
  7. Marketing Messages with `pixel_id` for re-engagement attribution.
  8. Neutral, LGPD- and Meta-compliant event taxonomy for sensitive verticals.
  9. An MCP or Marketing API agent that stages drafts but needs human approval.
- Each item can be checked against a primary Meta doc, which makes the demo defensible.

### Gaps
- No primary 2026 doc in the window on Conversions API Gateway changes or value-based bidding for leads ("value optimization for conversion leads") was retrieved.
- The EMQ and ACR details rely on secondary descriptions of the Dataset Quality API.
