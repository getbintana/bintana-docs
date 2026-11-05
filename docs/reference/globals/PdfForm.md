# PdfForm

The form layer of a PDF: Cairo draws the page, PoDoFo adds the fields a viewer
can fill.

A [`Report`](../libraries/Report.md) with an `Input` or a `Signature` element
uses this for you. Call it directly when you already have a static PDF and want
to turn it into a form.

```js
PdfForm.Available

PdfForm.AddFields("solicitud.pdf", [
    { Page: 1, Name: "nombre", Type: "Text",
      Rect: { X: 160, Y: 734, Width: 300, Height: 24 }, Value: "Matías" },
    { Page: 1, Name: "firma", Type: "Signature",
      Rect: { X: 160, Y: 592, Width: 250, Height: 60 }, Reason: "Conformidad" },
]);
```

## Every member

| | | |
|---|---|---|
| `Available` (ro) | whether this build has PoDoFo, which is what `AddFields` needs; when false the verb refuses with a sentence naming the package | [availability](#availability) |
| `AddFields(path, fields)` | adds the fields to the PDF at `path`, **in place**, and answers how many | [fields](#fields) |

## Availability

| | |
|---|---|
| `Available` (ro) | whether this build has PoDoFo, which is what `AddFields` needs; when false the verb refuses with a sentence naming the package |

`PdfForm` is optional at build time, the sqlite mould. A program that only draws
reports needs none of it.

## Fields

| | |
|---|---|
| `AddFields(path, fields)` | adds the fields to the PDF at `path`, **in place**, and answers how many. Each field is `{ Page, Name, Type, Rect, Value, Checked, ReadOnly, Required, Multiline, MaxLength, Reason }`; `Type` is `"Text"`, `"Check"` or `"Signature"`, `Page` is 1-based, and `Rect` is `{ X, Y, Width, Height }` in **PDF points with the origin at the bottom-left**. A signature field is left empty for the signer's own application. The PDF must exist and be one this build's PoDoFo can parse; a failure leaves the file as it was |

The field list:

Each field is:

| | |
|---|---|
| `Page` | 1-based; 1 when left out |
| `Name` | the field's name, unique in the document |
| `Type` | `"Text"`, `"Check"` or `"Signature"` |
| `Rect` | `{ X, Y, Width, Height }` in **PDF points**, origin at the **bottom-left** |
| `Value` | the text of a `Text` field |
| `Checked` | the state of a `Check` field |
| `ReadOnly`, `Required` | the PDF field's own flags |
| `Multiline`, `MaxLength` | a `Text` field's line count and character limit |
| `Reason` | a `Signature` field's reason |

**A signature field is a `/Sig` widget with no signature in it.** The signer's
own application — Acrobat, Preview, a browser or the platform's signing tool —
fills it with their certificate. Bintana never needs the private key.
