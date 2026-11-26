# Design QA — TELEMO explanation

- Source visual truth: user-supplied miSignal “マイシグナルとは？” screenshot (`/var/folders/3l/38v471wx4fbbqrrv78ns5q600000gn/T/TemporaryItems/NSIRD_screencaptureui_jENwKe/スクリーンショット 2026-10-05 18.14.51.png`, 1180 × 655 px). The Financial Japan screenshot informed the more human Japanese lettering.
- Implementation: `http://127.0.0.1:4173/index.html#telemo`; Safari Computer Use captures in this conversation (the tool does not persist a screenshot path).
- Viewports and state: Safari full-screen desktop, approximately 1920 px wide, and a narrower 884 px window; TELEMO anchor shown. Source is a design reference with different copy and assets, so comparison is at the section-frame level rather than pixel-for-pixel content matching. Capture density is not normalized.

## Findings and comparison history

1. The first desktop capture showed the expected centered section title, large serif copy on the left, and a landscape visual on the right. The headline wrapped in the middle of Japanese words. Fixed with intentional line breaks; the subsequent accessibility view confirms three complete lines.
2. The first 884 px capture compressed the headline and image into narrow columns. Fixed by switching to a single column below 960 px. The subsequent Safari capture shows a readable headline, body, CTA, and image in order without horizontal overflow.

## Fidelity surfaces

- Typography: centered sans-serif section title and Japanese Mincho headline carry the reference hierarchy. The text remains real HTML. The system Mincho fallback may vary by device.
- Layout and rhythm: pale blue full-width section, generous top space, two desktop columns, and a stacked narrow layout match the reference frame.
- Color: blue-on-pale-blue treatment retains GIGUUU's brand blue and existing orange action button.
- Image: the generated TELEMO visual is a local 1672 × 939 px raster asset; the existing four process labels and “AI” remain as a caption. No miSignal-specific scientific claims or imagery are reused.
- Copy: the existing TELEMO catch, description, tags, process labels, and CTA are retained; “TELEMOとは？” is the section heading requested by the user.
- Interactions: header TELEMO navigation was clicked in Safari and scrolled to this section. CTA destination is unchanged. The local HTML, CSS, and image all returned HTTP 200.

## Residual test gap

The 390 px mobile viewport and browser console were not captured. The mobile rules were reviewed in CSS; the narrower 884 px browser capture was visually checked.

final result: passed
