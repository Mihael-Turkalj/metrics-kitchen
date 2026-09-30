# The Metrics Kitchen

A cooking game for ad metrics. Every Meta Ads and Google Ads metric is a recipe, and you cook it from its ingredients: cost goes in the pot, impressions go through the strainer, an apple adds ×1,000, and out comes CPM. Put something in the wrong place and the soup spoils.

**Live site:** https://mihael-turkalj.github.io/metrics-kitchen/

**Status:** complete.

## How it plays

- **Pot:** the top of the formula. Everything in it adds up.
- **Strainer:** what you divide by. It adds up too, so invalid click rate is invalid clicks ÷ (clicks + invalid clicks).
- **Seasoning:** a multiplier. The apple is ×1,000 (per thousand) and the lemon is ×100 (a percentage).
- **The ticket** is the order: the metric, then the formula filling in line by line, with numbers from a made-up but consistent campaign. When the dish is done, the total counts up.
- **Wrong ingredient:** the soup turns green, flies arrive, the ticket is stamped SPOILED, and the chef explains exactly what went wrong ("Leek (Leads) isn't part of CPM at all"). Dump the pot and try again.
- **Stars:** 3 for a clean cook, minus one for each spoil and one for asking the chef, never below 1. They're saved in this browser.
- **35 recipes:** 17 from Meta Ads Manager and 18 from Google Ads, from CPM and ROAS to search impression share and invalid click rate. Each finished dish shows its definition, its caveats and a link to the platform's own help page.
- **Controls:** with a mouse, drag a food onto the stove, or click it and then click where it goes. On a phone, tap a food, then tap pot, strainer or seasoning. The stove stays on screen while you scroll the pantry. Everything works from the keyboard too.

### The chef's challenges

Six word problems from real ad work, cooked in the same kitchen. The ticket carries the question instead of a metric, and the pantry holds exactly the numbers the question gives, plus the lemon and the apple as traps.

- **Rates are seasoning.** "2% of the people who click buy" is a jar of spice that multiplies (turmeric for buying, paprika for clicking, herbs for your margin). The price of one click is a coin.
- **Any correct arrangement counts.** A product doesn't care about order, so €0.50 in the pot with 0.6% and ×1000 in the bowl is as right as 0.6% in the pot with €0.50 in the bowl. The check allows everything that still multiplies out to the answer, with one amount in the pot.
- **The solved card** shows the answer as a sentence ("At most €0.30 a click"), the sum as cooked ("€290 × 15% × 0.7% = €0.3045"), the reasoning step by step, and the name the industry uses (break-even CPC).
- **The questions:** percentage who clicked (CTR), percentage who bought (conversion rate), clicks a budget buys, cost of 1,000 impressions (CPM), euros back per euro spent (ROAS), and the most you can pay per click without losing money.

## How it was built

| | |
|---|---|
| **Approach** | The `frontend-design` plugin skill: pick one bold direction and commit to it. Here that's a 1970s cookbook kitchen: tomato enamel pot with polka dots, mustard tiles, avocado and teal, a paper order ticket. |
| **Art** | 24 foods drawn by Nano Banana Pro (via kie.ai) as two sprite sheets, the second using the first as its style reference, then background-removed and sliced into WebP. 38 credits in total (about $0.19). The pot, strainer, bowl, flames, steam, flies and sparkles are hand-written SVG, so they can animate. |
| **Formulas** | `research/metrics.md`. Every formula was read from Meta's and Google's own help pages on 30 September 2026, with the Google Ads API reference used only as a cross-check. No third-party sources. Where a platform gives only words, not an equation, the recipe says so. |
| **Stack** | Vite, React and TypeScript, with plain CSS for the loops, splashes and the dump sequence. Motion (`motion/react`) handles dragging, flight arcs, stamps and page transitions. The Web Animations API runs the one-off squashes, sloshes and flares, and the Web Audio API makes every sound effect (no audio files). |
| **Type** | Shrikhand (display), Bricolage Grotesque (text), Martian Mono (ticket and labels). |
| **Impeccable hooks** | Off |

### The motion

- **Full screen:** on desktop the kitchen fills the window with no scrolling. The stove takes whatever height is left, and the pot grows to fill it, limited by both width and height, from a 1280×720 laptop up to a 2560×1440 monitor.
- **Drag:** the card leans into the direction you throw it (its rotation follows drag velocity) and springs back if you miss.
- **The throw:** the food flies a real arc (steady across, up and down under gravity) with a fading motion trail, spinning once and shrinking to the size it will float at.
- **The splash:**
  - The food dunks under the surface, bobs back up and settles a quarter under, clipped at the waterline.
  - Rings spread and a jet shoots up. A crown of drops, in the soup's colour and the food's, flies out; a few land on the enamel and run down the outside of the pot.
  - The soup sloshes, the pot squashes, the flames flare and a puff of steam rises.
  - The value pops up out of the pot ("+ €7,283.46", "÷ 578,746", "×1,000").
  - The strainer wobbles and sheds a shower through its holes; the seasoning bowl bounces and throws up a pinch.
