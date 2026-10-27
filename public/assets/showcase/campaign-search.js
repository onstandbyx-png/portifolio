/* Search, local and conversation formats of "Campanhas e anúncios": LinkedIn,
   Google Pesquisa and Display, SEO, ChatGPT, Maps, WhatsApp (clique para
   conversar e catálogo). campaign-channels.js calls makeSearch with its shared
   helpers and merges what comes back:
   - mocks: { name: () => html } added to the mock table;
   - placements: { 'channel/placement': placement } replacing (or joining) by key;
   - channels: { channel: { benefit, art } } fields merged into the channel;
   - SCREEN: { mockName: { tema, fundo } } app theme behind the status bar;
   - AVISOS: { 'channel/placement': aviso | null } the closing banner (null removes it).
   Until a format moves here, the one in campaign-channels.js keeps playing. */
export function makeSearch() {
  return { mocks: {}, placements: {}, channels: {}, SCREEN: {}, AVISOS: {} };
}
