# Database

A [`Record`](Record.md) over a table.

`Database.Sqlite` is a **driver** in C; `Table` is the portable half in
`rad.js`. Nothing generic here carries the name of an implementation, and the
second engine proved it: [`Database.Odbc`](OdbcConnection.md) reaches every
server with an ODBC driver, and the same `Table`, `Cursor` and `Model` work on
it, reading what differs off `Dialect`.

```js
class Client extends Record {
    static Naming = "snake";                      // the SQL spelling, once
    static Fields = {
        Id:         Field.Int({ key: true }),     // the identity
        Name:       Field.Text({ required: true, max: 80 }),
        Balance:    Field.Decimal({ decimals: 2 }),
        PostalCode: Field.Text({ max: 8 }),       // column postal_code
    };
}

const db      = Database.Sqlite("data/sales.db");   // ":memory:" also works
const clients = db.Table("clients", Client);

const c = clients.Save(new Client({ Name: "Ana" }));  // INSERT; fills c.Id
c.Balance = "1500.50";
clients.Save(c);                                      // UPDATE, by the key
```

## Every member

**On a connection**

| | |
|---|---|
| `Close()` | let it go |
| `Columns(table)` | `[{ Name, Type, Required, Key }]` — what is really in the table, which is how a program checks that a record's shape still fits |
| `Dialect` (ro) | `{ Placeholder, Quote, NewKey, KeyQuery, Page, Decimal, Types, AutoKey }` — **what differs per engine**, so the portable half above can build SQL without knowing which engine it is talking to |
| `Execute(sql, [params])` | **one** statement, answering `{ Changes, LastId }` |
| `Open` (ro) | whether it still is |
| `Path` | the file this connection is |
| `Query(sql, [params])` | the rows a statement answers, as **plain objects** — for the report, the `GROUP BY`, the join that is not one shape |
| `Each(sql, [params], fn)` | the rows **one at a time**: `fn(row)` for each, as `Query` would have made it, never an array of all of them -- a report over a year, an export. `fn` returning `false` stops; the answer is how many rows were handed over. `Close()` is refused while it reads |
| `Cursor(sql, [params], [options])` | a [`Cursor`](Database.md): the rows a statement answers, counted, and read a window at a time |
| `Script(sql)` | several statements and **no parameters**: a schema, a migration |
| `Table(name, RecordClass)` | a [`Table`](Database.md): the rows of `name` as records of `Shape` |
| `Tables` (ro) | the tables and views, ordered |
| `Transaction(fn)` | everything in `fn` or nothing. **Nests**, through savepoints, so a function that wraps its own work in one is safe to call from inside another |

**On a table**

| | |
|---|---|
| `All()` | → every row, as records |
| `Connection` (ro) | the connection it came from |
| `Count([sql], …params)` | → a number, building no records |
| `Cursor([sql], …params)` | a [`Cursor`](Database.md): the rows a statement answers, counted, and read a window at a time |
| `Delete(rec)` | DELETE by key; **throws** when it matched no row |
| `Find(…key)` | → one record or `null`; one value per key field, in declaration order |
| `Insert(rec)` | INSERT, and tells the record its new key |
| `Name` (ro) | the table's name |
| `Save(rec)` | `Insert` when the key is at its starting value, else `Update` |
| `Shape` (ro) | the record class it maps |
| `Update(rec)` | UPDATE by key, **only the columns that changed**; **throws** when it matched no row |
| `Where(sql, …params)` | → the rows matching, as records |

**A cursor**

| | |
|---|---|
| `Count` (ro) | how many rows the statement answers, asked once until `Refresh()` |
| `Row(index)` | one row by its position, from the window around it |
| `Rows(start, count)` | `count` rows from `start`, in one statement |
| `Each(fn)` | the rows **one at a time**: `fn(row)` for each, as `Query` would have made it, never an array of all of them -- a report over a year, an export. `fn` returning `false` stops; the answer is how many rows were handed over. `Close()` is refused while it reads |
| `Refresh()` | forgets the count and the window |
| `Window` (ro) | how many rows a window reads |

## The two halves

**The typed half is `Table`**, and it is where a program should live: it answers
records, checks values on the way in and knows the key. **The untyped half is the
connection**, for the query that is not a row of one shape — a report, a
`GROUP BY`, a schema migration.

