# ReportDocument

A banded report with no control: the paper, the bands, the rows, the pages they
make and the drawing of each one, with nothing on a screen.

It is what a [`Report`](Report.md) shows — the control holds one as
`Report.Document` and adds what a screen has: the current page, the two events
and `Send`. A `ReportDocument` is made with `new` and is not a widget, so it is
also what a `main` project writes a report with: the nightly job, the statement
run from a timer, a tool run over ssh. It ships in the `report` library.

```json
{ "name": "Statements", "main": "Main", "uses": ["report"] }
```

```js
function Main() {
    const d = new ReportDocument();
    d.Sections = sections();               // a function of your own, shared with a form
    d.Data     = rows;
    d.SavePdf("statement.pdf");
}
```

**The language of a report is the control's.** What a band is, what an element
can be, how a group nests and what a `Total` adds up are written once, on
[`Report`](Report.md#the-bands) and in [llm/report.md](../../llm/report.md); a
`Sections` value means the same assigned to either. This page is the document's
members and what it does with no display.

## Every member

| | | |
|---|---|---|
| `Data` | the rows: an array of plain objects | [the shape](#the-shape) |
| `Margins` | the gutter around the content, in points: one number for all four edges, or `{ Top, Right, Bottom, Left }` | [the shape](#the-shape) |
| `Orientation` | `Portrait` `Landscape` | [the shape](#the-shape) |
| `Paper` | `A4` `Letter` `A5`, the sheet in points (72 to the inch) | [the shape](#the-shape) |
| `Sections` | the band definitions — the whole of what a report is besides the numbers | [the shape](#the-shape) |
| `PageCount` (ro) | how many pages the data and the sections make | [the pages](#the-pages) |
| `Refresh()` | measures again now and answers the new `PageCount` | [the pages](#the-pages) |
| `Save(path, [page], [scale])` | one page to a PNG | [out to a file](#out-to-a-file) |
| `SavePdf(path)` | **every page, one file** | [out to a file](#out-to-a-file) |
| `Paint(p, page, width, height)` | draws page `page` (one-based, clamped) with `p`, scaled to fit `width`×`height` and centred — for a painter something else opened: a `DrawPage` of your own, or a `Drawing` that puts this page beside other things | [on a painter of your own](#on-a-painter-of-your-own) |
| `DesignLayout([sample])` | the bands as a designer stacks them: one page wide, in reading order, with every element's box | [on a painter of your own](#on-a-painter-of-your-own) |
| `PaintDesign(p, width, height, [sample])` | the design on a painter: the sheet, a tint and a rule for every band, and the elements where they will print | [on a painter of your own](#on-a-painter-of-your-own) |

It raises no events: nothing moves a page on a document, and nothing waits for
one to be measured.

## The shape

| | |
|---|---|
| `Paper` | `A4` `Letter` `A5`, the sheet in points (72 to the inch). Defaults to `"A4"`. |
| `Orientation` | `Portrait` `Landscape`. Defaults to `"Portrait"`. |
| `Margins` | the gutter around the content, in points: one number for all four edges, or `{ Top, Right, Bottom, Left }`. `40`. Every side is a finite number or the assignment throws |
| `Sections` | the band definitions — the whole of what a report is besides the numbers. Checked when assigned, so a typo is refused where it was written. Defaults to `{}`. |
| `Data` | the rows: an array of plain objects. `Field` elements read a key off the current row; the group bands read the keys named by each group's `.On`. Defaults to `[]`. |

These are the control's properties of the same names — assigning
`report.Paper` assigns `report.Document.Paper` — with the same defaults and the
same refusals, so a `Sections` value built in a function can feed a form's
`Report` and a `main`'s document alike. What each band and element says is on
[`Report`](Report.md#the-bands); the sheet sizes come from
[`Printer.Papers`](../globals/Printer.md), the one table every host reads.

## The pages

| | |
|---|---|
| `PageCount` | how many pages the data and the sections make. Measures when it has to, so it is answerable before anything has been drawn. An empty report is one blank page, not none |
| `Refresh()` | measures again now and answers the new `PageCount`. Call it when you changed the rows **in place**; assigning `Data` or `Sections` already throws the old pages away |

**A document measures when it is asked**, not when it is assigned: `PageCount`,
`Paint`, `Save` and `SavePdf` measure first if anything changed since the last
time. Assigning `Data` or `Sections` throws the old pages away; changing a row
**in place** does not, which is what `Refresh()` is for.

## Out to a file

| | |
|---|---|
| `Save(path, [page], [scale])` | one page to a PNG. `page` defaults to `1`, `scale` to `2` (144 dpi — an A4 page is a 1190px-wide PNG). **No widget and no display**: it draws through `Drawing` |
| `SavePdf(path)` | **every page, one file**. Vector, at the paper's exact size, so the text in it is text. A report with `Input`/`Signature` elements is a form: the page is drawn first and the fields are added by `PdfDocument.AddFields`. **No widget and no display**: it draws through `Drawing`, which is what lets a `main` project — a report run from a timer — write one. A page that throws leaves no file |

Both draw through [`Drawing`](../globals/Drawing.md), which is a painter with no
control behind it: the same pages the control shows, in **black ink on white**
whatever the desktop's theme, and an element with no font drawn in the font
`Text` measured it with. That is why they work in a `main` run by the console
runtime, `bintana`, with no display and no GTK. A page that throws leaves no
file. Not in a [`Task`](../globals/Task.md): a worker installs no painter and no
`Drawing`.

A report with `Input` or `Signature` elements is a form: `SavePdf` draws the
page first and then adds the fields with
[`PdfDocument.AddFields`](../globals/PdfDocument.md), so the PDF can be filled
in a viewer and signed by the signer's own application.

## On a painter of your own

| | |
|---|---|
| `Paint(p, page, width, height)` | draws page `page` (one-based, clamped) with `p`, scaled to fit `width`×`height` and centred — for a painter something else opened: a `DrawPage` of your own, or a `Drawing` that puts this page beside other things. Black on white, whatever the theme |
| `DesignLayout([sample])` | the bands as a designer stacks them: one page wide, in reading order, with every element's box. Coordinates are points, `0,0` at the sheet's top-left; `sample` is the row a `Field` or a `Total` reads, and one is made from the field names when it is not given. The stack grows past the page when the bands need more room, so a designer shows all of them rather than cutting the last band off. |
| `PaintDesign(p, width, height, [sample])` | the design on a painter: the sheet, a tint and a rule for every band, and the elements where they will print. Scaled to fit `width`×`height`, as `Paint` scales a page; answers the same layout in the painter's coordinates, which is what a hit test wants. A missing image is a placeholder box, not a throw — the designer is where it is chosen. |

`Paint` is a page drawn where something else decides: a `Drawing.SavePdf` that
puts a report page beside a chart, a `DrawPage` of a print job of your own, or
the `Canvas` of the control itself — which is exactly what `Report` does. The
ink is the painter's `Foreground`.

`DesignLayout` and `PaintDesign` are the designer's half: the bands stacked in
reading order, one page wide, with the box of every element. The IDE's report
designer draws with `PaintDesign` and hit-tests against the layout it answers;
a tool of your own that previews or edits a report's shape can do the same with
no control at all.

## See also

[`Report`](Report.md), the control · [`ChartDocument`](ChartDocument.md) ·
[`Drawing`](../globals/Drawing.md) · [`Printer`](../globals/Printer.md) ·
[`PdfDocument`](../globals/PdfDocument.md) ·
[llm/report.md](../../llm/report.md), the short form and the full element grammar
