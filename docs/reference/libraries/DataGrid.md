# DataGrid

A table with frozen columns, a row of totals, one sort and a spreadsheet's copy
and paste.

The leading columns stay put while the rest scroll across, the totals stay under
their columns, a click on a heading sorts every column together, and selected
rows go to LibreOffice or Excel and come back. It ships in the `datagrid`
library and is a [`Component`](../widgets/Component.md).

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
        { Text: "Amount", Width: 100, Alignment: "Right", Total: "sum", Decimals: 2 },
    ];
    this.Lines.Frozen = 2;
    this.Lines.AddRows(rows);
}
```

**`examples/sales` is the whole of it running**: a year of sales with the sale
and the client frozen, exact totals of quantity and amount, a filter, quantity
and price editable with the amount worked out again, and rows copied to and
pasted from a spreadsheet.

## Every member

| | | |
|---|---|---|
| `Columns` | the columns, as `TableView`'s `{ Text, Width, Alignment, Editor, Link, Visible }` with `Total` (`"sum"`, `"count"`, `"avg"`, `"min"`, `"max"`) and `Decimals` for the row of totals | [the columns](#the-columns) |
| `Frozen` | how many leading columns stay put while the rest scroll across | [the columns](#the-columns) |
| `Sortable` | whether a click on a heading sorts the rows, in both halves | [the columns](#the-columns) |
| `GroupBy` | the declared column whose values group the rows, `-1` for none | [groups](#groups) |
| `ExpandAll()` | opens every group | [groups](#groups) |
| `CollapseAll()` | closes every group | [groups](#groups) |
| `Add(row)` | adds a row, the array of its values in declared column order | [the rows](#the-rows) |
| `AddRows(rows)` | adds many rows in one change to both halves | [the rows](#the-rows) |
| `Clear()` | takes every row away | [the rows](#the-rows) |
| `Count` (ro) | how many rows the grid holds | [the rows](#the-rows) |
| `Row(index)` | that row's values, in declared column order | [the rows](#the-rows) |
| `Cell(row, column)` | one value, by row and declared column | [the rows](#the-rows) |
| `SetCell(row, column, value)` | writes one value, by row and declared column, in whichever half draws it | [the rows](#the-rows) |
| `RemoveRow(index)` | takes one row out | [the rows](#the-rows) |
| `Refilter()` | asks `Filter` of every row again, in both halves | [the rows](#the-rows) |
| `Index` | the selected row, `-1` for none | [the selection](#the-selection) |
| `MultiSelect` | more than one row at a time, in both halves | [the selection](#the-selection) |
| `Selection` (ro) | every selected row, as an array of indices in order | [the selection](#the-selection) |
| `Totals()` | the row of totals as it is drawn: one value per declared column, `""` where a column declares none | [totals](#totals) |
| `Copy()` | the selected rows as tab-separated text, every column in declared order -- what a spreadsheet pastes -- put on the clipboard and answered | [a spreadsheet](#a-spreadsheet) |
| `Range` (ro) | the rectangle of cells marked on screen, `{ Row, Column, ToRow, ToColumn }` with rows as data indices, or `null` | [a spreadsheet](#a-spreadsheet) |
| `SelectRange(row, column, toRow, toColumn)` | mark a rectangle of cells, in any order, and answer the grid | [a spreadsheet](#a-spreadsheet) |
| `ClearRange()` | take the mark off every cell; answers the grid | [a spreadsheet](#a-spreadsheet) |
| `Paste(text)` | writes tab-separated text from the current cell down and across: a spreadsheet's copied rows, or `text` when given | [a spreadsheet](#a-spreadsheet) |
| **event** `Select()` | the selection moved, in either half | [the selection](#the-selection) |
| **event** `Activate()` | a double click or Enter on a row | [the selection](#the-selection) |
| **event** `CellEdit(row, column, text, how)` | an edit ended, as `TableView`'s, with `column` the declared index | [the rows](#the-rows) |
| **event** `Filter(row)` | asked of each row, as `TableView`'s | [the rows](#the-rows) |

## The columns

| | |
|---|---|
| `Columns` | the columns, as `TableView`'s `{ Text, Width, Alignment, Editor, Link, Visible }` with `Total` (`"sum"`, `"count"`, `"avg"`, `"min"`, `"max"`) and `Decimals` for the row of totals. A column is always its declared index, in whichever half it is drawn |
| `Frozen` | how many leading columns stay put while the rest scroll across. Default `0`, every column scrolling |
| `Sortable` | whether a click on a heading sorts the rows, in both halves. Default `false` |

**A column is always its declared index**, whichever half draws it -- `Cell`,
`SetCell`, `CellEdit` and `Totals` count from the first column declared, frozen
or not. A sort orders the grid's own rows, numbers as numbers and text as the
locale orders it, and fills both halves in that order.

## The rows

| | |
|---|---|
| `Add(row)` | adds a row, the array of its values in declared column order |
| `AddRows(rows)` | adds many rows in one change to both halves |
| `Clear()` | takes every row away |
| `Count` (ro) | how many rows the grid holds |
| `Row(index)` | that row's values, in declared column order |
| `Cell(row, column)` | one value, by row and declared column |
| `SetCell(row, column, value)` | writes one value, by row and declared column, in whichever half draws it |
| `RemoveRow(index)` | takes one row out |
| `Refilter()` | asks `Filter` of every row again, in both halves |
| **event** `CellEdit(row, column, text, how)` | an edit ended, as `TableView`'s, with `column` the declared index; `how` is `"paste"` for a cell `Paste` wrote. **`false` refuses it**, a string is kept instead of the text |
| **event** `Filter(row)` | asked of each row, as `TableView`'s; **`false` hides it** in both halves |

## The selection

| | |
|---|---|
| `Index` | the selected row, `-1` for none. Assigning selects it in both halves |
| `MultiSelect` | more than one row at a time, in both halves. Default `false` |
| `Selection` (ro) | every selected row, as an array of indices in order |
| **event** `Select()` | the selection moved, in either half |
| **event** `Activate()` | a double click or Enter on a row |

## Totals

| | |
|---|---|
| `Totals()` | the row of totals as it is drawn: one value per declared column, `""` where a column declares none |

`Total` is `"sum"`, `"count"`, `"avg"`, `"min"` or `"max"`, and a column with
one puts the row of totals under the grid. Values are counted as `Decimal`s --
a `Decimal`, a number, or text that reads as one -- so a sum is exact, and
`Decimals` rounds the total shown.

## A spreadsheet

| | |
|---|---|
| `Copy()` | the selected rows as tab-separated text, every column in declared order -- what a spreadsheet pastes -- put on the clipboard and answered. With a rectangle marked, that rectangle instead |
| `Range` (ro) | the rectangle of cells marked on screen, `{ Row, Column, ToRow, ToColumn }` with rows as data indices, or `null` |
| `SelectRange(row, column, toRow, toColumn)` | mark a rectangle of cells, in any order, and answer the grid. A grouped grid refuses: its rows are keys in a tree, not positions |
| `ClearRange()` | take the mark off every cell; answers the grid |
| `Paste(text)` | writes tab-separated text from the current cell down and across: a spreadsheet's copied rows, or `text` when given. Each cell is raised as `CellEdit` with `"paste"`, so a handler can refuse it. Rows past the last one are not made. With no `text` the clipboard is read, which answers later |

Ctrl+C and Ctrl+V in the grid do the same. **A press and a drag mark a rectangle
of cells** in either half; a plain click marks one cell, Shift extends from the
anchor, and the cells wear `bta-cell-range` (`SetRange` on the two tables).
`Copy` answers the rectangle when there is one and the selected rows otherwise.
`Paste` writes from the current cell down and across without making new rows.
A grouped grid has no rectangle: its rows are keys in a tree, and a position
moves when a group folds.

## Groups

| | |
|---|---|
| `GroupBy` | the declared column whose values group the rows, `-1` for none. Each group is a row of its own over its rows -- its value and how many, then each `Total` worked out for the group alone -- and folds in both halves at once. Default `-1` |
| `ExpandAll()` | opens every group |
| `CollapseAll()` | closes every group |

```js
this.Grid.GroupBy = 1;          // by client: "Casa Rivas (12)", its subtotals, its sales
this.Grid.CollapseAll();        // one line per client
this.Grid.GroupBy = -1;         // flat again
```

**A group's row says what it is in the grouping column** -- the room its values
already have -- or in the first column when that one is hidden, and carries
each `Total` worked out over the group's rows alone, drawn as a heading. Groups
come in the order of their value (numbers as numbers), the rows under each in
the grid's order; sorting by a heading sorts within each group, and sorting by
the grouping column orders the groups. The row of totals under the grid stays
the grand total.

**The grid still speaks of rows by index**: `Index`, `Selection`, `Cell`,
`CellEdit` and `Filter` mean the same row grouped or flat, and a group's row is
no row of the data -- `Index` is `-1` on it, it opens no editor, `Copy` leaves it
out. `Paste` and Tab go down the rows as they are shown, skipping a folded
group. A fold made with a group's arrow folds both halves, and stays folded when
a filter, a sort or a new row rebuilds the groups; an edit to a grouping cell
moves its row to its new group.

## What it is made of

Four [`TableView`](../widgets/TableView.md)s -- `FrozenView`, `MainView`,
`FrozenTotals`, `MainTotals` -- kept in line by properties every table has:
`ScrollY` and `ScrollX` from the other's `Scroll`, `ColumnWidths` for the widths
drawn, `ColumnResize` for a heading's edge dragged, `Headers` off for the totals,
`Hover` and `HoverRow` for the row under the pointer, lit in both halves, and
the `shared-selection` class on the panel around them, so the selection is one
colour in both while either has the focus. The row of totals is chosen in both
halves at once, and **it and the rows are one selection**: choosing the totals
lets go of the rows (raising `Select`), and choosing a row lets go of the totals.

**Tab walks the cells**, as in a spreadsheet: the next cell, Shift+Tab the one
before, across both halves in declared order and on to the next row at the end
of one, skipping hidden columns and filtered rows. Past the first cell or the
last the focus leaves the grid; Ctrl+Tab leaves it from anywhere. The rows
chosen stay chosen while the cell moves along a row.

They are reachable for what the grid does not say itself.

## See also

[`TableView`](../widgets/TableView.md) · [`Decimal`](../globals/Decimal.md) ·
[`Clipboard`](../globals/Clipboard.md)
