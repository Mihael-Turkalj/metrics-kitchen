# Metrics Kitchen: ad-metric recipes (Meta Ads Manager + Google Ads)

Researched 2026-09-30. Structured data: `src/data/metrics.json` (22 ingredients, 2 spices, 35 metrics: 17 Meta, 18 Google).

**Method.** Every formula was read from the platform's own help page on the date above.

- **Meta Business Help Center pages** build their content with JavaScript, so a plain fetch gets only the page title. They were read in a real browser (Playwright/Edge).
- **Google Ads Help** was read the same way.
- **Google Ads API field reference.** Official Google developer documentation, used only to cross-check where the Help Center gives no equation or contradicts itself.
- **No third-party sites** were used as a source for any formula.

**Legend.**
- **POT:** the numerator.
- **STRAINER:** what you divide by.
- **SPICE:** a constant multiplier. ×100 turns a fraction into a percentage; ×1000 turns a per-impression cost into a per-thousand cost.
- **Derived:** the platform describes the metric only in words, and the equation was written from that description.
- **UNVERIFIED:** could not be confirmed from an official page.

---

## Sources

### Meta Business Help Center: metrics in the JSON
1. CPM (cost per 1,000 impressions): https://www.facebook.com/business/help/753932008002620
2. Cost per 1,000 Meta Accounts reached: https://www.facebook.com/business/help/1461718327429941
3. Cost per click (all): https://www.facebook.com/business/help/560163334110364
4. CPC (cost per link click): https://www.facebook.com/business/help/683065845109838
5. Cost per unique (link) click: https://www.facebook.com/business/help/1654277868148371
6. CTR (all): https://www.facebook.com/business/help/928745330472862
7. CTR (link click-through rate): https://www.facebook.com/business/help/877711998984611
8. Unique CTR (link click-through rate): https://www.facebook.com/business/help/1641651316083156
9. Frequency: https://www.facebook.com/business/help/1546570362238584
10. Cost per result: https://www.facebook.com/business/help/762109693832964
11. Result rate: https://www.facebook.com/business/help/856603834384968
12. Cost per purchase: https://www.facebook.com/business/help/2057725494492853
13. Cost per lead: https://www.facebook.com/business/help/999694013547805
14. Cost per (15-second) ThruPlay: https://www.facebook.com/business/help/1796060333844808
15. Purchase ROAS: https://www.facebook.com/business/help/274294333328345
16. Average purchases conversion value: https://www.facebook.com/business/help/482313771081200
17. Cost per post engagement: https://www.facebook.com/business/help/1514627528773502

### Meta Business Help Center: ingredients
18. Amount spent: https://www.facebook.com/business/help/1406571646230212
19. Impressions: https://www.facebook.com/business/help/675615482516035
20. Reach: https://www.facebook.com/business/help/710746785663278
21. Clicks (all): https://www.facebook.com/business/help/787506997938504
22. Link clicks: https://www.facebook.com/business/help/659185130844708
23. Unique link clicks: https://www.facebook.com/business/help/491429337684346
24. Results: https://www.facebook.com/business/help/611432918970668
25. Purchases: https://www.facebook.com/business/help/826924984184747
26. Purchases conversion value: https://www.facebook.com/business/help/1736088569845993
27. Leads: https://www.facebook.com/business/help/431390884009671
28. 15-second ThruPlays: https://www.facebook.com/business/help/471190536725647
29. Post engagement: https://www.facebook.com/business/help/735720159834389

### Meta Business Help Center: other pages used
30. About metrics being removed (Oct 2024 unique-metric removals): https://www.facebook.com/business/help/1695754927158071
31. Video average play time: https://www.facebook.com/business/help/1794520550789165
32. About engagement rate ranking: https://www.facebook.com/business/help/2351270371824148
33. Ad recall lift rate: https://www.facebook.com/business/help/1250464571636086
34. Outbound CTR: https://www.facebook.com/business/help/229718404167277
35. Unique CTR (all): https://www.facebook.com/business/help/606374679466768
36. Cost per 6-second ThruPlay: https://www.facebook.com/business/help/847129791388082
37. Cost per 2-second continuous video play: https://www.facebook.com/business/help/1427122650664596
38. Cost per website purchase: https://www.facebook.com/business/help/376991189159105
39. Cost per landing page view: https://www.facebook.com/business/help/1073011758268493
40. In-app purchase ROAS: https://www.facebook.com/business/help/1848669175353398