- **The fire:** a cast-iron burner with pan supports and two rows of gas flames, blue at the base and amber at the tips, one row behind the pot and one in front. It throws a warm glow on the pot's underside and sparks rise at the sides. It grows with every ingredient, leans up when you hover a food over the pot, roars gold when the dish is cooked, and coughs and sputters when it's spoiled.
- **Spoiled:** the pot rattles, the soup goes green, stink lines rise and three flies circle.
- **The dump (2.2 s):**
  1. A 1970s avocado pedal bin rises out of the counter and its lid swings open.
  2. The pot lifts off the flame and tips about its lip. A stream of green soup pours into the bin, the ingredients tumble in after it, and the flies follow.
  3. The pot gets two bangs on the rim to empty it, then lands back on the burner.
  4. The lid slams with a puff of stink and a jolt, and the bin sinks away.
  5. Fresh broth fills the pot and the rim glints.
  Every step has its own synthesised sound.
- **Cooked:** a ladle stirs, sparkles rise, a bell rings and the recipe card slides in with its stars popping one by one.
- **Around the kitchen:** the steam curls, the bubbles rise, and the zone labels bob when a food is picked and waiting. The recipe book opens on a slow-turning sunburst with drifting foods.
- **Reduced motion:** the flights, splashes, shakes and loops are skipped, the dump is instant, and results appear at once.

## What we learned

- **A game needs a mechanic that matches the maths.** "Add everything to the pot" can't express a division. Splitting it into pot (sum on top), strainer (sum below) and seasoning (multipliers) covers all 35 metrics with the same three moves, and a wrong move always has a precise explanation.
- **Official docs don't always give an equation.** Several Google metrics are described only in words. Recording which formulas are stated and which are derived kept the recipe cards honest.
- **Phones need a different control, not a smaller one.** Draggable cards (`touch-action: none`) that fill a phone screen leave nothing to scroll with. On touch screens the game switches to tap-to-place, and the stove sticks to the top so the pot is always in view.
- **Put derived layout in CSS variables.** The counter line has to sit under the pot's belly however tall the stove gets. Working it out from container units (the pot is a known share of the stove's width) keeps it pixel-exact on desktop and phone without JavaScript.
- **Give the game one interface, not one mode flag.** The kitchen cooks a `Dish`: its pantry, how to name and write each ingredient, what fits where, why a mistake is wrong, and what to show when it's done. A metric recipe and a word problem are two adapters to the same kitchen, so every animation and control works for both.
- **Word problems need a looser check than recipes.** A recipe has one correct placement; a word problem has several, because multiplication doesn't care about order. Checking "can this still multiply out to the answer?" instead of "is this the listed spot?" accepts every right answer and still stops every wrong one early.
- **Split a moving object from its surroundings.** To tip the pot over a bin, it had to leave the burner behind. The pot is three layers in one box: the burner and back flames behind it, the pot itself (the only layer that moves), and the front flames and effects in front. They share one coordinate system, so they line up exactly.
- **Register custom properties that hold container units.** An unregistered `--pot-w: calc(100cqw …)` is worked out wherever it is used, so inside a zone that is itself a container it silently measured the wrong box. Declaring it with `@property` as a `<length>` fixes its value where it's defined.
- **Step through long animations instead of screenshotting in real time.** Pausing every CSS animation and setting `currentTime` gives exact frames of a 2.2-second sequence, which is how the bin's size and its lid hinge were caught.
- **Test the wrong answers as hard as the right ones.** The spoil path turned up two real bugs: the chef's hint was covering the zone labels, and the SPOILED stamp hid the ticket's contents.

## Credits and notes

- Unofficial and not affiliated with or endorsed by Meta or Google. Meta and Facebook are trademarks of Meta Platforms, Inc. Google and Google Ads are trademarks of Google LLC. No platform logos are used.
- The campaign numbers are randomly generated for practice, not real data. Platform definitions change, so check the linked help page before relying on a formula for reporting.
- Food illustrations were generated with Nano Banana Pro through kie.ai for this project.

## Run it

```bash
npm install
npm run dev
```
