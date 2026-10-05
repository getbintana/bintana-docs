# xlsx — a workbook, written

`Xlsx` writes an `.xlsx`: the sheet somebody on the other side of the table asks
for. It ships in the `xlsx` library, reached the way any library is:

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

**It writes, and only writes.** There is no reader here — `examples/sheets` is
the other half, and it is an example because a reader is not what this library
promises. The name is the format and not the program: `xlsx` is the extension of
ECMA-376, and a class named after a vendor would promise its product.

## Xlsx

| Member | |
|---|---|
| `Available` | whether this build can write a workbook: libxml2 is optional, and it is what the parts are written with |
| `Write(path, sheets)` | writes `sheets` as an `.xlsx` at `path`; answers the number of sheets. Each sheet is `{ Name, Columns, Rows }`, a column's `Kind` being `text` (the default), `number`, `money`, `date` or `bool`. **Throws** naming the cell for a value that cannot be its kind, and naming the package when the build has no libxml2 |

### A sheet

| | |
|---|---|
| `Name` | what the tab says. 1 to 31 characters, no `[ ] : * ? / \`, no leading or trailing apostrophe, and no two equal without case — the format's limits, refused by name |
| `Columns` | `[{ Text, Kind, Width }]`. `Text` is the heading, `Width` a width in characters (8 to 60 unless the values need more). `Kind` decides what a cell *is*, not how it looks |
| `Rows` | one array per row, in the columns' order. A row with more values than there are columns is refused, naming the row |

**What each kind of cell is**, because a spreadsheet holds them as different
things and which one is not decided by how it looks:

| `Kind` | the cell |
|---|---|
| `text` (the default) | an inline string, with its spaces kept. **`01234` is a postal code and stays text**, or it becomes 1234 and a customer is somewhere else |
| `number` | a number as it is. A `Decimal` goes in by its own digits (`120.50`), because `"120.50"` as text is the one thing a column of money must not be |
| `money` | a number shown with two decimals (`0.00`) |
| `date` | `"YYYY-MM-DD"`, written as a serial number with a date format, because that is what a date *is* here |
| `bool` | `true` or `false` |

An empty value (`null`, `undefined`, `""`) is **no cell at all**, which is how an
empty cell is written, and not an empty string that a formula would count.

## What it does not do

- **It does not read.** Opening a workbook is `examples/sheets`, and reading is
  not what this library promises.
- **No formulas, no merged cells, no colours, no images, no charts**, and one
  style set (a bold header, the date and the money formats). It is what an
  application needs to hand a table to somebody, not a spreadsheet engine.
- **Money past fifteen significant digits does not survive**: a spreadsheet
  keeps a number as a double. That is the format's limit and not this library's,
  and the alternative — writing the digits as text — would be a column nobody
  can sum.
- **It needs libxml2**, optional when the runtime is built: `Available` is the
  build's answer, and `Write` refuses with a sentence naming the package.

The container is written to a temporary and moved into place last, so an export
that fails half way leaves the file that was already there as it was and nothing
beside it.
