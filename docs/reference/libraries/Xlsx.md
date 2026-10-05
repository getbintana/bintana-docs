# Xlsx

A workbook, written: the sheet somebody on the other side of the table asks
for.

It is **not a control**: it ships in the `xlsx` library, is reached with `uses`,
and is one class of statics over the runtime's [`Zip`](../globals/Zip.md) and
[`Xml`](../globals/Xml.md). The name is the format and not the program —
`xlsx` is the extension of ECMA-376 — and it writes that format and nothing
else.

```json
{ "name": "Clients", "startup": "ClientsForm", "uses": ["xlsx"] }
```

```js
Xlsx.Write("clients.xlsx", [{
    Name:    "Clients",
    Columns: [{ Text: "Name" }, { Text: "Balance", Kind: "money" }, { Text: "Since", Kind: "date" }],
    Rows:    [["Álvarez", new Decimal("120.50"), "2024-03-01"]],
}]);
```

**It writes, and only writes.** There is no reader here: opening a workbook is
[`examples/sheets`](https://github.com/getbintana/bintana/tree/main/examples/sheets),
which is an example and not this library's other half. What it is for is an
application handing a table to somebody who will open it in a spreadsheet
program, which is what `examples/clients`' *Export* does.

## Every member

| | | |
|---|---|---|
| `Available` | whether this build can write a workbook: libxml2 is optional, and it is what the parts are written with | [available](#available) |
| `Write(path, sheets)` | writes `sheets` as an `.xlsx` at `path`; answers the number of sheets | [write](#write) |

## Available

| | |
|---|---|
| `Available` | whether this build can write a workbook: libxml2 is optional, and it is what the parts are written with |

An `.xlsx` is a zip of XML parts, so the writer needs the runtime's
[`Xml`](../globals/Xml.md) — which is **optional at build time**, the sqlite and
libsecret mould. `Available` is the build's answer, and without libxml2 `Write`
refuses with a sentence naming the package instead of writing anything.

A program that offers an export asks it before offering the button:

```js
if (Xlsx.Available) … // the action is enabled
```

## Write

| | |
|---|---|
| `Write(path, sheets)` | writes `sheets` as an `.xlsx` at `path`; answers the number of sheets. Each sheet is `{ Name, Columns, Rows }`, a column's `Kind` being `text` (the default), `number`, `money`, `date` or `bool`. **Throws** naming the cell for a value that cannot be its kind, and naming the package when the build has no libxml2 |

`Xlsx.Write(path, sheets)` writes the workbook and answers **the number of
sheets**. Every part is built before the archive is opened, so a value refused
half way through the third sheet writes nothing at all; the archive itself is
written to a temporary and moved into place last, so a failure leaves the file
that was already there as it was and nothing beside it.

### A sheet

| | |
|---|---|
| `Name` | what the tab says. 1 to 31 characters, no `[ ] : * ? / \`, no leading or trailing apostrophe, and no two equal without case — the format's limits, refused by name |
| `Columns` | `[{ Text, Kind, Width }]`. `Text` is the heading, `Width` a width in characters (8 to 60 unless the values need more). `Kind` decides what a cell *is*, not how it looks |
| `Rows` | one array per row, in the columns' order. A row with more values than there are columns is refused, naming the row |

### What each kind of cell is

A spreadsheet holds a value as text, a number, a date or a boolean, and **which
one is not decided by how it looks**: `01234` is a postal code and must stay
text, or it becomes 1234 and a customer in Córdoba is somewhere else. So a
column says its `Kind`, the value is held to it, and a value that cannot be that
kind is refused naming the cell — not written as something near it.

| `Kind` | the cell |
|---|---|
| `text` (the default) | an inline string, with its spaces kept. A character XML cannot carry (a control character, half a surrogate pair) is **dropped** here, because whether a stray character in a client's name should stop an export is the application's question and the answer for a list is no. A sheet's *name* is not cleaned: it is the program's own text, and a bad one is refused |
| `number` | a number as it is. A [`Decimal`](../globals/Decimal.md) goes in by its own digits (`120.50`), because `"120.50"` as text is the one thing a column of money must not be |
| `money` | a number shown with two decimals (`0.00`) |
| `date` | `"YYYY-MM-DD"`, written as a serial number with a date format, because that is what a date *is* here. The format counts a 29 February 1900 that never existed, which is why the day zero is 30 December 1899 and every date after February 1900 is right |
| `bool` | `true` or `false` |

An empty value (`null`, `undefined`, `""`) is **no cell at all**, which is how
an empty cell is written, and not an empty string that a formula would count.

## What it does not do

- **It does not read.** Opening a workbook is `examples/sheets`, and reading is
  not what this library promises.
- **No formulas, no merged cells, no colours, no images, no charts**, and one
  style set: a bold header, the date format and the money format.
- **Money past fifteen significant digits does not survive.** A spreadsheet
  keeps a number as a double, which is the format's limit and not this
  library's, and the alternative — writing the digits as text — would be a
  column nobody can sum.
- **It needs libxml2**, optional at build time; see [Available](#available).

## See also

[`Zip`](../globals/Zip.md) · [`Xml`](../globals/Xml.md) ·
[`Decimal`](../globals/Decimal.md) ·
[`examples/clients`](https://github.com/getbintana/bintana/tree/main/examples/clients) ·
[`examples/sheets`](https://github.com/getbintana/bintana/tree/main/examples/sheets) ·
[llm/xlsx.md](../../llm/xlsx.md), the short form