`Where` takes **SQL**, and everything after the filter goes with it:

```js
clients.Where("balance > ? ORDER BY name LIMIT 50", 0)
```

**Values are bound, never interpolated**, and there is no way to ask for anything
else: `Where("name = ?", typed)` and never string concatenation. That is not a
warning about SQL injection so much as the shape making it unavailable.

## A row is a file

`Load` reads a row and `Serialize` writes one, so **nothing converts values on
the way**: a [`Decimal`](Decimal.md) is stored as **text**, exact — a REAL would
lose the cents — a `"YYYY-MM-DD"` date is text that already sorts, a
[`Bytes`](Bytes.md) is a BLOB, and a `Bool` is SQL's `0`/`1`.

All five of sqlite's storage classes are used. `Field.Record` and `Field.List`
are **refused**: a detail is its own table, which is a schema decision and not
something a mapper should make silently.

A column spelled in another case is the same identifier to SQL: a record's
`Code` against a column `code` needs no `Naming`, and the table reads the row as
the shape spells it. A spelling that differs by more than case is refused on the
first statement -- `Naming` or `as` is the answer, never a guess.

## The connection itself

| | |
|---|---|
| `Query(sql, [params])` | the rows a statement answers, as **plain objects** — for the report, the `GROUP BY`, the join that is not one shape |
| `Execute(sql, [params])` | **one** statement, answering `{ Changes, LastId }` |
| `Script(sql)` | several statements and **no parameters**: a schema, a migration |
| `Columns(table)` | `[{ Name, Type, Required, Key }]` — what is really in the table, which is how a program checks that a record's shape still fits |
| `Tables` (ro) | the tables and views, ordered |
| `Dialect` (ro) | `{ Placeholder, Quote, NewKey, KeyQuery, Page, Decimal, Types, AutoKey }` — **what differs per engine**, so the portable half above can build SQL without knowing which engine it is talking to |
| `Path` | the file this connection is |
| `Open` (ro) | whether it still is |
| `Close()` | let it go |
| `Table(name, RecordClass)` | a [`Table`](Database.md): the rows of `name` as records of `Shape` |

## A cursor: many rows, a window at a time

| | |
|---|---|
| `conn.Cursor(sql, [params], [{ Window }])` | the rows a statement answers, counted and read a window at a time (200 rows unless `Window` says) |
| `table.Cursor([sql], …params)` | the same over a table, each row a record; the filter is `Where`'s |
| `Count` (ro) | how many rows the statement answers, asked once until `Refresh()` |
| `Row(index)` | one row by its position, `0` to `Count - 1`, from the window around it |
| `Rows(start, count)` | `count` rows from `start`, fewer at the end, in one statement |
| `Each(fn)` | the rows **one at a time**: `fn(row)` for each, as `Query` would have made it, never an array of all of them -- a report over a year, an export. `fn` returning `false` stops; the answer is how many rows were handed over. `Close()` is refused while it reads |
| `Refresh()` | forgets the count and the window, so the next question reads again |
| `Window` (ro) | how many rows a window reads |
| `conn.Each(sql, [params], fn)` | the connection's own: `fn(row)` for each row as `Query` would make it, never an array. Answers how many. `Close()` is refused while it reads |

`Query` answers **every row in an array**, which is right for a screenful and
wrong for a grid over a table of a year, or an export. A cursor answers `Count`
with one `SELECT count(*)` and a row from a window read with `LIMIT`/`OFFSET`
around it, so a [`TableView`](../widgets/TableView.md) asking `Data(row, column)`
as it draws costs a statement every `Window` rows:

```js
this.cur = db.Cursor("SELECT * FROM sales ORDER BY id");
this.Grid.Count = this.cur.Count;                     // on demand

Grid_Data(row, column) { return String(this.cur.Row(row)[NAMES[column]]); }
```

**The statement says its order.** `LIMIT`/`OFFSET` over a statement with no
`ORDER BY` is undefined in SQL — two windows could overlap or miss a row — and a
cursor does not parse a statement to add one. Over 200 000 rows ordered by the
key, the last window is read in 2 ms; ordered by an expression with no index, such
as `locale_key(name)`, every new window sorts the table again (0.45 s), so keep
that order for a short list or give it a column of its own with an index.

