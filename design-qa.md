# Native HTML / CSS / SVG hero — 2026-10-22

Preview: http://localhost:8003/?v=code-hero#hero. Branch: `design/telemo-campaign-hero`. This supersedes the raster-art implementation below. The user's explicit request to construct the hero in code determines the medium.

The hero no longer uses a generated PNG. Its visible h1, TELEMO wordmark and balloon copy are editable HTML text. CSS text shadows create the white letter depth and soft contact shadow; an inline SVG path draws the balloon, and the existing native SVG tile supplies white stripes. The existing small president is the only bitmap in the hero experience, rendered in its separate fixed guide. No new image generation, framework, library, canvas or dependency is added. Original generated files and their prompts remain archived in `assets/hero/campaign/generation-manifest.json`.

## Visual target and comparisons

The layout reference remains the user's advertising screenshot `/var/folders/3l/38v471wx4fbbqrrv78ns5q600000gn/T/TemporaryItems/NSIRD_screencaptureui_0Fgyvf/スクリーンショット 2026-10-22 19.37.36.png` (2652 × 1342 pixels, original viewport/density unknown). It supplies the top headline / left product / right speech arrangement. White stripes, own-brand Japanese copy, small fixed president, native controls and first-view client band remain intentional user requirements; source beverage, actors, claims and branding are excluded.

The immediate implementation targets are the preceding approved white-stripe captures in `output/campaign-white-stripes/hero-1440-900.png` and `hero-390-844.png`. `output/campaign-code-hero/desktop-before-after.png` and `mobile-before-after.png` compare those to the code implementation at matching 1440 × 900 and 390 × 844 CSS viewports and equal column display widths, with aspect ratios preserved. Actual capture density is 1. State: initial hero, menu closed, compact guide bubble hidden. The original reference / live comparison is `/tmp/telemo-code-hero-reference-comparison.png`, normalized to equal 680px display widths. These boards and the 320 × 568 capture were opened and inspected.

Typography uses the site's local Noto Sans JP at weight 900, navy headline and teal emphasis. Desktop has two headline lines; mobile recomposes the same copy into four lines. Logo letters are selectable HTML with CSS depth; the code version intentionally replaces photoreal material shading with solid brand colors and clean type. The balloon retains two centered text lines, a white fill, teal outline and down-right tail. The white background is continuous and there is no raster boundary. Logo/heading/balloon separation, foreground copy, native actions and client band are preserved.

[P2, fixed] Initial mobile title/logo boxes overlapped, and the first bubble text adjustment left insufficient interior padding. Reduced/repositioned the mobile wordmark and set a balanced bubble font size. Final captures and geometry checks show separated title/logo/balloon regions, readable centered copy inside the balloon and no CTA overlap. No actionable P0/P1/P2 findings remain.

## Browser verification

`output/campaign-code-hero/verification.json` passes at 1920 × 1080, 1440 × 900, 1440 × 800, 1440 × 640, 1024 × 768, 768 × 1024, 767 × 900, 390 × 844, 375 × 667 and 320 × 568. All show one visible h1 with exact copy, live TELEMO text, no hero img/picture/canvas element, and zero generated campaign-image requests. No title/logo or logo/balloon intersection, horizontal overflow, clipped balloon text or CTA overlap occurs. The complete client band remains in the first viewport, CTAs are at least 52px tall, and the president retains its viewport position when scrolling while its comment updates. Keyboard primary CTA, contact navigation and mobile menu opening/closing pass. Heading, wordmark and balloon remain visible with JavaScript disabled. No page exceptions or failed HTTP responses occurred. Native Safari was not independently tested.

final result: passed

---

# White striped hero with continuous background — 2026-10-22

Preview: http://localhost:8003/?v=white-striped-hero#hero. Branch: `design/telemo-campaign-hero`. This report supersedes the earlier pale-rectangle hero treatment.

The latest user reference is `/var/folders/3l/38v471wx4fbbqrrv78ns5q600000gn/T/TemporaryItems/NSIRD_screencaptureui_0Fgyvf/スクリーンショット 2026-10-22 19.37.36.png` (2652 × 1342 source pixels). It guides the headline-above / product-left / speech-shape-right arrangement. The existing TELEMO adaptation keeps own-brand copy/materials and the previously requested small fixed president. White stripes replace the reference's blue grain under the user's explicit background request; reference actors, beverage, company, slogans, badge and colors are excluded from the webpage. Original screenshot CSS viewport/density are unknown.

