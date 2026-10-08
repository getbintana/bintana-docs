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
| `Columns` | an array of `{ Text, Width, Alignment, Editable, Link }` | [the columns](#the-columns) |
| `Count` | how many rows — **settable**, which is the on-demand mode: the table then asks `Data(row, column)` for each cell it draws | [the rows](#the-rows-it-holds), [on demand](#on-demand-a-table-that-holds-nothing) |
| `HeaderHeight` (ro) | how tall the row of column headings is | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `HeaderMenu` | the menu a column heading offers on a secondary click, as the same array of items `Menu` takes | [the heading's menu](#the-headings-menu) |
| `HeaderMinHeight` | a floor for the row of column headings, in pixels | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `Index` | the selected row, `-1` for none | [the selection](#the-selection) |
| `Key` | the selected node's key; assigning selects, opening the way to it | [a tree](#a-tree) |
| `MultiSelect` | more than one row at a time | [the selection](#the-selection) |
| `RowHeight` (ro) | how tall one row is, as GTK measured it | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `RowLines` | rules between the rows | [the columns](#the-columns) |
| `ScrollMaxY` (ro) | the largest `ScrollY` that still shows a row: the rows' height less one view | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `ScrollY` | how far down the rows are scrolled, in pixels -- the wheel, a scrollbar, the keyboard or an assignment | [beside something else](#beside-something-else-the-geometry-it-can-say) |
| `Selection` (ro) | every selected row, as an array of indices in order | [the selection](#the-selection) |
| `Sortable` | makes the headers clickable | [sorting](#sorting) |
| `Reorderable` | whether a column heading can be dragged to move its column | [reordering the columns](#reordering-the-columns) |

**Methods**

| | | |
|---|---|---|
| `Add(values, [options])` | one row, as an array of strings | [the rows](#the-rows-it-holds), [a tree](#a-tree) |
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
| `RemoveRow(index)` | takes that row out | [the rows](#the-rows-it-holds) |
| `RemoveNode(key)` | takes that node out, **and the subtree with it** | [a tree](#a-tree) |
| `Reveal(index)` | brings that visible row into view with the least scrolling it takes, and answers whether there was one | [the rows](#the-rows-it-holds) |
| `Row(index)` | that row's values, as the array it was given — including any it was given beyond the columns declared | [the rows](#the-rows-it-holds) |
| `Select(index)` | move the selection from code | [the selection](#the-selection) |
| `SelectAll()` | with `MultiSelect` | [the selection](#the-selection) |
| `SetCell(row, column, value)` | one cell, in place | [the rows](#the-rows-it-holds) |
| `SetIcon(row, column, name)` | an icon from the theme beside a cell's text | [the rows](#the-rows-it-holds) |
| `SetUri(row, column, uri)` | where a `Link` cell goes when that is not its text | [the rows](#the-rows-it-holds) |
| `SortBy(column, [ascending], [compare])` | actually reorders the rows it holds, **by the text the cells show**: natural order by default (`9` before `10`, the locale's collation otherwise), or `compare(a, b)` — the two cells' text, answering a number as `Array.sort`'s does — for what natural order reads wrongly: a minus sign, grouped thousands, a `d/m/Y` date | [sorting](#sorting) |
| `SortColumn(column, [ascending])` | the same as clicking that heading from code: the arrow moves and `Sort` is raised | [sorting](#sorting) |
| `ReorderColumn(column, index)` | moves the column at `column` to `index` — the heading drag, from code, and the road a test can take because the gesture is a pointer one | [reordering the columns](#reordering-the-columns) |

**Events**

| | | |
|---|---|---|
| `Activate()` | raises `Activate` for that visible position, as a double click would; the selected row with no argument | [the selection](#the-selection) |
| `Data(row, column)` | a cell is needed — **the answer is the return value** | [on demand](#on-demand-a-table-that-holds-nothing) |
| `HeaderClick(column, button, ctrl, shift)` | a heading was pressed — **the answer is the menu** | [the heading's menu](#the-headings-menu) |
| `Select()` | move the selection from code | [the selection](#the-selection) |
| `Sort(column, ascending)` | a heading was clicked — **the handler decides** | [sorting](#sorting) |
| `Reordered(column, index)` | a heading was dragged, or `ReorderColumn` moved one: the column that was at `column` is now at `index` | [reordering the columns](#reordering-the-columns) |

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
| `Columns` | an array of `{ Text, Width, Alignment, Editable, Link }`. `Text` is **translated**; `Width: 0` sizes itself and the last column takes the slack; `Editable: true` makes a cell a field — clicked, typed and committed — and an editable column reads left-aligned, because a `GtkEditableLabel` is not a label. `Link: true` makes each cell a link — underlined, a pointer over it, a focus stop, Enter — whose address is the cell's text unless `SetUri` or `Data` says another, and a cell with no text is plain. **A column is a field or a link, never both** |
| `ColumnLines` | rules between the columns. Default `false` |
| `RowLines` | rules between the rows. Default `true` |

Only `Text` is required, and `Width: 0` — the default — means *size yourself to
what is in you*. **The last column takes the slack**, whatever its width says, so
a table never ends in a gap: put the column that should absorb the width last,
give the short ones beside it a fixed width (a size, a date, an amount), and
right-align the numbers.

A width is where a column **starts**, not a cage: the user can drag the edge
between two headings, and drag the heading itself to move the column — see
[reordering the columns](#reordering-the-columns).

Re-declaring `Columns` rebuilds the headings and **keeps the rows**. A row holds
the values it was given, not a copy cut to the columns that existed at the time:
add `["a", "b", "c"]` to a table of two columns and the third value is there,
unshown, and appears if a third column is declared later. The other way round, a
row shorter than there are columns simply reads blank in the rest.

## Reordering the columns

| | |
|---|---|
| `Reorderable` | whether a column heading can be dragged to move its column. **The reorder changes `Columns`** — and the rows with it — and raises `Reordered(column, index)`; `false` locks the order, which is what a program whose `Data` maps the position onto its own data wants. Default `true` |
| `ReorderColumn(column, index)` | moves the column at `column` to `index` — the heading drag, from code, and the road a test can take because the gesture is a pointer one. `Columns` is the new order afterwards, the rows moved with it, and `Reordered(column, index)` is raised. Moving one to where it already is does nothing |
| **event** `Reordered(column, index)` | a heading was dragged, or `ReorderColumn` moved one: the column that was at `column` is now at `index`. `Columns` is the new order and the rows moved with it. **The columns the table answers with are the ones the user arranged**, which is why a program that maps the position onto its own data turns `Reorderable` off |

A heading can be dragged along the row of headings, and **the order it lands in
is the order the table then answers by**: `Columns` reads it, a save writes it,
and `Cell(row, column)`, `SetIcon` and every event address a column by where it
is now. The rows move with the columns, so a row given `["Ana", "10.50"]` reads
`["10.50", "Ana"]` once those two are swapped — a position is what a column is.

**A program that answers `Data` keeps its own mapping**, so it is the one that
has to follow: map by position and rebuild the mapping in `Reordered`, or turn
the drag off with `Reorderable = false` and keep the order the form declared.
What a user rearranges on screen is saved as the new `Columns` when the form is
serialised, which is the point of letting them.

```js
/* the program's own order follows the table's */
Tickets_Reordered = (column, index) => {
    const [moved] = this.fields.splice(column, 1);
    this.fields.splice(index, 0, moved);
};
```

In a tree, the disclosure and the indent live on the **first visible column**,
so a reorder that puts another column first moves them there with it.

## The rows it holds

| | |
|---|---|
| `Add(values, [options])` | one row, as an array of strings. A row shorter than there are columns reads `""` for the rest. Clears an on-demand `Count`. **`options` is `{ Key, Parent, Icon }`, and a row with a `Key` is a node**: the first one makes this table a tree, `Parent` is the key of the node it goes under (absent is a root), and `Icon` is the picture for its first column — the same one `TreeView.Add` takes, so a node need not be added and then decorated |
| `Count` | how many rows — **settable**, which is the on-demand mode: the table then asks `Data(row, column)` for each cell it draws. **Settable**, and setting it is the on-demand shape. Assigning it puts the table in this shape and clears any rows it held |
| `Cell(row, column)` | one value. Refused on an on-demand table, which has no cells to answer about |
| `Row(index)` | that row's values, as the array it was given — including any it was given beyond the columns declared. Refused on an on-demand table |
| `SetCell(row, column, value)` | one cell, in place. The selection stays where it is |
| `SetIcon(row, column, name)` | an icon from the theme beside a cell's text. `""` takes it off. Refused on an on-demand table |
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
| `Selection` (ro) | every selected row, as an array of indices in order |
| `MultiSelect` | more than one row at a time. Refused on a tree |
| `Select(index)` | move the selection from code. `Select` leaves the others alone where several are allowed |
| `Deselect(index)` | unselects it |
| `SelectAll()` | with `MultiSelect` |
| `DeselectAll()` | selects nothing |
| `Activate([index])` | raises `Activate` for that visible position, as a double click would; the selected row with no argument. Answers whether there was one. In both the flat and the tree shape, because a click lands on a position |
| `ActivateOnSingleClick` | raise `Activate` on one click instead of two. Default `false` |
| **event** `Select()` | the selection moved — by the user or by an assignment. Ask `Index` for where it is and `Cell`/`Row` for what is there; `Key` when the table is a tree |
| **event** `Activate()` | a double click on a row, or Enter on it. The gesture for *open this one* |

`Select` fires for a selection made in code as well as one made with the mouse,
which is what a form wants: the button under the table is enabled in one place
rather than in every place that moves the selection.

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
| **event** `Data(row, column)` | the table needs a cell. **The return value is the answer**: a string, or `{ Text, Icon, Uri }` for a cell with a picture or an address of its own. In a `Link` column an absent `Uri` means the text is the address and `""` means this cell is not a link |
| **event** `CellEdit(row, column, text)` | an editable cell's edit ended — Enter, or the focus moving away. `row` is an index in a flat table and a key in a tree, as every verb here addresses one. **Returning `false` refuses it** and the cell goes back to what it said; anything else is taken and the text is written into the row. An on-demand table holds no cells, so there the handler stores it |
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

A column declared `Editable: true` draws its cells as fields: clicked, typed and
committed with Enter or by leaving. When the edit ends, `CellEdit(row, column,
text)` is raised and **its answer decides**: `false` puts back what the cell
said, anything else means *taken* and the text is written into the row. That
makes the event a notification with a veto rather than a request — a program
that wants validation, or that wants to store the value somewhere of its own,
has the one hook.

```js
Files_Columns   = [{ Text: "Name", Editable: true }, { Text: "Size" }];
Files_CellEdit  = (row, column, text) => text.trim() !== "";   // empty refuses
```

An editable column reads **left-aligned**: the cell is a `GtkEditableLabel` and
not a `GtkLabel`, and `Alignment` is the label's property. A table that answers
`Data` holds no cells to write, so there the handler stores the value and the
cell asks again on the next bind.

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

## A tree

Give a row a `Key` and the table becomes a hierarchy with headings over it.

| | |
|---|---|
| `Add(values, { Key, Parent, Icon })` | one row, as an array of strings. A row shorter than there are columns reads `""` for the rest. Clears an on-demand `Count`. **`options` is `{ Key, Parent, Icon }`, and a row with a `Key` is a node**: the first one makes this table a tree, `Parent` is the key of the node it goes under (absent is a root), and `Icon` is the picture for its first column — the same one `TreeView.Add` takes, so a node need not be added and then decorated |
| `Key` | the selected node's key; assigning selects, opening the way to it. `""` selects nothing. A tree only |
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

**In a tree, a row is addressed by its key** — `Cell(key, column)`,
`SetCell(key, …)`, `SetIcon(key, …)`, `Row(key)`, and `RemoveNode(key)`, which takes
the subtree with it. That is not a second spelling of the same thing: a *position*
in a tree is a position in the **visible** list, so it moves the moment something
above it is collapsed. `Index` still says where the highlight is right now, and
`Key` is the one to keep.

Sorting sorts **siblings within each parent**, which is the only order a
hierarchy has: sorting the flattened list would put a child above its own parent.

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
- **No columns the user can reorder.** They can drag a heading's edge to widen
  one — a declared width is where it starts — but the order is the form's.
- **No grouping, no totals, no frozen columns.** A report is
  [`report`](../../llm/report.md), which has bands, groups and totals and goes out
  as a PDF.
- **It does not sort itself.** Said twice on purpose.

## See also

[`ListBox`](ListBox.md) · [`RowList`](RowList.md) · [`TreeView`](TreeView.md) ·
[`Record`](../globals/Record.md), for rows that are data rather than strings ·
[`examples/table`](https://github.com/getbintana/bintana/tree/main/examples/table) · [`examples/clients`](https://github.com/getbintana/bintana/tree/main/examples/clients)
