# Message

Telling the user something, with no question attached.

```js
Message.Error("Cannot open {0}: {1}", path, e.message);
```

## Every member

| | | |
|---|---|---|
| `Error(text, …args, [done])` | something failed; the same as `Info` in every other respect | [the three of them](#the-three-of-them) |
| `Info(text, …args, [done])` | something happened | [the three of them](#the-three-of-them) |
| `Warning(text, …args, [done])` | something is not right; the same as `Info` in every other respect | [the three of them](#the-three-of-them) |

## The three of them

**They show and return.** They do not block, and there is **no answer**: a
question that needs one is a form -- `Confirm` and `AskText` in
[`lib/dialog`](../../llm/dialog.md), or one of your own with `Modal` (see
[`Form`](../widgets/Form.md)).

**What can be waited for is the dismissal**: a function last is `done`, run
once the window has been closed -- by its button, Enter, Escape or the title
bar -- and never a value for a `{0}` hole. It is what a program that reports
and then stops needs, since quitting on the next line closes the message
before anybody has read it:

```js
Message.Error("Cannot open {0}", path, () => Application.Quit(1));
```

The window is titled with `Application.Name`, carries the icon of its kind,
and its text can be selected and copied. A program that quits with one still
open closes it, and that `done` is not called.

**The first argument is a text position**, so it takes `{0}` holes, goes through
the catalogue and must **never** be a template literal: a sentence built with
backticks is a sentence a translator never sees, and the values in it are exactly
what should not be in the catalogue.

With no display they print to stderr and run `done` at once, which is what
makes the same call work in a console tool.

## When not to use one

A dialog interrupts. Most of what a program wants to say is better said where the
thing is: a status line, a label under the field, a
[`Spinner`](../widgets/Spinner.md) that stops, a banner in an
[`Overlay`](../widgets/Overlay.md) that fades on its own. Keep these three for
what the user must not miss — and `Error` for what actually failed.

## What goes wrong

- **The message came out untranslated with the values in it.** A template
  literal instead of `{0}` holes.
- **The program waited for an answer that never came.** These return at once;
  what asks is a form.
- **The error flashed and the program was gone.** `Application.Quit()` on the
  next line: quit in `done` instead.
- **Nothing appeared.** No display — look at stderr.

## See also

[`Logger`](Logger.md), for what goes in a log rather than in front of somebody ·
[`Dialog`](Dialog.md) · [`Form`](../widgets/Form.md)
