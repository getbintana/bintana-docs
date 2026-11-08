# PdfView — a PDF on a form

A PDF on a form: its pages one at a time, with a zoom, and the buttons to go
through them. It ships in the `pdfview` library and is a
[`Component`](../reference/widgets/Component.md).

```json
{ "name": "Manuals", "startup": "MainForm", "uses": ["pdfview"] }
```

```json
{ "type": "PdfView", "name": "Viewer",
  "properties": { "File": "docs/manual.pdf", "Zoom": "Fit width", "Expand": true } }
```

```js
this.Viewer.Open(path, password);                 // one that wants a password
this.Viewer.Print(() => this.Status.Text = "sent");
const text = this.Viewer.Document.Text(this.Viewer.Page);
```

**It is a `DrawingArea` and [`PdfDocument.Draw`](../reference/globals/PdfDocument.md), and
no control of its own**: its canvas's `Draw` puts the page on a white sheet on
the screen, its `DrawPage` puts the same page on paper, and its `Paginate`
answers how many. So `Print` is `Printer.Send(viewer.Canvas)`, `Preview` is
`Printer.Preview`, and a thumbnail is `Painter.Render(viewer.Canvas, page, w, h)`.

**The password is an argument, never a property**: every property with a getter
and a setter is saved in the `.form`, and a password in a project file is a
password in version control.

Not done, said so it is not looked for: selecting or searching text (the text is
`Document.Text(page)`), following links, a page's outline.

## PdfView

| | |
|---|---|
| `File` | the PDF shown, a path; `""` shows nothing. Assigning opens it, so a file that is not there or not a PDF throws here. One that wants a password is `Open(path, password)`'s -- never a property, which a `.form` would keep. Defaults to `""` |
| `Document` (ro) | the open document, a `PdfDocument` -- its text, its metadata -- or `null` |
| `Pages` (ro) | how many pages; `0` with no document |
| `Page` | the page shown, from 1. Assigning one past either end goes to that end. Defaults to `1` |
| `Zoom` | `Fit page` `Fit width` `50%` `75%` `100%` `150%` `200%` -- the whole page in the room, its width in the room, or that much of its real size. Defaults to `"Fit page"` |
| `Toolbar` | whether the row of buttons above the page shows. Defaults to `true` |
| `Open(path, password)` | opens a PDF, with its password when it has one, and shows its first page |
| `Next()` | the next page, if there is one |
| `Previous()` | the page before, if there is one |
| `Print(setup, cb)` | the print dialog, then a printer -- `Printer.Send` over the canvas, every page of the document. `cb` as `Send` calls it |
| `Preview(setup, cb)` | the runtime's print preview of every page -- `Printer.Preview` over the canvas; answers its window |
| **event** `PageChange(page)` | the page shown moved -- the buttons, `Next`, `Previous` or `Open`. Assigning `Page` raises nothing, as a setter does not |
