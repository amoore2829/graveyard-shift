# Handoff: Graveyard Shift — Campy Horror Blog Homepage

## Overview
A homepage for a horror blog ("Graveyard Shift") styled as a campy, early-2000s GeoCities/Angelfire-era fan site — dark background, marquee scroller, table-ish grid layout, visitor counter, guestbook, MIDI player, webring/browser badges, and an "under construction" block.

## About the Design Files
The bundled file (`Graveyard Shift Homepage.dc.html`) is a **design reference built in HTML** — a working prototype showing intended look, layout, and interaction, not production code to paste into your app as-is. The task is to **recreate this design in your codebase's existing environment** (React, Vue, plain JS/templating, etc.) using its established patterns, routing, and components — or, if no framework/environment exists yet, pick the simplest appropriate stack (plain HTML/CSS/JS is a fine, period-accurate choice here) and implement it there.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy in the file are final — recreate pixel-perfectly. Placeholder blocks (diagonal-striped boxes) mark where real photos/GIFs go; everything else is finished.

## Page Structure (single page, top to bottom)
Outer wrapper: full-viewport black background with a dark red radial glow (`radial-gradient(ellipse at top, #150000 0%, #000 60%)`), centered content column, max width **920px**, background `#0a0a0a`, `1px solid #3a0000` border, subtle red glow box-shadow.

1. **Marquee bar** — top strip, `4px solid #ff1a1a` bottom border, black background, scrolling green (`#39ff14`) text via CSS `translateX` animation (16s linear loop): webring/guestbook/visitor-count promo copy.

2. **Header/hero** — centered, radial dark-red background panel:
   - Site title "GRAVEYARD SHIFT" in **Creepster** (Google Font), 80px, color `#ff1a1a`, text-shadow `0 0 18px #a80000`.
   - Tagline "a zine for the sleep-deprived and superstitious" in **Special Elite**, 15px, color `#39ff14`, letter-spacing 2px.

