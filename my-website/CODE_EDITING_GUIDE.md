# Code editing guide

The site is organized in the `my-website` folder. Keep `index.html`, `styles.css`,
and `script.js` together there, and store the site's image assets in `images/`.

| File | Edit this when you want to change |
| --- | --- |
| `index.html` | Page text, section order, links, image paths, video links, and form fields |
| `styles.css` | Colors, layout, typography, responsive rules, image sizing, and visual effects |
| `script.js` | Navigation, animations, video previews, and contact-form behavior |
| `GoogleAppsScript.gs` | Google Sheets validation and how submissions are saved |

The CSS and JavaScript files are grouped with section headings. Search for the
section name or the selector/element you want to change. YouTube links and
their card titles are in the `SECTION 9: VIDEOS` block in `index.html`.
The ten service cards are in the `SECTION 6: SERVICES` block. Background
animation and the mobile static-background fallback are in `script.js`; keep
all `ezgif-frame-001.jpg` through `ezgif-frame-240.jpg` files in `images/` so
the background can load on mobile and desktop.

For Google Sheets deployment and updating the web app URL, see
[`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md).