Built-in image_gen background-extraction edits produce `assets/hero/campaign/telemo-campaign-desktop-v4.png` (1774 × 887) and `telemo-campaign-mobile-v3.png` (1122 × 1402). Both are original RGBA output with measured alpha range 0–255 (58.4% / 53.8% fully transparent). The pale paper/floor backing is removed; navy headline, 3D teal/white letters, contact shadows and opaque white balloon remain. No raster post-processing was applied. Exact prompts/references and source roles are in the adjacent `.prompt.json` files and `generation-manifest.json`. Earlier PNGs are preserved.

The hero uses one continuous white background with a subtle repeating diagonal stripe asset, including navigation/CTA space and former image margins. Therefore the stripes continue through transparent image regions without a tinted rectangular edge. No dimensions, text sizes, action targets or guide behavior changed. The requested “営業を、次のステージへ。” span is removed from the active pricing banner; its other copy is retained. Historical alternative pages are outside scope.

## Visual evidence

`output/campaign-white-stripes/desktop-before-after.png` and `mobile-before-after.png` compare matching 1440 × 900 and 390 × 844 CSS viewports respectively, normalized to equal column widths while preserving aspect ratios. Actual Chromium capture density is 1. Initial state: menu closed, hero current, compact guide bubble hidden, small president visible. The old rectangle boundary disappears; white letter extrusion/balloon remain distinct, all six letters and exact Japanese copy are readable, and desktop/mobile composition remains intact. `pricing-copy-1440.png` confirms the requested slogan is absent.

The reference/live full-view composition board is `/tmp/telemo-white-stripes-reference-layout-comparison.png`, both inputs displayed at 680px width with preserved aspect ratios. It was opened and compared along with the desktop/mobile before/after boards and pricing capture. Differences in palette, own-brand content, portrait scale, two-line headline, native navigation/buttons and visible client band are intentional user requirements. The latest adaptation preserves the same large headline, left product and right speech-shape hierarchy. No actionable P0/P1/P2 findings remain.

## Verification

`output/campaign-white-stripes/verification.json` passes at 1920 × 1080, 1440 × 900, 1024 × 768, 390 × 844, 375 × 667 and 320 × 568. Correct transparent source variants decode; white base and stripe asset are active; the client band remains fully inside the first viewport; deleted slogan is absent; no horizontal overflow, page exceptions or HTTP failures occur. Guide coordinates/dimensions match the preceding approved version, and remain fixed when scrolling to audio demos while the comment changes. Previously verified keyboard/menu/form navigation behavior is unchanged. Native Safari was not independently tested.

final result: passed

---

# Fixed mini-president with section comments — 2026-10-22

Preview: http://localhost:8003/?v=fixed-president-comments#hero. Branch: `design/telemo-campaign-hero`. This supersedes the earlier removal of the floating president.

The existing small president now follows the page at a fixed viewport position, with the same initial size/position as the approved hero. A hidden, image-free hero anchor preserves the responsive placement; the fixed portrait measures that anchor on initialization and resize, and never moves in response to scrolling. The portrait stays still. Only the compact text bubble changes when the current section changes, using existing copy. While the hero is current, its existing large balloon is used and the compact bubble is hidden. No booking button, narration, timed text rotation or avatar sprite animation is added to the fixed guide.

The benefits section retains its separate center president/comments. Its handoff code skips a guide explicitly configured to stay fixed, so it cannot hide or move the floating portrait. The bubble has no pointer interaction and does not block controls beneath it. The mobile menu hides the guide while open. Existing hero artwork, logo separation, first-view client band, section copy and CTA links are preserved.

`output/campaign-fixed-president/verification.json` passes at 1920 × 1080, 1440 × 900, 1024 × 768, 390 × 844, 375 × 667 and 320 × 568. Avatar viewport coordinates and dimensions remain identical across audio demos, founder, benefits and contact; section comments change and stay inside the viewport. The guide stays visible through the benefits section, the center president still arrives, returning to the hero hides the duplicate compact bubble, mobile-menu hiding and reduced-motion stillness pass. The initial portrait matches its hero anchor, the full client band still fits above the fold, and no horizontal overflow, page exceptions or HTTP failures occurred. Syntax checks pass for all three changed/new JavaScript files.

Actual Chromium captures use deviceScaleFactor 1: `hero-1440.png`, `hero-390.png`, `listen-1440.png`, `listen-390.png` in that output directory. Desktop hero and desktop/mobile scrolled views were opened and inspected. The compact bubble can overlay page content as expected for this requested floating guide; pointer events pass through it. No actionable P0/P1/P2 findings remain. Native Safari was not independently tested.

