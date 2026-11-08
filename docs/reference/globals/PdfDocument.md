# PdfDocument

A PDF, read: its pages, their size and their text, its metadata, and a page
drawn on a [`Painter`](../../llm/controls.md#painter).

```js
const doc = PdfDocument.Load("manual.pdf");          // or Open(path, password)
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
is [`Probe.Pdf`](Probe.md#pdf).

**Read with poppler, written with PoDoFo, one object.** Each half is optional at
build time and says so: `CanRead` and `CanWrite`, and a member of a missing half
refuses with a sentence naming its package. `Load` needs neither -- a report's
form is written by a build with no reader. It was `PdfForm` for the writing
half until a PDF became one object.

## Every member

| | | |
|---|---|---|
| `Load(path, [password])` | a PDF, opened -- `Load` as `Bitmap.Load`, since `Open` is what an opened one answers (whether it still is) | [opening](#opening) |
| `CanRead` (ro) | whether this build reads a PDF -- pages, text, a page drawn -- which is poppler; when false those members refuse naming the package | [opening](#opening) |
| `CanWrite` (ro) | whether this build writes into a PDF -- `AddFields`, `Encrypt` -- which is PoDoFo; when false those refuse naming the package | [opening](#opening) |
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
| `AddFields(fields)` | form fields written into this document's file, **in place**, and how many | [writing](#writing) |
| `Encrypt(path, { Password, OwnerPassword, Permissions })` | this document written to `path` **encrypted**, AES-256 | [writing](#writing) |
| `Close()` | let it go; closing twice is not an error | [the document](#the-document) |

## Opening

| | |
|---|---|
| `Load(path, [password])` | a PDF, opened -- `Load` as `Bitmap.Load`, since `Open` is what an opened one answers (whether it still is). Throws, saying which: there is no such file, it is encrypted and wants a password, the password is wrong, or it is not a PDF this machine reads (the last three where this build reads PDFs) |
| `CanRead` (ro) | whether this build reads a PDF -- pages, text, a page drawn -- which is poppler; when false those members refuse naming the package |
| `CanWrite` (ro) | whether this build writes into a PDF -- `AddFields`, `Encrypt` -- which is PoDoFo; when false those refuse naming the package |

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

## Writing

| | |
|---|---|
| `AddFields(fields)` | form fields written into this document's file, **in place**, and how many. Each is `{ Page, Name, Type, Rect, Value, Checked, ReadOnly, Required, Multiline, MaxLength, Reason }`; `Type` is `"Text"`, `"Check"` or `"Signature"`, `Page` is 1-based, and `Rect` is `{ X, Y, Width, Height }` in **PDF points with the origin at the bottom-left**. A signature field is left empty for the signer's own application. Every field is checked first, and a failure leaves the file as it was. Needs PoDoFo (`CanWrite`) |
| `Encrypt(path, { Password, OwnerPassword, Permissions })` | this document written to `path` **encrypted**, AES-256: `Password` opens it, `OwnerPassword` lifts the restrictions, and `Permissions` lists what is allowed without it -- `Print`, `HighPrint`, `Copy`, `Edit`, `EditNotes`, `FillAndSign`, `Accessible`, `Assemble`; every one when absent. `path` may be this document's own, which is replaced whole and read from then on with the new password. Needs PoDoFo (`CanWrite`) |

```js
const doc = PdfDocument.Load("solicitud.pdf");
doc.AddFields([
    { Page: 1, Name: "nombre", Type: "Text",
      Rect: { X: 160, Y: 734, Width: 300, Height: 24 }, Value: "Matías" },
    { Page: 1, Name: "acepto", Type: "Check",
      Rect: { X: 160, Y: 692, Width: 16, Height: 16 }, Checked: true },
    { Page: 1, Name: "firma", Type: "Signature",
      Rect: { X: 160, Y: 592, Width: 250, Height: 60 }, Reason: "Conformidad" },
]);
doc.Encrypt("solicitud-cerrada.pdf", { Password: "1234", OwnerPassword: owner,
                                       Permissions: ["Print", "FillAndSign"] });
doc.Close();
```

**Cairo draws the page; PoDoFo adds what Cairo cannot**: AcroForm fields a PDF
viewer can fill, and encryption. A [`Report`](../libraries/Report.md) with an
`Input` or a `Signature` element calls `AddFields` for you. **A signature field
is a `/Sig` widget with no signature in it**: the signer's own application fills
it with their certificate, and Bintana never needs the private key.

**Encryption is AES-256 and nothing weaker**: `Password` opens the file,
`OwnerPassword` lifts the restrictions (it is `Password` when not given), and
`Permissions` lists what is allowed without it. A password is an argument and
never kept in a file of the project.

## See also

[`Probe`](Probe.md) · [`PdfView`](../libraries/PdfView.md) ·
[`Printer`](Printer.md) · [`Report`](../libraries/Report.md), whose forms are
written with `AddFields`
