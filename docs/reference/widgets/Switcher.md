# Switcher

Pages picked from a strip of linked buttons.

The same stack of pages a [`Notebook`](Notebook.md) holds, with a segmented
control instead of tabs — and, with `Strip: "None"`, a bare stack that only code
switches, which is what a wizard and a *welcome page / workspace* pair are.

It is a [`Container`](Container.md), so everything there is here too; what
follows is what is its own.

## Every member

| | | |
|---|---|---|
| `Count` (ro) | how many there are | [the pages](#the-pages) |
| `Current` | which page is showing | [the page showing](#the-page-showing) |
| `Strip` | `Top` `Bottom` `Start` `End` `None` — `None` is a bare stack only code switches | [the strip](#the-strip) |
| `Tabs` | the labels, as strings | [the strip](#the-strip) |
| `Append(child, [name])` | one more page | [the pages](#the-pages) |
| `PageAt(x, y)` | the index of the page whose button is under that point, in this control's own coordinates, or `-1` where there is none: away from the strip or with `Strip | [the strip](#the-strip) |
| `RemovePage(index)` | takes it out, with the control in it | [the pages](#the-pages) |
| **event** `Switch(index)` | a different page is showing | [the page showing](#the-page-showing) |

## Which of the two is this one

| | reach for it when |
|---|---|
| [`Notebook`](Notebook.md) | the pages are **documents** the user opened — tabs, and a strip that can hold a button |
| **`Switcher`** | **the pages are modes of one window** — a segmented control, or no strip at all |

## The pages

| | |
|---|---|
| `Append(child, [name])` | one more page. The child is the page, and `name` is a **string** — a segmented control has nowhere for a widget, where a [`Notebook`](Notebook.md)'s tab label is one |
| `RemovePage(index)` | takes it out, with the control in it |
| `Count` (ro) | how many there are |

## The page showing

| | |
|---|---|
| `Current` | which page is showing. Assigning it switches, and **raises `Switch`**. An index past the last page is **kept and applied when that page arrives**, so a `.form` may declare the page it opens on. Default `-1` |
| **event** `Switch(index)` | a different page is showing |

**`Strip: "None"` plus `Current` is the whole of a wizard**, and of the IDE's
own window, which is a switcher of two pages — the welcome page and the
workspace — with nothing to click between them. **`Current` may be declared in
the `.form`**: the loader builds the pages after the properties, and the index
is kept until the page it names arrives.

## The strip

| | |
|---|---|
| `Strip` | `Top` `Bottom` `Start` `End` `None` — `None` is a bare stack only code switches. Default `"Top"` |
| `Tabs` | the labels, as strings. **Translated**. A segmented control has nowhere to put a widget, so this is the whole of it |
| `PageAt(x, y)` | the index of the page whose button is under that point, in this control's own coordinates, or `-1` where there is none: away from the strip or with `Strip: "None"`. What a form designer asks to turn a click on the strip into a page, since it keeps the pointer for itself and the strip never sees the press |

A hidden page has no button on the strip, so the buttons after it answer for
the pages after it — `PageAt` counts pages, not buttons.

## What goes wrong

- **Nothing switches.** `Strip: "None"` and nothing assigns `Current`.
- **Assigning `Current` ran the handler.** It does.
- **A button was wanted in the strip.** That is a [`Notebook`](Notebook.md);
  this strip is buttons of its own and holds nothing else.

## See also

[`Notebook`](Notebook.md) · [`Panel`](Panel.md) · [ide.md](../../ide.md)