3. **Nav bar** — centered flex row, gap 28px, background `#111`, top+bottom `1px solid #39ff14` borders. Links (Courier Prime 14px, red `#ff1a1a`, hover green `#39ff14`): Urban Legends, Creepypasta, Reviews, About (anchors to #about), Guestbook (anchors to #guestbook, green by default).

4. **Two-column body** (`grid-template-columns: 2fr 1fr`, gap 22px, padding 24px 22px):

   **Left column:**
   - Featured post card: `2px solid #ff1a1a` border, padding 16px. Contains an image placeholder (220px tall, diagonal dark-red stripe pattern, labeled "photo: foggy motel hallway, door 214 ajar"), title "THE THING IN ROOM 214" (Creepster 34px, green), body copy (Courier Prime 14px, `#ccc`), byline/meta (12px, `#888`) with "read more →" link.
   - Recent Posts list: heading "◆ RECENT POSTS ◆" (Special Elite 14px, green, bottom border), 5 rows, each a flex row (title link left, category/comment-count meta right in `#666`), dotted divider between rows.
   - Categories: heading "◆ CATEGORIES ◆", 3-column grid of cards (`1px solid #39ff14`, centered, category name in Creepster 18px red, subtitle 11px grey): Urban Legends / Creepypasta / Reviews.
   - About section (`id="about"`): dashed `#444` border box, flex row — 100×100 image placeholder ("photo: site owner") + heading "◆ ABOUT THE KEEPER ◆" (green) + bio copy (13px, `#ccc`).
   - Guestbook (`id="guestbook"`): `1px solid #ff1a1a` border box, heading "◆ GUESTBOOK ◆" (red). Scrollable list (max-height 160px) of entries formatted `"message" — name` (message `#888`, name `#39ff14`). Below: a name input (optional, placeholder "name (optional)") and a message input + "SIGN →" button, both dark inputs (`#050505` bg, `#444` border, Courier Prime 12px).

   **Right sidebar** (flex column, gap 14px):
   - Visitor counter box: `1px solid #39ff14`, centered, label "SOULS TRAPPED HERE" (11px green), big 6-digit odometer number in **VT323** monospace, 30px, red, letter-spacing 5px, black background.
   - "Under construction" box: dashed red border, 🕯 emoji label, image placeholder (60px, "gif: digging construction worker").
   - MIDI player box: `1px solid #444`, "🎵 now playing:" label, track name "dead_hallway.mid" (green), transport row with ▶/⏸ toggle icon (green) + ■ + a static "volume" bar-glyph string `▓▓▓░░`.
   - Badge stack: three small bordered boxes (10px text) — "BEST VIEWED IN / NETSCAPE 4.0" (red border/text), "OPTIMIZED FOR / 800×600" (green border/text), "🔗 HORROR WEBRING 🔗 / [prev] · [random] · [next]" (red border/text).
   - "Friends of the site" box: `#444` border, two 34px-tall image-placeholder badge slots ("badge: haunted-diary.net", "badge: crypt-tv fanpage").

5. **Footer** — centered, top border `1px solid #2a0000`, grey 11px text: "© 2026 GRAVEYARD SHIFT — do not read alone. best experienced with the lights off."

## Interactions & Behavior
- **Marquee**: pure CSS animation, infinite loop, no JS needed (`@keyframes marq { from: translateX(100%); to: translateX(-100%); }`, 16s linear).
- **Blink cursor** utility class exists (`.blinker`, 1s step-start infinite opacity toggle) for any retro blinking-text accents.
- **Visitor counter**: increments by 1 on every page load/session and persists via `localStorage` (key holds an integer, e.g. starts at 6660, formatted zero-padded to 6 digits on display). No backend required for the prototype; a real deployment should move this server-side to count unique/real visits.
- **MIDI play/pause toggle**: clicking the transport glyph row flips a boolean `playing` state, swapping the displayed icon between ▶ and ⏸ (no actual audio wired up in the prototype — real build should attach an `<audio>` element or Web Audio and toggle playback on the same click).
- **Guestbook**: local component state holds an array of `{name, msg}` entries, newest first, seeded with two example entries. Typing fills controlled `draftName`/`draftMsg` fields; clicking "SIGN →" prepends a new entry (default name "anonymous" if left blank) and clears the inputs. A real build should persist entries server-side (DB) rather than in memory/localStorage, and likely add basic spam/profanity guarding.
- **Nav anchors**: "about" and "guestbook" nav links are in-page anchor scrolls to those sections' `id`s.
- No responsive/mobile breakpoints were designed — this is an intentionally fixed-width (~920px), desktop-era layout; decide with the user whether a mobile fallback is in scope before building.

## Design Tokens

**Colors**
- Background black: `#000`
- Panel background: `#0a0a0a`
- Card/box background (inputs): `#050505`
- Blood red (primary accent): `#ff1a1a`
- Deep red border/glow: `#3a0000`, `#2a0000`, `#a80000`
- Acid green (secondary accent): `#39ff14`
- Body copy grey: `#ccc`
- Muted meta grey: `#888`, `#666`, `#555`
- Border grey: `#444`, `#333` (dotted), `#2a2a2a`

**Typography**
- Display/headline: **Creepster** (Google Font) — site title, post titles, category names
- Accent/section labels: **Special Elite** (Google Font) — tagline, "◆ SECTION ◆" headings
- Counter digits: **VT323** (Google Font) — visitor counter
- Body/UI text: **Courier Prime** (Google Font), weights 400/700 — nav, body copy, meta, inputs, badges

**Spacing / Sizing**
- Content max-width: 920px
- Outer padding: 24px 12px
- Body grid gap: 22px; padding 24px 22px
- Card padding: 12–16px
- Sidebar gap: 14px

**Borders / Effects**
- Solid borders: 1–4px, colors per section above (no border-radius anywhere — sharp/square corners throughout, intentionally era-authentic)
- Box shadow: `0 0 60px rgba(255,0,0,.08)` on the outer panel only
- No drop shadows on cards/buttons (flat, table-era look)

## Assets
All imagery is placeholder — diagonal dark-red striped boxes with a text label describing the intended photo/GIF (e.g. "photo: foggy motel hallway", "gif: digging construction worker", "badge: haunted-diary.net"). Replace with real photography, a looping construction GIF, and real webring/friend-site badge images. Fonts are loaded from Google Fonts (Creepster, VT323, Special Elite, Courier Prime) — no other external assets.

## Files
- `Graveyard Shift Homepage.dc.html` — the full homepage design/prototype referenced throughout this document.