final result: passed

---

# Desktop wordmark / balloon separation — 2026-10-22

Preview: http://localhost:8003/?v=wordmark-left-gap#hero. Branch: `design/telemo-campaign-hero`.

The desktop hero now uses `assets/hero/campaign/telemo-campaign-desktop-v3.png` (1774 × 887), edited with built-in image_gen from the approved v2 asset. The 3D TELEMO group moves left and becomes slightly smaller; all six letters, including the complete O, have clear pale background space before the speech balloon. The headline, balloon copy/position, palette and canvas remain visually consistent. Exact edit prompt and references are in `telemo-campaign-desktop-v3.prompt.json`; previous assets are preserved. No raster post-processing was applied. The only consuming-code change is the desktop image path in `index.html`; mobile artwork, styles, behavior, copy and later sections are unchanged.

Visual evidence: `output/campaign-wordmark-gap/wordmark-before-after.png` compares v2/v3 at equal 676px display widths. `source-render-comparison.png` compares selected v3 artwork against the live HTML first view, also at equal widths with preserved aspect ratios. Both boards were opened and inspected for all six letter shapes, visible separation from the balloon, exact Japanese text, perspective, texture and overall layout. The HTML deliberately adds native navigation/actions and the small separate president. No actionable P0/P1/P2 findings remain.

`output/campaign-wordmark-gap/verification.json` passes at 1440 × 900, 1024 × 768 and 390 × 844. Correct desktop v3 and unchanged mobile v2 assets decode at their original dimensions; the whole client-logo band remains inside the initial viewport, no horizontal overflow or floating guide is present, and no page exceptions or HTTP failures occurred. Actual Chromium captures use deviceScaleFactor 1. The prior broader responsive and interaction checks below remain applicable because geometry and behavior are unchanged.

final result: passed

---

# Hero and client logo band in the first view — 2026-10-22

Preview: http://localhost:8003/?v=clients-first-view#hero. This report supersedes the preceding height/spacing measurements. Branch: `design/telemo-campaign-hero`.

The hero now reserves space for the following client-logo band: 120px on desktop, 156px on tablet and 140px on mobile. Portrait phones of at least 540px height also constrain the artwork width using its original aspect ratio and the remaining viewport height. Short landscape phones retain normal scrolling for readable content. The existing heading, sample disclaimer and logo files remain unchanged. The hero president stays small and static within the hero, and CTAs retain their existing touch target sizes.

`output/campaign-first-view-clients/verification.json` passes at 1920 × 1080, 1440 × 900, 1440 × 800, 1366 × 768, 1440 × 640, 1024 × 768, 768 × 1024, 767 × 900, 390 × 844, 375 × 667, 320 × 700 and 320 × 568. The full logo band, copy and logo-image height fit inside the initial viewport at every tested size. No horizontal overflow, fixed president, floating guide, character/button overlap, page exceptions or HTTP failures were found. Buttons remain at least 52px high. No JavaScript, content, image assets, links or later sections changed.

Actual Chromium screenshots (deviceScaleFactor 1) are saved as `first-view-WIDTH-HEIGHT.png` in that output directory. `desktop-before-after.png` compares the live page before/after at the same 1440 × 900 CSS viewport and equal display widths. The comparison and 375 × 667 / 320 × 568 phone captures were opened and visually inspected: headline hierarchy, 3D wordmark, balloon text and native controls remain readable without distortion or clipping. No actionable P0/P1/P2 findings remain. Existing generated source/edit records and prior functional verification are preserved below. Native Safari was not independently tested.

final result: passed

---

# Small static hero president — 2026-10-22

Preview: http://localhost:8003/?v=president-top-only#hero. Branch: `design/telemo-campaign-hero`. This report supersedes the historical campaign-hero report below.

The user's latest screenshot identifies the global floating mini-president and bubble as unwanted. That aside is removed. A smaller transparent president is positioned absolutely inside the top hero, so he leaves the screen with that section. The center benefits-section president, entrance and text comments remain available. The obsolete hero visibility script is removed; `telemo-concierge.js` remains because it also initializes the existing booking panel.

## Visual evidence and intentional changes

