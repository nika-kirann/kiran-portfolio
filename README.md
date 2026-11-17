# Kiran SA — Portfolio

A clean, editorial personal portfolio (dark theme, one violet accent). Plain HTML, CSS and JavaScript: no build step, no dependencies.

## Links
- GitHub: https://github.com/Kiranxer
- Instagram: https://instagram.com/justtt.nikaaa
- Website: https://kdramaheaven.in

## Files
- `index.html` — all the content (hero, about, skills, work, journey, contact)
- `style.css` — colors, layout and animations
- `script.js` — reveals, counters, cursor, tilt cards, lightbox, nav highlighting, mobile menu
- `images/` — profile photo, a background-removed cutout of it (`kiran-cutout.svg` used in the hero; `.png`/`.webp` originals also deployed), and two Free Fire profile screenshots (ME NIKA GOD on Free Fire MAX, NIKA on Free Fire India; UIDs and in-game bios masked), stored as SVG files that embed the WebP image. The Gaming section switches between the two accounts with tabs.

## How to edit
- **Text:** open `index.html` and change the words inside each section.
- **Hero role line:** edit the `hero-role` paragraph near the top of `index.html`.
- **Placeholder work cards:** in the `#work` section, find the cards marked `<!-- PLACEHOLDER -->`. Change the tag, title and text, and to show an image replace the `<span>` inside `.card-media` with `<img src="images/your-file.jpg" alt="...">` (upload the image into the `images/` folder; normal .jpg/.png/.webp files work fine). For a link, change the `<div class="card card-placeholder fade">` to `<a class="card fade" href="YOUR-LINK" target="_blank" rel="noopener">` and close it with `</a>`.
- **Colors:** change the variables at the top of `style.css` (`--bg`, `--text`, `--accent`, ...).

## Interactive effects
Cursor glow, magnetic buttons and card tilt only run on desktop mice/trackpads. All motion turns off automatically for visitors with *reduce motion* enabled.
The hero cutout floats over a violet glow; on desktop it tilts in 3D with the mouse (glow and figure move at different depths) and the glow brightens on hover. On phones it uses gentle tilt from the device orientation where available, plus scroll parallax. Click it to enlarge.

## Preview locally
Open `index.html` in your browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Deploy free on Vercel
1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New → Project** and import this repository.
3. Leave every setting as default (Framework: *Other*, no build command) and click **Deploy**.
4. Every push to `main` redeploys automatically.
