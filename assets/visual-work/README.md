# Visual work

Project order begins with Reborn Music Lemnos, Shisha Nomads, Drivio, Skin Care Lab, Dumbos, and Meli Lemnou, followed by the music videos (Mona Lisa first) and wedding film.

The responsive project grid in `index.html` groups the current originals in `assets/Portofolio/` into 13 projects. Filenames are URL-encoded, including spaces and `#`.

- Drivio: main car rental video preview, followed by A5 graphic design and two Jeep Wrangler photographs.
- Dumbos: programme, two announcements, and elephant logo.
- Shisha Nomads: main video preview and two supporting product photographs.
- Skin Care Lab: dermabrasion, summer treatments, mesotherapy artwork.
- Meli Lemnou / Meli Bontelas: first English brochure page as the main preview, with honey photography and the second page in the gallery.
- Reborn Music Lemnos: two event previews.
- Music (in order): Mona Lisa by Karnalh (local official trailer), CYPHER, Ase me mono (with four production polaroids), Gia panta, Long press, Ftera by Lynux.
- Wedding film: `gamos.mp4` (Regino and Margarita, identified from its title frame).

Optimized JPEG images and extracted video posters live in `previews/grid/`. The site loads these instead of the large source images. Videos retain the user's smaller MP4 previews, use native controls, and load only on demand. Supporting media is available in each card's expandable gallery. Visible previews loop muted and pause when offscreen or the tab is hidden. The collection uses equal columns and natural media proportions without filters or preview buttons. Sections share one horizontal frame; only Visual Work scrolls vertically. The dotted background inside Visual Work uses `assets/Portofolio/Grid.png`.

Run `npm run build` after editing `script.ts` to regenerate `script.js`. Run `npm run check` for TypeScript validation. The complete grid remains available without JavaScript.

Mona Lisa uses the local official trailer with its YouTube thumbnail as the poster and retains its individual YouTube link. The unnamed seventh music clip remains omitted. Ftera, Ase me mono, Longpress, and Gia panta link to their individual YouTube videos. CYPHER links to its individual YouTube video. The section footer links to @thirdeyevzn on Instagram and the Behance portfolio.