- Built-in image_gen edit assets: `assets/hero/campaign/telemo-campaign-desktop-v2.png` (1774 × 887) and `telemo-campaign-mobile-v2.png` (1122 × 1402). The baked-in large president is removed and the existing balloon tail points down-right. Original v1 files are preserved. Exact edit prompts, references and actual dimensions are in adjacent `.prompt.json` files and `generation-manifest.json`. No raster post-processing was applied.
- Existing character asset: `assets/concierge/president-cutout/poster.webp`, 256 × 384. Desktop image width is 72–112 CSS pixels; mobile is 64px. It is static within the hero, has no pointer interaction and does not cover the CTA links. A single accessible h1 and native HTML navigation/CTAs remain.
- Current browser captures: `output/campaign-president-small/hero-{1920-1080,1440-900,1024-768,768-1024,390-844,320-700}.png`. Filenames indicate CSS viewport size. Chromium deviceScaleFactor is 1. Initial navigation is closed. `hero-section-*` captures isolate the hero. Scrolled captures at 1440 and 390px demonstrate the absence of the floating widget.
- Combined source/render boards: `desktop-comparison.png` and `mobile-comparison.png` in the same output directory. Both columns use equal display widths with preserved aspect ratios. The complete generated art is compared against the live HTML hero, which intentionally adds the small transparent president and native controls. The desktop rendering also includes navigation above the artwork. `president-size-comparison.png` compares before/after live pages at the same 1440 × 900 viewport. All three boards were opened and visually inspected.
- Fonts, Japanese text, hierarchy, pale teal texture, 3D TELEMO wordmark, existing colors, CTA labels and section order are preserved. No new claims or statistics were added. No clipping, distorted image proportions, CTA overlap or remaining actionable P0/P1/P2 findings were found in the inspected desktop/mobile views.

## Verification

`output/campaign-president-small/verification.json` passes at 1920 × 1080, 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844 and 320 × 700. At every width the hero president is inside the hero with `position: absolute`, the global concierge count is zero, the mini president leaves the viewport after scrolling, CTAs fit above the fold and horizontal overflow is zero. Correct desktop/mobile v2 assets decode successfully. Keyboard primary CTA, contact navigation/form presence, mobile menu, center president arrival/greeting/next comment, booking preparation state and reduced motion pass. No page exceptions or HTTP failures occurred. Forms were not submitted. Native Safari was not independently tested.

final result: passed

---

# TELEMO campaign hero — 2026-10-22

Preview: http://localhost:8003/?v=campaign-hero-final. Branch: `design/telemo-campaign-hero`. This local review branch includes the pending background/audio-card design branch and the latest main's deeper 3D wordmark assets. The campaign change itself is limited to `index.html#hero`, a dedicated CSS/JS link, generated hero art and QA records.

## Source and comparison evidence

- Composition reference: the user's 2048 × 1074 advertising screenshot, `/var/folders/3l/38v471wx4fbbqrrv78ns5q600000gn/T/TemporaryItems/NSIRD_screencaptureui_GATbxD/スクリーンショット 2026-10-22 18.34.43.png`. Its original CSS viewport and density are unknown. The reference is used for the headline/product/character/speech-balloon arrangement only; its actors, products, wording, logo and bright palette are not included in the page. Original-reference/adaptation comparison: `/tmp/telemo-campaign-reference-layout-comparison.png`, both normalized to the same 680px display width, preserving aspect ratio. Header position, native CTAs, own brand/copy and the single president are intentional adaptations.
- Selected desktop visual target: `assets/hero/campaign/telemo-campaign-desktop-v1.png`, 1774 × 887 pixels, 2:1. Selected mobile visual target: `assets/hero/campaign/telemo-campaign-mobile-v1.png`, 1122 × 1402 pixels. Both were generated with built-in image_gen, inspected, and kept unaltered. Exact prompts and source roles: `assets/hero/campaign/generation-manifest.json`.
- Browser captures: `output/campaign-hero/hero-1920-1080.png`, `hero-1440-900.png`, `hero-1440-800.png`, `hero-390-844.png`, `hero-320-700.png`. Filenames indicate CSS viewport size; deviceScaleFactor is 1, so screenshot pixels equal CSS pixels. State: initial hero, navigation closed, both CTAs visible, floating guide hidden while the art already contains the president.
- Same-input source/render comparisons: `output/campaign-hero/desktop-art-comparison.png` and `mobile-art-comparison.png`. Original art and actual rendered image regions are normalized to equal display widths. Desktop uses contain fitting with no clipping or stretching; mobile uses the full portrait artwork. These combined boards were opened and visually compared before passing QA.

## Comparison history and fixes

