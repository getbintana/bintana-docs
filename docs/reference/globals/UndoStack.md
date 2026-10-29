# UndoStack

What Edit › Undo takes back.

**A step is two functions, not a snapshot**: what to do and what to take back.
A snapshot of the whole document per edit costs the size of the document every
time; a pair costs what the edit costs.

```js
const undo = new UndoStack();
undo.OnChange = () => {
    this.MnuUndo.Enabled = undo.CanUndo;
    this.Text = (undo.Modified ? "* " : "") + this.fileName;
};
undo.Do("Move card", () => card.Move(x, y), () => card.Move(oldX, oldY));
undo.Undo();
```

## Every member

| | | |
|---|---|---|
| `new UndoStack([limit])` | an empty one, keeping `limit` steps (default `100`, `0` for no limit) | [the steps](#the-steps) |
| `Add(text, redo, undo)` | records a step that **has already happened** -- text typed, a drag that ended -- without running it | [the steps](#the-steps) |
| `CanRedo` | whether there is a step to do again | [the steps](#the-steps) |
| `CanUndo` | whether there is a step to take back | [the steps](#the-steps) |
| `Clear()` | forgets every step, both ways; what is done now counts as clean | [saved or not](#saved-or-not) |
| `Do(text, redo, undo)` | runs `redo` and records the step, so `Undo` runs `undo` | [the steps](#the-steps) |
| `Group(text, fn)` | runs `fn`, and every `Do` and `Add` inside it becomes **one** step called `text`, undone last-first | [the steps](#the-steps) |
| `Limit` | how many steps it keeps, the oldest going first | [the steps](#the-steps) |
| `MarkClean()` | what is done now is what was saved | [saved or not](#saved-or-not) |
| `Modified` | whether what is done now differs from what it was at `MarkClean` -- the asterisk in a title bar | [saved or not](#saved-or-not) |
| `OnChange` | assign `() => …`, called after every change to what can be undone or redone | [saved or not](#saved-or-not) |
| `Redo()` | does again the last step taken back | [the steps](#the-steps) |
| `RedoText` | the text of the step `Redo` does again, or `""` | [the steps](#the-steps) |
| `Undo()` | takes the last step back | [the steps](#the-steps) |
| `UndoText` | the text of the step `Undo` takes back, or `""` -- for a menu's "Undo Move card" | [the steps](#the-steps) |

## The steps

`Do` is the ordinary verb: it runs the change and records it. `Add` is for a
change that already happened by the time the program hears of it — a drag that
ended, a word typed in a field — so running it again would do it twice.

**A new step after an `Undo` forgets what could be redone**, as every editor
does: the future that was taken back is not the one being written now.

**Failure is honest.** A `redo` that throws inside `Do` records nothing; an
`undo` that throws leaves the step where it was; a `Group` whose function throws
takes back what it had done. The list never says something happened that did
not.

A step cannot record another from inside itself — `Do` called from a `redo` or
an `undo` throws — because it would put the undo itself on the list.

## Saved or not

`MarkClean()` after a save, and `Modified` answers whether the document differs
from what is on disk — by position in the list, not by comparing documents. Undo
back to the saved state and it reads `false` again. A clean point that fell off
the bottom of `Limit`, or was among the steps a new one replaced, is gone, and
`Modified` stays `true` until the next `MarkClean`.

`OnChange` is the one place a menu's Undo/Redo items and a title's asterisk are
kept true.

## What goes wrong

- **Redo did something twice.** The change was recorded with `Do` after it had
  already happened; that is `Add`.
- **"called from inside a step".** A `redo` or `undo` called `Do`; call the
  change directly there.
- **`Modified` stayed `true` after Undo to the saved state.** `MarkClean()` was
  not called after the save.

## See also

[`Settings`](Settings.md) · [`Clipboard`](Clipboard.md)
