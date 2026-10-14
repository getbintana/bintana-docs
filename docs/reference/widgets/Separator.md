# Separator

A rule.

A line between two groups of controls, or between the items of a toolbar. It is
the cheapest way to say *these belong together and those do not*.

It is a `Widget` and a control like any other, so everything on
[Widget](Widget.md) is on it too; what follows is what is its own.

## Every member

| | | |
|---|---|---|
| `Orientation` | `Horizontal` `Vertical` | [the line](#the-line) |
| `Width` | the **room** it takes across itself, not the thickness of the rule: a `Vertical` separator is this wide, and its one-pixel rule stands centred in it -- `Width: 76` is a rule with 37 pixels of air on each side | [the room](#the-room) |
| `Height` | the same on the other axis: the room across a `Horizontal` separator, and the length of a `Vertical` one | [the room](#the-room) |

## The line

| | |
|---|---|
| `Orientation` | `Horizontal` `Vertical`. **Which axis the room is on**: the size across the rule, the other one being a minimum length. Default `"Horizontal"`. A `Horizontal` separator is a line across, between two rows of things; a `Vertical` one divides a toolbar |

The rule is **one pixel**, drawn in the theme's own colour for a `separator` —
whatever theme that is. Nothing about it is configurable: a rule with a colour
of its own is a `Panel` with a `Background`, or a `Drawing`.

## The room

| | |
|---|---|
| `Width` | the **room** it takes across itself, not the thickness of the rule: a `Vertical` separator is this wide, and its one-pixel rule stands centred in it -- `Width: 76` is a rule with 37 pixels of air on each side. `1` (or less) is a rule with no room. **The container cannot stretch it into a band**: the axis across the rule is the one a size means room on, and the rule is one pixel there whatever the container gives. On a `Horizontal` separator this is the rule's length instead, and `Height` is the room |
| `Height` | the same on the other axis: the room across a `Horizontal` separator, and the length of a `Vertical` one |

**The size declared is the room, and the rule stands in the middle of it.** A
`GtkSeparator` draws nothing of its own — the theme paints its *whole*
allocation — so a size could otherwise only mean a band of colour as thick as
itself. The runtime insets what is painted instead, and the separator keeps its
declared size in the layout — and in
[`Bounds()`](Widget.md#where-it-is-and-how-big), which is what a designer
selects it by: a `Vertical` one given `Width: 76` is a rule with 37 pixels of
air on each side, and a `Horizontal` one given `Height: 12` is a rule five
pixels from the top of a twelve-pixel band. **The container cannot stretch it
across the rule**: a horizontal rule in a horizontal bar is one pixel, not the
bar's height — the axis across a rule is the one a size means room on.

Which of the two sizes is the room follows from [`Orientation`](#the-line): it
is the one **across** the rule, and the other is the rule's *length*, a minimum
like every size. A size of one — or nothing at all — is no room: the rule fills
its box, which is what a separator did before there was a room to have.

## When it is not a `Separator`

- **The two halves should be resizable** — [`Split`](Split.md), whose divider is
  draggable.
- **The group needs a name** — [`Frame`](Frame.md), which has a caption and a
  line around the whole of it.
- **It is a menu separator** — that is `{ "separator": true }` in the menu's own
  array, not this control.

## What goes wrong

- **A band of colour where a rule should be.** That is a [`Panel`](Panel.md)
  with a `Background`, or a `Drawing`: a `Separator`'s rule is one pixel
  whatever size it is given, which is the room.
- **The rule is not quite in the middle.** An even room divides 37 and 38: the
  extra pixel goes on the far side, which is what "as evenly as it divides"
  means.
- **It is invisible.** In a box with no size, a separator across the axis has no
  length to draw along — an `HExpand` is what gives it one.

## What it does not do

- **No colour, no style of its own** beyond what
  [`Widget`](Widget.md#how-it-looks)'s `Background` and `Style` give it.

## See also

[`Frame`](Frame.md) · [`Split`](Split.md) · [`Panel`](Panel.md)