1. [P2, fixed] On the 1920 × 1080 viewport, the initial 900px hero height cap reduced the artwork to 1428px wide and left excessive side margins. Replaced the cap with the lesser of viewport height and the 2:1 artwork plus header/CTA height. The artwork now paints at 1788 × 894px and both CTAs remain above the fold. Same-viewport before/after evidence: `output/campaign-hero/wide-size-comparison.png`.
2. [P2, fixed] At 320px, the initial primary-button label wrapped to two lines. Reduced horizontal padding/gap and kept its text on one line. Primary button height is now 54px, secondary 52px; both fit. Focused, same-viewport comparison: `output/campaign-hero/mobile-cta-comparison.png`.
3. Final desktop/mobile art comparisons and full-view captures show no remaining actionable P0/P1/P2 findings. The two-pixel native-control height difference is minor and does not affect alignment or use.

## Required fidelity surfaces

- Fonts/typography: the exact original hero headline and the existing phrase “現場の知見を、AIの力に。” are part of the generated advertising art, retained as image text. The headline is also a single accessible HTML h1. Generated lettering uses a heavy, friendly Japanese gothic hierarchy. Navigation and real CTA labels retain the site's local fonts; CTA sizes are 15px desktop and 13px mobile. No text clipping, Japanese substitutions or squeezed image proportions were observed.
- Spacing/layout: large headline above the reduced 3D TELEMO wordmark, president and speech balloon on the right; mobile is a portrait recomposition. Wordmark occupies approximately 64% of the desktop artwork rather than the old full-width treatment. Header and buttons stay separate HTML. At every verified viewport, CTAs are above the fold and document horizontal overflow is zero.
- Colors/tokens: pale teal/off-white paper texture, navy headline, teal front faces, white 3D sides and white speech balloon. Existing orange primary CTA is preserved. No dark background panel or reference campaign colors are added.
- Image quality: both generated assets are loaded at their correct aspect ratios and remain original PNGs. All six TELEMO letters, the president's identity/pose, Japanese copy and balloon are legible. The original art supplies the wordmark, person and balloon; no code-drawn substitutes are used. The mobile hair/wordmark overlap is part of the selected artwork and leaves the wordmark readable.
- Copy/content: original two-line hero statement, existing CTA labels/links and existing brand message are retained. No metrics, achievements, offers or new claims are invented. HTML outside the hero is byte-identical after excluding the two dedicated CSS/JS links.

## Browser and functional verification

`output/campaign-hero/verification.json`: 1920 × 1080, 1440 × 900, 1440 × 800, 1024 × 768, 768 × 1024, 390 × 844 and 320 × 700. Responsive image selection, image decoding, no overflow, one accessible h1 and CTA touch targets of at least 52px pass. Keyboard focus/Enter on the main CTA navigates to the workflow; contact CTA reaches the existing form; mobile menu opens, navigates and closes. The floating president restores outside the hero, and the benefits-section center entrance/greeting/next-comment handoff still works. Reduced-motion hero rendering passes. No page exceptions or failed HTTP responses occurred. No form was submitted and no new audio was added.

Verification used the previously authorized Playwright browser and local Chromium captures. Native Safari was not independently verified. PNG optimization is optional follow-up polish; there are no remaining blocking findings. The prototype remains running locally for review.

final result: passed

---

# Desktop background spacing — 2026-10-22

At widths of 1024px and above, the six existing background panels alternate grid / plain: audio demos, workflow, benefits, pricing, company, contact. The pricing panel now uses its solid pale teal surface with the white paper layer. This is a panel-based interpretation of the user's requested spacing. Mobile backgrounds are preserved. Stylesheet version: `20261022d`.

Browser comparison at 1440, 1024 and 390px: section heights and positions are identical to the prior version, no horizontal overflow or page exceptions, and the mobile background images are unchanged. Desktop computed background images confirm the alternating six-panel sequence. Desktop pricing was visually inspected.

---

# Compact shared audio demo card — 2026-10-22

The three audio demos now share one white outer card with thin dividers. Each desktop row places the demo label and description beside its native audio player; mobile moves the player beneath the label. Existing HTML copy and all audio sources are byte-identical; only the stylesheet version changes to `20261022c` and the scoped CSS is updated.

Browser verification at 1440, 768, 761, 390 and 320px: all three players fit within their rows, no horizontal overflow or page exceptions, and no media errors. Desktop card-area height decreases from 779.53px to 316.53px; mobile (390px) decreases from 736.53px to 474.14px. Desktop and mobile screenshots were visually inspected. Earlier stack/background QA below describes those previous versions.

---

# Audio demo vertical stack — 2026-10-22

