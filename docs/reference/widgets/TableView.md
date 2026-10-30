# TableView

A list with columns, and its rows may nest.

This is the control to reach for whenever a row has **fields** — a file and its
size and kind, a client and their town and balance, a folder that opens onto the
files inside it. It draws its own headings, scrolls itself, sorts on a click, and
holds its rows either as strings it owns or as an answer it asks you for.

It is a `Widget` and a control like any other, so everything on
[Widget](Widget.md) is on it too; what follows is what is its own.

## Every member

Everything it has of its own, in one place. Each links to where it is explained;
the short phrase is there so a name can be found by eye, and the sentence that
matters is in the section. **Everything on [`Widget`](Widget.md) is also on it** —
`Visible`, `Enabled`, `Font`, `Style`, `Tooltip`, `Bounds()` and the rest — and is
not repeated here.

**Properties**

| | | |
|---|---|---|
| `AutoExpand` | opens a node as it arrives, and again when it gains a child after being closed by hand | [a tree](#a-tree) |
| `ColumnLines` | rules between the columns | [the columns](#the-columns) |
| `ColumnOrder` (ro) | the declared column indices, in the order the view shows them -- `[0, 1, 2]` until a heading is dragged or `MoveColumn` is called | [moving a column](#moving-a-column) |
| `Columns` | an array of `{ Text, Width, Alignment, Editor, Link, Visible, Tree }` | [the columns](#the-columns) |
| `Count` | how many rows — **settable**, which is the on-demand mode: the table then asks `Data(row, column)` for each cell it draws | [the rows](#the-rows-it-holds), [on demand](#on-demand-a-table-that-holds-nothing) |
| `CurrentCell` | the cell the reader is on, as `{ Row, Column }` — the row is a key in a tree and an index in a flat table, the column is an index — or `null` for none | [the current cell](#the-current-cell) |
| `EditCell(row, column)` | the click, from code: opens that cell's editor, turns a `Check`, or raises a `Custom` cell's `CellEditor` | [editing a cell](#editing-a-cell) |
| `EndEdit([commit])` | ends the open edit: committed as Enter would, or with `false` given up as Escape would | [editing a cell](#editing-a-cell) |
| `HeaderHeight` (ro) | how tall the row of column headings is | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `HeaderMenu` | the menu a column heading offers on a secondary click, as the same array of items `Menu` takes | [the heading's menu](#the-headings-menu) |
| `HeaderMinHeight` | a floor for the row of column headings, in pixels | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `Index` | the selected row, `-1` for none | [the selection](#the-selection) |
| `Key` | the selected node's key; assigning selects it alone, opening the way to it | [a tree](#a-tree) |
| `MultiSelect` | more than one row at a time, in a flat table or a tree, set before the rows or after them | [the selection](#the-selection) |
| `SelectedKeys` | every selected node's key, in the order shown -- `[]` for none, and one key without `MultiSelect` | [a tree](#a-tree) |
| `Reorderable` | lets the person drag a heading to another place | [moving a column](#moving-a-column) |
| `RowHeight` (ro) | how tall one row is, as GTK measured it | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `RowLines` | rules between the rows | [the columns](#the-columns) |
| `ScrollMaxY` (ro) | the largest `ScrollY` that still shows a row: the rows' height less one view | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `ScrollY` | how far down the rows are scrolled, in pixels -- the wheel, a scrollbar, the keyboard or an assignment | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `Selection` (ro) | every selected row, as an array of indices in order | [the selection](#the-selection) |
| `SetEditable(row, column, editable)` | whether this row's cell edits, in a column with an `Editor` | [editing a cell](#editing-a-cell) |
| `Sortable` | makes the headers clickable | [sorting](#sorting) |

**Methods**

| | | |
|---|---|---|
| `Add(values, [options])` | one row, as an array of strings | [the rows](#the-rows-it-holds), [a tree](#a-tree) |
| `AddRows(rows)` | many rows in one call, each the array `Add` takes | [the rows](#the-rows-it-holds) |
| `Cell(row, column)` | one value | [the rows](#the-rows-it-holds) |
| `Clear()` | empties it — **and forgets which of the three shapes this table was** | [the rows](#the-rows-it-holds) |
| `CollapseAll()` | closes every node | [a tree](#a-tree) |
| `CollapseNode(key)` | closes it | [a tree](#a-tree) |
| `Deselect(index)` | unselects it | [the selection](#the-selection) |
| `DeselectAll()` | selects nothing | [the selection](#the-selection) |
| `Activate([index])` | raises `Activate` for that visible position, as a double click would; the selected row with no argument | [the selection](#the-selection) |
| `ActivateOnSingleClick` | raise `Activate` on one click instead of two | [the selection](#the-selection) |
| `Exists(key)` | whether that node is there | [a tree](#a-tree) |
| `ExpandAll()` | opens every node | [a tree](#a-tree) |
| `ExpandNode(key)` | opens or closes it | [a tree](#a-tree) |
| `Expanded(key)` | whether it is open | [a tree](#a-tree) |
| `MoveColumn(column, position)` | puts the declared column at that place of the view, `0` the first: what a drag does, from code, and raising nothing | [moving a column](#moving-a-column) |
| `RemoveRow(index)` | takes that row out | [the rows](#the-rows-it-holds) |
| `RemoveNode(key)` | takes that node out, **and the subtree with it** | [a tree](#a-tree) |
| `Reveal(index)` | brings that visible row into view with the least scrolling it takes, and answers whether there was one | [the rows](#the-rows-it-holds) |
| `Refilter()` | says the answer to `Filter` may have changed, and asks it again of every row | [filtering](#filtering) |
| `Row(index)` | that row's values, as the array it was given — including any it was given beyond the columns declared | [the rows](#the-rows-it-holds) |
| `Select(index)` | move the selection from code | [the selection](#the-selection) |
| `SelectAll()` | with `MultiSelect` | [the selection](#the-selection) |
| `SetCell(row, column, value)` | one cell, in place | [the rows](#the-rows-it-holds) |
| `SetIcon(row, column, name)` | an icon from the theme beside a cell's text | [the rows](#the-rows-it-holds) |
| `SetStyle(row, column, style)` | the theme class a cell wears -- a name like `"heading"`, the way `Style` takes one on a control, not a colour | [the rows](#the-rows-it-holds) |
| `SetUri(row, column, uri)` | where a `Link` cell goes when that is not its text | [the rows](#the-rows-it-holds) |
| `SortBy(column, [ascending], [compare])` | actually reorders the rows it holds, **by the text the cells show**: natural order by default (`9` before `10`, the locale's collation otherwise), or `compare(a, b)` — the two cells' text, answering a number as `Array.sort`'s does — for what natural order reads wrongly: a minus sign, grouped thousands, a `d/m/Y` date | [sorting](#sorting) |
| `SortColumn(column, [ascending])` | the same as clicking that heading from code: the arrow moves and `Sort` is raised | [sorting](#sorting) |

**Events**

| | | |
|---|---|---|
| `Activate()` | raises `Activate` for that visible position, as a double click would; the selected row with no argument | [the selection](#the-selection) |
| `CellChange(row, column)` | the current cell moved; `null` and `-1` say it was cleared | [the current cell](#the-current-cell) |
| `Data(row, column)` | a cell is needed — **the answer is the return value** | [on demand](#on-demand-a-table-that-holds-nothing) |
| `Filter(row)` | asked of each row — **returning `false` hides it** | [filtering](#filtering) |
| `ColumnMove(column, position)` | the person dragged a heading to another place | [moving a column](#moving-a-column) |
| `HeaderClick(column, button, ctrl, shift)` | a heading was pressed — **the answer is the menu** | [the heading's menu](#the-headings-menu) |
| `Select()` | move the selection from code | [the selection](#the-selection) |
| `Sort(column, ascending)` | a heading was clicked — **the handler decides** | [sorting](#sorting) |

## Which list is this one

Four controls here are lists, and **what differs is what a row is**. Everything
else — the selection, adding, removing, clearing — is spelt the same way in all
four on purpose.

| | a row is | reach for it when |
|---|---|---|
| `ListBox` | a string | the list is words, and they may be translated |
| `RowList` | a widget you built | a row is a small form: fields, a switch, a button |
| `TreeView` | a name, addressed by key | a hierarchy, with no headings and one column |
| **`TableView`** | **fields, and they may nest** | rows have columns — flat, on demand, or a tree |

A `Grid` is none of these: it is a layout for controls you place, not a list of
data.

**A `TableView` replaces the pair people used to build**: a `TreeView` for the
hierarchy and a table beside it for the fields, re-filled every time the
selection moved. That arrangement loses the headings over the tree, the alignment
per row and the single scrollbar, and keeps each node's other values in a
structure of its own by hand.

## The three shapes, and choosing one

A table either **holds** its rows or it does not, and the ones it holds may
**nest**. Which of the three you are in is decided by the first row that goes in,
and `Clear()` decides again:

| | `Add(values)` | `Add(values, { Key })` | `Count = n` |
|---|---|---|---|
| **holding its rows** | ✔ | ✖ | clears the rows |
| **on demand** | clears the count, and holds that row | ✖ | ✔ |
| **a tree** | ✖ | ✔ | ✖ |

- **Holding its rows** is the ordinary one. The table owns the strings, so
  `Cell`, `Row`, `SetCell`, `SetIcon` and `SortBy` all answer: there is something
  there to answer about.
- **On demand** is `Count = n` and a `Data` handler. A hundred thousand rows cost
  a number, because the table asks for the cells it is about to draw and nothing
  else. The four calls above are refused: the values live wherever your handler
  reads them.
- **A tree** is `Add(values, { Key, Parent })`. The headings sit over the
  hierarchy, every node carries its own fields, and it is one scrolling surface.
  From then on a row is addressed by its **key**.

Mixing them is refused where you write it, with the reason:

```
Add: this table is a tree -- every row in one is a node, so it needs a key:
Add(values, { Key, Parent })
```

## A table on a form

Declared in the `.form` like any control, columns and all — they are an ordinary
property, so the designer edits them and the catalogue translates their headings:

```json
{ "type": "TableView", "name": "Files",
  "properties": {
    "X": 10, "Y": 10, "Width": 554, "Height": 250,
    "HAlign": "Fill", "VAlign": "Fill", "MinWidth": 260, "MinHeight": 140,
    "Sortable": true,
    "Columns": [ { "Text": "Name" },
                 { "Text": "Size", "Width": 90, "Alignment": "Right" },
                 { "Text": "Kind", "Width": 160 } ] } }
```

and filled from code:

```js
Form_Open() {
    for (const [name, size, kind] of FILES) {
        this.Files.Add([name, size, kind]);
        this.Files.SetIcon(this.Files.Count - 1, 0, iconFor(kind));
    }
}

Files_Select()  { this.BtnDelete.Enabled = this.Files.Index >= 0; }
Files_Activate() { Message.Info("{0} is {1}", this.Files.Cell(this.Files.Index, 0),
                                              this.Files.Cell(this.Files.Index, 2)); }
```

That fragment is the first page of [`examples/table`](https://github.com/getbintana/bintana/tree/main/examples/table),
shortened; the example itself is the three shapes side by side, on three pages.

**It scrolls itself.** A `TableView` is already a scrolling view of its rows —
putting one inside a `Scroller` gives it infinite room to grow into and takes the
scrollbar away from the rows, which is the opposite of what was wanted.

## The columns

| | |
|---|---|
| `Columns` | an array of `{ Text, Width, Alignment, Editor, Link, Visible, Tree }`. `Text` is **translated**; `Width: 0` sizes itself and the last column takes the slack. **`Visible: false` hides the column** -- and it keeps its place in the list, so the numbers the program uses (`Cell`, `SetCell`, `SortColumn`, `HeaderClick`) are the ones it declared, and a column that comes back does not shift the ones after it. **`Editor` makes the cells fields**, and is a kind's name or `{ Kind, ... }`: `"Text"`; `{ Kind: "Number", Min, Max, Step, Decimals }`, answering with a point and rounding a half away from zero; `"Date"`, a field with a calendar whose day is `YYYY-MM-DD` (the arrows move the day, Enter or Space picks it); `{ Kind: "Check", ActiveText, InactiveText }`, a tick holding one of the two (`"true"`/`"false"`); `{ Kind: "Combo", Items }`; and `"Custom"`, which opens nothing and raises `CellEditor`. The kinds are `Widget.PropertyOptions("TableView", "Columns.Editor")`. A click or F2 opens a cell, Enter or the focus leaving commits, Escape gives up, and `CellEdit` decides. **A cell is still text** -- every kind reads it and writes it back. `Editable: true` is `Editor: "Text"`. `Link: true` makes each cell a link -- underlined, a pointer over it, a focus stop, Enter -- whose address is the cell's text unless `SetUri` or `Data` says another, and a cell with no text is plain. **`Tree: true` puts a tree's expander** -- the arrow and the indent -- in that column instead of the first; only where it is drawn moves, every index stays the declared one. One column at most says it, a flat table keeps it for when it becomes a tree, and a marked column that is `Visible: false` hands the expander to the first column shown. **A column is edited or a link, never both**, and a misspelt option is refused by name |
| `ColumnLines` | rules between the columns. Default `false` |
| `RowLines` | rules between the rows. Default `true` |

Only `Text` is required, and `Width: 0` — the default — means *size yourself to
what is in you*. **The last column takes the slack**, whatever its width says, so
a table never ends in a gap: put the column that should absorb the width last,
give the short ones beside it a fixed width (a size, a date, an amount), and
right-align the numbers.

A width is where a column **starts**, not a cage: the user can drag the edge
between two headings -- and, with `Reorderable`, the heading itself to another
place ([moving a column](#moving-a-column)).

## Moving a column

| | |
|---|---|
| `Reorderable` | lets the person drag a heading to another place. **Only where the column is drawn moves**: every index stays the declared one -- `Cell`, `Data(row, column)`, `CellEdit`, `HeaderClick`, `Sort` -- and `ColumnOrder` says the places. A drop raises `ColumnMove`; assigning `Columns` again puts the columns back in the declared order. Default `false` |
| `ColumnOrder` (ro) | the declared column indices, in the order the view shows them -- `[0, 1, 2]` until a heading is dragged or `MoveColumn` is called. What a program keeps to give the person their order back: replay it with `MoveColumn(ColumnOrder[i], i)` from the first place to the last |
| `MoveColumn(column, position)` | puts the declared column at that place of the view, `0` the first: what a drag does, from code, and raising nothing. The indices stay the declared ones |
| **event** `ColumnMove(column, position)` | the person dragged a heading to another place: `column` is its declared index and `position` its place in the view now. Raised with `Reorderable`, after the move; `ColumnOrder` is the whole order. Not raised by `MoveColumn` |

**A column has an index and a place, and every member speaks of the index.**
The index is where it was declared in `Columns`, and it is what the row's
values, `Cell`, `Data(row, column)`, `CellEdit`, `HeaderClick` and `Sort` all
say; the place is only where it is drawn. So a program never has to translate:
the person can put "Fin" before "Inicio" and `Cell(row, 3)` is still "Fin".

The order is **the person's, not the form's**: a `.form` carries `Reorderable`
and never the order, and assigning `Columns` again puts the declared order
back. A program that wants the order kept saves `ColumnOrder` and gives it back
the next time:

```js
Tasks_ColumnMove(column, position) {
    Settings.Set("tasks.order", this.Tasks.ColumnOrder);
}

restoreOrder() {
    const order = Settings.Get("tasks.order", null);
    if (order && order.length === this.Tasks.Columns.length)
        order.forEach((column, place) => this.Tasks.MoveColumn(column, place));
}
```

A hidden column keeps its place and moves like any other. A tree's expander is
on a column, not on a place, so it goes with the column it is on -- the one
marked `Tree`, or the first declared.

Re-declaring `Columns` rebuilds the headings and **keeps the rows**. A row holds
the values it was given, not a copy cut to the columns that existed at the time:
add `["a", "b", "c"]` to a table of two columns and the third value is there,
unshown, and appears if a third column is declared later. The other way round, a
row shorter than there are columns simply reads blank in the rest.

## The rows it holds

| | |
|---|---|
| `Add(values, [options])` | one row, as an array of strings. A row shorter than there are columns reads `""` for the rest. Clears an on-demand `Count`. **`options` is `{ Key, Parent, Icon }`, and a row with a `Key` is a node**: the first one makes this table a tree, `Parent` is the key of the node it goes under (absent is a root), and `Icon` is the picture for its first column — the same one `TreeView.Add` takes, so a node need not be added and then decorated. **For many rows at once, `AddRows`**: one change to the list instead of one per row |
| `AddRows(rows)` | many rows in one call, each the array `Add` takes. **The whole batch is one change to the list**, which is what makes filling a table from a query linear: `Add` appends one item and raises `items-changed` per call, so the ordinary loop was quadratic — 40 000 rows took 17 s (D3 of the October audit), and this is a `splice`. Refused on a tree, whose rows are nodes with keys, and it clears an on-demand `Count` as one `Add` does |
| `Count` | how many rows — **settable**, which is the on-demand mode: the table then asks `Data(row, column)` for each cell it draws. **Settable**, and setting it is the on-demand shape. Assigning it puts the table in this shape and clears any rows it held |
| `Cell(row, column)` | one value. Refused on an on-demand table, which has no cells to answer about |
| `Row(index)` | that row's values, as the array it was given — including any it was given beyond the columns declared. Refused on an on-demand table |
| `SetCell(row, column, value)` | one cell, in place. The selection stays where it is |
| `SetIcon(row, column, name)` | an icon from the theme beside a cell's text. `""` takes it off. Refused on an on-demand table |
| `SetStyle(row, column, style)` | the theme class a cell wears -- a name like `"heading"`, the way `Style` takes one on a control, not a colour. `""` takes it off, and recycling a cell takes it off too. Refused on an on-demand table, whose `Data` answers `{ Text, Style }` |
| `SetUri(row, column, uri)` | where a `Link` cell goes when that is not its text. `""` makes the cell not a link, `null` goes back to opening its text. Refused on an on-demand table |
| `RemoveRow(index)` | takes that row out. **Flat only** — a tree says `RemoveNode(key)`, and this one refuses with that sentence |
| `RemoveNode(key)` | takes that node out, **and the subtree with it**. **Tree only** — a flat table says `RemoveRow(index)` |
| `Reveal(index)` | brings that visible row into view with the least scrolling it takes, and answers whether there was one |
| `Clear()` | empties it — **and forgets which of the three shapes this table was** |

**In a tree, every one of these takes a key where it says `row`** — see
[a tree](#a-tree). `Add` takes the text of each cell and nothing else; the icon
is a second call.
That is what keeps `Add(["a", "b", "c"])` the way a row is written — a cell is
text, and an icon is a name the desktop draws.

**Removing more than one row goes back to front.** `Selection` is the selected
rows in order, and taking one out shifts every row after it:

```js
for (const at of [...this.Files.Selection].reverse()) this.Files.RemoveRow(at);
```

Front to back deletes the wrong rows the moment two are selected, and works
perfectly until somebody selects two.

## The selection

| | |
|---|---|
| `Index` | the selected row, `-1` for none. Assigning selects it. Default `-1` |
| `Selection` (ro) | every selected row, as an array of indices in order. In a tree they are positions of the rows shown, which a fold moves -- `SelectedKeys` names the nodes |
| `MultiSelect` | more than one row at a time, in a flat table or a tree, set before the rows or after them. Ctrl+click adds or takes a row, Shift+click selects a range, and Shift+Up/Down grows or shrinks the range from the row the reader is on; a plain click or arrow goes back to one. A Ctrl or Shift click opens no editor. Default `false` |
| `Select(index)` | move the selection from code. `Select` leaves the others alone where several are allowed. In a tree the index is a position of the rows shown, as `Index` is |
| `Deselect(index)` | unselects it |
| `SelectAll()` | with `MultiSelect`. In a tree, every row shown: a node under a closed parent has no row to select |
| `DeselectAll()` | selects nothing |
| `Activate([index])` | raises `Activate` for that visible position, as a double click would; the selected row with no argument. Answers whether there was one. In both the flat and the tree shape, because a click lands on a position |
| `ActivateOnSingleClick` | raise `Activate` on one click instead of two. Default `false` |
| **event** `Select()` | the selection moved — by the user or by an assignment to `Index` or `Key` (not `SelectedKeys` or `MultiSelect`). Ask `Index` for where it is and `Cell`/`Row` for what is there; `Key` when the table is a tree, and `Selection`/`SelectedKeys` for every row of a `MultiSelect` one |
| **event** `Activate()` | a double click on a row, or Enter on it. The gesture for *open this one* |

`Select` fires for a selection made in code as well as one made with the mouse,
which is what a form wants: the button under the table is enabled in one place
rather than in every place that moves the selection. **Two assignments are the
exception**: `SelectedKeys` and `MultiSelect` raise nothing, so a program that
puts back the rows it was working on after a rebuild does not hear its own
doing.

**With `MultiSelect`, the gestures are a sheet's.** Ctrl+click adds a row or
takes it off, Shift+click selects the range from the row last clicked, and
Shift+Up/Down grows or shrinks the range from the row the reader is on (the
current cell's); a plain click or a plain arrow goes back to one row. A Ctrl or
Shift click is a selection and nothing else -- it opens no editor and leaves the
current cell where it was. It works the same in a flat table and a tree.

**`Activate([index])` is the double click from code**, and
`ActivateOnSingleClick` decides which click raises the event in the first place
(default `false`, like every other list here). The index is the visible position
— what a click lands on — and with no argument it is the row already selected,
which is what Enter does. It is the same verb in the flat and the tree shape,
because a click lands on a position; a position that is not there is nothing to
activate and not an error.

**`Index` answers the first selected row**, once there is more than one:
selecting 0, then 2, then 3 leaves `Index` at `0` and `Selection` at `[0, 2, 3]`.
Ask `Selection` whenever `MultiSelect` is on.

## The current cell

| | |
|---|---|
| `CurrentCell` | the cell the reader is on, as `{ Row, Column }` — the row is a key in a tree and an index in a flat table, the column is an index — or `null` for none. **Assigning moves it and selects the row**, opening the way to it; `null` clears it. A cell that is not editable is a cell all the same: it can be current, and F2 is what opens it |
| **event** `CellChange(row, column)` | the current cell moved — a press, `EditCell`, F2, or an assignment to `CurrentCell`. `row` is an index in a flat table and a key in a tree; **`null` and `-1` say it was cleared**. `CurrentCell` is where it is now |

**A row is selected; a cell inside it is current**, and that finer cursor is the
table's own: `CurrentCell` answers it as `{ Row, Column }` — a key in a tree, an
index in a flat table — or `null` for none. A press moves it, F2 and `EditCell`
move it to the cell they open, and **assigning it moves it too, selecting the row
and opening the way to the node**; assigning `null` clears it, and a cell that
does not edit is a cell all the same: a summary's date can be the current one,
and F2 is what opens a field there. **The rows that leave take it with them** —
`Clear`, `RemoveRow`, `RemoveNode` and a shrinking `Count` drop it — and while
one is current it carries the class `bta-cell-current`, so an application's
`app.css` is what draws the frame or the tint its sheet wants.

**`CellChange(row, column)` is raised when it moves**, whichever way it moved —
`null` and `-1` say it was cleared — so a status line, an entry bar or a
program's own cursor can follow the reader.

**Enter, Tab and Shift+Tab are the grid's move-on keys**, and the table consumes
them: the program reads them and moves the current cell itself, since where it
goes — the next row, the next column, wrapping at the ends — is the
application's. `CellEdit` says so in its `how`, so **an edit that ends with one
is reported even when the text did not change**: the whole message is *this edit
is over, move on*. Enter arrives as `KeyPress` before the view activates the
row, so a grid can use it without the row's dialog opening instead.

## Filtering

| | |
|---|---|
| `Refilter()` | says the answer to `Filter` may have changed, and asks it again of every row. The whole of the API on this side: what the handler answers from -- a search field, a tick -- is the program's, and nothing here can see it change. A tree and a table answering `Data` refuse it |
| **event** `Filter(row)` | asked of each row as it arrives and on `Refilter()`. **Returning `false` hides the row**; no handler shows every one. **A hidden row is still a row**: `Count` counts it, and `Index`, `Selection`, `Select`, `Cell` and every event number by it, so an index means the same row whatever is typed in a search. A lookup and nothing else: it runs while the table is told about rows. A flat table that holds its rows -- not a tree, not one answering `Data` |

```js
// a search box over the table: the answer is the return value
Grid_Filter(row) {
    return this.Search.Text === "" ||
           this.Grid.Cell(row, 0).toLowerCase().includes(this.Search.Text.toLowerCase());
}
Search_Change() { this.Grid.Refilter(); }
```

**A hidden row is still a row.** `Count` counts it, and `Index`, `Selection`,
`Select`, `Cell` and every event number by it -- so an index means the same row
whatever is typed in the search, and a program that keeps its data beside the
table keeps it by the same numbers. A hidden row cannot be selected or revealed
(`Select` and `Reveal` answer `false`). Rows added while a filter is on are
asked as they arrive, and a sort asks every row again. With no handler every
row shows.

**A lookup and nothing else**: `Filter` runs while the table is being told
about rows, so it reads -- `Cell`, a field, the program's own data -- and
changes nothing. A tree and a table answering `Data` are not filtered, and
`Refilter()` refuses there, saying why.

## Sorting

| | |
|---|---|
| `Sortable` | makes the headers clickable. **The table does not reorder itself** — it raises `Sort`. Default `false` |
| **event** `Sort(column, ascending)` | a sortable header was clicked. **The handler decides** — `SortBy` is what actually reorders |
| `SortBy(column, [ascending], [compare])` | actually reorders the rows it holds, **by the text the cells show**: natural order by default (`9` before `10`, the locale's collation otherwise), or `compare(a, b)` — the two cells' text, answering a number as `Array.sort`'s does — for what natural order reads wrongly: a minus sign, grouped thousands, a `d/m/Y` date. **Stable**: equal cells keep the order they had, so sorting by one column and then another nests them. A comparator that throws leaves the rows as they were |
| `SortColumn(column, [ascending])` | the same as clicking that heading from code: the arrow moves and `Sort` is raised |

**A sortable table does not sort itself**, and this is the one thing about it
that surprises everybody once. It cannot: a table that answers `Data` has no rows
to reorder, and the same word must not mean two different things depending on
which shape the table is in. So the click arrives as an event and the answer is
one line:

```js
Files_Sort(column, ascending) { this.Files.SortBy(column, ascending); }
```

**The order is the order of what the cells show**, because a table keeps the
text it draws and not the value it was given. By default that is *natural*
order -- the desktop's collation, with runs of digits compared as numbers, so
`9` comes before `10` and `Factura 9` before `Factura 10`. What it reads wrongly
is a minus sign, a grouped thousand (`1.234,56` against `999,00`) and a date
written day first; for those the program says how, and only the program can:

```js
Totals_Sort(column, ascending) {
    this.Totals.SortBy(column, ascending,
        (a, b) => Locale.Parse(a) - Locale.Parse(b));
}
```

The sort is **stable** -- equal cells keep the order they had -- so sorting by
one column and then by another leaves the first order inside the second. A
comparator that throws, or answers something that is not a number, leaves the
rows exactly as they were and the error reaches the caller.

An on-demand table answers it by changing what its `Data` handler reads — sorting
the source, or reading it backwards — and the rows redraw where they are.

**The selection follows the rows through a sort**, in both shapes: the rows that
were selected are still the selected ones, at whatever positions they have moved
to. The same is true of `SetCell` — changing a cell does not move the highlight.

## The heading's menu

A right click on a column heading offers that heading's menu, and the menu is
the one `HeaderMenu` declares:

```js
Tasks.HeaderMenu = [{ name: "MnuColumns", text: Locale.Text("Columns…") },
                    { separator: true },
                    { name: "MnuHide", text: Locale.Text("Hide this column") }];
```

A label declared in a `.form` is prose the extractor already collects and the
menu builder translates; one that lives only in code is wrapped in
`Locale.Text`, which is what puts it in the catalogue.

| | |
|---|---|
| `HeaderMenu` | the menu a column heading offers on a secondary click, as the same array of items `Menu` takes. Built for each click, and every item's handler is told the column, last: `MnuHide_Click(column)`. Like `Menu`, refused on a table that is not in a form yet |
| **event** `HeaderClick(column, button, ctrl, shift)` | a column heading was pressed — the one pointer event a heading raises, because GTK claims its press before the bubble phase. `button` is `1` primary, `2` middle, `3` secondary. **The return value is the menu of the secondary click**: an array replaces `HeaderMenu` for that click, anything else falls back to it. A primary click also raises `Sort` when `Sortable`, on the release |

**Every item is told which column it was opened over**, last and after whatever
its kind already carries: `MnuHide_Click(column)`, a `check` item's
`Click(on, column)`, a dynamic one's `Click(index, text, column)`. That is what
makes *Hide this column* writable at all, and it is why **the menu is built for
each click** rather than once: a menu whose items act on "this column" has to be
instantiated for the one that was clicked. The consequence to know: the state a
program sets on an item from code — `this.MnuHide.Enabled = false` — does not
survive the next right click. A menu that depends on the context answers it from
the event, which is also where a dynamic menu is built:

```js
Tasks_HeaderClick(column, button, ctrl, shift) {
    if (button !== 3) return;
    this.headColumn = column;
    return [{ name: "MnuHide", text: Locale.Text("Hide this column") },
            { name: "MnuDel",  text: Locale.Text("Delete column"),
              enabled: this.Tasks.Columns.length > 1 }];
}
```

**`HeaderClick` is the heading's press for every button**, and the only pointer
event a heading raises: GTK's own title gesture claims the press, so the
`MouseDown` a control reports never arrives on a heading. The secondary click is
the one that asks for a menu — GTK presents it below the heading — and a primary
click still sorts when `Sortable` is on. The event is also what a custom order
hangs off: turn `Sortable` off and reorder in the handler, or keep it and use
another button for another order.

## On demand: a table that holds nothing

Set `Count` and answer `Data`:

| | |
|---|---|
| `Count` | how many rows — **settable**, which is the on-demand mode: the table then asks `Data(row, column)` for each cell it draws. **Settable**, and setting it is the on-demand shape. Assigning it puts the table in this shape and clears any rows it held |
| **event** `Data(row, column)` | the table needs a cell. **The return value is the answer**: a string, or `{ Text, Icon, Uri, Style, Editable }` for a cell with a picture, an address or a theme class of its own, or one that does not edit in a column that does (`Editable: false`). In a `Link` column an absent `Uri` means the text is the address and `""` means this cell is not a link |
| **event** `CellEdit(row, column, text, how)` | an edit ended. **`how` says what ended it**: `"enter"`, `"tab"` and `"shift-tab"` are the grid's move-on keys, and an edit that ends with one is reported even when nothing changed, because the program reads the reason and moves; `"pick"` is a day, an item or a tick chosen; `"focus"` is the keyboard leaving; `"code"` is `EndEdit`; `"left"` is the row unbound, scrolled away. Every other reason reports a text that changed. `row` is an index in a flat table and a key in a tree. **Returning `false` refuses it** and the cell goes back to what it said; **a string is kept instead of the text** -- the program's own spelling of what was typed; anything else keeps the text. A handler that throws refuses. An on-demand table holds no cells, so there the handler stores it. **A held flat row the program removed while the edit was open is not raised at all**: its index went with it, and `-1` names no row; a tree keeps its key |
| **event** `CellLink(row, column, uri)` | a `Link` cell was activated — a click, or Enter on it. `row` is an index in a flat table and a key in a tree. **Returning `false` refuses it** and nothing is opened, as in `CellEdit`; anything else lets the desktop open `uri` |

```js
Form_Open()            { this.Big.Count = 100000; }
Big_Data(row, column)  { return column === 0 ? String(row) : String(row * row); }
```

A hundred thousand rows cost the number: the handler is called for the cells
about to be drawn, which is a few dozen for a screenful, and again when you
scroll.

**The handler must be a lookup.** It runs inside GTK's own drawing, once per
visible cell each time a row is bound, so anything slow in it is slow on every
scroll — and anything with a side effect changes the world while the world is
being measured. Read from an array, a `Record`, a map you already have; do not
open a file, do not query a database, do not write to a control.

`Cell`, `Row`, `SetCell` and `SetIcon` are refused here, and that is the shape
being honest: the values are not in the table, they are wherever your handler
reads them, and the table cannot answer for somebody else's data. `Add` is not
refused — it clears the count and the table starts holding rows again.

## Editing a cell

A column with an `Editor` draws its cells as labels and opens a field on one when
it is clicked, or when it has the focus and F2 is pressed. Enter, Tab and
Shift+Tab — the grid's move-on keys, see [the current
cell](#the-current-cell) — or the focus leaving, commits; Escape gives up. **The
kind is the column's**, and every kind reads the cell's text and writes text
back, so the rows, `Cell`, `Data` and sorting are the same as in any other
table:

```js
Plan_Columns = [
    { Text: "Task",      Editor: "Text" },
    { Text: "Duration",  Alignment: "Right",
      Editor: { Kind: "Number", Min: 0, Step: 1, Decimals: 1 } },
    { Text: "Start",     Editor: "Date" },              // a day picked is YYYY-MM-DD
    { Text: "Milestone", Alignment: "Center",
      Editor: { Kind: "Check", ActiveText: "Yes", InactiveText: "No" } },
    { Text: "Calendar",  Editor: { Kind: "Combo", Items: ["Standard", "Night"] } },
    { Text: "Constraint", Editor: "Custom" },           // shows …, opens your dialog
];
```

`Editable: true` is `Editor: "Text"`. A misspelt option is refused by name, and an
option of another kind too (`Items` on a `Number`). The kinds there are answer
`Widget.PropertyOptions("TableView", "Columns.Editor")`, and the designer's column
dialog offers them as the column's *Cell*, beside *None* and *Link*, with each
kind's options under it.

Two kinds have rules worth knowing before relying on them. **A `Number` answers
with a point and rounds a half away from zero**, as `Decimal` does: 12.25 at one
decimal is `12.3`, where printf would say `12.2`. **A `Date` is typed or picked**:
the button beside the field opens a calendar, the arrows move the day (across
months), and Enter, Space or a click picks it.

**`CellEdit(row, column, text, how)` decides**: `how` says what ended the edit
— `"enter"`, `"tab"` and `"shift-tab"` are the move-on keys, reported even when
nothing changed so the program can move the [current
cell](#the-current-cell); `"pick"` is a day, an item or a tick chosen; `"focus"`
is the keyboard leaving; `"code"` is `EndEdit`; `"left"` is the row unbound,
scrolled away. When the text changed, `false` puts back what the cell said, a
string is kept *instead* of what was typed — the program's own spelling, `"2"`
kept as `"2d"` — and anything else keeps the text. A table that answers `Data`
holds no cells to write, so there the handler stores the value and the cell asks
again on the next bind.

**Whether a cell edits at all is the row's**, and it is said before anything is
typed: a summary's dates are its children's, so on that row the cell is drawn dim
and opens nothing. **`CellEditor(row, column)` is asked as an edit begins**, and
is where a row's own list or kind comes from — the calendars a plan has, a date
only for the constraints that take one:

```js
Plan.SetEditable(row, 2, false);                          // a held row
Plan_Data = (row, column) => ({ Text: text(row, column),  // an on-demand one
                                Editable: !summary(row) });

Plan_CellEditor = (row, column) => {
    if (column === 4) return { Items: plan.Calendars };   // this edit's list
    if (column === 5) { openConstraintDialog(row); return; }
};
```

| | |
|---|---|
| `SetEditable(row, column, editable)` | whether this row's cell edits, in a column with an `Editor`: `false` draws it dim and opens nothing, **before** anything is typed -- a summary's dates, which are its children's. Refused on an on-demand table, whose `Data` answers `{ Text, Editable: false }` |
| `EditCell(row, column)` | the click, from code: opens that cell's editor, turns a `Check`, or raises a `Custom` cell's `CellEditor`. Answers whether it did -- `false` for a cell that is not on screen (`Reveal` first), not editable, or refused by `CellEditor` |
| `EndEdit([commit])` | ends the open edit: committed as Enter would, or with `false` given up as Escape would. Answers whether one was open |
| **event** `CellEditor(row, column)` | an edit is about to begin -- a click, F2 or `EditCell`. `row` is an index in a flat table and a key in a tree. **Returning `false` refuses it**; an object is this edit's editor over the column's -- `{ Items: [...] }` for a list that is the row's, `{ Max: 1000 }`, or `{ Kind: "Date" }` for a cell whose kind depends on its row (a `Check` column stays one). For a `Custom` column this is the whole edit: open the dialog here and write with `SetCell` |

`EditCell` is the click, from code, and `EndEdit` the Enter or the Escape — what a
Save button wants before it reads the rows. A `Custom` column opens nothing of its
own: `CellEditor` is the whole edit, and the program writes with `SetCell`.

[`examples/plan`](https://github.com/getbintana/bintana/tree/main/examples/plan)
is all of it running: a plan of phases and tasks with one column of each kind,
the phases' derived cells shut, the calendars handed to the `Combo` per edit, the
notes written in a dialog, and *Add task* opening the new row's name with
`EditCell`.

## A link in a cell

A column declared `Link: true` draws each cell as a link: underlined, a pointer
over it, a stop for the keyboard, and Enter or a click opens it. **The address is
the cell's own text** unless `SetUri(row, column, uri)` (or `Uri` in what `Data`
answers) says another, so a column of tickets can show `GLPI #4512` and open its
page. `""` makes one cell not a link and `null` goes back to the text; a cell
with no text is plain.

`CellLink(row, column, uri)` is raised first and, as `CellEdit` does, **`false`
refuses**: nothing is opened. Anything else lets the desktop open it. A column is
a field or a link and never both — declaring both is refused.

```js
Tickets_Columns  = [{ Text: "Task" }, { Text: "Ticket", Link: true }];
Tickets_CellLink = (row, column, uri) => uri.startsWith("https://");
```

## A class on a cell

`SetStyle(row, column, style)` puts a theme class on one cell, the way `Style`
takes one on a control: **a name, not a colour** — `"heading"` for a row that is
a group rather than a file, `"dim-label"` for one that is out of play, whatever
the theme paints. A theme that does not know the name simply does not paint it,
and that is not an error.

```js
Board_SetStyle = (key, column) => key.startsWith("g/") && column === 1 ? "heading" : "";
```

`""` takes it off, and the class comes off by itself when the cell is recycled
for another row — which is what makes a list that reuses its widgets say the
right thing. The one class the runtime adds on its own is `dim-label`, on a cell
`SetEditable` locked; a cell can wear both.

## A tree

Give a row a `Key` and the table becomes a hierarchy with headings over it.

| | |
|---|---|
| `Add(values, { Key, Parent, Icon })` | one row, as an array of strings. A row shorter than there are columns reads `""` for the rest. Clears an on-demand `Count`. **`options` is `{ Key, Parent, Icon }`, and a row with a `Key` is a node**: the first one makes this table a tree, `Parent` is the key of the node it goes under (absent is a root), and `Icon` is the picture for its first column — the same one `TreeView.Add` takes, so a node need not be added and then decorated. **For many rows at once, `AddRows`**: one change to the list instead of one per row |
| `Key` | the selected node's key; assigning selects it alone, opening the way to it. `""` selects nothing. **With several selected it is the one the reader is on**: the `CurrentCell` row when that row is selected, otherwise the first selected node shown. A tree only |
| `SelectedKeys` | every selected node's key, in the order shown -- `[]` for none, and one key without `MultiSelect`. Assigning selects exactly those, opening the way to each, and `[]` selects nothing; **it raises no `Select`**. A key that is not there is refused before anything changes, and so are several without `MultiSelect`. `[]` on a flat table, which refuses the assignment. A fold drops the selection of the rows it hides, as GTK does |
| `Exists(key)` | whether that node is there. `false` on a flat table rather than a refusal: it is the question you ask *before* you know |
| `AutoExpand` | opens a node as it arrives, and again when it gains a child after being closed by hand. Default `true`. A tree only. The same mechanism `TreeView` uses, answering the same |
| `ExpandNode(key)` | opens or closes it. Opening opens the way to it too, since a row only exists once its ancestors are open. Not `Expand`, which is `Widget`'s layout property |
| `CollapseNode(key)` | closes it |
| `ExpandAll()` | opens every node |
| `CollapseAll()` | closes every node |
| `Expanded(key)` | whether it is open |
| `Count` (ro here) | how many rows — **settable**, which is the on-demand mode: the table then asks `Data(row, column)` for each cell it draws. **Settable**, and setting it is the on-demand shape. Assigning it puts the table in this shape and clears any rows it held |

**A parent goes in before its children**: `Parent` names a key, and a key that
nothing has added yet is not there to go under.

**The expander -- the arrow and the indent -- is in the first column, unless a
column says `Tree: true`.** A plan that shows its Id first marks the name:

```js
this.Tasks.Columns = [
    { Text: "Id",       Width: 40,  Alignment: "Right" },
    { Text: "Tarea",    Width: 280, Editor: "Text", Tree: true },
    { Text: "Duración", Width: 84,  Alignment: "Right" },
];
```

Only where the outline is drawn moves: `Cell`, `Data(row, column)`,
`CellEdit`, `HeaderClick`, `SortColumn` and the keyboard still count the
columns as declared, so the name above is column 1. One column at most says
it -- two are a `TypeError`, and the columns stay as they were. A flat table
takes it and uses it the day its first `Key` arrives. **A marked column that is
`Visible: false` hands the expander to the first column shown**, and gets it
back when it is shown again: an outline that vanished with a column would leave
the rows with no way to open. Declaring `Columns` again moves the expander and
keeps the rows, and which of them were open.

**In a tree, a row is addressed by its key** — `Cell(key, column)`,
`SetCell(key, …)`, `SetIcon(key, …)`, `SetStyle(key, …)`, `Row(key)`, and
`RemoveNode(key)`, which takes the subtree with it. That is not a second spelling of the same thing: a *position*
in a tree is a position in the **visible** list, so it moves the moment something
above it is collapsed. `Index` still says where the highlight is right now, and
`Key` is the one to keep.

Sorting sorts **siblings within each parent**, which is the only order a
hierarchy has: sorting the flattened list would put a child above its own parent.

**Several nodes are selected with `MultiSelect`, and named by `SelectedKeys`.**
`Selection` still answers positions, which a fold moves; `SelectedKeys` answers
the keys in the order shown, and assigning it selects exactly those -- opening
the way to each, refusing the whole list if one key is not there, and raising no
`Select`. `Key`, with several selected, is the one the reader is on: the
`CurrentCell` row when it is among them, otherwise the first shown. A `SetCell`
or a sort keeps every selected node selected; **a fold drops the rows it hides**,
as GTK does, so read `SelectedKeys` after a `CollapseNode` rather than before.

```js
const keys = this.Tasks.SelectedKeys;     // the rows the reader chose
for (const k of keys) this.plan.indent(k);
this.fill();                              // Clear() and Add the plan again
this.Tasks.SelectedKeys = keys;           // the same rows, selected again
```

`ExpandNode` and not `Expand`: `Expand` is `Widget`'s layout property, on every
control, and means *absorb the slack in the box*.

## Beside something else: the geometry it can say

A schedule, a chart or a diff drawn next to a table needs three numbers from it —
where its rows are scrolled to, how tall one row is, and how tall the heading row
is — and **`GtkColumnView` has none of the three**: no row-height getter, no scroll
accessor and no way to ask which child is the heading. They are read out of what
GTK *does* publish, and each has a trap.

| | |
|---|---|
| `RowHeight` (ro) | how tall one row is, as GTK measured it. `0` while the table holds no row or has not been laid out |
| `HeaderHeight` (ro) | how tall the row of column headings is. `0` before the first allocation |
| `HeaderMinHeight` | a floor for the row of column headings, in pixels. **The heading does not follow the control's font** -- the theme sizes it -- so this is what makes a taller one. `0`, nothing said |
| `ScrollY` | how far down the rows are scrolled, in pixels -- the wheel, a scrollbar, the keyboard or an assignment. Assigning **clamps** to `[0, ScrollMaxY]`, so a number past the end means the end |
| `ScrollMaxY` (ro) | the largest `ScrollY` that still shows a row: the rows' height less one view. `0` when there is nothing to scroll |

```js
const rowsTop = this.Table.HeaderHeight;           // where the first row starts
const y       = rowsTop + i * this.Table.RowHeight - this.Table.ScrollY;
```

**`RowHeight` is the rows' natural height over the rows that are drawn.** In a tree
that is not `Count`, which is every node at every level: a folded branch is in
neither the count nor the height, and dividing by `Count` answered a row that got
shorter every time something was folded — a third short with one branch closed, on
a tree of fifteen. And it is not the scroll range divided by the rows either: that
range is never less than the view, so a plan of three tasks in a tall window
answered 102 for a row that is 36.

**The heading does not follow the font.** At 10, 11, 12 and 13 points the rows are
36, 37, 39 and 41 pixels tall and the heading is **25 in every one**: the theme
sizes it and not the control. `HeaderMinHeight` is a floor for it, and it moves the
heading and nothing else — the rows and their extent stay the theme's. A chart
beside a list used it to put two rows of axis type in the same band without making
the type seven points.

**A table with no columns has no heading row at all**, so `HeaderHeight` is `0`
there — and `0` is also what it answers before the first layout, which is why a
check for "has it been laid out" has to give the table a column to be true.

**The numbers need a viewport, and a table in a `Fixed` never gets one.** It is
handed a rectangle and the scrolled window inside it keeps a viewport of zero, so
the heading measures as the whole control and the rows come out 24 of 37. Put the
table in a [`Scroller`](Scroller.md) of its own, or in a box.

**They are a frame behind the rows.** A row added in this turn has no allocation
yet, so `RowHeight` is the one before it and `ScrollMaxY` the one before that. Wait
for a number rather than asserting as you go — `Timer.After(0, …)` is the usual
place.

`ScrollY` is assignable and **clamps** to `[0, ScrollMaxY]`, so a number past the
end means the end. It is the same pair of ideas as the `Scroller`'s and the
editors', and the same two panes locked together is
[`Editor.md`](Editor.md#where-it-is-scrolled-to)'s recipe.

## What goes wrong

- **The table is empty and nothing threw.** A tree whose `Parent` names a key
  that was never added has nowhere to go; add the parent first.
- **Clicking a heading does nothing.** `Sortable` makes the heading clickable; a
  `Sort` handler is what sorts. See [Sorting](#sorting).
- **A row was removed and the wrong one went.** Remove back to front — see
  [the rows it holds](#the-rows-it-holds).
- **`Cell` throws.** The table is on demand, so it has no cells. Read from
  wherever your `Data` handler reads.
- **The rows vanished when the count was set.** `Count = n` is the on-demand
  shape and clears what was held. It is one control and three shapes; `Clear()`
  is how you change your mind.
- **Scrolling is jerky with many rows.** Something in `Data` is not a lookup.
- **The table grew past the window.** It scrolls itself, so it does not need a
  `Scroller` around it; what it needs is `HAlign`/`VAlign` of `Fill`, or an
  `Expand`, so the room it gets is the room there is.

## What it does not do

- **No editing in place.** A cell is text the program put there; a table is for
  showing rows and choosing one. Editing belongs on a form beside it, which is
  also where the validation and the undo are.
- **No grouping, no totals, no frozen columns.** A report is
  [`report`](../../llm/report.md), which has bands, groups and totals and goes out
  as a PDF.
- **It does not sort itself.** Said twice on purpose.

## See also

[`ListBox`](ListBox.md) · [`RowList`](RowList.md) · [`TreeView`](TreeView.md) ·
[`Record`](../globals/Record.md), for rows that are data rather than strings ·
[`examples/table`](https://github.com/getbintana/bintana/tree/main/examples/table) · [`examples/plan`](https://github.com/getbintana/bintana/tree/main/examples/plan) · [`examples/clients`](https://github.com/getbintana/bintana/tree/main/examples/clients)
