# Muhamad Fahrez Bukhori — Portfolio

Personal portfolio featuring electrical engineering, robotics, hardware design, projects, experience, and certifications.

Website: https://resberg.github.io/

## Run locally

Run `python -m http.server 4173` in the repository root, then open http://localhost:4173.

Built with HTML, CSS, and JavaScript. No build step. Motion uses GSAP, ScrollTrigger and Lenis (vendored in `assets/vendor/`) and falls back to a static page for reduced-motion users.

## Edit content

- `index.html`: profile, education, experience, video, certificates, contact.
- `content.js`: project descriptions shown in the project dialog.
- `main.js`: motion, PCB signal canvas, dialogs, and the study-progress calculation (start/end dates).
- `main.css`: appearance.
- `project-viewer.js`, `project-viewer.css`: 3D model viewer.
- `assets/`: photos, logos, 3D models, and certificate documentation.

GitHub Pages serves branch `main` from `/ (root)`.
