# PropertyGrid — an object's properties as rows

A panel that shows what an object has and edits it: one row per property, the
name beside the field that suits its value, and a drop-down where the class
declares the values it accepts. It is what an inspector, a settings screen or a
printer's configuration page is made of.

It ships in the `propertygrid` library, is reached with `uses`, and is a
[`Component`](../reference/widgets/Component.md), so it is placed on a form like
any other control.

```json
{ "name": "Settings", "startup": "MainForm", "uses": ["propertygrid"] }
```

```json
{ "type": "PropertyGrid", "name": "Props", "properties": { "Expand": true } }
```

**`Target` is runtime data**, because a `.form` cannot carry an object. A form
assigns it once the object exists:

```js
Form_Open() {
    this.Props.Target = this.printer;
}
```

## PropertyGrid

| | |
|---|---|
| `Target` | the object whose properties are shown; `null` shows "No target" |
| `LabelWidth` | the width of the name column, in pixels. Default `110` |
| `Keys()` | the property names the grid shows, in the target's own order |
| `Editor(name)` | the editor built for one property, or `null` when it is not shown -- what a test or a caller that wants to focus a row asks for |
| `Value(name)` | the target's value for one property |
| `SetValue(name, value)` | writes one property through the target's own setter and raises `Change`, as an edit in the grid does. A refusal is the setter's and is not caught |
| `Refresh()` | rebuilds the rows from the target; call it after changing its shape in place -- a record's fields, a class's options |
| **event** `Change(name, value)` | an edit the target accepted. The value is the target's own, after its setter -- a `Decimal` stays exact, a number is a number |

**The rows are asked of the target.** A control or a component answers
`PropertyNames()` and `PropertyOptions(name)`; a [`Record`](library.md#record-and-field)
answers with its `static Fields`, whose kinds decide the editor — `Bool` a tick,
`Enum` a drop-down, `Date` a picker, `Decimal` an exact field, `Int`/`Number` a
number, `List`/`Record` JSON text; a plain object answers with its own keys and
the value's type decides. A class that is neither can say
`static Options = { Paper: ["A4", "Letter"] }` for the lists it wants.

```js
class Printer extends Record {
    static Fields = {
        Paper:  Field.Enum(["A4", "A5", "Letter"]),
        Copies: Field.Int({ min: 0, max: 99 }),
        Duplex: Field.Bool(true),
    };
}

Form_Open() {
    this.Props.Target = new Printer();
}

Props_Change(name, value) {
    this.Status.Text = `${name} is now ${value}`;
}
```

**An edit goes through the target's setter.** A value it refuses leaves the
target as it was and puts the sentence in the editor's tooltip; a value it
accepts raises `Change` with what the setter made of it. A `Decimal` field is
still a `Decimal` in the event, which is what a money total needs.

## What it does not do

- **No nested objects opened in place.** A `Record` field or a list is JSON text;
  a host that wants a child grid puts one beside it.
- **No undo.** The target is the program's; a `SetValue` that should be undoable
  is the program's to record.
- **No validation beyond the target's own.** A field that refuses a value says
  why in its tooltip; a field that accepts it is the class's decision.
- **No automatic save.** `Change` says what happened; writing it down is the
  application's.

## See also

[`Record` and `Field`](library.md#record-and-field) · [`Widget`](../reference/widgets/Widget.md) ·
[`TextBox`](../reference/widgets/TextBox.md) · [`ComboBox`](../reference/widgets/ComboBox.md) ·
[`DecimalBox`](../reference/widgets/DecimalBox.md)
