# Muhamad Fahrez Bukhori — Portfolio

Personal portfolio featuring electrical engineering, robotics, hardware design, projects, experience, and certifications.

Website: https://resberg.github.io/

## Run locally

Run `python -m http.server 4173` in the repository root, then open http://localhost:4173.

Built with HTML, CSS, and JavaScript. No build dependencies. Scroll-driven 3D motion supports reduced-motion preferences and an animation pause control.

## Edit content

- `index.html`: profile, experience, certificates, gallery.
- `content.js`: project descriptions.
- `app.js`: contact/profile configuration and interactions.
- `style.css`, `content.css`, `spatial.css`, `spatial.js`: appearance and motion.
- `assets/`: photos and certificate documentation.

GitHub Pages serves branch `main` from `/ (root)`.

## Journey layout and mobile

The portfolio now follows seven stops: introduction, background/skills, experience, projects, certifications, services, and collaboration. `journey-update.css` contains mobile comfort fixes; `journey-update.js` drives chapter position, journey progress, and the PLA price estimator. Native scrolling is preserved. The desktop 3D project stage is limited to screens at least 901px wide and 650px tall; phones and tablets use normal card flow.

3D printing PLA is listed at Rp500/gram, as provided by the portfolio owner. The estimator multiplies user-entered weight by this rate and does not place an order or collect payment. Consultation uses the provided public email.

Illustrations from CaptExcellent/kits-library-assets (Kitbitz) are included under `assets/kitbitz`. See LICENSE.md and SOURCES.md in that folder. They are decorative illustrations, not photos of the owner's work or equipment.
