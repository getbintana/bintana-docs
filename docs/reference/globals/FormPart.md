# FormPart

Something a form owns that is not a control: a `Timer` today, and later a
connection or a client. It has no rectangle, no `Bounds` and no `Children`, so
it is declared in the form's `components` list and reached by name like a
control.

```json
"components": [
  { "type": "Timer", "name": "Clock",
    "properties": { "Delay": 1000, "Enabled": true } }
]
```

```js
Clock_Tick() { this.LblTime.Text = Time.Now(); }
```

## Every member

| | | |
|---|---|---|
| `Form` (ro) | the form this part belongs to, or `null` when it is a bare object | [the object](#the-object) |
| `PropertyNames()` | every settable property, `Name` first and then what the class declares in `static Properties` -- the list a property grid edits and a `.form` writes | [the object](#the-object) |
| `EventNames()` | every event the class declares in `static Events` | [the object](#the-object) |
| `TextProperties()` | the properties that hold prose a person reads -- none by default, and the reason a part's values are not looked up in a catalogue | [the object](#the-object) |
| `PropertyOptions(name)` | the exact values a property accepts, or `null` for one written freely; a part with a closed list says it here | [the object](#the-object) |
| `On(event, handler)` | assign `handler` to `event`; assigning again replaces it, the way a control's `On` does | [events](#events) |
| `Emit(event, ...args)` | raise `event`: this part's own handler first, then the form's `<Name>_<Event>` method, with the arguments the event carries | [events](#events) |
| `Apply(properties)` | applies a property dictionary to the part, refusing a name it has not got | [the object](#the-object) |
| `Serialize()` | this part as a `.form` node | [the object](#the-object) |
| `Delete()` | removes it from the form it belongs to | [the object](#the-object) |
| `FormPart.New(type)` | a new part of `type` -- `Timer`, `Connection` or `HttpClient`; a name that is not a part is refused by name | [the classes](#the-classes) |
| `FormPart.Types()` | the names of the part classes this runtime can make, for a palette or a `.form` loader | [the classes](#the-classes) |
| `FormPart.TypeName(part)` | the name a part is written under in a `.form` -- the registry's name, which is not always the class's own (`Connection` is a part, the C `Connection` it wraps is a type) | [the classes](#the-classes) |

## The object

`Name` is the node's, not a property: the form binds the part under it, and it
is the prefix of its handlers. `PropertyNames` returns `Name` first and then
the class's `static Properties`; `Apply` writes those in the **class's order**,
which is what lets a `Timer` put `Delay` in place before `Enabled` starts it.
`Serialize` writes only what differs from a fresh instance, exactly as a
control's does.

A part is kept alive by the form's own property (`this.Clock`), and a part in a
running application is attached to its form: `Form` answers it. `FormPart.New`
is the runtime's own registry; a part built into the runtime registers itself
there, and a project's own part would need the loader that knows its class.

## Events

`Emit("Tick")` calls the part's `On("Tick", …)` handler and then looks for
`<Name>_Tick` on the form, with the form as `this`. That is the controls' rule
without GTK. A part that is only being *drawn* in the designer does not run and
its events reach nobody.

## The classes

`Timer`, `Connection`, `Model` and `HttpClient` are the built-ins. `Timer`
declares `Delay` and `Enabled` as properties and `Tick` as its event; see
[Timer](Timer.md#a-timer-on-a-form). `Connection` declares `Path` and owns one
`Database.Sqlite` file. `Model` declares `Connection`, `Record` and
`TableName`; its `Table` is the table for that record, and `Ensure` creates it
from the shape. Several models share one connection. `HttpClient` declares
`BaseUrl`, `Timeout`, `Http1` and `FollowRedirects` and owns an `Http.Client`.
A class becomes a part when it extends `FormPart` and declares `static Events`
and `static Properties`; `Exec` is a global with statics rather than a class,
so it needs a wrapper before a `.form` can name it.

## See also

[`Timer`](Timer.md) · [`Form`](../widgets/Form.md) ·
[`forms.md`](../../llm/forms.md#parts--objects-with-no-rectangle)
