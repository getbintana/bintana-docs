# Popover

A control floated over another, opened by a verb and **in no form's tree**.

```js
Txt_Change() {
    this.sug ??= new Suggestions();               // a component with a .form of its own
    Popover.Show(this.sug, this.Txt, { Autohide: false });
}
```

It used to be a control — a container with one child that sat in a form and was
opened with `Popup(anchor)` — and everything wrong with it came from living in the
tree. It takes no room, so the designer could not draw it, pick it or drop into
it; it could live only in a container that lays its children out through a layout
manager; and its open state had to be a read-only property. It is a verb now, for
the reason `MenuButton` was never added: it is something the runtime does, and a
widget of its own bought a place for those problems to live.

## Every member

| | | |
|---|---|---|
| `Show(content, anchor, [{ Rect, Position, Arrow, Autohide, Closed }])` | opens `content` — any control, usually a component with a `.form` of its own — floating over `anchor` | [showing](#showing) |
| `Close(content)` | closes it | [showing](#showing) |
| `IsOpen(content) -> boolean` | whether `Show` opened it and it has not closed since | [showing](#showing) |

## Showing

| | |
|---|---|
| `Show(content, anchor, [{ Rect, Position, Arrow, Autohide, Closed }])` | opens `content` — any control, usually a component with a `.form` of its own — floating over `anchor`. **Not in the form's tree**: it takes no room, appears in no `Children`, and nothing in the form being drawn mentions it. A control that is in a container is taken out of it, as `Add` would; it comes back out, free-standing, when the popover closes, and can be shown again. The options: `Rect` (`{ X, Y, Width, Height }` in the anchor's own coordinates — what `Editor.CursorBounds()` answers — points at a place in it instead of the whole of it), `Position` (`Top`, `Bottom`, `Left` or `Right`, the side it **prefers**; default `"Bottom"`), `Arrow` (the tail pointing back at the anchor, default `true`; `false` for a list flush against a field), `Autohide` (a click outside or Escape closes it, default `true`) and `Closed` (a function called once when it went down, **by any road**, the window going included). A misspelt option is refused. Showing a control that is already open moves it, with the options given this time. The anchor must be on screen, which it cannot be before the window is shown. The point is taken once: an anchor that moves afterwards leaves the popover where it opened |
| `Close(content)` | closes it. Nothing happens when it is not open; `Closed` is called once it is down |
| `IsOpen(content) -> boolean` | whether `Show` opened it and it has not closed since |

**The content is any control.** The case this was made for is a component with a
`.form` of its own — drawn in its own tab, reusable, with handlers of its own — and
a `Label` built in code is as good. It is in nobody's `Children` and appears in no
`.form`.

**A control that is somewhere already moves**, as `Add` does, and comes out
free-standing when the popover closes. So the same control can be shown again, or
put into a container, and doing either while it is open closes the popover and
tells the program.

**`Rect`** is `{ X, Y, Width, Height }` in the anchor's own coordinates, and a
field left out is the anchor's own: `Editor.CursorBounds()` answers one, and it
is how a hint sits beside an editor's cursor instead of under the whole editor.
`Position` is the side it **prefers** — `"Top"`, `"Bottom"` (the default), `"Left"`
or `"Right"` — and GTK moves it when there is no room. `Arrow` draws the tail
pointing back at the anchor, **on by default** as in GTK; a list of suggestions
flush against a field does not want one, and passes `false`.

**`Autohide` is the choice that decides how it behaves, and each value is a whole
design.** `true`, the default, is GTK's menu: the popup takes the keyboard, the
arrows walk the content, Enter activates, Escape and a click outside close it — what
a select wants. `false` leaves the keyboard in the field that opened it, so typing
goes on reaching the entry; the program closes it, and the price is that a click on
a bare background moves no focus and tells it nothing. A suggestion list is the
second shape, and there is no way to have both.

**`Closed`** is a function called **once** when it went down, by any road: `Close`,
Escape or a click outside, the anchor being deleted or hidden, or its window
closing. It arrives **a turn after** the thing that closed it and never from
inside it, because those happen inside GTK hiding a window; `IsOpen` is false at
once. A `Show` from inside `Closed` opens it again.

**`Show` on something that is already open moves it**, taking the options given
this time — a hint that follows the cursor calls it on every move.

## What goes wrong

- **`Popover.Show: X is not on screen`.** The anchor has no rectangle: the window
  is not shown yet (`Form_Open` runs before it is presented), or the anchor is in a
  hidden page or a collapsed `Expander`.
- **`'Autohid' is not an option`.** A misspelt option is refused by name rather
  than ignored, since a flag that quietly does nothing reads as the feature not
  working.
- **It closes by itself when the anchor goes.** Deleting or hiding the anchor
  closes the popover — a popover pointing at nothing is worse than none — and
  `Closed` is told.
- **`Closed` has not been called yet** on the line after `Close()`. It arrives on the
  next turn of the loop; read `IsOpen` for the answer now.

A worker has none of it: it is a verb about a widget.

## See also

[`Editor.CursorBounds()`](../widgets/Editor.md) · [Components](../../llm/forms.md#components--a-form-that-is-not-a-window)