The three audio demo cards now use one column at every viewport width, in the existing order: 回線デモ, デリバリーデモ, MAデモ. The override is scoped to `#telemo-listen` in `telemo-movie-background.css`; its stylesheet version is updated to `20261022b`. This intentionally increases the desktop audio section height. Existing copy, audio files, card styling and backgrounds are preserved.

Browser verification at 1440, 390 and 320px: three aligned, non-overlapping vertical cards; no horizontal overflow or page exceptions. All three audio sources load without media errors. Visual desktop verification passed. The background comparison below describes the earlier background-only commit.

---

# Movie reference background study — 2026-10-22

Branch: `design/movie-background`, based on merged main `dc5d355`. Preview: http://localhost:8002/?v=movie-background#telemo-core.

The background treatment adapts the reference's fine graph paper, diagonal paper edges and alternating chapter surfaces to the existing white / pale teal palette. Original SVG grid and circle outlines are local assets. No reference images, fonts, scripts or copy are included. No gradients or new motion are added. Reference observations and source CSS fingerprint: `docs/design/movie-background-reference.json`.

Scope: the new `telemo-movie-background.css` and two SVG assets. `index.html` adds one stylesheet link at the end of the head and a class on main; removing these additions yields byte-identical HTML against the base commit. Existing CSS, JavaScript, content, links, forms, images and layout remain unchanged.

Verification: `output/movie-background/verification.json`. Browser comparisons at 1440, 768, 390 and 320px found identical section geometry, heading typography and links against main; all six benefit cards remain present and document horizontal overflow is zero. The mobile menu opens, follows the service anchor and closes. Keyboard comment advancement, normal-motion guide departure / center arrival / greeting / next comment / guide restoration, and reduced-motion display pass. The three new resources return HTTP 200, with no page exceptions or failed HTTP responses. Forms were not submitted.

Visual evidence: `output/movie-background/{1440,390}-{telemo-core,telemo-listen,telemo-plan,founder}.png`. Desktop and mobile backgrounds, paper edges and character/comment readability were visually inspected. The new branch is local only.

final result: passed

---

# Current president comments — 2026-10-22

The center president now greets visitors in a text speech bubble, advances through three comments and supports a manual next button. There is no narration feature. See `docs/design/benefits-founder-comments.md` and `output/benefits-comments/verification.json`. Earlier animation and layout QA is preserved below.

---

# Current character animation — 2026-10-22

The benefits-section robot has been replaced by the existing president with a handoff from the floating guide. See `docs/design/benefits-founder-motion.md` and `output/benefits-founder/verification.json` for the current scope and passing verification. Layout QA below predates this character-only update.

---

# TELEMO benefits layout — 2026-10-22

Scope: `index.html#telemo-core`, `telemo-benefits-study.css`, and `docs/design/telemo-benefits-reference.json`, on `design/aishift-background` only.

## Visual evidence

- Source visual truth: `docs/design/aishift-benefits-reference.png`, user-supplied desktop crop, verified intrinsic size **2896 × 1702 pixels**. The original CSS viewport and device density are unknown; the last row and mascot are cropped at the bottom.
- Source HTML/CSS: https://aishift.com/ `.worries-resolve`. Six card titles/bodies and relevant CSS declarations were extracted directly. URL, retrieval time and source hashes are in `docs/design/telemo-benefits-reference.json`.
- Desktop implementation: `output/benefits-study/desktop-1440.png`, 1440 × 989 pixels, viewport 1440 × 1100 CSS pixels, devicePixelRatio 1.
- Full-view combined comparison: `output/benefits-study/comparison-first.png`. Source and implementation are normalized to the same 1000px image width, preserving each aspect ratio. Compare the composition as an adaptation, not an exact pixel clone of an unknown viewport.
- Focused first-card comparison: `output/benefits-study/comparison-detail.png`, source and implementation cards normalized to 660px width. This verifies three rounded corners, the square lower corner, teal heading hierarchy, side rule, readable copy and spacing.
- Tablet: `output/benefits-study/width-768.png`, 768 × 1243 pixels, CSS viewport width 768, devicePixelRatio 1.
- Final mobile: `output/benefits-study/mobile-390-final.png` (390 × 1818) and `mobile-320-final.png` (320 × 1898), CSS viewport height 900, devicePixelRatio 1. Both are shown together in `mobile-comparison-final.png`.
- State: static strengths section, all six cards present, existing robot loaded and decoded. Sticky navigation and the existing floating guide are hidden **only while taking section screenshots**; they remain present in the live preview.

## Intentional adaptations

