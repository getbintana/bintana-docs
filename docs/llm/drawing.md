# drawing — the drawing half, for a `main`

`drawing` is a library with no JavaScript of its own: naming it is what loads
`Painter`, `Bitmap`, `Drawing` and `Text`'s measurements (`Text.Width` and the
rest) into a project that declares `main`. A window project has them always;
the console host (`bintana`) keeps cairo, Pango and GdkPixbuf out of its link,
and loads them, as `bintana-drawing.so`, only for a project whose `uses` reaches
`drawing`.

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

**Without it, a `main` is told what to add.** `Drawing.Save` and the rest
answer `this needs drawing, and the project does not use it: add "uses":
["drawing"] to project.btp` instead of drawing nothing.

What each one does is on its own page:
[`Painter`](controls.md#painter) (the pen a `Draw` handler and a `Drawing`
callback are handed), [`Drawing`](library.md#drawing) (a PNG or a PDF with no
control), [`Bitmap`](library.md#bitmap) (scale, crop, rotate and flip), and
[`Text`](library.md#text), whose measurements a layout asks before it draws.
`DrawingArea` is a control and needs a window; it is not part of this library.