### Google Ads Help
41. Average cost-per-click (Avg. CPC): https://support.google.com/google-ads/answer/14074
42. Cost-per-thousand impressions (CPM), a bidding definition: https://support.google.com/google-ads/answer/6310
43. About columns in your statistics table (Avg. CPM, Cost, Invalid clicks / Invalid click rate, Impression share): https://support.google.com/google-ads/answer/2454071
44. Clickthrough rate (CTR): https://support.google.com/google-ads/answer/2615875
45. Conversion rate: https://support.google.com/google-ads/answer/2684489
46. Average CPA: https://support.google.com/google-ads/answer/6396841
47. Understand your conversion tracking data (Cost / conv., Conv. rate, Conv. value / cost, Value / conv., All-conv. variants): https://support.google.com/google-ads/answer/6270625
48. Conversion value per cost: https://support.google.com/google-ads/answer/13405059
49. View performance across campaign types (Interactions, Interaction rate, Average cost): https://support.google.com/google-ads/answer/6162977
50. Interactions: https://support.google.com/google-ads/answer/6281923
51. About engagements reporting (Engagements, Engagement rate, Avg. CPE): https://support.google.com/google-ads/answer/6156146
52. About YouTube ads and view metrics (TrueView views, TrueView view rate): https://support.google.com/google-ads/answer/2375431
53. TrueView view rate: https://support.google.com/google-ads/answer/6293479
54. About YouTube's cost-per-view (CPV) bidding: https://support.google.com/google-ads/answer/2472735
55. Cost-per-view (CPV): https://support.google.com/google-ads/answer/2382888
56. About impression share: https://support.google.com/google-ads/answer/2497703
57. About top and absolute top metrics: https://support.google.com/google-ads/answer/7501826
58. Invalid clicks: https://support.google.com/google-ads/answer/42995
59. About invalid traffic: https://support.google.com/google-ads/answer/11182074
60. Unique Reach: https://support.google.com/google-ads/answer/9012727
61. Measuring reach and frequency: https://support.google.com/google-ads/answer/2472714
62. About avg. impr. freq. per user (7 or 30 days): https://support.google.com/google-ads/answer/9507337
63. Frequency (glossary): https://support.google.com/google-ads/answer/59384
64. Return on investment (ROI): https://support.google.com/google-ads/answer/14090
65. Cost (glossary): https://support.google.com/google-ads/answer/13405060
66. Metrics available with conversions with cart data (Average order value, Revenue): https://support.google.com/google-ads/answer/16564103
67. Cost per action (glossary): https://support.google.com/google-ads/answer/13278730
68. All Google Ads terms (glossary index): https://support.google.com/google-ads/topic/24937

### Cross-check only
69. Google Ads API `metrics` field reference (v25; `latest` redirected here): https://developers.google.com/google-ads/api/fields/v25/metrics

---

## Ingredients (22)

Where one quantity exists on both platforms, it is merged into a single ingredient. Where the definitions differ, the ingredients are kept separate.

