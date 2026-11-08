# PdfDocument

A PDF, read: its pages, their size and their text, its metadata, and a page
drawn on a [`Painter`](../../llm/controls.md#painter).

```js
const doc = PdfDocument.Open("manual.pdf");          // or Open(path, password)
doc.Pages                                             // 12
doc.PageSize(1)                                       // { Width: 595, Height: 842 }, points
doc.Text(3)                                           // the page's text, in reading order
doc.Title                                             // "" when the file says none

Viewer_Draw(p, w, h) { doc.Draw(p, 1, w, h); }        // a page, fitted to the room
```

**Generic reading, not understanding.** `Text(page)` is the page's text in
reading order, as the library reads it -- what a search or an index is built
from. What a particular layout *means* -- a supplier's invoice, a bank's
statement -- is that supplier's or that bank's, and a program parsing one is
parsing them.

**Drawn on a Painter, which makes the rest free.** A `DrawingArea` whose
`DrawPage` calls `Draw` is a viewer -- [`PdfView`](../libraries/PdfView.md) is
exactly that -- and the same control prints with `Printer.Send`, previews with
`Printer.Preview` and makes a thumbnail with `Painter.Render`. Pages count from
**1**, as `DrawPage` counts them, and sizes are in **points**, 72 to the inch.

What a file is without keeping it -- the page count, the first page's size --
is [`Probe.Pdf`](Probe.md#pdf). Optional at build time: without poppler-glib
`Open` refuses with a sentence naming the package.

## Every member

| | | |
|---|---|---|
| `Open(path, [password])` | whether it still is | [opening](#opening) |
| `Path` (ro) | the file it was opened from | [the document](#the-document) |
| `Open` (ro) | whether it still is | [the document](#the-document) |
| `Pages` (ro) | how many pages, numbered from 1 as `DrawPage` numbers them | [the document](#the-document) |
| `Title` (ro) | what the file says it is called | [the document](#the-document) |
| `Author` (ro) | who the file says wrote it | [the document](#the-document) |
| `Subject` (ro) | the file's own subject line | [the document](#the-document) |
| `Keywords` (ro) | the file's keywords, as it wrote them | [the document](#the-document) |
| `Creator` (ro) | the program that made the document | [the document](#the-document) |
| `Producer` (ro) | the program that wrote the PDF | [the document](#the-document) |
| `Created` (ro) | when the file says it was made, a `Date` | [the document](#the-document) |
| `Modified` (ro) | when the file says it was last changed, a `Date` | [the document](#the-document) |
| `PageSize(page)` | that page's size in **points**, 72 to the inch; pages need not all be one size | [a page](#a-page) |
| `Text(page)` | the text on that page, in reading order, as the library reads it -- what a search or an index is built from | [a page](#a-page) |
| `Draw(painter, page, [width], [height])` | draws that page on a `Draw`'s painter, at its origin and under its transform: at its own size in points, or scaled to fit `width` by `height`, keeping its proportions | [a page](#a-page) |
| `Close()` | let it go; closing twice is not an error | [the document](#the-document) |

## Opening

| | |
|---|---|
| `Open(path, [password])` | whether it still is |

A relative path is the program's, as everywhere. The four refusals are four
sentences because there are four things to do about them: the file is not
there, it wants a password, the password is wrong, it is not a PDF. **A
password is an argument**, never kept by the runtime.

## The document

| | |
|---|---|
| `Path` (ro) | the file it was opened from |
| `Open` (ro) | whether it still is |
| `Pages` (ro) | how many pages, numbered from 1 as `DrawPage` numbers them |
| `Title` (ro) | what the file says it is called; `""` when it says nothing |
| `Author` (ro) | who the file says wrote it; `""` when it says nothing |
| `Subject` (ro) | the file's own subject line; `""` when it has none |
| `Keywords` (ro) | the file's keywords, as it wrote them; `""` when it has none |
| `Creator` (ro) | the program that made the document; `""` when it says nothing |
| `Producer` (ro) | the program that wrote the PDF; `""` when it says nothing |
| `Created` (ro) | when the file says it was made, a `Date`; `null` when it says nothing |
| `Modified` (ro) | when the file says it was last changed, a `Date`; `null` when it says nothing |
| `Close()` | let it go; closing twice is not an error |

What the file does not say is `""` for a text and `null` for a date, so a
caption built from it needs no test.

## A page

| | |
|---|---|
| `PageSize(page)` | that page's size in **points**, 72 to the inch; pages need not all be one size |
| `Text(page)` | the text on that page, in reading order, as the library reads it -- what a search or an index is built from. Generic: what a particular layout *means* is the program's |
| `Draw(painter, page, [width], [height])` | draws that page on a `Draw`'s painter, at its origin and under its transform: at its own size in points, or scaled to fit `width` by `height`, keeping its proportions. No white of its own: the paper is the caller's. What a `DrawPage` hands on, which is how a viewer, a print and a preview are the same code |

```js
Thumbs_DrawPage(p, page, w, h) { this.doc.Draw(p, page, w, h); }   // printed as it is shown
```

`Draw` puts the page at the painter's origin, under its transform, with no white
beneath it -- a page is often transparent, and on a screen the paper is the
caller's to draw (`PdfView` puts a white sheet on a grey desk).

## See also

[`Probe`](Probe.md) · [`PdfView`](../libraries/PdfView.md) ·
[`Printer`](Printer.md) · [`PdfForm`](PdfForm.md), which writes form fields into
a PDF Cairo drew