Keep TELEMO's white/pale-gray/teal tokens, local Noto Sans JP, existing 1240px content container and robot asset. Use the original four strengths plus automatic calling and support capabilities already described elsewhere on the page. Do not reuse the reference company's claims, mascot, blue branding or fonts. At tablet/mobile widths, move the heading and robot above the cards; use two columns on tablet and one on mobile. Other sections, IDs, scripts and forms remain unchanged.

## Comparison history

1. Initial full-view comparison shows the intended two card columns flanking a vertical headline and mascot, six cards in three staggered rows, and asymmetrical card corners. Differences in brand color, mascot, copy and the established content width are intentional.
2. [P2] The initial mobile primary heading was approximately the same size as card headings. Increased it from `clamp(22px, 5.8vw, 34px)` to `clamp(26px, 6.9vw, 34px)`. Re-captured 390/320px views and inspected them together; primary headings are now 26.91/26px against 23px card headings, with no clipping.
3. An initial screenshot preceded lazy-image decoding. Re-captured both final mobile images after explicitly awaiting image decoding. The robot is visible and has natural width 1145px in both final captures; this required no runtime-image change.
4. Corrected source-image metadata to its measured 2896 × 1702 pixels and regenerated the focused comparison from those dimensions. Final full-view, focused and mobile comparisons show no remaining actionable P0/P1/P2 issues.

## Verification

- Browser-rendered widths: 1440, 1100, 1024, 768, 601, 600, 390, 375 and 320 CSS pixels. Document and section horizontal overflow are zero; all section elements stay within the viewport. The vertical heading's punctuation has a 3px visible ink overhang at 1100px, with no clipping or viewport overflow.
- Main heading uses vertical-rl above 1099px and horizontal-tb below it. Body copy remains 14px; source order is preserved in the mobile stack.
- Mobile menu opens (`aria-expanded=true`), navigates to service and contact anchors, and closes (`aria-expanded=false`) after each selection. Contact form remains present. No form submission performed.
- Browser console: 0 errors, 0 warnings during verification.
- JSON parses; six source cards and six TELEMO cards are present; displayed copy matches the JSON. HTML outside the core section is unchanged except for the new stylesheet link. Both localhost servers and all new resources return HTTP 200. `git diff --check` passes.
- Native browser connection failed earlier; user approved Playwright MCP on 2026-10-22, and final visual/interaction checks above used that connection successfully.

final result: passed

---

Historical founder QA follows; it applies only to that prior section.

# Founder editorial implementation — 2026-10-14

Scope: `index.html#founder` and `founder.css`. This report covers the selected founder concept only. The prior accompaniment-section report is preserved in `output/founder-editorial/prior-design-qa.md`; its earlier limitations have not been re-audited.

## Visual evidence

- Source visual truth: `output/founder-editorial/reference.png`, 1604 × 980 pixels, first displayed Image Gen option selected by the user.
- Browser-rendered implementation: `output/founder-editorial/desktop-final.jpg`, 1604 × 1100 pixels. In-app browser, viewport 1604 × 1100 CSS pixels, devicePixelRatio 1.
- Full-view combined comparison: `output/founder-editorial/comparison.png`.
- Focused headline, biography and records comparison: `output/founder-editorial/comparison-detail.png`.
- Mobile captures: `output/founder-editorial/mobile-top.jpg`, `mobile-metrics.jpg` and `mobile-body.jpg`, 390 × 900 pixels/CSS pixels, devicePixelRatio 1.
- State: main navigation closed, founder section scrolled into view, four records present, source portrait loaded at natural width 1191px.
- Normalization: both desktop captures use the same viewport width. Crop out the existing sticky navigation and section padding; scale source/implementation content regions to the same 670px comparison width. Preserve the established 1240px content container rather than extending this section to the approximately 1400px mock container. The narrower real-site container is intentional integration with adjoining sections, not a density mismatch.
- Capture limitation: direct DOM screenshots return a blank image on this localhost surface. Native browser captures successfully show the page but are compressed and visibly softer than the source PNG. Layout and hierarchy were visually compared, and actual text, font sizes, colors, intrinsic image size and overflow were additionally inspected through the rendered DOM. Exact antialiasing is not asserted.

## Comparison history

1. First combined comparison (`comparison-first.png`): [P2] heading/metric/origin typography was less prominent than the chosen concept. Increased desktop title 48→56px, lead 21→24px, record heading 16→18px, labels 14→15px, number maximum 42→46px and origin heading maximum 34→38px. Kept mobile-specific readable sizes.
2. Re-captured at the same viewport/state and inspected the full-view and focused comparison together. Added the source biography paragraph break on wide desktop while allowing natural wrapping below 1200px. Final combined captures show the intended photo-left, text-right hierarchy, four borderless metrics, teal current-work rule and two-column origin message. No actionable P0/P1/P2 findings remain.

