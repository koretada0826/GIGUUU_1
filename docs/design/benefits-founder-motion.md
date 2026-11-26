# Benefits president handoff — 2026-10-22

Follow-up: the central text bubble and comment gestures were added later the same day. See `benefits-founder-comments.md` for the current text-only behavior. The verification below records the earlier handoff implementation.

The robot in `index.html#telemo-core` is replaced by the existing mini-president asset. When this section enters the middle band of the viewport, the existing floating guide sinks below the window over 560ms. After 580ms, the center character rises from below the visible window and settles into the original stage. The center stays present and the floating guide stays hidden/inert while the section is active. Outside the section the center hides and the floating guide returns, preserving its prior collapsed, motion and inert state.

The center portrait is a keyboard-accessible replay button. Arrival takes 900ms; the eight-frame hand wave runs twice over 2200ms and then returns to the static pose. OS reduced motion and the existing guide's motion-pause setting display a static portrait. A failed animation asset also leaves the static portrait visible.

## Scope and assets

- The only replaced HTML block is `.telemo-benefits__character` inside `#telemo-core`.
- Added `telemo-benefits-founder.css` immediately after the existing benefits stylesheet in the head, and `telemo-benefits-founder.js` at the body end. All new selectors and keyframes use the `lpsr-benefits-` prefix. Only the existing floating-guide root also receives temporary classes for the requested handoff.
- No shared concierge CSS/JS files were modified. The six cards, their copy, anchors, caption, stage geometry and other sections remain unchanged. `output/benefits-founder/scope-verification.json` records matching SHA-256 hashes after excluding the character replacement and the two dedicated resource additions.
- Reused `assets/concierge/president-cutout/poster.webp` (256×384) and `wave.webp` (2048×384, 8 frames). These are the existing 2.5D president assets derived from `president-mini-v1.png`. No new image generation or third-party assets were needed. The robot used by the separate comparison section is retained.

## Verification

- `output/benefits-founder/verification.json`: all 10 cases passed. Browser viewports: 1440×1100, 1920×900, 768×1000, 390×1000 and 320×1000. Tested the sink/arrival sequence, single-character presentation, frame advancement, finite motion, click/Enter replay, restarting during playback, restoring the guide, and cancelling a handoff on rapid scrolling.
- OS reduced motion, the guide's existing pause setting, and an intentionally unavailable wave asset were checked separately. The static portrait remains available.
- A delayed animation load followed by hiding/returning to the tab resumes the pending arrival. Changing the OS preference during playback immediately stops motion and shows the static center portrait.
- No horizontal overflow, JavaScript/Console errors or missing resources in the five normal viewport checks. The asset-failure case intentionally aborts the wave request.
- The original and updated desktop character blocks both measure 232×303.78125 CSS pixels. All six cards retain identical text.
- Visually reviewed `handoff-section-1440.png`, `handoff-section-390.png` and `handoff-section-320.png`. The final images show the center president with the right-hand floating guide absent. `sinking-1440.png` and `arriving-1440.png` record the transition stages. Fixed navigation remains present in these browser captures.
- `node --check telemo-benefits-founder.js` and `git diff --check` pass. No form submission, publishing, deployment or merge performed.

Result: passed.