| id | Name (aka) | Platform | Unit | What it is | Src |
|---|---|---|---|---|---|
| `cost` | Cost (Amount spent) | both | currency | Total ad spend. Meta says Amount spent is the numerator of every cost-per metric. | 18, 43 |
| `impressions` | Impressions | both | count | Times an ad was shown or on screen. Invalid traffic is excluded on both platforms. | 19, 44 |
| `reach` | Reach (Meta Accounts reached; Unique users) | both | count | Deduplicated audience, estimated on both platforms. Meta uses sampled data. Google uses modelled cross-device data, reported only for Display, Video, Discovery/Demand Gen and App campaigns. | 20, 60, 61 |
| `clicks` | Clicks | Google | count | Valid ad clicks. Invalid clicks are filtered out. | 44, 43 |
| `clicks_all` | Clicks (all) | Meta | count | Any click, tap or swipe on the ad, including link, profile, reaction, comment, share and media-expand clicks. | 21 |
| `link_clicks` | Link clicks | Meta | count | Clicks on links to the advertiser's chosen destination. A subset of Clicks (all). | 22 |
| `unique_link_clicks` | Unique link clicks | Meta | count | Accounts that made a link click. Estimated from sampled data. | 23 |
| `results` | Results | Meta | count | Outcomes that match the objective. The meaning changes per campaign, and some may be modelled. | 24 |
| `purchases` | Purchases | Meta | count | Attributed purchase events. | 25 |
| `leads` | Leads | Meta | count | Attributed leads, from forms, messaging or pixel events. | 27 |
| `purchase_value` | Purchases conversion value | Meta | currency | Value of attributed purchases (purchases only). | 26 |
| `thruplays` | ThruPlays (15-second ThruPlays) | Meta | count | Video plays to completion or of at least 15 s (97% of the length for shorter videos). | 28 |
| `post_engagements` | Post engagements | Meta | count | A bundle of post actions: reactions, comments, shares, saves, 3-second plays, photo views, link clicks and more. | 29 |
| `conversions` | Conversions | Google | count | Primary conversion actions. Can be fractional, and may be modelled. | 47 |
| `conv_value` | Conv. value (Total conv. value) | Google | currency | Value of everything in the Conversions column, covering all primary actions, not only purchases. | 47 |
| `interactions` | Interactions | Google | count | The main action for each ad format: a click for text, Shopping and image ads, a TrueView view for video, an engagement for some formats. | 49, 50 |
| `engagements` | Engagements | Google | count | Format-specific engagements, such as Lightbox or Gmail expansions or watching a video ad for a set number of seconds. | 51 |
| `trueview_views` | TrueView views (Views) | Google | count | Billable YouTube view: 30 s or an interaction for in-stream; 10 s or a click for in-feed and Shorts. | 52, 54, 55 |
| `eligible_impressions` | Eligible impressions | Google | count | Google's estimate of the impressions the ads could have won. Used only inside impression-share formulas. | 56, 57 |
| `top_impressions` | Top impressions | Google | count | Search impressions among the top ads, counting at most one per search. | 57 |
| `abs_top_impressions` | Absolute top impressions | Google | count | Search impressions in the very first ad slot, counting at most one per search. | 57 |
| `invalid_clicks` | Invalid clicks | Google | count | Clicks Google filtered out as invalid. They are not billed and not in Clicks. | 43, 58, 59 |

The 22 ingredients are two above the 14–20 target. Every one is needed by a metric the brief asked for:
- `top_impressions`, `abs_top_impressions` and `eligible_impressions` are needed for the share and top-of-page metrics.
- `invalid_clicks` is needed for the invalid click rate.
- `unique_link_clicks` is needed for the unique CTR.
- `post_engagements` is needed for Meta's cost per engagement.

The cheapest way back to 20 is to drop `unique_link_clicks` (2 metrics) and `post_engagements` (1 metric).

---

## Meta Ads Manager recipes (17)

