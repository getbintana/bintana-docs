# DataGrid — a table with frozen columns and a row of totals

The table a business screen expects: the leading columns stay put while the
rest scroll across, a row of totals stays under its columns, a click on a
heading sorts every column together, and selected rows go to a spreadsheet and
come back from one.

It ships in the `datagrid` library, is reached with `uses`, and is a
[`Component`](../reference/widgets/Component.md), so it is placed on a form like
any other control.

```json
{ "name": "Invoices", "startup": "MainForm", "uses": ["datagrid"] }
```

```json
{ "type": "DataGrid", "name": "Lines", "properties": { "Expand": true } }
```

```js
Form_Open() {
    this.Lines.Columns = [
        { Text: "Code",   Width: 70 },
        { Text: "Client", Width: 160 },
        { Text: "Qty",    Width: 70,  Alignment: "Right", Total: "sum" },
        { Text: "Amount", Width: 100, Alignment: "Right", Total: "sum", Decimals: 2 },
        { Text: "Notes",  Width: 240, Editor: "Text" },
    ];
    this.Lines.Frozen   = 2;          // Code and Client stay put
    this.Lines.Sortable = true;
    this.Lines.AddRows(rows);         // each row: its values in column order
}

Lines_CellEdit(row, column, text) {
    if (column !== 3) return;
    try { new Decimal(text); } catch (e) { return false; }   // not an amount: refused
}
```

**`examples/sales` is the whole of it running**: a year of sales with the sale
and the client frozen, exact totals of quantity and amount, a filter, quantity
and price editable with the amount worked out again, and rows copied to and
pasted from a spreadsheet.

**A column is always its declared index**, whichever half draws it: `Cell`,
`SetCell`, `CellEdit` and `Totals` count from the first column declared, frozen
or not.

## DataGrid

| | |
|---|---|
| `Columns` | the columns, as `TableView`'s `{ Text, Width, Alignment, Editor, Link, Visible }` with `Total` (`"sum"`, `"count"`, `"avg"`, `"min"`, `"max"`) and `Decimals` for the row of totals. A column is always its declared index, in whichever half it is drawn |
| `Frozen` | how many leading columns stay put while the rest scroll across. Default `0`, every column scrolling |
| `Sortable` | whether a click on a heading sorts the rows, in both halves. Default `false` |
| `MultiSelect` | more than one row at a time, in both halves. Default `false` |
| `GroupBy` | the declared column whose values group the rows, `-1` for none. Each group is a row of its own over its rows -- its value and how many, then each `Total` worked out for the group alone -- and folds in both halves at once. Default `-1` |
| `ExpandAll()` | opens every group |
| `CollapseAll()` | closes every group |
| `Count` (ro) | how many rows the grid holds |
| `Index` | the selected row, `-1` for none. Assigning selects it in both halves |
| `Selection` (ro) | every selected row, as an array of indices in order |
| `Add(row)` | adds a row, the array of its values in declared column order |
| `AddRows(rows)` | adds many rows in one change to both halves |
| `Clear()` | takes every row away |
| `Row(index)` | that row's values, in declared column order |
| `Cell(row, column)` | one value, by row and declared column |
| `SetCell(row, column, value)` | writes one value, by row and declared column, in whichever half draws it |
| `RemoveRow(index)` | takes one row out |
| `Refilter()` | asks `Filter` of every row again, in both halves |
| `Totals()` | the row of totals as it is drawn: one value per declared column, `""` where a column declares none |
| `Copy()` | the selected rows as tab-separated text, every column in declared order -- what a spreadsheet pastes -- put on the clipboard and answered. With a rectangle marked, that rectangle instead |
| `Range` (ro) | the rectangle of cells marked on screen, `{ Row, Column, ToRow, ToColumn }` with rows as data indices, or `null` |
| `SelectRange(row, column, toRow, toColumn)` | mark a rectangle of cells, in any order, and answer the grid. A grouped grid refuses: its rows are keys in a tree, not positions |
| `ClearRange()` | take the mark off every cell; answers the grid |
| `Paste(text)` | writes tab-separated text from the current cell down and across: a spreadsheet's copied rows, or `text` when given. Each cell is raised as `CellEdit` with `"paste"`, so a handler can refuse it. Rows past the last one are not made. With no `text` the clipboard is read, which answers later |
| **event** `Select()` | the selection moved, in either half |
| **event** `Activate()` | a double click or Enter on a row |
| **event** `CellEdit(row, column, text, how)` | an edit ended, as `TableView`'s, with `column` the declared index; `how` is `"paste"` for a cell `Paste` wrote. **`false` refuses it**, a string is kept instead of the text |
| **event** `Filter(row)` | asked of each row, as `TableView`'s; **`false` hides it** in both halves |

**Totals are exact.** `Total` is `"sum"`, `"count"`, `"avg"`, `"min"` or
`"max"`; a value that is a `Decimal`, a number, or text that reads as a decimal
is counted as a `Decimal`, so `0.1 + 0.2` is `0.3`. `Decimals` rounds the total
shown. A column with a `Total` is what puts the row of totals under the grid.

**What it is made of**: four `TableView`s kept in line by properties every table
has -- `ScrollY` and `ScrollX` assigned from the other's `Scroll`,
`ColumnWidths` for the widths really drawn, `ColumnResize` when a heading's
edge is dragged, `Headers` off for the totals, `Hover` and `HoverRow` for the
row under the pointer, and `shared-selection` on the panel around the halves so
the selection is one colour in both. Choosing the row of totals lets go of the
rows (and raises `Select`), and choosing a row lets go of the totals. **Tab and
Shift+Tab walk the cells** across both halves and on to the next row, leaving the
grid past the first or last cell (Ctrl+Tab leaves from anywhere). They are
reachable as
`FrozenView`, `MainView`, `FrozenTotals` and `MainTotals` for what the grid does
not say itself (a row height floor, a heading menu).

**Groups**: `GroupBy = 1` puts a row per value of column 1 over its rows -- the
value and count in the grouping column, each `Total` over the group's rows --
folding both halves together. Rows are still addressed by index (`Index`,
`Cell`, `CellEdit`); a group's row is `-1`, opens no editor and is left out of
`Copy`. Sorting sorts within groups, and by the grouping column orders them.

**A rectangle of cells** is marked with a press and a drag in either half, or
from code with `SelectRange`; `Copy` answers that rectangle instead of the rows.
A plain click marks one cell, Shift extends from the anchor, and the cells wear
`bta-cell-range`. A grouped grid has no rectangle: its rows are keys in a tree,
and a position moves when a group folds. `Paste` writes from the current cell
down and across, and makes no new rows.