**What it has read it keeps until `Refresh()`** — the count and the window. A
program that wrote a row asks again.

`Each` is the one a driver must provide for a cursor never to hold every row:
stepping a statement is the engine's. `fn` may run other statements on the
connection, which sqlite allows while a read is stepping; closing it is refused
until `Each` returns.

## The language's order: `COLLATE LOCALE` and `locale_key`

Text compares byte by byte, so `ORDER BY name` puts `Álvarez` after `Zapata`.
Two names registered on every connection give [`Locale.Compare`](Locale.md)'s
order in the statement:

```js
db.Query("SELECT name FROM clients ORDER BY locale_key(name)")       // to sort
db.Query("SELECT * FROM clients WHERE name < ? COLLATE LOCALE", ["M"]) // to compare
```

`locale_key(x)` is the order worked out once per row, and the one to sort with:
over 200 000 names, 0.29 s, against 2.3 s for `ORDER BY name COLLATE LOCALE` and
0.11 s for bytes. `COLLATE LOCALE` is for what a key cannot do — a comparison, a
`GROUP BY`. Both are named in the statement, never in a schema, and **neither can
be indexed**: the order is the desktop's, and an index would keep one desktop's
order in a file another opens.

## An update writes what changed

`Update` writes **only the columns that changed** since the table read the record
— by `Find`, `Where`, `All` or a cursor — or last wrote it. Two windows editing
different fields of one row both keep their edit; the last writer used to replace
every column. A record the program built and gave a key has no such past, and
every column is written. Nothing changed is no statement at all.

## Transactions

| | |
|---|---|
| `Transaction(fn)` | everything in `fn` or nothing. **Nests**, through savepoints, so a function that wraps its own work in one is safe to call from inside another |

## A connection on a form

The connection can be declared in a `.form` as a part, with no rectangle, and
a `Model` part selects one record over one of its tables:

```json
"components": [
  { "type": "Connection", "name": "Db",
    "properties": { "Path": "data/clients.db" } },
  { "type": "Model", "name": "Clients",
    "properties": { "Connection": "Db", "Record": "Client",
                    "TableName": "clients" } }
]
```

```js
this.Clients.Insert(client);
this.Db.Query("select * from clients");
```

**One `Connection` is one file; one `Model` is one record over one table.**
Several models can use the same connection -- `this.Clients`, `this.Orders` --
and the file is opened once. `Path` is relative to the project. `Model`'s
`Record` names a `.record` (or a `Record` class in code), `TableName` the
table, and `Model.Table` is the `Table`; its first use creates the table from
the shape with `CREATE TABLE IF NOT EXISTS`. The mapping is the one `Table`
already uses: text/date/time/datetime/enum/decimal are `TEXT`, int and bool
`INTEGER`, number `REAL`, bytes `BLOB`, a single integer key is `INTEGER
PRIMARY KEY`, and `required` is `NOT NULL`. A `Field.List` or `Field.Record`
is not a column and is refused by name; a shape that no longer fits an
existing table is `Table`'s refusal, not a silent migration.

The file opens on first use; `Db` is the `Connection`, and `Query`, `Execute`,
`Script`, `Table`, `Tables`, `Columns`, `Transaction` and `Close` are the
connection's own words for it. A form that closes closes it. See
[FormPart](FormPart.md) and
[forms.md](../../llm/forms.md#parts--objects-with-no-rectangle).

## What goes wrong

- **`Update` threw and the program stopped.** It matched no row — the record's
  key is wrong or the row is gone, which is a real failure and not a no-op.
- **A total was out by cents.** A `REAL` column somewhere, or a double that got
  in before the `Decimal` did.
- **A value was refused before any SQL ran.** The record checked it: the column
  is not where that check lives.
- **`Field.Record` was refused.** A detail is its own table, and its own
  `Table`.
- **Two connections to one file fought.** sqlite is a file: one connection per
  process, and a `Transaction` around anything that writes more than one row.
- **A query that is not this shape.** `Query`/`Execute` on the connection; they
  answer plain objects and take the same bound parameters.

## See also

[`Record`](Record.md) · [`Decimal`](Decimal.md) ·
[`examples/clients`](https://github.com/getbintana/bintana/tree/main/examples/clients) · [../../plans/data-plan.md](https://github.com/getbintana/bintana/blob/main/docs/plans/data-plan.md)
