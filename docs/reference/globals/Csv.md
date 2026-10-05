# Csv

Rows of text, the way spreadsheets and other programs exchange them.

A CSV file is a table with no types: every value is text, and what a column
means — a number, a date, a code with leading zeros — is the application's to
decide. `Csv` reads and writes the rows; it never guesses.

## Every member

| | |
|---|---|
| `Format(rows, options)` | rows (arrays of values) as CSV text. A value is quoted when it holds the separator, the quote, a line break or space at either end; `null` and `undefined` are empty, and a number is written as the language writes it, never in the desktop's format. `options`: `Separator` (default `,`), `Quote`, `LineEnd` (default LF) |
| `Load(path, options)` | the rows of a CSV file, as `Parse` reads them. **The error names the file** |
| `Parse(text, options)` | the rows of a CSV text, each an array of strings |`), `Quote` (default `"`). A last line break makes no empty row |
| `Save(path, rows, options)` | writes rows as a CSV file, as `Format` writes them |

## When to reach for it

```js
const rows = Csv.Load(path);             // [["host", "cpu"], ["web1", "12.5"], …]
const [headings, ...data] = rows;
const cpu = data.map((r) => Number(r[1]));

Csv.Save(out, [["host", "cpu"], ...hosts.map((h) => [h.Name, h.Cpu])]);
```

**The separator is found when it is not given**: the one of `,` `;` tab `|`
that the first line holds most of, outside quotes. A spreadsheet in a locale
whose decimal separator is the comma (Spanish, German, French) saves with `;`,
and a reader that assumed `,` would see one column per line and say nothing.
Give `Separator` when the file is known.

A quoted value may hold the separator, a line break, or a quote written twice
(`"dijo ""sí"""`). A line may end in LF or CRLF, and a UTF-8 byte-order mark
before the first heading is dropped. Rows may have different lengths; nothing
is padded.

## What goes wrong

- **A number came back as a string.** Every value is text: `Number(v)`, after
  deciding what an empty cell means.
- **"1,5" is not 1.5.** A decimal comma is the file's convention, not the
  parser's to undo: replace it before `Number` when the file was written that
  way.
- **`Csv.Parse: a quoted value is not closed`.** A quote opened and the text
  ended inside it — usually a file cut short, or a quote that should have been
  doubled.

## See also

[`File`](File.md) · [`Xml`](Xml.md), the other format other programs write
