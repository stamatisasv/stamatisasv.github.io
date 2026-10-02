# Visual work

The responsive, filterable project grid in `index.html` groups the current originals in `assets/Portofolio/` into 11 projects. Filenames are URL-encoded, including spaces and `#`.

- Dumbos: programme, two announcements, and elephant logo.
- Shisha Nomads: two product photographs.
- Skin Care Lab: dermabrasion, summer treatments, mesotherapy artwork, and video.
- Meli Lemnou / Meli Bontelas: honey photography and both English brochure pages.
- Reborn Music Lemnos: two event previews.
- Music: CYPHER, Ase me mono (with four production polaroids), Gia panta, Long press, and Ftera by Lynux.
- Wedding film: `gamos.mp4` (Regino and Margarita, identified from its title frame).

Optimized JPEG images and extracted video posters live in `previews/grid/`. The site loads these instead of the large source images. Videos retain the user's smaller MP4 previews, use native controls, and load only on demand. Supporting media is available in each card's expandable gallery. Filters preserve keyboard access, announce the project count, and pause hidden previews. Only one video plays at a time.

Run `npm run build` after editing `script.ts` to regenerate `script.js`. Run `npm run check` for TypeScript validation. The complete grid remains available without JavaScript.

Mona Lisa and the unnamed seventh music clip remain omitted because no matching media or details are available.