| Metric | POT | STRAINER | SPICE | Unit | Diff | Src | Notes |
|---|---|---|---|---|---|---|---|
| CPM (cost per 1,000 impressions) | cost | impressions | ×1000 | currency | 2 | 1 | Worked example on the page: $50 ÷ 10,000 × 1,000 = $5. |
| Cost per 1,000 Meta Accounts reached | cost | reach | ×1000 | currency | 2 | 2 | Estimated. Google has no equivalent. |
| CPC (all) | cost | clicks_all | | currency | 1 | 3 | |
| CPC (cost per link click) | cost | link_clicks | | currency | 1 | 4 | Always ≥ CPC (all), because link clicks are a subset of clicks (all). |
| Cost per unique link click | cost | unique_link_clicks | | currency | 2 | 5 | Page titled "Cost per unique click". Estimated. |
| CTR (all) | clicks_all | impressions | ×100 | percent | 2 | 6 | |
| CTR (link click-through rate) | link_clicks | impressions | ×100 | percent | 2 | 7 | |
| Unique CTR (link) | unique_link_clicks | reach | ×100 | percent | 3 | 8 | The strainer is reach, not impressions. |
| Frequency | impressions | reach | | ratio | 1 | 9 | Estimated. |
| Cost per result | cost | results | | currency | 1 | 10 | iOS 14+: results come from SKAdNetwork. Some results may be modelled. |
| Result rate | results | impressions | ×100 | percent | 2 | 11 | Meta's nearest thing to a conversion rate. |
| Cost per purchase | cost | purchases | | currency | 1 | 12 | Website and in-app variants exist (38). |
| Cost per lead | cost | leads | | currency | 1 | 13 | |
| Cost per ThruPlay | cost | thruplays | | currency | 2 | 14 | Now labelled "Cost per 15-second ThruPlay" and marked "in development". |
| Purchase ROAS | purchase_value | cost | | ratio | 2 | 15 | Cost is the strainer here. Displayed as a ratio, not a %. In-app variant exists (40). |
| Average purchases conversion value | purchase_value | purchases | | currency | 2 | 16 | Meta's version of average order value. |
| Cost per post engagement | cost | post_engagements | | currency | 2 | 17 | |

**How the ×100 was handled.** Meta's rate pages give "X divided by Y" and describe the result as a percentage (6, 7, 8, 11). The ×100 spice is how that percentage is displayed, not a separate step in Meta's formula.

## Google Ads recipes (18)

| Metric | POT | STRAINER | SPICE | Unit | Diff | Src | Notes |
|---|---|---|---|---|---|---|---|
| Avg. CPM | cost | impressions | ×1000 | currency | 2 | 43 (42) | **Derived**: described only as the average charged per 1,000 impressions. |
| Avg. CPC | cost | clicks | | currency | 1 | 41 | Strictly the cost of clicks ÷ clicks. |
| CTR | clicks | impressions | ×100 | percent | 2 | 44 | Page states "clicks ÷ impressions = CTR". |
| Avg. cost | cost | interactions | | currency | 2 | 49 | |
| Interaction rate | interactions | impressions | ×100 | percent | 2 | 49 | |
| Conv. rate | conversions | interactions | ×100 | percent | 2 | 45, 47 | Divides by interactions, not clicks. Can exceed 100%. |
| Cost / conv. | cost | conversions | | currency | 1 | 47 (46) | The glossary calls it "Average CPA". Only conversion-trackable cost counts. |
| Conv. value / cost | conv_value | cost | | ratio | 2 | 48, 47 | Google's ROAS, although the column isn't called ROAS. |
| Value / conv. | conv_value | conversions | | currency | 2 | 47 | |
| TrueView avg. CPV | cost | trueview_views | | currency | 2 | 54, 55 | **Derived** from the bidding description. The equation is from the API (69). Only view-eligible cost counts. |
| TrueView view rate | trueview_views | impressions | ×100 | percent | 3 | 52, 53 | Page states "TrueView view rate = views / impressions", counting only view-eligible impressions. |
| Engagement rate | engagements | impressions | ×100 | percent | 2 | 51 | |
| Avg. CPE | cost | engagements | | currency | 2 | 51 | **Derived** from a verbal description. The API (69) gives the same equation. |
| Search impr. share | impressions | eligible_impressions | ×100 | percent | 3 | 56 | Page states "impressions / total eligible impressions". Search Network only. |
| Impr. (Top) % | top_impressions | impressions | ×100 | percent | 3 | 57 | See the conflict under "Where Meta and Google disagree" below. |
| Impr. (Abs. Top) % | abs_top_impressions | impressions | ×100 | percent | 3 | 57 | Page states "Impressions on the absolute top/impressions". |
| Invalid click rate | invalid_clicks | clicks + invalid_clicks | ×100 | percent | 3 | 43, 59 | Summed strainer: the API (69) says "filtered + non-filtered clicks". |
| Avg. impr. freq. / user | impressions | reach (Unique users) | | ratio | 1 | 62, 60 | The equation is explicit for the 7- and 30-day versions and **derived** for the plain column. |

