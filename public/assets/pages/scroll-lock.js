/* K3 · Reference-counted page scroll lock.
 * Ported to plain JS from smiile-landing src/components/scrollLock.ts (own code):
 * a menu may hand off to a dialog in the same task, so each owner releases only
 * its own lock and the page unlocks when the last owner releases. The scrollbar
 * gutter is compensated so the layout does not jump. */
const owners = new Set();
let restore;

export function lockPageScroll() {
  if (typeof document === 'undefined') return () => {};
  const owner = Symbol('scroll-lock');
  if (owners.size === 0) {
    const body = document.body, html = document.documentElement;
    const overflow = body.style.overflow, padding = body.style.paddingInlineEnd;
    const pageWidth = html.clientWidth;
    const gutter = pageWidth > 0 ? Math.max(0, window.innerWidth - pageWidth) : 0;
    if (gutter > 0 && gutter < 100) {
      const existing = parseFloat(getComputedStyle(body).paddingInlineEnd) || 0;
      body.style.paddingInlineEnd = `${existing + gutter}px`;
    }
    body.style.overflow = 'hidden';
    html.dataset.scrollLocked = 'true';
    restore = () => {
      body.style.overflow = overflow;
      body.style.paddingInlineEnd = padding;
      delete html.dataset.scrollLocked;
    };
  }
  owners.add(owner);
  return () => {
    if (!owners.delete(owner) || owners.size > 0) return;
    restore?.();
    restore = undefined;
  };
}

export const scrollLockCount = () => owners.size;
