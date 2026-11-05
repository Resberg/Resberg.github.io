# Interactive project models

Preview models converted from the STEP files supplied by the portfolio owner:

- `sumo-1kg.glb` — `sumo 1kg.step`
- `sumo-final.glb` — `Sumo final.step`
- `transporter.glb` — `transporter.step`

Conversion uses OpenCascade tessellation, preserves the CAD component colors, converts millimeters to meters, and maps CAD Z-up to glTF Y-up. Meshes are optimized for interactive browser viewing with glTF Transform and meshoptimizer. The Transporter preview additionally uses lossless meshopt buffer compression. The original STEP files are unchanged and are not required by the website.

The viewer is self-hosted from `@google/model-viewer` 4.4.0 (Apache 2.0). The meshopt decoder is self-hosted from meshoptimizer 1.3.0 (MIT). Their license notices are in `assets/vendor/`.