## Required fidelity surfaces

- Fonts/typography: existing local Noto Sans JP headings/body and Space Grotesk numbers/English. Rendered desktop title 56px/900, lead 24px/700, metrics 46px/700. Source hierarchy retained; paragraph and heading breaks adapt to the real container. Mobile title stays on one line at 390px; body remains 15px with 1.9 line height.
- Spacing/layout rhythm: portrait 360px, 56px desktop column gap; aligned four-record strip; origin separated by a thin top rule and divided into two columns. The surrounding site's shared section padding and 1240px width are retained. At narrow widths the portrait/copy stack, metrics become 2 × 2 and origin stacks.
- Colors/tokens: shared --rf-heading #0a2a44, --rf-accent #007d8c, --rf-text #34424e, --rf-border #d8e8ec on white. No dark filled boxes, card shadows or decorative icon surfaces in the redesigned section.
- Image quality/assets: reuse the existing original portrait `assets/founder/founder-portrait-ai.png`; natural ratio 1191/1320, no new raster approximation. Face, pose, hands and identity match the source. Photo remains square-cornered.
- Copy/content: retained the name/role, biography, all four exact activity/product/count associations, current operating statement and complete origin message as selectable HTML. Decorative handwritten note and explanatory record-note removed to match the selected mock. Record group has a real h3 and aria-labelledby list; portrait retains descriptive alt text.

## Verification

- Browser rendered DOM inspected at 1604, 1024, 768, 390 and 320 CSS pixels: no document horizontal overflow. The 1604/1024/320 checks also found no founder elements outside the viewport; record numbers fit their allotted widths.
- Visually inspected desktop and mobile photo, record and origin views. Mobile adaptations are inferred from the selected desktop concept; no mobile mock was supplied.
- Desktop “私たちについて” navigation tested. Mobile menu open, founder navigation and automatic menu close tested.
- In-app browser console error log: empty after the final capture.
- `git diff --check` passes. Existing unrelated workspace changes retained.
- No new runtime/dependencies or behavioral test suite needed for this static section redesign.

## Follow-up polish

P3: generated reference typography and the site's actual font rendering differ slightly; native capture compression prevents a pixel-level antialiasing verdict. The selected composition, hierarchy, palette and content are implemented. Unrelated page sections are outside this report.

final result: passed


## 2026-10-30 — Web Design Clip hero study / TELEMO reading

final result: passed

20 reference / HTML pairs were inspected in native Chrome, including desktop dialogs and mobile layouts. Source and implementation are shown together in each capture. Scoped report: [Hero study QA](output/webdesignclip-hero-20/design-qa.md). Source truth: `assets/webdesignclip-hero-20/sources.json`; evidence: `output/webdesignclip-hero-20/comparison-01.png` through `comparison-20.png` and `qa-revised.jpg`. Desktop captures: 2818 × 1662 pixels at 2× density. Mobile: 390 × 844 CSS px in responsive emulation.

Initial spacing, portrait overlap, vertical text flow and two cropped wordmarks were corrected and recaptured. Typography, spacing, colors, image quality and copy were reviewed. Search, filters, candidate save/remove, empty/reset, all 20 dialog pages and mobile concept-only enlargement were exercised. No actionable P0/P1/P2 findings remain in this board. Main-site ruby reading was separately verified in Safari (`main-reading-safari.png`).


## 2026-10-30 導入フロー：中央拡大カルーセル

final result: blocked（実画面の確認のみ）

中央の工程を拡大し、ホイール1操作・左右ボタン・キーボード・横スワイプで切り替える実装を追加。カードは白地と細い枠へ簡素化。通常時のミニ社長は下端4px＋セーフエリアに配置。

DOMイベントを使った処理テスト、JavaScript構文、HTTP 200、6枚の原文・価格と対象外HTMLの保持、git diff --check は確認済み。CUAが Native pipe startup failed で利用できず、実ブラウザでの最終表示確認は未実施。詳細は output/flow-carousel-20261030/README.md。
## 2026-11-16 導入の流れ（案2）

- Reference: user-supplied horizontal.png.
- Implementation: six equal-width cards on desktop; vertical timeline on screens 900px and below.
- Static checks: `git diff --check` passed; local CSS returned HTTP 200.
- Visual comparison: blocked because the in-app browser access host was unavailable. Desktop and mobile rendering still require visual inspection.
- final result: blocked
