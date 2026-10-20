/* K7/K8 · Device frames for the parallel pages, reusing the portfolio's own
 * frames without changing them:
 * - phone:    createDeviceFrame() from /assets/showcase/device-frame.js;
 * - notebook: createMacBookFrame() from /assets/showcase/editorial-hardware.js;
 * - tablet:   createIPadFrame() from the same module.
 * Both modules import nothing and run standalone. Their styles:
 * - phone needs /assets/showcase/device-frame.css + /assets/showcase/device-premium.css
 *   (the second adds the island, side buttons and the notebook material);
 * - notebook needs /assets/showcase/device-premium.css (.rf-macbook .mbp-*);
 * - tablet: editorial-hardware.css only styles it inside #editorial, so its shell
 *   is ported to /assets/pages/devices.css (.pg-tablet .ipad-pro-*).
 * Always link /assets/pages/devices.css too (sizing for the three frames).
 * Visible text and labels say "celular", "notebook" and "tablet", never product names. */
import {createDeviceFrame} from '../showcase/device-frame.js';
import {createIPadFrame, createMacBookFrame} from '../showcase/editorial-hardware.js';

export const DEVICE_STYLES = Object.freeze({
  phone: ['/assets/showcase/device-frame.css', '/assets/showcase/device-premium.css', '/assets/pages/devices.css'],
  notebook: ['/assets/showcase/device-premium.css', '/assets/pages/devices.css'],
  tablet: ['/assets/pages/devices.css']
});

/** Phone frame; `content` is a string or a Node placed on the live screen. */
export function createPhone({label = 'Celular com a demonstração', content, tone = 'light', scheme = 'dark', time = '10:47'} = {}) {
  const frame = createDeviceFrame({label, content, tone, scheme, time});
  frame.root.classList.add('pg-phone');
  return frame;
}

export function createNotebook({label = 'Notebook com a demonstração', content} = {}) {
  const frame = createMacBookFrame({label});
  frame.root.classList.add('pg-notebook');
  if (typeof content === 'string') frame.screen.innerHTML = content;
  else if (content instanceof Node) frame.screen.append(content);
  return frame;
}

export function createTablet({label = 'Tablet com a demonstração', content} = {}) {
  const frame = createIPadFrame({label});
  frame.root.classList.add('pg-tablet');
  if (typeof content === 'string') frame.screen.innerHTML = content;
  else if (content instanceof Node) frame.screen.append(content);
  return frame;
}
