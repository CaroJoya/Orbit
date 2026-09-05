# NomadSync visual verification notes

## Desktop home route
The home view rendered successfully at `http://127.0.0.1:3000/`. The left demo journey sidebar, workspace utility links, header mode switch, progress rail, intake canvas, route strip, and hero imagery were visible. The browser console showed only the standard React DevTools informational message and no runtime errors.

## Trip shelf route
The `/trips` route rendered successfully with active workspace navigation, account/activity links, the Jaipur live-trip hero, trip metrics, saved-route cards, open-demo CTA, share CTA, and mobile dock navigation. The extracted page content confirmed all intended labels and controls were present.

## Route library route
The `/explore` route rendered with mood filters, search placeholder, three route cards with save buttons, use-this-shape actions, and the intake-canvas handoff. After replacing storage-only assets, remote Unsplash imagery is now visible and no broken local image placeholder remains.

## Field guide route
The `/guide` route rendered with the connected-surfaces walkthrough, product promise card, FAQ accordion (first answer open), support handoff, release note, and live-demo return CTA. The inline N brand glyph is visible in the sidebar and header.

## Activity center route
The `/activity` route rendered with the unread signal banner, mark-all-as-read action, four activity rows, notification-hygiene card, and quick return to the live Jaipur trip.

## Profile & settings route
The `/account` route rendered with the traveler profile, route score, privacy note, settings toggles, default moods, and return-to-workspace CTA. The mobile dock remained visible on the desktop capture as intended for the responsive breakpoint styling.

## Core traveler flow
The intake CTA advanced successfully from step 01 to Route Radar. The Route Radar page showed the three day tabs, map markers, timeline, contextual assistant, live price bar, and “Keep shaping the trip” CTA. Stable Unsplash imagery loaded on the route surface after replacing unavailable `/manus-storage` assets. The browser remained free of visible runtime errors.

## Customize flow
The Route Radar CTA advanced successfully to Customize. The room-swap control changed from “Swap room” to “Upgraded” and updated the visible room price from ₹13,000 to ₹14,200, the trip total from ₹48,040 to ₹49,240, and the pricing ledger with a ₹1,200 delta.

## Checkout and digital pass
The Customize “Review trip” CTA advanced to Checkout. The visual booking CTA advanced to Digital Pass without any real payment. The pass rendered the QR voucher, track-driver action, privacy-chat action, offline-ready tile, and weather-watch “Adapt My Day” branch.

## Ripple Engine selection
The Digital Pass weather card opened the Ripple Engine. Selecting Option B changed the selected card styling and the CTA text to “Resolve with Option B”. The completion copy was then updated so A/B/C selections carry their own outcome language instead of always claiming an indoor-gallery swap.

## Final Ripple selection check
After the rebuild, jumping directly to Ripple Engine and selecting Option B correctly changed the recommended highlight and CTA text to “Resolve with Option B”. The CTA sits just below the current viewport in the browser capture, so the next verification step is a small scroll before clicking it.

## Completion state
After scrolling the CTA into view, resolving Option B advanced to Complete. The final summary correctly reads “Ripple Engine moved the weather risk” with “Outdoor trek moved to Day 3 and the driver buffer stayed protected.” Share and dual-sided review actions are visible on the completion screen.

## Operator and vendor perspectives
The operator switch rendered the resolved command center state: 12 active trips, 18.4% live margin, zero open risks, fleet map, weather-ripple summary, and dispatch activity. The vendor switch rendered the privacy relay phone, masked customer request, QR voucher, fixed ₹120 rate, confirmation/decline buttons, and command-center sync card.

## Final interaction audit
Vendor confirmation updated the local chat, operator audit log, command-center sync, and traveler-pass status. A browser warning was traced to the Route Radar start marker passing the page-level `Home` component instead of the imported `HomeIcon`; the reference was corrected to prevent recursive nested buttons.
