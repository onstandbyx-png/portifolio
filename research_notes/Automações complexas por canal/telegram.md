# Telegram: advanced automation for businesses and creators (window 2026-06-29 to 2026-10-27)

Research date: 2026-10-27. Primary sources: the Bot API changelog (fetched live), the Telegram blog, and the core.telegram.org docs (Mini Apps, Serverless, Stars payments, FAQ, ToS). Anything dated before 2026-06-29 is marked **[CONTEXT]**.

## 1. Which Bot API versions and Telegram updates came out in the window, and what did they add?

### Takeaway
The window had two Bot API releases, 10.2 (2026-07-14) and 10.3 (2026-08-24). It also had two client updates, on Jul 14 and Aug 25, and one new platform: **Telegram Serverless** (docs published about 2026-07-15; Mini App hosting and endpoints added on 2026-10-06). The common thread is automation inside groups, channels and communities: ephemeral messages, buttons inside messages, welcome messages and Communities. There is also a webhook for changes to Stars subscriptions, a security hardening of Mini Apps, and backend hosting run by Telegram itself. As of 2026-10-27 the changelog shows nothing after Aug 24, 2026.

### Cited Findings
**Bot API 10.2 (July 14, 2026)** — [Bot API changelog](https://core.telegram.org/bots/api-changelog)
- **Ephemeral Messages**: bots can send group messages, and receive commands, that only one user and the bot can see. Added: `BotCommand.is_ephemeral`, `Message.receiver_user`, `Message.ephemeral_message_id`, and the `receiver_user_id` and `callback_query_id` parameters on sendMessage/sendPhoto/etc. Also added `editEphemeralMessageText/Media/Caption/ReplyMarkup` and `deleteEphemeralMessage`, plus replies to ephemeral messages via `ReplyParameters.ephemeral_message_id`. — [changelog](https://core.telegram.org/bots/api-changelog)
- **Communities** (initial support): several supergroups, channels and bots linked around one topic. Added the `Community` class, the `CommunityChatAdded`/`CommunityChatRemoved` service messages and `ChatFullInfo.community`. — [changelog](https://core.telegram.org/bots/api-changelog)
- **Subscription webhook**: "Added updates about changes to a user payment subscription, represented by the class `BotSubscriptionUpdated` and the field `subscription` in the class `Update`." This matters for reconciling recurring Stars billing. — [changelog](https://core.telegram.org/bots/api-changelog)
- **Mini App security hardening**: Mini App methods can no longer be called from origins other than the Mini App's own domain. It was turned on automatically for all Mini Apps on **July 20, 2026**. Developers can opt out in the @BotFather Mini App, but the opt-out makes the bot responsible for avoiding links to untrusted sites. — [changelog](https://core.telegram.org/bots/api-changelog)
- Rich Messages input blocks: `InputRichMessage.blocks` with about 20 `InputRichBlock*` types (table, list, map, slideshow, details, "Thinking" and others), `InputRichMessageMedia` and `InputMediaVoiceNote`. — [changelog](https://core.telegram.org/bots/api-changelog)

**Bot API 10.3 (August 24, 2026)** — [changelog](https://core.telegram.org/bots/api-changelog)
- **Buttons inside rich messages**: `RichMessageButton`, `RichTextButton`, `RichBlockButtons`/`InputRichBlockButtons`. Also added expandable block quotes, `RichBlockDocument` (files inside text) and `tg://document?id=` links.
- Ephemeral messages reworked: the new `EphemeralMessageParameters` object (it replaces receiver_user_id/callback_query_id) and `replace_callback_query_message`, which shows an ephemeral message *in place of* the original message for one user only. That works as a private overlay on a public post.
- **Welcome messages for bots**: the admin right `can_send_welcome_messages` (in `ChatAdministratorRights`, `ChatMemberAdministrator` and `promoteChatMember`).
- Reply markup: `DisabledButton` / `InlineKeyboardButton.disabled`, and `force_reply` on inline and reply keyboards.
- AI streaming: `can_stop`/`keep_on_stop` on `sendMessageDraft`/`sendRichMessageDraft`, plus the update `MessageGenerationStopped` (`Update.stopped_message_generation`) when a user presses Stop.
- `CommunityChatJoined` service message, and `text`, `entities` and `is_private` on `UniqueGiftInfo` (signed gifts).

**Client updates**
- Jul 14, 2026, "Rich Text Editor, Communities, Ephemeral Messages in Groups, 350 Million GIFs". Rich text editor with tables, inline media and headings, AI generation powered by Cocoon, and up to 32,768 characters per message (**Premium-only**). Communities are collaborative by default and can be restricted. In Ephemeral Bot Messages, "Bots can send ephemeral messages at any time or in response to specific commands"; uses include greetings, private AI summaries, errors and menus. — [Telegram blog, 2026-07-14](https://telegram.org/blog/communities-editor-invisible-messages)
- Aug 25, 2026, "Welcome Messages, Buttons in Messages and Signed Gifts". Owners set native **Welcome Messages** visible only to new members, with multiple messages, media and rich formatting, and no bot required (Edit > Welcome Message). **Buttons inside Messages** "paired with ephemeral messages… create flows for anything from surveys, games, and horoscopes to viewing and ordering products", and they can be posted in groups and channels where "any number of users can interact." Also: Inline Documents in Messages and Signed Gifts from the Marketplace. The same post says Telegram shipped "12 major updates… more than 55 features" in the past year. — [Telegram blog, 2026-08-25](https://telegram.org/blog/welcome-messages-buttons-TG-13)

**Telegram Serverless (new platform, in window)**
- "Telegram Serverless lets you run backend code for your bot and Mini App directly on Telegram's infrastructure". It uses JavaScript modules running in a V8 isolate "right next to the Bot API and a built-in database" (SQLite), with outbound HTTP. You enable it in @BotFather → Serverless, then deploy with `npx tgcloud push` and `npx tgcloud migrate`. — [core.telegram.org/bots/serverless](https://core.telegram.org/bots/serverless)
- Changelog entry for **October 6, 2026**: "Added Mini App hosting… served at https://app<app_id>.tgcloud.ai/", plus "endpoints, the functions your Mini App calls with `Telegram.WebApp.Serverless.call`", and CLI 0.2.0. — [Serverless docs](https://core.telegram.org/bots/serverless)
- Endpoints receive `ctx.initData` "already verified by the platform… A call without valid init data is rejected with 401 before your code runs." So Serverless removes the need to write your own initData HMAC check. — [Serverless docs](https://core.telegram.org/bots/serverless)
- The Mini Apps reference now lists `Serverless` as a NEW field of `window.Telegram.WebApp`. — [Mini Apps docs](https://core.telegram.org/bots/webapps)
- TechTimes (2026-07-16) says the docs were published "yesterday", i.e. about Jul 15, 2026. The article notes there is no published pricing, execution or storage limits, or database-export path. It also says handlers can import only `sdk`/`schema` (no npm packages), cannot download or upload file bytes, and run with foreign keys disabled. Hacker News users asked how to manage secrets. Some access was gated ("Get access to Serverless", per [HackerNoon](https://hackernoon.com/telegram-can-host-your-bot-should-you-give-up-your-vps)). — [TechTimes](https://www.techtimes.com/articles/320758/20260716/telegram-serverless-ships-one-deploy-command-your-bot-data-never-leaves-telegram.htm)

**[CONTEXT] Releases just before the window that the in-window features build on**
- Bot API 10.1 (Jun 11, 2026): **Rich Messages** (`sendRichMessage`, plus `sendRichMessageDraft` for streaming AI replies), **Join Request Queries** (`answerChatJoinRequestQuery`, `sendChatJoinRequestWebApp`, `ChatFullInfo.guard_bot`, which lets a bot or Mini App screen join requests) and link media in polls. — [changelog](https://core.telegram.org/bots/api-changelog); blog: "AI Guardians for Groups" — [Telegram blog 2026-06-11](https://telegram.org/blog/watch-apps-and-more)
- Bot API 10.0 (May 8, 2026): **Guest Mode** (bots answer when @mentioned in chats they are not part of; up to 3 guest bots per message), **bot-to-bot communication**, "Allowed Business Bots to manage user accounts without a Telegram Premium subscription", `getUserPersonalChatMessages`, poll restrictions (`members_only`, `country_codes`) and Live Photos as paid media. — [changelog](https://core.telegram.org/bots/api-changelog)
- May 7, 2026 client update: **Chat Automation in Profiles**. "Every Telegram user can connect a bot to their profile — and allow it to respond to messages on their behalf", with per-chat scoping (Settings > Chat Automation). This turns the former Telegram Business "connected bots" into a feature for every user. — [Telegram blog 2026-05-07](https://telegram.org/blog/ai-bot-revolution-11-new-features)
- Bot API 9.6 (Apr 3, 2026): **Managed Bots**, which let a bot create and control other bots (`getManagedBotToken`, `t.me/newbot/{manager}/{suggested}` links). — [changelog](https://core.telegram.org/bots/api-changelog)
- Mini App platform features (full-screen, home-screen shortcuts, geolocation `LocationManager`, device motion) date from Bot API 8.0 (Nov 17, 2024). `DeviceStorage`/`SecureStorage` date from Bot API 9.0 (Apr 11, 2025). In 2026 Mini Apps only got `requestChat` (9.6) and `chat_join_request_query_id` in initData (10.1). — [Mini Apps docs changelog](https://core.telegram.org/bots/webapps)
- Channel Direct Messages and Suggested Posts (Jun–Jul 2025) and Checklists (Jul 1, 2025; Bot API 9.1) are older. — [Telegram blog index](https://telegram.org/blog)
- Current docs for business-account automation: `sendChecklist` (business connection), `getBusinessAccountStarBalance`, and `transferBusinessAccountStars` (requires the `can_transfer_stars` right). — [Bot API reference](https://core.telegram.org/bots/api)

### Inferences
- Within the window, Telegram's automation work focused on **in-group and in-channel interactive flows** (ephemeral messages + in-message buttons + welcome messages + Communities) and on **removing infrastructure** (Serverless). It did not focus on new payment primitives: `BotSubscriptionUpdated` is the only new payments-related item.
- No in-window changes were found to Stars pricing, affiliate programs, verification, the ad platform or Mini App device APIs. The researcher only checked the changelog and blog, so smaller policy changes may have been missed.

### Gaps
- Exact launch date and current access status of Serverless (general availability vs waitlist), and its pricing and limits: not published as of the sources reviewed.
- No in-window Telegram blog post after Aug 25, 2026 was found. Whether a September or October client update exists could not be confirmed beyond the blog index fetched on 2026-10-27.
- A GitHub issue describes "Bot API 10.2 checklists (sendChecklist)" ([hermes-agent #78745](https://github.com/NousResearch/hermes-agent/issues/78745)). This **conflicts** with the official changelog, where checklists date from Bot API 9.1 (July 2025). Treat it as mislabeled.

## 2. Which complex funnels have the highest impact?

### Takeaway
The building blocks now support three high-value funnels: (a) a channel or community, then a gated, paid entry managed by a bot; (b) a public post with in-message buttons and ephemeral overlays, then a Mini App catalog, then checkout; (c) an AI secretary bot connected to a profile or business account that handles DMs. No source gave comparative conversion data across these funnels, so ranking them is judgment, not measurement.

### Cited Findings
- **Gated recurring access**: `createChatSubscriptionInviteLink` sets a channel invite link with `subscription_price` of 1–10,000 Stars and a `subscription_period` that "must always be 2592000 (30 days)". — [Bot API reference](https://core.telegram.org/bots/api). Bots can offer "paid subscriptions to their bot – adding multiple tiers" — [Bot features](https://core.telegram.org/bots/features). In-window: `BotSubscriptionUpdated` webhooks for subscription state changes (10.2). — [changelog](https://core.telegram.org/bots/api-changelog)
- **Join screening**: Join Request Queries plus a Mini App let you "ask qualifying questions before someone gets in" (vendor summary, [Conferbot](https://www.conferbot.com/blog/telegram-bot-api-10)). Official API: `sendChatJoinRequestWebApp`, `answerChatJoinRequestQuery` and `WebAppInitData.chat_join_request_query_id` (10.1, [CONTEXT]). — [changelog](https://core.telegram.org/bots/api-changelog), [Mini Apps docs](https://core.telegram.org/bots/webapps)
- **In-feed commerce flows**: Telegram says in-message buttons + ephemeral messages enable flows "to viewing and ordering products". These messages can be posted in channels where any number of users interact, each in a separate session. — [Telegram blog 2026-08-25](https://telegram.org/blog/welcome-messages-buttons-TG-13). `replace_callback_query_message` shows a per-user ephemeral view in place of the tapped message. — [changelog](https://core.telegram.org/bots/api-changelog)
- **Onboarding**: native Welcome Messages (no bot) and the bot right `can_send_welcome_messages`. Telegram suggests using a button-flow welcome message as a quiz. — [blog 2026-08-25](https://telegram.org/blog/welcome-messages-buttons-TG-13), [changelog](https://core.telegram.org/bots/api-changelog)
- **AI DM handling**: Chat Automation lets any user connect a bot that replies on their behalf, scoped to chosen chats ([CONTEXT] May 2026). Business bots no longer require Premium (10.0). — [blog 2026-05-07](https://telegram.org/blog/ai-bot-revolution-11-new-features), [changelog](https://core.telegram.org/bots/api-changelog). The official features page lists the "business secretary that processes incoming business messages and performs only the actions allowed by the account owner" and a multi-agent "coordinator bot asks specialist bots to… process an order" as reference patterns. — [Bot features](https://core.telegram.org/bots/features)
- **Re-engagement at scale**: the free broadcast limit is about 30 msgs/s. Paid broadcasts go up to 1,000 msgs/s at 0.1 Stars per message above the free amount. Limits in groups: 20 msgs/min. — [Bots FAQ](https://core.telegram.org/bots/faq)
- **Extra creator revenue**: bot developers get 50% of Telegram Ads revenue from ads shown in their bot chat — [Bot features](https://core.telegram.org/bots/features). Channels with 1,000+ subscribers get a 50% ad revenue share, paid in Toncoin via Fragment (secondary source) — [AdminHub](https://adminhub.tools/blog/telegram-ads-cost/)
- **Brazil practice (status quo)**: Brazilian SaaS such as Telebot and Automatizze sell Pix-paid bots that "vende, cobra, libera o grupo e renova sua assinatura no automático" (sell, charge, grant group access and renew the subscription automatically) and remove members who stop paying. — [telebot.com.br](https://telebot.com.br/), [automatizzebot.com.br](https://automatizzebot.com.br/). Freelance briefs ask for VIP-group bots with Mercado Pago/Pix integration. — [99freelas](https://www.99freelas.com.br/project/bot-gerenciador-de-assinaturas-de-canais-e-grupos-vip-no-telegram-543960)

### Inferences
- A reference "complex" funnel built on in-window features: public channel post (rich message with in-message buttons) → ephemeral per-user product view → Mini App catalog (hosted on Serverless, initData pre-verified) → Stars invoice (digital) or provider/Pix (physical) → subscription invite link → `BotSubscriptionUpdated`-driven access revocation/retention messaging → Community linking the paid channel and support group → ephemeral welcome + AI guest/secretary bot for support.
- In Brazil the dominant real-world pattern (VIP group + Pix) sits in tension with the Stars-only rule for digital goods (see Q5). The Pix flows typically run outside Telegram's payment UI.

### Gaps
- No case study with measured conversion or retention for ephemeral/in-message-button funnels was found; the features are too new (Jul–Aug 2026).
- No public stats from Telebot, Automatizze or similar providers on GMV, churn or the number of Brazilian VIP groups were found.

## 3. Evidence of conversion, retention or revenue; size of Brazil's user base and typical business uses there

### Takeaway
Telegram-level monetization is large but known mainly from 2025 investor leaks. Brazil-specific evidence points to a **shrinking, less engaged** Telegram base (57% install penetration in Jan 2025, down from 65% in 2022, with daily use falling). That means Telegram in Brazil is a niche channel (VIP groups, infoproducts, deals and promos communities), not a mass customer-service channel like WhatsApp.

### Cited Findings
- **Brazil penetration**: 57% of Brazilian smartphone owners had Telegram installed in Jan 2025, down from 63% a year earlier. Users who open it daily or almost daily fell from 50% to 38%; those who never or almost never open it rose from 18% to 25%. For comparison, WhatsApp was at 99%. Sample: 2,099 respondents, Jan 15–30 2025, ±2.1 pp. — [Mobile Time, 2025-02-27](https://www.mobiletime.com.br/noticias/27/02/2025/telegram/)
- Historical trend: 13% (2019) → 27% (Jan 2020) → 45% (Jan 2021) → 60% (Jan 2022). — [Telecompaper, 2022-02-24](https://www.telecompaper.com/news/telegram-reaches-60-of-brazilian-smartphones--1415229). It then went 66% (Aug 2023) → 63% (Jan 2024). — [Poder360](https://www.poder360.com.br/tecnologia/telegram-tem-queda-de-usuarios-pela-1a-vez-no-brasil/)
- June 2026 Super Panorama: WhatsApp is on the home screen of 64.8% of Brazilian smartphones, up from 53% in 2025. The growth is attributed to brand-to-consumer messaging and authentication tokens. Telegram's figure was not given in the article. — [Mobile Time, 2026-06-09](https://www.mobiletime.com.br/noticias/09/06/2026/whatsapp-super-panorama/). A Mobile Time column calls the Oct 2026 presidential race "a eleição dos canais de WhatsApp" (the election of WhatsApp channels), with no comparable Telegram role mentioned in the snippet. — [Mobile Time, 2026-10-13](https://www.mobiletime.com.br/colunistas/13/10/2026/canais-de-whatsapp/)
- **Telegram global revenue [CONTEXT]**: H1 2025 revenue was $870M (+65% YoY from $525M), with an operating profit of about $400M and a net loss above $220M due to the Toncoin writedown. Advertising was $125M in H1 2025, and the full-year 2025 target was $2B (FT via Cointelegraph/Yahoo). — [TradingView/Cointelegraph](https://www.tradingview.com/news/cointelegraph:01e9ad089094b:0-telegram-revenue-jumps-to-870m-in-h1-2025-2b-full-year-target-ft/), [Yahoo Finance](https://finance.yahoo.com/news/telegram-revenue-surges-65-870m-160000131.html). About one-third of H1 2025 revenue ($300M) came from Toncoin-related deals. — [FT](https://www.ft.com/content/26c18637-667f-498c-99e2-5c757702121b). 2024: first annual profit of $540M on about $1.4B revenue. — [MLQ summary of FT](https://mlq.ai/news/telegram-posts-first-annual-profit-of-540-million-eyes-ipo-amid-legal-challenges/)
- Statista tracks monthly Telegram IAP revenue through Aug 2026, but the figure is paywalled. — [Statista](https://www.statista.com/statistics/1342640/telegram-in-app-revenue/)
- TechTimes claims "more than 10 million active bots" (attributed to a secondary blog, so low reliability). — [TechTimes](https://www.techtimes.com/articles/320758/20260716/telegram-serverless-ships-one-deploy-command-your-bot-data-never-leaves-telegram.htm)
- Typical Brazilian business uses: paid VIP groups and channels with Pix billing bots (sales and subscription bots, content creators, mentoring and "clubes VIP"). — [Telebot](https://telebot.com.br/), [Automatizze](https://automatizzebot.com.br/), [YouTube tutorial (PT)](https://www.youtube.com/watch?v=AbrCdV_8Ekg)

### Inferences
- For a Brazilian business, Telegram makes most sense for **creator/infoproduct communities and paid groups** and for developer- or crypto-adjacent audiences. Mass-market customer service and commerce in Brazil remain on WhatsApp.
- The decline in daily usage weakens retention economics for Telegram-only funnels in Brazil. Pairing Telegram communities with WhatsApp or email re-engagement is likely necessary (inference).

### Gaps
- No 2026 edition of the Mobile Time/Opinion Box messaging survey with a Telegram figure was found (the Feb 2025 edition is the latest confirmed). Telegram's 2026 Brazil penetration is **unknown**.
- No full-year 2025 or H1 2026 Telegram financials were found in reliable sources (only H1 2025 leaks).
- No Brazil or LatAm case study with conversion or retention numbers for Telegram Stars, Mini Apps or Business bots was found.

## 4. What makes an implementation high-barrier?

### Takeaway
The technical barrier lies in security-correct Mini App auth (initData HMAC or Ed25519 third-party validation, plus same-origin enforcement since Jul 20, 2026), payment correctness (pre-checkout and successful_payment handling, refunds, subscription-state webhooks, /paysupport), multi-surface orchestration (ephemeral + rich + business connections + communities), and rate-limit-aware broadcasting. Serverless lowers the hosting and auth barrier but adds lock-in.

### Cited Findings
- `initData` must be validated on the server ("WARNING: Validate data from this field before using it"). `initDataUnsafe` "should not be trusted". Third parties can verify the `signature` with Telegram's Ed25519 public keys (production key `e7bf03a2…242d`) without the bot token and should check `auth_date` freshness. — [Mini Apps docs](https://core.telegram.org/bots/webapps)
- Cross-origin protection for Mini App methods became mandatory by default on 2026-07-20. Opting out shifts responsibility to the developer. — [changelog](https://core.telegram.org/bots/api-changelog)
- Stars payment flow: send an invoice with currency `XTR`, then handle `pre_checkout_query` → `answerPreCheckoutQuery` → `successful_payment`. Store `telegram_payment_charge_id` for refunds (`refundStarPayment`). You must answer `/paysupport`. — [Stars payments docs](https://core.telegram.org/bots/payments-stars)
- Serverless endpoints verify initData automatically and reject invalid calls with 401. Constraints: no npm packages, no file byte I/O, foreign keys disabled, no documented DB export, undisclosed limits and pricing. — [Serverless docs](https://core.telegram.org/bots/serverless); [TechTimes](https://www.techtimes.com/articles/320758/20260716/telegram-serverless-ships-one-deploy-command-your-bot-data-never-leaves-telegram.htm)
- AI agent UX now requires handling streaming drafts, `can_stop`, and `MessageGenerationStopped`, which means cancelling model work when a user presses Stop. — [changelog 10.3](https://core.telegram.org/bots/api-changelog), [Bot features](https://core.telegram.org/bots/features)
- Business-account automation needs granular business-bot rights (e.g., `can_transfer_stars`, `can_view_gifts_and_stars`). — [Bot API reference](https://core.telegram.org/bots/api)
- TON in Mini Apps: under the ToS, a Mini App that issued a TON-based token listed on a licensed exchange may direct users to that exchange, subject to regulations; other crypto promotion is restricted. — [Bot Developer ToS](https://telegram.org/tos/bot-developers)

### Inferences
- For a portfolio or demo, the most "high-barrier but showable" stack is: a Mini App with server-side initData validation (or Serverless endpoints), a Stars subscription with `BotSubscriptionUpdated` reconciliation and automatic revocation, ephemeral and in-message-button flows in a group or Community, and an AI bot with stoppable streaming.

### Gaps
- No public benchmark of build effort or cost for these stacks was found.

## 5. What are the constraints and risks?

### Takeaway
Digital goods sold inside Telegram apps must use Stars (Apple and Google rules), which conflicts with Brazil's Pix-based VIP-group norm. Broadcast and group rate limits cap blast-style marketing. Brazil has a history of court-ordered Telegram suspensions. Serverless adds privacy and lock-in risk.

### Cited Findings
- "Your bot or mini app must use Telegram Stars for the sale of digital goods and services inside Telegram apps, regardless of any other web portals… you may have set up outside". Telegram "cannot display your bot or mini-app to mobile users" that sell digital goods via other currencies or third-party providers. Physical goods may use other providers. — [Stars payments docs](https://core.telegram.org/bots/payments-stars); same rule in [Bot Developer ToS](https://telegram.org/tos/bot-developers)
- Rate limits: about 1 msg/s per chat, 20 msgs/min in groups, about 30 msgs/s for broadcasts (paid broadcasts up to 1,000/s at 0.1 Stars per extra message). — [Bots FAQ](https://core.telegram.org/bots/faq)
- Brazil regulatory history [CONTEXT]: on 2022-03-17/18, STF Justice Alexandre de Moraes ordered Telegram suspended nationwide for not complying with court orders. Telegram then complied and apologized. — [STF](https://noticias.stf.jus.br/postsnoticias/ministro-alexandre-de-moraes-da-prazo-para-telegram-cumprir-integralmente-determinacoes-do-stf/), [BBC Brasil](https://www.bbc.com/portuguese/articles/cvgr0p67p65o)
- Data and privacy: bot messages are not end-to-end encrypted. Serverless places logic and data on Telegram infrastructure. After Durov's 2024 arrest, Telegram's data disclosures to French authorities rose sharply (673 in Q4 2024 per TechTimes' cited source). — [TechTimes](https://www.techtimes.com/articles/320758/20260716/telegram-serverless-ships-one-deploy-command-your-bot-data-never-leaves-telegram.htm)
- Platform dependency: Communities and ephemeral messages are new (Jul 2026), and outdated clients show a placeholder in place of new features. — [blog 2026-08-25](https://telegram.org/blog/welcome-messages-buttons-TG-13). The Rich Text Editor (manual) is Premium-only. — [blog 2026-07-14](https://telegram.org/blog/communities-editor-invisible-messages)

### Inferences
- Brazilian VIP-group sellers using Pix inside a bot for digital content are, on Telegram's stated policy, at risk of having the bot hidden on mobile. A compliant design is Stars inside Telegram, or an external web checkout that is not promoted inside the app (to be verified against the ToS).
- LGPD obligations apply to any bot storing Brazilian users' data. Serverless's lack of export and retention controls complicates compliance (inference; not legally verified).

### Gaps
- No 2025–2026 Brazilian court action specifically against Telegram was found in this search (the search returned only 2022 items). Election-period (Oct 2026) TSE measures involving Telegram were not verified.
- Stars-to-BRL pricing and the developer reward rate were not verified in this pass.
