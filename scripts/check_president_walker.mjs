import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

function boot({ width = 1280, height = 900, reduced = false, failedAssets = false, controls = true } = {}) {
  const callbacks = new Map();
  const requestedImages = [];
  const timers = new Map();
  let next = 1;
  const node = () => ({ dataset: {}, events: {}, attrs: {}, textContent: '', hidden: false, addEventListener(k, fn) { this.events[k] = fn; }, setAttribute(k, v) { this.attrs[k] = v; } });
  const avatar = node(), motion = node(), guide = node();
  const classes = new Set(), styles = {}, storage = {};
  guide.dataset.section = 'hero';
  guide.classList = { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x), toggle(x, on) { on ? classes.add(x) : classes.delete(x); } };
  avatar.classList = { toggle() {} };
  guide.querySelector = x => x.includes('avatar') ? avatar : controls ? motion : null;
  guide.getBoundingClientRect = () => ({ width: Math.min(340, width - 24), height: classes.has('is-collapsed') ? 32 : 260 });
  guide.matches = () => false;
  guide.style = { setProperty(k, v) { styles[k] = v; } };
  const media = { matches: reduced, addEventListener() {} };
  const events = {}, documentEvents = {};
  const document = { querySelector: () => guide, documentElement: { clientWidth: width }, addEventListener: (k, fn) => documentEvents[k] = fn };
  const window = { addEventListener: (k, fn) => events[k] = fn };
  class Image {
    set src(value) { requestedImages.push(value); queueMicrotask(() => failedAssets ? this.onerror() : this.onload()); }
  }
  vm.runInNewContext(readFileSync(new URL('../telemo-walker.js', import.meta.url), 'utf8'), {
    document, window, Image, innerHeight: height, URLSearchParams, location: { search: '' },
    matchMedia: q => q.includes('reduced') ? media : { matches: width <= 640 },
    sessionStorage: { getItem: k => storage[k], setItem: (k, v) => storage[k] = v },
    requestAnimationFrame: fn => { const id = next++; callbacks.set(id, fn); return id; },
    cancelAnimationFrame: id => callbacks.delete(id), performance: { now: () => 0 },
    setTimeout: fn => { const id = next++; timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id),
  });
  return { guide, avatar, motion, classes, styles, callbacks, storage, media, requestedImages,
    section(id) { guide.events['telemo:guide-comment']({ detail: { id } }); },
    arrive() { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(fn => fn(4000)); },
  };
}
const loaded = async () => { await new Promise(resolve => setImmediate(resolve)); };

const desktop = boot(); await loaded();
assert(!desktop.classes.has('is-roaming'));
assert.equal(desktop.styles['--guide-x'], undefined);
assert(!desktop.requestedImages.some(x => x.endsWith('/walk.webp')));
desktop.section('telemo-how');
assert.equal(desktop.avatar.dataset.state, 'talk');
assert(!desktop.classes.has('is-travelling'));
assert.equal(desktop.callbacks.size, 0);
desktop.motion.events.click();
assert.equal(desktop.avatar.dataset.state, 'still');
assert.equal(desktop.storage['telemo-guide-motion'], 'paused');
assert.equal(desktop.callbacks.size, 0);

const mobile = boot({width: 390, height: 680}); await loaded();
mobile.section('telemo-how');
assert.equal(mobile.styles['--guide-x'], undefined);
assert.equal(mobile.callbacks.size, 0);
assert.equal(mobile.styles['--guide-y'], undefined);

const reduced = boot({reduced: true}); await loaded();
reduced.section('telemo-how');
assert.equal(reduced.avatar.dataset.state, 'still');
assert.equal(reduced.callbacks.size, 0);
assert(reduced.motion.disabled);

const failure = boot({failedAssets: true}); await loaded();
assert(!failure.classes.has('has-walker'));
assert(failure.motion.hidden);

const noControls = boot({ controls: false }); await loaded();
assert(noControls.classes.has('has-walker'));
noControls.section('telemo-how');
assert.equal(noControls.avatar.dataset.state, 'talk');
const noControlsReduced = boot({ controls: false, reduced: true }); await loaded();
assert(noControlsReduced.classes.has('is-motion-paused'));
assert.equal(noControlsReduced.avatar.dataset.state, 'still');
const noControlsFailure = boot({ controls: false, failedAssets: true }); await loaded();
assert(!noControlsFailure.classes.has('has-walker'));
console.log('PASS: fixed position, no walking frames, in-place gestures, pause, reduced motion, fallback, absent controls.');
