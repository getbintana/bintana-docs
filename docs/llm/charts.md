# Charts — the library that ships with the runtime

`Chart` is not a control. It is a **component** written in Bintana, in the
`charts` library that comes with the runtime, and it is reached the way any
library is: name it in `project.json`, then use its class in a `.form`.

```json
{ "name": "Sales", "startup": "MainForm", "uses": ["charts"] }
```

```json
{
  "type": "Chart", "name": "Sales",
  "properties": { "Type": "Bar", "Title": "By quarter",
                  "Labels": ["Q1", "Q2", "Q3", "Q4"], "Legend": "Bottom" }
}
```

```js
this.Sales.Series = [{ Name: "2026", Values: rows.map((r) => r.Total) }];
```

That division is the whole idea: **what the chart is** goes in the `.form`, where
the designer edits it and the catalogue translates it; **the numbers** come from
code. `uses` finds the library with nothing installed and nothing configured —
where it is looked for is in [the project file's
reference](../formats.md#libraries-uses), and a name that is not found stops the
program printing every path it tried.

The example is `examples/charts`: five shapes, two axes, stacking, curves, and
21,600 readings you can zoom into. Three more kinds, `Scatter`, `Heatmap` and
`Gauge`, and bars and a line on one plot, are described under `Series` below.

## Chart

One class, and `Type` says which kind. Every property redraws when it is
assigned, and every one of them is designable and serialised, so a form may
declare any of them.

| Member | |
|---|---|
| `Type` | `Bar` `Line` `Area` `Pie` `Doughnut` `Scatter` `Heatmap` `Gauge`. Defaults to `"Bar"`. |
| `Series` | the data: `[{ Name, Values, Color, Colors, Axis, Type, X, Sizes }]` — see below. Defaults to `[]`. Assigning it redraws |
| `Labels` | the category axis, as strings. As many as there are values is a label per bar; **fewer** is marks spread evenly across the plot; a pie names its slices from them. Defaults to `[]`. |
| `Marks` | `[{ At, Text }]`, `At` being an index into the values — a **real** time axis, where the caller says where each label goes. Replaces `Labels` on the x axis while it is set. Defaults to `[]`. |
| `Legend` | `None` `Top` `Bottom`. It wraps to at most **three** rows and whatever did not fit is not drawn: a legend of thirty series is the wrong control, and eating the plot to hold one is worse. Defaults to `"Bottom"`. |
| `Grid` | the horizontal rules behind the data. Defaults to `true`. |
| `Stacked` | series piled instead of side by side. Applies to `Bar` and `Area`; a line and a pie **ignore** it rather than refusing, so the order of two lines in a `.form` never matters. Defaults to `false`. |
| `Bands` | a `Gauge`'s coloured ranges, `[{ To, Color, Name }]` in rising order: each runs from the end of the one before (the first from `YMin`) to `To`, and the value's arc takes the colour of the range it falls in. Other types ignore it. Defaults to `[]`. |
| `Lines` | horizontal reference lines, `[{ Value, Color, Text, Width }]`, drawn across the plot at `yOf(Value)` with the text at the right edge. A `Value` outside the axis is not drawn; `Width` defaults to `1.5`, and `Color` to the chart's ink. Defaults to `[]`. |
| `ShowValues` | the number on the bar or the percentage in the slice, drawn only where it measures as fitting. Defaults to `false`. |
| `Title` | above the plot. **Translated**. Defaults to `""`. |
| `YMin` | pins the bottom of the y axis; `""` (or `null`) works it out from the data, on *nice* numbers rather than on the data's own extremes. A value that is not a finite number is refused where it is assigned — stored, it left the axis with no ticks and every frame threw. Defaults to `""`. |
| `YMax` | likewise the top. Defaults to `""`. |
| `Decimals` | how the numbers are written, `0` to `6`; goes through `Locale.Number`, so the separators are the user's. Defaults to `0`. |
| `Antialias` | smooth edges. Off is faster and looks it; `Reduced` is the knob that actually matters. Defaults to `true`. |
| `Curved` | rounded lines for `Line` and `Area`, **monotone**: between two samples the curve stays between their values and flattens at a peak instead of inventing a taller one. Off by default because a curve says something about values nobody measured. Defaults to `false`. |
| `Reduced` | more points than pixel columns are decimated to a min and a max per column, which keeps the envelope — a one-sample spike survives it. Defaults to `true`. On by default |
| `From` | the first value on screen. Defaults to `0`. |
| `Count` | how many are on screen; `0` is all of them. Defaults to `0`. |
| `Zoomable` | lets the wheel zoom and a drag pan — see [what the pointer does](../reference/libraries/Chart.md#what-the-pointer-does). Off by default, so a chart of four bars never steals a scroll from the `Scroller` around it. Defaults to `false`. |
| `Refresh()` | redraws now. **Assigning any property already does**, so this is for the case where the numbers changed **in place** |
| `Save(path, width, height)` | the same drawing to a PNG of any size — a chart in a report, or in a bug report |
| `Document` (ro) | the chart itself — a `ChartDocument`, which is what draws. Every property below that is not about the pointer is a property of it |
| **event** `Select(series, at, value)` | a click on a bar, a point or a slice. `at` is the index into that series' `Values` |
| **event** `Hover(series, at, value)` | the pointer passing over one, **which is not a selection**: a chart that reported a click as a hover could not have a tooltip. On a line or an area it is the first series; on a **stacked** `Area` it is the band the pointer is inside (the top one above them all), `value` is that series' own value, and the mark is drawn at the top of its band |
| **event** `Range(from, count)` | the window changed — the wheel, a drag, or the double click that resets it |

### `Series`

```js
chart.Series = [
    { Name: "2026", Values: [15, 12, 21, 18] },
    { Name: "Margin %", Values: [31, 28, 35, 33], Color: "#e5a50a", Axis: "Right" },
];
```

| | |
|---|---|
| the series' `Name` | what the legend and a hover call it; `Series 1`, `Series 2`… when omitted |
| `Values` | the numbers. A number or numeric text is a value; **anything else — `null`, `undefined`, `NaN`, `""`, a word — is a gap**: a line or an area stops there and starts again at the next value, a bar is not drawn, and the pointer over it reports nothing. A gap is never a zero |
| `Color` | any CSS colour; omitted, it takes the next of the library's eight, chosen to hold up on a light theme and a dark one |
| `Colors` | **a colour per value**, for the charts where a value is a shape of its own: each slice of a `Pie` or a `Doughnut` and its legend entry, and each bar of a `Bar`. A list; an entry that is missing or `""` is the colour the chart would have chosen. What the colour means — a severity, a status — is the caller's: `Colors: ["#e45959", "#ffa059", "#97aab3"]`. A string is refused, since one colour for the whole series is `Color` |
| `Axis` | `"Left"` or `"Right"`. `"Right"` gives that series **its own** range, ticks and margin — two series in different units on one scale is the classic chart that lies |
| the series' `Type` | how this series is drawn on a plot, whatever the chart's `Type`: `"Bar"`, `"Line"` or `"Area"`, and `""` for the chart's own. **Bars and a line on one plot**: the counts as bars and the rate as a line over them, usually with `Axis: "Right"`. The line is drawn over the bars and is not part of their stack; a bar series is narrowed only for the other bar series beside it |
| `X` | the left edge, in the parent's coordinates. **It means something only inside a container laying out by coordinate**; in a row or a column the parent decides and this reports where it ended up. `-32767`..`32767`, like `Y` and `Move` |
| `Sizes` | a `Scatter`'s bubble sizes, one per value, scaled by area between the smallest and the largest — a size twice as big *looks* twice as big |
| `Format` | how this series' numbers are written: `""` (the document's `Decimals`), `"Number"`, `"Percent"`, `"Duration"`, `"Bits"` — **the words the application's own cards use**, so a chart and the figure beside it agree. The axis of a side takes its format from its first series, and a bar, a slice, a readout and a tooltip from their own. `Bits` writes `Gbps`/`Mbps`/`Kbps`/`bps`, `Duration` writes `45s`, `3m`, `2h 5m`, `1d 2h 0m` |
| `Unit` | a suffix for a format that carries no unit of its own — `"GB"`, `"ms"` — written after the number. `Percent`, `Duration` and `Bits` imply theirs |
| `Mirror` | **the series is drawn below the axis and its labels are absolute**: a butterfly's exits face its entries, and the axis says `1,80` and not `-1,80`. The values are negated once, when the series is assigned |
| `Hidden` | out of the drawing and out of the range, and still in the legend, dimmed — a click there takes it out and puts it back. `Refresh()` after changing it in place |

**Points, cells and a dial** are the three kinds that are not a category plot:

- **`Scatter`** puts each value at (`X`, value), over two numeric axes. The
  horizontal axis is worked out from `X` on nice numbers like the vertical one,
  with a little room at each end, and **does not run through zero**: a cloud of
  latencies between 1,200 and 1,900 ms fills the plot instead of a corner of it.
  `Sizes` makes it a bubble chart, and `Labels` names each point for a hover.
- **`Heatmap`** draws each series as a **row** (named by its `Name`) and each
  slot as a **column** (named by `Labels`), each cell shaded from the ground to
  the first series' `Color` between the lowest and the highest value — or
  between `YMin` and `YMax`, which pin the scale. A gap is an empty cell, never
  the lowest shade. The legend becomes the scale, with each end named, and
  `ShowValues` writes the numbers in the cells that hold them.
- **`Gauge`** shows the first value of the first series on a half dial from
  `YMin` (zero unless pinned) to `YMax` (the next nice number above the value
  unless pinned), the number large in the middle and `Labels[0]` under it.
  `Bands` colours its ranges, and the value's arc takes the colour of the band
  it falls in:

```js
gauge.Type  = "Gauge";
gauge.YMax  = 100;
gauge.Bands = [{ To: 90, Color: "#e01b24" }, { To: 99, Color: "#e5a50a" }, { To: 100, Color: "#2ec27e" }];
gauge.Series = [{ Name: "SLI", Values: [93.75] }];
```

`HitTest` and `Select` answer for all three: the point, the cell (`Series` is its
row and `At` its column) or the dial.

Assigning `Series` replaces the lot; it is a value, not a handle, so mutating the
array you passed changes nothing until you assign again or call `Refresh()`.

A **pie or doughnut reads the first series only** and names its slices from
`Labels`: a pie of two series is two pies, so it draws one. Only positive values
are slices, and **each keeps its own index** — a zero between two slices leaves
its label, its colour and its `Select`/`Hover` index where they were, and the
legend still names it.

**A `Mirror` series is a butterfly's other wing**: it is drawn below the axis and
its labels are absolute, so the entries one way and the exits the other face each
other and the axis reads `1,80` on both sides:

```js
chart.Series = [
    { Name: "In",  Values: received, Format: "Bits" },
    { Name: "Out", Values: sent,     Format: "Bits", Mirror: true },
];
```

**A threshold is a `Lines` entry**, not a rule: one horizontal line per value —
an SLO at 99.9, an alert level — across the plot with its text at the right edge,
and a value the axis does not reach is not drawn:

```js
chart.Lines = [{ Value: 99.9, Color: "#e01b24", Text: "SLO 99,9" }];
```

## ChartDocument

**The chart with no control.** Everything a chart *is* — the type, the data, the
axes and the drawing of them — lives in a `ChartDocument`, and the `Chart` above
holds one as `Document` and adds what a screen has: the pointer, the wheel, a
drag and the three events. Every property in the table above that is not about
the pointer is the document's, under the same name and with the same default, so
a `.form` that declares `Type` on a `Chart` goes on doing so.

It exists because a control needs a display, and a `main` project — a report run
from a timer, a tool over ssh — never has one. A document needs nothing: it draws
through [`Drawing`](library.md#drawing), so a console program has charts too.

```json
{ "name": "nightly", "main": "Main", "uses": ["charts"] }
```

```js
function Main() {
    const c = new ChartDocument();
    c.Type   = "Line";
    c.Title  = "Load";
    c.Labels = hours;
    c.Series = [{ Name: "web-1", Values: load }];
    c.Save("/var/reports/load.png", 800, 400);
}
```

| Member | |
|---|---|
| `Paint(p, width, height)` | draws the chart with `p` into `width`×`height` — for a painter something else opened: a `Drawing`, a report's page, a `DrawPage` of your own. The ink is the painter's `Foreground`, so on paper it is black |
| `Save(path, width, height)` | the drawing to a PNG of any size. **No widget and no display**: it draws through `Drawing`, so a `main` project has charts too |
| `HitTest(x, y)` | what the last `Paint` drew at a point, in the coordinates it drew in: `{ Series, At, Value }` — the bar, the point or the slice a click there means, `At` an index into that series' `Values` — or `null`. What a drawing that holds a document of its own (a dashboard, a page) answers a click with, since only a `Chart` hears the pointer. Nothing drawn yet is `null` |
| `LegendHit(x, y)` | the legend entry at a point, in the same coordinates: `{ Series, At }` — `Series` is the one to hide or show and `At` the entry that was hit (the slice's index on a pie, the series' own on a plot) — or `null`. Nothing when the legend is `None` or nothing has been drawn yet |
| `Tooltip(x, y)` | what a tooltip would say at a point, in the coordinates of the last `Paint`: `{ Text, X, Y, Width, Height }` — the label, the series and the value under it, formatted with that series' `Format`, in a box measured with the font the frame drew with — or `null` when nothing is there. **The document does not draw it**: a drawing that keeps a document of its own places the card with its own ink and its own theme, which is why the box comes measured and placed beside the point |
| `ToPng(width, height)` | the same drawing as `Save`, answered as `Bytes` — a chart to attach or put in a reply, with nothing on disk |
| `Lines` | horizontal reference lines, `[{ Value, Color, Text, Width }]`, drawn across the plot at `yOf(Value)` with the text at the right edge. A `Value` outside the axis is not drawn; `Width` defaults to `1.5`, and `Color` to the chart's ink. Defaults to `[]`. |
| `Zoomable` | lets the wheel zoom and a drag pan — the arithmetic of it is `ZoomAt`/`PanBy`/`Press`/`Move`/`Release`, so a drawing that forwards a pointer gets the same window a `Chart` does. Off by default, so a chart of four bars never steals a scroll from the `Scroller` around it. Defaults to `false`. |
| `Refresh()` | redraws now and forgets what the last frame measured, for when the numbers changed **in place**: `doc.Series[k].Hidden = true` changes no property, so nothing knows to recompute the range |
| `ZoomAt(x, y, dy)` | zooms the window about `x` — the datum under it stays under it, which is what makes zooming feel like a lens — turning the wheel by `dy`. Answers whether the window moved; a notch that moved nothing is `false` |
| `PanBy(dx)` | pans the window by `dx` pixels: positive moves the values left, the way a drag does. Answers whether the window moved |
| `Press(x, y)` | the pointer down at (x, y): remembers where a drag would start and answers whether this document can pan at all — `Zoomable`, a window drawn, and something off it |
| `Move(x, y)` | the pointer at (x, y) after a `Press`: pans when it has dragged more than three pixels, and otherwise marks `hover`. Answers `"pan"` (a drag, whose window may or may not have moved), `"hover"` (a different point is under the pointer now) or `""` |
| `Release()` | the pointer up: forgets the press and answers `true` when the gesture never dragged — which is a click, and what raises `Select` |

**On paper the ink is black.** A document drawn through `Drawing` has a painter
with no control behind it, and such a painter's `Foreground` is black — so the
title, the axes and the legend come out readable on a white page whatever the
desktop's theme. A `Chart`'s own `Save` runs its canvas instead, and takes the
theme's ink; on a dark desktop that is light text on a transparent ground, which
is the one to avoid for a page. `Paint` draws with whatever painter it is handed,
which is how a chart goes onto a page of a `Drawing.SavePdf` beside other things,
or into a `Draw` or `DrawPage` of your own. A `Task` cannot draw one: a worker
installs no painter and no `Drawing`.

**A document hears no pointer, and `HitTest` is how its drawing answers one.**
A program that paints documents itself — a dashboard of several charts on one
`DrawingArea`, a page — gets the click on its own control, translates it into
the chart's coordinates (where it called `Paint`), and asks: `doc.HitTest(x, y)`
answers `{ Series, At, Value }`, the same bar, point or slice a `Chart` would
have raised `Select` for, or `null`. It measures against the **last** `Paint`,
so it answers for what is on screen.

## What the pointer does

Nothing until `Zoomable`, and then: the wheel zooms about the pointer, a drag
pans, and a double click goes back to all of it. Each of the three raises
`Range`, and the wheel notch is only consumed when the view actually changed —
zooming out a view that already shows everything answers `false` and raises no
`Range` — so a chart inside a `Scroller` still scrolls it at the ends.

`Select` and `Hover` are raised whether or not the chart is zoomable, and both
carry the index into the *whole* series — never the position on screen.

**The arithmetic is the document's**, so a drawing that paints documents itself —
a dashboard of several charts on one `DrawingArea` — forwards the pointer to the
chart under it and gets exactly what a `Chart` does: `ZoomAt(x, y, dy)`,
`PanBy(dx)`, and the `Press`/`Move`/`Release` a drag is. `HitTest` says which
chart and what under the point, `LegendHit` says whether the click was on the
legend (and `Series[].Hidden` takes a series out), and `Tooltip(x, y)` answers
`{ Text, X, Y, Width, Height }` for a card the caller draws — **the document
never draws a tooltip window**.

## The one performance fact

The cost of a frame is in **pixels covered**, not in points, and in an
interpreter the passes over the data cost more than the drawing. Both show up in
the same measurement, on 21,600 readings in an 800-wide plot:

```
decimated      59.0 frames/s    3.5 ms in the handler
every point    13.2 frames/s   46.6 ms
```

`Reduced` is on by default and is why the first line exists. The rest is the
caller's: the first working version of this component drew at 35 frames a second
because it computed the y range with `flatMap` over all 21,600 values **on every
frame**, and neither the values nor the range had changed. If you hand a chart a
long series, do the arithmetic once and keep it.

## What it does not do

No animation, no radar, no candlesticks, no second x axis, no logarithmic scale,
and no tooltip window of its own — `Hover` and `Tooltip` are there so the form
can put the text where it wants it.

**Three things of Chart.js' are left out on purpose**, since that is the library
this one was measured against: its *plugin system*, because a component's subclass
is the extension point here; its *animation by default*, because `Timer.Every` and
`Refresh()` are enough for the rare case and a chart that animates on every change
of data is one nobody can read a number off; and its *config object*, because a bag
of nested options is the opposite of a designable control — which is the whole
argument of this environment, and the reason `Type`, `Legend` and `Labels` are
properties in a file. `Chart` is a component like any other: it is
[`lib/charts/Chart.js`](https://github.com/getbintana/bintana/blob/main/lib/charts/Chart.js), about a thousand lines of
ordinary Bintana, and a project that needs a shape it has not got can extend it
or copy it into its own `lib/`.
