# PropertyGrid

An object's properties, as rows that edit them.

An inspector, a settings screen, a printer's configuration page: the same panel
every time, one row per property, the name beside the field that suits it, and a
drop-down where the class declares the values it accepts. It ships in the
`propertygrid` library and is a [`Component`](../widgets/Component.md).

```json
{ "name": "Settings", "startup": "MainForm", "uses": ["propertygrid"] }
```

```json
{ "type": "PropertyGrid", "name": "Props", "properties": { "Expand": true } }
```

```js
Form_Open() {
    this.Props.Target = this.printer;
}
```

**`Target` is runtime data** — a `.form` cannot carry an object — so a form
assigns it once the object exists. Setting it builds the rows; `Refresh()`
rebuilds them after the target's shape changed in place.

## Every member

| | | |
|---|---|---|
| `Target` | the object whose properties are shown | [the target](#the-target) |
| `LabelWidth` | the width of the name column, in pixels | [the rows](#the-rows) |
| `Keys()` | the property names the grid shows, in the target's own order | [the rows](#the-rows) |
| `Editor(name)` | the editor built for one property, or `null` when it is not shown -- what a test or a caller that wants to focus a row asks for | [the rows](#the-rows) |
| `Value(name)` | the target's value for one property | [reading and writing](#reading-and-writing) |
| `SetValue(name, value)` | writes one property through the target's own setter and raises `Change`, as an edit in the grid does | [reading and writing](#reading-and-writing) |
| `Refresh()` | rebuilds the rows from the target; call it after changing its shape in place -- a record's fields, a class's options | [the rows](#the-rows) |
| **event** `Change(name, value)` | an edit the target accepted | [reading and writing](#reading-and-writing) |

## The target

| | |
|---|---|
| `Target` | the object whose properties are shown; `null` shows "No target" |

**A class that is neither** can declare `static Options = { Paper: ["A4", "Letter"] }`
for the lists it wants a drop-down for. The grid asks the target first, then its
class.

## The rows

| | |
|---|---|
| `LabelWidth` | the width of the name column, in pixels. Default `110` |
| `Keys()` | the property names the grid shows, in the target's own order |
| `Editor(name)` | the editor built for one property, or `null` when it is not shown -- what a test or a caller that wants to focus a row asks for |
| `Refresh()` | rebuilds the rows from the target; call it after changing its shape in place -- a record's fields, a class's options |

A field's kind wins over the value's type: a `Field.Enum` is a drop-down before
it has a value, and a `Field.Date` is a picker even when the value is `""`. A
value whose setter refuses the edit leaves the target as it was and puts the
sentence in the editor's tooltip.

## Reading and writing

| | |
|---|---|
| `Value(name)` | the target's value for one property |
| `SetValue(name, value)` | writes one property through the target's own setter and raises `Change`, as an edit in the grid does. A refusal is the setter's and is not caught |
| **event** `Change(name, value)` | an edit the target accepted. The value is the target's own, after its setter -- a `Decimal` stays exact, a number is a number |

## See also

[`Record` and `Field`](../../llm/library.md#record-and-field) ·
[`Widget`](../widgets/Widget.md) · [`TextBox`](../widgets/TextBox.md) ·
[`ComboBox`](../widgets/ComboBox.md) · [`DecimalBox`](../widgets/DecimalBox.md)