---

## Where Meta and Google disagree

**1. Cost naming.** Google's "Cost" and Meta's "Amount spent" are the same ingredient. Two oddities:
- Google's glossary entry for *Cost* (65) describes it as the average daily budget, which is not how the column behaves. The statistics-table page (43) defines Cost correctly, as total spend on interactions.
- Several Google averages divide only the cost that was eligible for the denominator: Cost / conv., TrueView avg. CPV and Avg. CPE. Meta always divides the whole Amount spent.

**2. Clicks.**
- Google has one `Clicks` and one CTR.
- Meta splits clicks into Clicks (all) and Link clicks (plus outbound and unique variants), and each has its own CPC and CTR.
- Meta's Unique CTR divides unique link clicks by **reach**, not impressions.

**3. Conversion rate.**
- Google: Conv. rate = Conversions ÷ **Interactions**.
- Meta has no general conversion-rate column. Its nearest, Result rate, divides by **Impressions**.
- Meta's "conversion rate ranking" is a diagnostic ranking, not a formula.

**4. Cost per conversion.**
- Google: Cost / conv. (glossary: Average CPA), per primary conversion.
- Meta: Cost per result, where the "result" changes with the campaign objective. Meta also has per-event columns: per purchase, per lead, per landing page view.

**5. ROAS.**
- Meta: Purchase ROAS = purchase value ÷ amount spent. Purchases only.
- Google: Conv. value / cost. It counts every primary conversion action and the column isn't named ROAS.
- Google's "ROI" (64) is a different, profit-based formula.

**6. Average order value.**
- Meta: Average purchases conversion value = purchase value ÷ purchases.
- Google: the official "Average order value" is Revenue ÷ Orders and exists only with cart data (66). Value / conv. is the general analogue.

**7. Frequency.**
- Both platforms use the same recipe: impressions ÷ reach.
- Google reports it only for some campaign types, over at most 92 days, and it can't be summed across rows.
- Google's glossary word "Frequency" (63) means something else: the minimum number of times a user saw the ad.

**8. Video.**
- Meta ThruPlay: at least 15 s or completion (97% for short videos). A 6-second variant also exists.
- Google TrueView view: 30 s or an interaction for in-stream; 10 s or a click for in-feed and Shorts.
- Google's view rate excludes impressions that aren't view-eligible, such as bumper and non-skippable ads.

**9. Engagement.**
- Meta "post engagement" is a broad bundle that includes link clicks and 3-second video plays.
- Google "engagement" is format-specific, such as expansions or watch time.
- Google has an Engagement rate; Meta has none, only an engagement rate *ranking*.

**10. Reach.** Meta counts Meta Accounts; older pages still say "Accounts Center accounts". Google counts modelled unique users, including co-viewing on connected TV (60).

**11. Google-only concepts.** Impression share, top and absolute-top rates, and invalid clicks. Meta filters invalid traffic out of impressions (19) but reports no invalid-click column.

**12. Conflicts inside Google's own pages.**
- **Impr. (Top) %** (57). The definition says it is the percent of *your ad impressions* shown among the top ads, but the written equation divides by *eligible impressions*.
  - The Google Ads API (69) matches the definition: "percentage of your ad impressions".
  - The absolute-top twin divides by impressions.
  - So the JSON uses `top_impressions ÷ impressions`.
- **Top and absolute-top counting** (57). Both counts include at most one (the most prominent) impression per search, so their denominator is slightly smaller than the Impressions column.

---

## Not cookable (not a simple ratio of reported quantities)

