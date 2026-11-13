# drawing — the drawing half, for a `main`

`drawing` is a library with no JavaScript of its own: it names the drawing half
-- `Painter`, `Bitmap`, `Drawing` and `Text`'s measurements (`Text.Width` and
the rest). A window project has them always. The console host (`bintana`)
keeps cairo, Pango and GdkPixbuf out of its link and loads them, as
`bintana-drawing.so`, **the first time a program touches one of them** -- so a
`main` that draws needs nothing in its manifest, and one that never draws never
maps cairo. Naming `drawing` in `uses` loads it at the start instead.

```json
{ "name": "ledger", "main": "Main", "uses": ["drawing"] }
```

```js
function Main() {
    Drawing.SavePdf("out.pdf", 595, 842, 1, (p, page, w, h) => {
        p.Color = "black";
        p.Text(`page ${page}`, 40, 60);
    });
}
```

**A library that draws names it for you.** `report` and `charts` declare
`drawing` in their own `uses`, so a project that says `"uses": ["report"]` gets
it -- `Application.Uses()` lists every library a run loads, dependencies
first.

**A program that starts a `Task` loads it then**, on the main thread, so a
worker has `Bitmap` as it does in a window project. A machine without the
module answers the first touch with where it looked.

What each one does is on its own page:
[`Painter`](controls.md#painter) (the pen a `Draw` handler and a `Drawing`
callback are handed), [`Drawing`](library.md#drawing) (a PNG or a PDF with no
control), [`Bitmap`](library.md#bitmap) (scale, crop, rotate and flip), and
[`Text`](library.md#text), whose measurements a layout asks before it draws.
`DrawingArea` is a control and needs a window; it is not part of this library.
