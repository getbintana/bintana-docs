# Drawing

A [`Painter`](../../llm/controls.md#painter) over a PNG or a PDF, with no
control and no display.

```js
Drawing.Save("load.png", 800, 400, (p, w, h) => chart.Paint(p, w, h));
const png = Drawing.ToPng(400, 120, (p, w, h) => p.Text("Nightly", 10, 10));
Drawing.SavePdf("statement.pdf", 595, 842, pages,
                (p, page, w, h) => report.Paint(p, page, w, h));
```

**Every way out of a painter used to go through a control** —
[`DrawingArea`](../widgets/DrawingArea.md)'s `Save`, `ToPng` and `SavePdf`, and
[`Printer`](Printer.md) — and a control needs a display. So a `main` project,
which never initialises GTK, could measure a report's text with [`Text`](Text.md)
and lay out its pages, and then had nothing to draw them with: a report that has
to go out at six in the morning from a timer had to be run under `xvfb-run`, to
put a window nobody sees on a display nobody has. These are the control's three
verbs with the same names, the same arguments and the same refusals, and **the
drawing is passed where the control was**.

## Every member

| | | |
|---|---|---|
| `Save(path, width, height, draw)` | `draw(painter, width, height)` against an image of that size, written as a PNG — `DrawingArea.Save` with the handler passed in place of the control, so it needs **no widget and no display** | [a picture](#a-picture) |
| `ToPng(width, height, draw)` | the same picture as `Save`, answered as `Bytes` instead of written | [a picture](#a-picture) |
| `SavePdf(path, width, height, pages, draw)` | `draw(painter, page, width, height)` once per page into one **PDF** — `DrawingArea.SavePdf` with the drawing passed in place of the control, and `DrawPage`'s own arguments | [a document](#a-document) |

## A picture

| | |
|---|---|
| `Save(path, width, height, draw)` | `draw(painter, width, height)` against an image of that size, written as a PNG — `DrawingArea.Save` with the handler passed in place of the control, so it needs **no widget and no display**. Ink black, the font `Text` measures with. A `draw` that throws writes no file, and the throw is this call's |
| `ToPng(width, height, draw)` | the same picture as `Save`, answered as `Bytes` instead of written |

`draw(painter, width, height)` is called once, synchronously, with `Draw`'s own
arguments, against an image of that size in pixels — up to 16384 a side. The
size is required: there is no control to have one. `ToPng` answers the
[`Bytes`](Bytes.md) a file would have held, for something to attach or send with
nothing on disk.

## A document

| | |
|---|---|
| `SavePdf(path, width, height, pages, draw)` | `draw(painter, page, width, height)` once per page into one **PDF** — `DrawingArea.SavePdf` with the drawing passed in place of the control, and `DrawPage`'s own arguments. The size is in **points**, 72 to the inch (A4 is 595×842); `pages` may be `undefined` for one. What a `main` project prints with: **no widget and no display**. A page that throws leaves **no file** |

`draw(painter, page, width, height)` once per page, `page` 1-based — `DrawPage`'s
arguments, so a handler written for paper is the drawing for this. The size is in
**points**, 72 to the inch (A4 is 595×842; [`Printer.Papers`](Printer.md#the-paper-sizes)
has the table), up to PDF's 200 inches a side; `pages` is 1 to 10000, and
`undefined` for one. The surface is vector, so text stays text.

## The painter it hands over

A new one per call, and it has **no control behind it**, which decides three
things:

- **The ink is black** and the line one wide. A control's ink is its theme's
  `Foreground`; a document has no theme, and the theme's ink on white paper is
  the invisible drawing — on a dark desktop it is light. So `p.Foreground` is
  black here, and anything that draws in the painter's ink (a
  [`ChartDocument`](../libraries/Chart.md#the-document) does) comes out readable
  on paper. `Dark` is `false`.
- **The font is the one `Text` measures with**, at the resolution `Text` measures
  at. A page laid out with `Text.Size` is drawn by this at the size it was
  measured — which is what lets [`ReportDocument`](../libraries/Report.md#the-document)
  measure and draw a report with no display.
- **It is valid while `draw` runs** and refuses every call after, like any
  painter whose frame is over.

## When the drawing throws

**A throw from `draw` is this call's throw.** A control's handler is an event and
is reported as one; here the caller passed the function and is on the stack, so
it gets the exception. **It leaves no file**: a PNG is written only once the
drawing finished, and a PDF — which is written as it is drawn — is removed when a
page throws.

## What goes wrong

- **`needs a width and a height`.** There is no control to take them from.
- **A chart came out with white text.** It was saved through its control, whose
  ink is a dark theme's. Draw the document through this instead.
- **`is not a function` in a `Task`.** A worker installs no painter and no
  `Drawing`; draw on the main thread.
- **A PDF page the wrong size.** `SavePdf` takes points, not pixels: an A4 page
  is 595×842.

## See also

[`DrawingArea`](../widgets/DrawingArea.md) ·
[`Painter`](../../llm/controls.md#painter) · [`Text`](Text.md) ·
[`Printer`](Printer.md) · [`ReportDocument`](../libraries/Report.md#the-document) ·
[`ChartDocument`](../libraries/Chart.md#the-document)