| Metric | Platform | Why | Src |
|---|---|---|---|
| Video average play time | Meta | Total play time (including replays) ÷ video plays. The pot is a duration, which isn't a reported ingredient. | 31 |
| Quality ranking / Engagement rate ranking / Conversion rate ranking | Meta | Percentile rankings against competing ads, not formulas. | 32 |
| ROI | Google | (Revenue − costs) ÷ costs. It needs a subtraction and cost of goods, and isn't an Ads column. | 64 |
| Search lost IS (budget / rank), lost top / abs. top IS | Google | Modelled estimates of lost share, not a ratio of reported quantities. | 57 |
| Avg. impr. freq. / user (7 or 30 days) | Google | For a date range, it sums rolling-window impressions per day and divides by summed rolling-window unique users. That isn't one ratio of period totals. | 62 |
| Frequency distribution (1+, 2+, 3+ …) and glossary "Frequency" | Google | Counts of users per exposure bucket, or a minimum count. Not ratios. | 61, 63 |
| Quality Score | Google | A 1–10 diagnostic rating listed among the statistics-table columns, not a ratio. | 43 |

## Cookable but left out on purpose (each needs an extra ingredient)

| Metric | Platform | Recipe | Src |
|---|---|---|---|
| Outbound CTR | Meta | Outbound clicks ÷ Impressions | 34 |
| Unique CTR (all) | Meta | Unique clicks (all) ÷ Reach | 35 |
| Cost per 6-second ThruPlay | Meta | Amount spent ÷ 6-second ThruPlays | 36 |
| Cost per 2-second continuous video play | Meta | Amount spent ÷ 2-second continuous video plays | 37 |
| Cost per landing page view | Meta | Amount spent ÷ Landing page views (estimated) | 39 |
| Cost per website purchase / In-app purchase ROAS | Meta | Channel-specific versions of cost per purchase and Purchase ROAS | 38, 40 |
| Ad recall lift rate | Meta | Ad recall lift ÷ Reach. The pot is a modelled survey estimate. | 33 |
| Search top IS / Search abs. top IS | Google | Top (or abs. top) impressions ÷ Eligible top impressions | 57 |
| Average order value | Google | Revenue ÷ Orders (cart data only) | 66 |
| Cost / all conv., All conv. rate, All conv. value / cost, Value / all conv. | Google | The same recipes as the JSON versions, with All conversions in place of Conversions | 47 |
| Conv. value / click | Google | Conv. value ÷ eligible clicks | 47 |
| TrueView view rate (in-stream / in-feed / Shorts) | Google | TrueView views ÷ view-eligible impressions for one format | 52, 69 |

**Removed by Meta.** On 30 Oct 2024 Meta removed most "unique" event metrics (unique purchases, unique adds to cart, and so on) and their "cost per unique …" columns (30). They are left out for that reason. Unique link clicks, Unique CTR (link) and Reach were **not** on the removal list, so they stay.

---

## UNVERIFIED and derived items

**UNVERIFIED**
- **Scope of Google Avg. CPM.** The Help Center says it is the average charged per 1,000 impressions "if you're using CPM bidding". Whether Google calculates the column over all cost and impressions, or only CPM-bid traffic, is UNVERIFIED. The recipe (Cost ÷ Impressions × 1,000) is derived from the description.

**Derived, not stated as an equation on a Help Center page**
- Google Avg. CPM
- TrueView avg. CPV
- Avg. CPE
- Plain Avg. impr. freq. / user
- The Clicks + Invalid clicks strainer for invalid click rate. The Help Center says only "percentage of clicks", and the summed strainer comes from Google's API field definition.

The Google Ads API was used to cross-check TrueView avg. CPV, Avg. CPE and the invalid click rate.

**Naming drift to keep an eye on**
- **Meta: "Meta Accounts".** Replaces the older "Accounts Center accounts" / "people".
- **Meta: 15-second ThruPlays.** Now split into 15-second and 6-second ThruPlays.
- **Google: TrueView views.** Previously "Views"; API v25 uses `video_trueview_views`.
- **Google: TrueView view rate.** Previously "View rate" / "VTR".
