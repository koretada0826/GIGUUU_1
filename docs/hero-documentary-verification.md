# TELEMO documentary hero verification

Scope: existing homepage hero, its dedicated CSS/JS, and local GSAP dependency. Uses the existing callcenter-hero-placeholder.jpg asset without generated visual content or layer separation.

Final camera: horizontal drift from −0.3% to +0.3%, scale 1 to 1.03 on desktop and 1.02 on mobile. Four seconds per leg, eight seconds per full cycle, with sine.inOut easing and yoyo. No per-frame scroll calculations; only transforms and entrance opacity.

Browser checks in Safari:
- Desktop screenshot: neutral photo, readable live HTML headings, two visible CTAs; no photo edge exposure observed.
- Responsive mode set to 390 × 844: photograph above copy; face/receiver and both CTAs visible. Console subsequently reported innerWidth 470, so the responsive toolbar size is not treated as an exact CSS-width measurement.
- Console: GSAP 3.12.5 loaded, image complete, camera transform nonidentity, camera active, no horizontal overflow.
- Performance sample: 90 requestAnimationFrame samples, average interval 17ms, maximum 56ms. This is a short local measurement, not a cross-device performance guarantee. Layout-shift entries summed to 0; support for that entry type was not independently verified.
- Contact CTA reached #contact. Camera tween then reported paused=true and active=false. Returning to the top restored the hero view.
- No JavaScript errors appeared in the console during these checks.

Node VM lifecycle checks passed: desktop/mobile zoom settings; intersection-driven start; hidden-document pause; pageshow resume; focus settling; observer/listener cleanup; reduced motion and missing-GSAP static fallback. Reduced motion was validated in the controller harness and CSS, not through an OS setting change.

No video-generation API, Three.js, or Blender was introduced. The photograph's existing focus falloff provides depth without cutout artifacts.

## Final integration after concurrent edits

During verification, another process updated index.html, hero-documentary.css, hero-documentary.js, and the supplied photo. The current copy (現場から、社会を動かす。), photo dimensions (1151 × 868), and full-bleed layout were retained. Animation was isolated into hero-documentary-gsap.css and hero-documentary-gsap.js, with locally served GSAP loaded first. Existing CSS entrances and camera keyframes are overridden to avoid overlapping animation controllers; the old scroll-parallax script is no longer loaded.

The final full-bleed desktop was reloaded and visually inspected in Safari. The final controller passed syntax and VM checks for eight-second cycle, desktop/mobile zoom bounds, visible/hidden pause, listener cleanup, reduced-motion static behavior, and missing-library fallback. Frame/console/contact measurements above were taken on the earlier layout with the same controller architecture, not remeasured on the final full-bleed layout. A final mobile recapture was interrupted by a user app-state change, so the earlier mobile screenshot does not establish final-layout mobile visual QA.
