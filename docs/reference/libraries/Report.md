# Report

A banded report, as a component.

What Crystal Reports calls a *report definition*: content arranged in **bands** —
page header and footer, nested group headers and footers, a detail band that
repeats once per row, and the report's own header and footer — laid out over
**pages** of a fixed paper size, and out as one PDF.

It ships in the `report` library, is reached with `uses`, and draws with the same
[`Painter`](../../llm/controls.md#painter) every other drawing here uses.

```json
{ "name": "Statement", "startup": "ReportForm", "uses": ["report"] }
```

```json
{ "type": "Report", "name": "Report", "properties": { "Expand": true } }
```

```js
this.Report.Sections = this.sections();   // the shape, declared in code
this.Report.Data     = rows;              // the numbers, handed over
```

**There is no designer for a report**: the bands, their heights and what sits in
each are *written down*, which is why they can be version-controlled and why the
totals cannot drift from the data.

It is a [`Component`](../widgets/Component.md), so everything on
[`Widget`](../widgets/Widget.md) is on it too.

## Every member

| | | |
|---|---|---|
| `Data` | the rows: an array of plain objects | [the data](#the-data) |
| `Document` (ro) | the report itself — a `ReportDocument`, which is what draws | [the document](#the-document) |
| `Margins` | the gutter around the content, in points: one number for all four edges, or `{ Top, Right, Bottom, Left }` | [the paper](#the-paper) |
| `Orientation` | `Portrait` `Landscape` | [the paper](#the-paper) |
| `Page` | the current page, **one-based** | [turning the pages](#turning-the-pages) |
| `PageCount` (ro) | how many pages the data and the sections make | [turning the pages](#turning-the-pages) |
| `Paper` | `A4` `Letter` `A5`, the sheet in points (72 to the inch) | [the paper](#the-paper) |
| `Sections` | the band definitions — the whole of what a report is besides the numbers | [the bands](#the-bands) |
| `Refresh()` | re-measures, redraws and emits `Prepared` | [the data](#the-data) |
| `Save(path, [page], [scale])` | one page to a PNG | [off the screen](#off-the-screen) |
| `SavePdf(path)` | **every page, one file** | [off the screen](#off-the-screen) |
| `Send([setup], cb)` | **every page, to paper**, through [`Printer`](../../llm/library.md#printer): this fills in how many pages there are and the paper and orientation the report was laid out for, and `{ Copies, From, To }` say the job | [off the screen](#off-the-screen) |
| **event** `Page(page)` | the data moved the current page | [turning the pages](#turning-the-pages) |
| **event** `Prepared(count)` | the pages were computed | [the data](#the-data) |

## The paper

| | |
|---|---|
| `Paper` | `A4` `Letter` `A5`, the sheet in points (72 to the inch). Defaults to `"A4"`. |
| `Orientation` | `Portrait` `Landscape`. Defaults to `"Portrait"`. |
| `Margins` | the gutter around the content, in points: one number for all four edges, or `{ Top, Right, Bottom, Left }`. `40`. Every side is a finite number or the assignment throws |

Changing any of these **re-measures silently** — read `PageCount` back on the
next line — because they can be written in a `.form`, and an event raised while a
form is loading arrives before the form's other controls exist.

## The data

| | |
|---|---|
| `Data` | the rows: an array of plain objects. `Field` elements read a key off the current row; the group bands read the keys named by each group's `.On`. Defaults to `[]`. |
| `Refresh()` | re-measures, redraws and emits `Prepared`. Call it when you changed the rows **in place**; assigning `Data` or `Sections` already does |
| **event** `Prepared(count)` | the pages were computed: `Data`, `Sections` or `Refresh()`. `count` is the new `PageCount`. Changing the paper, the orientation or the margins re-measures **silently** — read `PageCount` back on the next line — because those can be written in a `.form`, and an event raised while a form is loading arrives before the form's other controls exist |

**Sort before handing the rows over.** Grouping is *consecutive equal values* —
Crystal's model, which never reorders the data, because reordering is a second
opinion about what the user meant. [`Locale.Compare`](../globals/Locale.md) is
the comparison that puts `Ñanculeo` between `Núñez` and `Ortiz`.

## The bands

| | |
|---|---|
| `Sections` | the band definitions — the whole of what a report is besides the numbers. See below. Defaults to `{}`. |

The five fixed bands are `ReportHeader` (once, at the top), `PageHeader` (the top
of every page), `Detail` (once per row), `PageFooter` and `ReportFooter`. The page
header and footer sit at fixed positions and the rest **flow** between them,
starting a new page when the next band does not fit.

**`Height: "Auto"` is the band that grows** — as tall as the lowest bottom its
elements reach, plus `Padding`. That is what a detail row with a description in
it wants. It is **refused on `PageHeader` and `PageFooter`**: they are what the
flow is measured *between*, so their height has to be known before any row is.

**Grouping is `Groups`, an ordered list, outermost first** — each entry
`{ On, Header, Footer }` — and they nest, exactly as a spreadsheet's subtotal
ladder does. **An open group's headers repeat at the top of every page its rows
run onto**, so a detail row that lands alone on page 2 still says whose it is.
A group turns when its key changes **by value** — two `Decimal`s of the same
number are one group, not two objects.

`Min` and `Max` compare numerically and exactly when every value of the field
is a number, numeric text or a `Decimal`, and as text with `Locale.Compare`
otherwise.

An element is `{ X, Y, Kind, … }`: `Text` (fixed words), `Field` (a value off the
row, or `@Page`/`@Pages`), `Total` (`Sum` `Count` `Min` `Max` `Avg`), `Line`,
`Box` or `Image`. **A `Total` has no scope of its own**: the band it sits in is
the scope, which is why there is nothing to disagree with it. The whole grammar
is in [llm/report.md](../../llm/report.md).

**A row can look like what it holds.** Any element takes `When` — `true`,
`false`, `"@Odd"`, `"@Even"`, `"@First"`, `"@Last"`, `{ Field, Is }` or
`{ Field, IsNot }` — and is drawn only where it holds; `Color` and `Font` may be
`{ Field: "Name" }`, read off the row; and a `Box` may be `Width: "Band"` (the
content area) and `Height: "Band"` (the band itself), which is how a stripe
covers a row that wrapped. The stripe counts rows across the whole run, not per
page, and every spelling is refused where it was written. See
[llm/report.md](../../llm/report.md#elements).

## Turning the pages

| | |
|---|---|
| `Page` | the current page, **one-based**. Assigning clamps to `[1, PageCount]`, so a page past the end is the last one, not a blank. Turning a page **redraws and does not re-measure**. Defaults to `1`. |
| `PageCount` (ro) | how many pages the data and the sections make. Measures lazily, so it is answerable in `Form_Open` before anything has drawn. An empty report is one blank page, not none |
| **event** `Page(page)` | the data moved the current page: `Data`, `Sections` or `Refresh()` left fewer pages than `Page`, and it was pulled back inside the new count. `page` is one-based. **Assigning `Page` raises nothing** — a property setter must not, since a `.form` declaring it would raise it before the host's other controls exist — so the code that turns a page updates its own display. The paper, the orientation and the margins pull the page back silently too |

**Turning a page redraws and does not re-measure.** That is what the two passes
buy: the pages were worked out when the data arrived, and `Page` only chooses
which of them to paint.

## Off the screen

| | |
|---|---|
| `SavePdf(path)` | **every page, one file**. Vector, at the paper's exact size, so the text in it is text; the pages are the ones the last measure worked out. This is what a report is for — `Save` is for when one page is going into something else. With no display, `Document.SavePdf` is the same file |
| `Send([setup], cb)` | **every page, to paper**, through [`Printer`](../../llm/library.md#printer): this fills in how many pages there are and the paper and orientation the report was laid out for, and `{ Copies, From, To }` say the job. **A paper chosen in the dialog scales the page rather than re-flowing it**, and the page count does not move — a report's bands are declared in its own points, so it declares no `Paginate` (a `Markdown` does). **Async**, like every dialog here: `cb({ Copies, From, To })` is what was actually sent, and is **not called** when the dialog was cancelled. **To a file it is `SavePdf`**: a PDF is not a printer with a `Copies` of 3 |
| `Save(path, [page], [scale])` | one page to a PNG. `page` defaults to the current one, `scale` to `2` (144 dpi — an A4 page is a 1190px-wide PNG). The export runs the same `Draw` at the exact paper size, clamps the page the way `Page` does, and **does not move the report** |

The canvas always shows the **whole page, scaled to fit, centred**, on white
paper with a thin outline that the export does not carry. There is no `Zoom` and
no `Fit`: a preview that fits is the one state that is never clipped.

**The page is white and the ink is black, not the theme's** — a report is a
document that will be printed, and the theme's ink on white paper is the
invisible drawing.

## The document

| | |
|---|---|
| `Document` (ro) | the report itself — a `ReportDocument`, which is what draws. Everything below that is not about the screen is a property of it |

**A report is a `ReportDocument`, and the control shows one.** The paper, the
bands, the rows, the pages and the drawing of each page are the document's; the
`Report` adds what a screen has — `Page`, the two events and `Send`. Every
property above but `Page` is the document's too, under the same name, and
assigning one on the control assigns it there.

A `ReportDocument` is made with `new` and is not a widget, so it is what a `main`
project writes a report with — the nightly job, the report run from a timer —
since such a project never has a display. It raises no events and has no `Page`;
what it adds is a painter-level verb, and its `Refresh` answers:

| | |
|---|---|
| `ReportDocument.PageCount` (ro) | how many pages the data and the sections make. Measures when it has to, so it is answerable before anything has been drawn. An empty report is one blank page, not none |
| `ReportDocument.Refresh()` | measures again now and answers the new `PageCount`. Call it when you changed the rows **in place**; assigning `Data` or `Sections` already throws the old pages away |
| `ReportDocument.Paint(p, page, width, height)` | draws page `page` (one-based, clamped) with `p`, scaled to fit `width`×`height` and centred — for a painter something else opened: a `DrawPage` of your own, or a `Drawing` that puts this page beside other things. Black on white, whatever the theme |
| `ReportDocument.Save(path, [page], [scale])` | one page to a PNG. `page` defaults to `1`, `scale` to `2` (144 dpi — an A4 page is a 1190px-wide PNG). **No widget and no display**: it draws through `Drawing` |
| `ReportDocument.SavePdf(path)` | **every page, one file**. Vector, at the paper's exact size, so the text in it is text. **No widget and no display**: it draws through `Drawing`, which is what lets a `main` project — a report run from a timer — write one. A page that throws leaves no file |

```js
// project.json: { "main": "Main", "uses": ["report"] }
function Main() {
    const d = new ReportDocument();
    d.Sections = sections();               // a function of your own, shared with a form
    d.Data     = rows;
    d.SavePdf("statement.pdf");
}
```

`Save` and `SavePdf` draw through [`Drawing`](../globals/Drawing.md), which is
the control's `Draw` with nothing on a screen: the same pages, the same black
ink, and an element with no font drawn in the font `Text` measured it with. A
page that throws leaves no file. Not in a [`Task`](../globals/Task.md): a worker
installs no painter and no `Drawing`.

## What it does not do

- **No sorting.** See [the data](#the-data).
- **A declared height does not grow.** `Wrap` re-flows within it and cuts what is
  left over; the band that grows is the one that says `Height: "Auto"`.
- **A band is never split across pages.** One taller than the room between the
  page header and footer is placed anyway and cut off at the page's foot, with
  one `Logger.Warning` per band per `Sections` naming it — see
  [llm/report.md](../../llm/report.md#sections).

## See also

[`Chart`](Chart.md) · [`Markdown`](Markdown.md) ·
[`DrawingArea`](../widgets/DrawingArea.md) ·
[`examples/report`](https://github.com/getbintana/bintana/tree/main/examples/report) ·
[llm/report.md](../../llm/report.md), the short form and the full element grammar
