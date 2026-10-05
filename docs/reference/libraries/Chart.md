# Chart

A chart, as a component: one class, and `Type` says which kind.

Bars, lines, areas, pies and doughnuts over a category axis, with two axes,
stacking, monotone curves and a window into a series too long to draw whole. It
is **not a control of the runtime**: it ships in the `charts` library, is reached
with `uses`, and is about a thousand lines of ordinary Bintana over a
[`DrawingArea`](../widgets/DrawingArea.md).

```json
{ "name": "Sales", "startup": "SalesForm", "uses": ["charts"] }
```

```json
{ "type": "Chart", "name": "Monthly",
  "properties": { "Expand": true, "Type": "Bar", "Title": "Sales",
                  "Legend": "Bottom", "Labels": ["Jan", "Feb", "Mar"] } }
```

```js
this.Monthly.Series = [{ Name: "2026", Values: rows.map((r) => r.Total) }];
```

**The declaration is in the `.form` and only the numbers come from code.** That
is the whole argument of this environment applied to charts: `Type`, `Labels`,
`Legend`, `Grid`, `Title` and the y range are ordinary properties, so the
designer edits them, the serialiser keeps them and the catalogue translates the
prose.

It is a [`Component`](../widgets/Component.md), so everything on
[`Widget`](../widgets/Widget.md) is on it too.

## Every member

**The shape of it**

| | | |
|---|---|---|
| `Type` | `Bar` `Line` `Area` `Pie` `Doughnut` `Scatter` `Heatmap` `Gauge` | [the kinds](#the-kinds) |
| `Curved` | rounded lines for `Line` and `Area`, **monotone**: between two samples the curve stays between their values and flattens at a peak instead of inventing a taller one | [the kinds](#the-kinds) |
| `Stacked` | series piled instead of side by side | [the kinds](#the-kinds) |
| `Bands` | a `Gauge`'s coloured ranges, `[{ To, Color, Name }]` in rising order: each runs from the end of the one before (the first from `YMin`) to `To`, and the value's arc takes the colour of the range it falls in | [the kinds](#the-kinds) |

**The data**

| | | |
|---|---|---|
| `Series` | the data | [the data](#the-data) |
| `Labels` | the category axis, as strings | [the axes](#the-axes) |
| `Marks` | `[{ At, Text }]`, `At` being an index into the values — a **real** time axis, where the caller says where each label goes | [the axes](#the-axes) |

**The axes and what is written on them**

| | | |
|---|---|---|
| `Decimals` | how the numbers are written, `0` to `6`; goes through `Locale.Number`, so the separators are the user's | [the axes](#the-axes) |
| `Grid` | the horizontal rules behind the data | [the axes](#the-axes) |
| `Legend` | `None` `Top` `Bottom` | [the axes](#the-axes) |
| `ShowValues` | the number on the bar or the percentage in the slice, drawn only where it measures as fitting | [the axes](#the-axes) |
| `Title` | above the plot | [the axes](#the-axes) |
| `YMax` | likewise the top | [the axes](#the-axes) |
| `YMin` | pins the bottom of the y axis | [the axes](#the-axes) |
| `Lines` | horizontal reference lines, `[{ Value, Color, Text, Width }]`, drawn across the plot at `yOf(Value)` with the text at the right edge | [thresholds](#thresholds) |

**A long series**

| | | |
|---|---|---|
| `Antialias` | smooth edges | [a long series](#a-long-series) |
| `Count` | how many are on screen | [a long series](#a-long-series) |
| `From` | the first value on screen | [a long series](#a-long-series) |
| `Reduced` | more points than pixel columns are decimated to a min and a max per column, which keeps the envelope — a one-sample spike survives it | [a long series](#a-long-series) |
| `Zoomable` | lets the wheel zoom and a drag pan — see [what the pointer does](#what-the-pointer-does) | [what the pointer does](#what-the-pointer-does) |

**Verbs and events**

| | | |
|---|---|---|
| `Refresh()` | redraws now | [the data](#the-data) |
| `Save(path, width, height)` | the same drawing to a PNG of any size — a chart in a report, or in a bug report | [off the screen](#off-the-screen) |
| `Document` (ro) | the chart itself — a `ChartDocument`, which is what draws | [the document](#the-document) |
| **event** `Select(series, at, value)` | a click on a bar, a point or a slice | [what the pointer does](#what-the-pointer-does) |
| **event** `Hover(series, at, value)` | the pointer passing over one, **which is not a selection**: a chart that reported a click as a hover could not have a tooltip | [what the pointer does](#what-the-pointer-does) |
| **event** `Range(from, count)` | the window changed — the wheel, a drag, or the double click that resets it | [what the pointer does](#what-the-pointer-does) |

## The kinds

| | |
|---|---|
| `Type` | `Bar` `Line` `Area` `Pie` `Doughnut` `Scatter` `Heatmap` `Gauge`. Defaults to `"Bar"`. |
| `Stacked` | series piled instead of side by side. Applies to `Bar` and `Area`; a line and a pie **ignore** it rather than refusing, so the order of two lines in a `.form` never matters. Defaults to `false`. |
| `Curved` | rounded lines for `Line` and `Area`, **monotone**: between two samples the curve stays between their values and flattens at a peak instead of inventing a taller one. Off by default because a curve says something about values nobody measured. Defaults to `false`. |
| `Bands` | a `Gauge`'s coloured ranges, `[{ To, Color, Name }]` in rising order: each runs from the end of the one before (the first from `YMin`) to `To`, and the value's arc takes the colour of the range it falls in. Other types ignore it. Defaults to `[]`. |

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

## The data

| | |
|---|---|
| `Series` | the data: `[{ Name, Values, Color, Colors, Axis, Type, X, Sizes }]` — see below. Defaults to `[]`. Assigning it redraws |
| `Refresh()` | redraws now. **Assigning any property already does**, so this is for the case where the numbers changed **in place** |

| On a series | |
|---|---|
| the series' `Name` | what the legend and a hover call it; `Series 1`, `Series 2`… when omitted |
| `Values` | the numbers. A number or numeric text is a value; **anything else — `null`, `undefined`, `NaN`, `""`, a word — is a gap**: a line or an area stops there and starts again at the next value, a bar is not drawn, and the pointer over it reports nothing. A gap is never a zero |
| `Color` | any CSS colour; omitted, it takes the next of the library's eight, chosen to hold up on a light theme and a dark one |
| `Colors` | **a colour per value**, for the charts where a value is a shape of its own: each slice of a `Pie` or a `Doughnut` and its legend entry, and each bar of a `Bar`. A list; an entry that is missing or `""` is the colour the chart would have chosen. What the colour means — a severity, a status — is the caller's: `Colors: ["#e45959", "#ffa059", "#97aab3"]`. A string is refused, since one colour for the whole series is `Color` |
| `Axis` | `"Left"` or `"Right"`. **`"Right"` gives that series its own range, ticks and margin** — two series in different units on one scale is the classic chart that lies |
| the series' `Type` | how this series is drawn on a plot, whatever the chart's `Type`: `"Bar"`, `"Line"` or `"Area"`, and `""` for the chart's own. **Bars and a line on one plot**: the counts as bars and the rate as a line over them, usually with `Axis: "Right"`. The line is drawn over the bars and is not part of their stack; a bar series is narrowed only for the other bar series beside it |
| `X` | the left edge, in the parent's coordinates. **It means something only inside a container laying out by coordinate**; in a row or a column the parent decides and this reports where it ended up. `-32767`..`32767`, like `Y` and `Move` |
| `Sizes` | a `Scatter`'s bubble sizes, one per value, scaled by area between the smallest and the largest — a size twice as big *looks* twice as big |
| `Format` | how this series' numbers are written: `""` (the document's `Decimals`), `"Number"`, `"Percent"`, `"Duration"`, `"Bits"` — the words the application's own cards use. The axis of a side takes its format from its first series, and a bar, a slice, a readout and a tooltip from their own |
| `Unit` | a suffix for a format that carries no unit of its own — `"GB"`, `"ms"` — written after the number. `Percent`, `Duration` and `Bits` imply theirs |
| `Mirror` | the series is drawn below the axis and its labels are absolute — see [the mirror](#the-mirror) |
| `Hidden` | out of the drawing and out of the range, and still in the legend, dimmed — see [a clickable legend](#a-clickable-legend) |

## The axes

| | |
|---|---|
| `Labels` | the category axis, as strings. As many as there are values is a label per bar; **fewer** is marks spread evenly across the plot; a pie names its slices from them. Defaults to `[]`. |
| `Marks` | `[{ At, Text }]`, `At` being an index into the values — a **real** time axis, where the caller says where each label goes. Replaces `Labels` on the x axis while it is set. Defaults to `[]`. |
| `YMin` | pins the bottom of the y axis; `""` (or `null`) works it out from the data, on *nice* numbers rather than on the data's own extremes. A value that is not a finite number is refused where it is assigned — stored, it left the axis with no ticks and every frame threw. Defaults to `""`. |
| `YMax` | likewise the top. Defaults to `""`. |
| `Grid` | the horizontal rules behind the data. Defaults to `true`. |
| `Legend` | `None` `Top` `Bottom`. It wraps to at most **three** rows and whatever did not fit is not drawn: a legend of thirty series is the wrong control, and eating the plot to hold one is worse. Defaults to `"Bottom"`. |
| `Title` | above the plot. **Translated**. Defaults to `""`. |
| `ShowValues` | the number on the bar or the percentage in the slice, drawn only where it measures as fitting. Defaults to `false`. |
| `Decimals` | how the numbers are written, `0` to `6`; goes through `Locale.Number`, so the separators are the user's. Defaults to `0`. |

## How a series writes its numbers

A series carries a `Format`, and the axis of a side takes it from the **first
series** measured on that side; a bar's number, a slice's, a readout and a
tooltip take it from their own series. The five words are the ones the
application's cards already use, so a chart and the figure beside it agree:

| | |
|---|---|
| `Format` | `""` is the document's `Decimals` and nothing else; `"Number"` writes the same; `"Percent"` appends ` %`; `"Duration"` writes `45s`, `3m`, `2h 5m`, `1d 2h 0m`; `"Bits"` writes `Gbps`/`Mbps`/`Kbps`/`bps` in the unit that keeps the figure short. A value that is not one of the five is refused where it is assigned |
| `Unit` | a suffix for a format that carries no unit of its own — `"GB"`, `"ms"` — written after the number. `Percent`, `Duration` and `Bits` imply theirs |

```js
chart.Series = [{ Name: "Traffic", Values: bytes, Format: "Bits" }];
chart.Series = [{ Name: "Free", Values: gigabytes, Format: "Number", Unit: "GB" }];
```

## The mirror

`Mirror` draws a series **below the axis** and writes its labels in absolute
value. It is what a butterfly is — the entries one way and the exits the other,
facing each other — and the sign is the drawing's, not the reading's:

```js
chart.Series = [
    { Name: "In",  Values: received, Format: "Bits" },
    { Name: "Out", Values: sent,     Format: "Bits", Mirror: true },
];
```

The values are negated once, when `Series` is assigned, so the range, the bars
and the hit test all measure one shape. **The axis says `1,80` and not `-1,80`**
— the mistake this property replaced was a caller negating the values itself and
the axis repeating the minus back at the reader.

## Thresholds

A threshold is a `Lines` entry: one horizontal line per `Value` — an SLO at
99.9, an alert level — drawn across the plot at `yOf(Value)` with its text at
the right edge, over the data. **A value the axis does not reach is omitted**,
not clamped to the border: an axis pinned away from it is saying the threshold
does not apply, and a line on the edge says the opposite. `Marks` is vertical
and by index, `Bands` is a gauge's ranges, and a *rule* that colours a reading
is the application's own; none of the three is another.

| | |
|---|---|
| `Lines` | horizontal reference lines, `[{ Value, Color, Text, Width }]`, drawn across the plot at `yOf(Value)` with the text at the right edge. A `Value` outside the axis is not drawn; `Width` defaults to `1.5`, and `Color` to the chart's ink. Defaults to `[]`. |

```js
chart.Lines = [{ Value: 99.9, Color: "#e01b24", Text: "SLO 99,9" }];
```

## A long series

| | |
|---|---|
| `Reduced` | more points than pixel columns are decimated to a min and a max per column, which keeps the envelope — a one-sample spike survives it. Defaults to `true`. On by default |
| `From` | the first value on screen. Defaults to `0`. |
| `Count` | how many are on screen; `0` is all of them. Defaults to `0`. |
| `Antialias` | smooth edges. Off is faster and looks it; `Reduced` is the knob that actually matters. Defaults to `true`. |
| `Zoomable` | lets the wheel zoom and a drag pan — see [what the pointer does](#what-the-pointer-does). Off by default, so a chart of four bars never steals a scroll from the `Scroller` around it. Defaults to `false`. |

**The cost of a frame is in pixels covered, not in points**, and in an
interpreter the passes over the data cost more than the drawing. Measured on
21,600 readings in an 800-wide plot:

```
decimated      59.0 frames/s    3.5 ms in the handler
every point    13.2 frames/s   46.6 ms
```

`Reduced` is why the first line exists. The rest is the caller's: the first
working version of this component drew at 35 frames a second because it computed
the y range with `flatMap` over all 21,600 values **on every frame**, and neither
the values nor the range had changed. **Hand a chart a long series and do the
arithmetic once.**

## What the pointer does

Nothing until `Zoomable`, and then: the wheel zooms about the pointer, a drag
pans, and a double click goes back to all of it. Each raises `Range`, and **the
wheel notch is only consumed when the view actually changed** — zooming out a
view that already shows everything answers `false` and raises no `Range` — so a
chart inside a [`Scroller`](../widgets/Scroller.md) still scrolls it at the ends.

| | |
|---|---|
| **event** `Select(series, at, value)` | a click on a bar, a point or a slice. `at` is the index into that series' `Values` |
| **event** `Hover(series, at, value)` | the pointer passing over one, **which is not a selection**: a chart that reported a click as a hover could not have a tooltip. On a line or an area it is the first series; on a **stacked** `Area` it is the band the pointer is inside (the top one above them all), `value` is that series' own value, and the mark is drawn at the top of its band |
| **event** `Range(from, count)` | the window changed — the wheel, a drag, or the double click that resets it |

`Select` and `Hover` are raised whether or not the chart is zoomable, and both
carry the index into the **whole** series — never the position on screen.

**The arithmetic is the document's**, not the control's, so a drawing that paints
documents itself — a dashboard of several charts on one
[`DrawingArea`](../widgets/DrawingArea.md) — forwards the pointer to the chart
under it and gets exactly what a `Chart` does:

| | |
|---|---|
| `ChartDocument.ZoomAt(x, y, dy)` | zooms the window about `x` — the datum under it stays under it, which is what makes zooming feel like a lens — turning the wheel by `dy`. Answers whether the window moved; a notch that moved nothing is `false` |
| `ChartDocument.PanBy(dx)` | pans the window by `dx` pixels: positive moves the values left, the way a drag does. Answers whether the window moved |
| `ChartDocument.Press(x, y)` | the pointer down at (x, y): remembers where a drag would start and answers whether this document can pan at all — `Zoomable`, a window drawn, and something off it |
| `ChartDocument.Move(x, y)` | the pointer at (x, y) after a `Press`: pans when it has dragged more than three pixels, and otherwise marks `hover`. Answers `"pan"` (a drag, whose window may or may not have moved), `"hover"` (a different point is under the pointer now) or `""` |
| `ChartDocument.Release()` | the pointer up: forgets the press and answers `true` when the gesture never dragged — which is a click, and what raises `Select` |

## The tooltip

**The document never draws a tooltip window.** `Tooltip(x, y)` answers what one
would say — `{ Text, X, Y, Width, Height }` — with the value formatted by its
series' `Format` and the box measured with the font the frame drew with, placed
beside the point. A drawing that keeps a document of its own draws the card with
its own ink and its own theme, which is why the geometry is part of the answer:

| | |
|---|---|
| `ChartDocument.Tooltip(x, y)` | what a tooltip would say at a point, in the coordinates of the last `Paint`: `{ Text, X, Y, Width, Height }` — the label, the series and the value under it, formatted with that series' `Format`, in a box measured with the font the frame drew with — or `null` when nothing is there. **The document does not draw it**: a drawing that keeps a document of its own places the card with its own ink and its own theme, which is why the box comes measured and placed beside the point |

```js
const t = doc.Tooltip(x, y);
if (t) { /* draw a card at (t.X, t.Y) sized (t.Width, t.Height), saying t.Text */ }
```

## A clickable legend

`LegendHit(x, y)` answers the legend entry under a point — `{ Series, At }` —
and `Series[].Hidden` takes that series out of the drawing and out of the range,
leaving it dimmed in the legend so a second click puts it back. `Paint` skips a
hidden series, and `Refresh()` is what recomputes the range after changing one
in place.

| | |
|---|---|
| `ChartDocument.LegendHit(x, y)` | the legend entry at a point, in the same coordinates: `{ Series, At }` — `Series` is the one to hide or show and `At` the entry that was hit (the slice's index on a pie, the series' own on a plot) — or `null`. Nothing when the legend is `None` or nothing has been drawn yet |
| `ChartDocument.Refresh()` | redraws now and forgets what the last frame measured, for when the numbers changed **in place**: `doc.Series[k].Hidden = true` changes no property, so nothing knows to recompute the range |

## Off the screen

| | |
|---|---|
| `Save(path, width, height)` | the same drawing to a PNG of any size — a chart in a report, or in a bug report |

The control's `Save` runs its own canvas, so it needs the control — and a control
needs a display. With no display, or for a page, it is the document's.

## The document

| | |
|---|---|
| `Document` (ro) | the chart itself — a `ChartDocument`, which is what draws. Every property below that is not about the pointer is a property of it |

**A chart is a `ChartDocument`, and the control shows one.** The type, the
series, the axes and the drawing of them are the document's; what the `Chart`
adds is a screen — the pointer, the wheel, a drag and `Select`, `Hover` and
`Range`. Every property above that is not about the pointer is the document's
too, under the same name and with the same default, and assigning one on the
control assigns it there: `chart.Type = "Line"` and `chart.Document.Type` are one
value.

A `ChartDocument` is made with `new` and is not a widget, so it is what a `main`
project draws charts with — a nightly job, a tool run over ssh. (Not a
[`Task`](../globals/Task.md): a worker installs no painter and no `Drawing`.) It
has every property above, `Zoomable` included, and verbs of its own — `Paint`,
`Save`, `HitTest`, `ToPng`, and the window, tooltip and legend verbs above:

| | |
|---|---|
| `ChartDocument.Paint(p, width, height)` | draws the chart with `p` into `width`×`height` — for a painter something else opened: a `Drawing`, a report's page, a `DrawPage` of your own. The ink is the painter's `Foreground`, so on paper it is black |
| `ChartDocument.Save(path, width, height)` | the drawing to a PNG of any size. **No widget and no display**: it draws through `Drawing`, so a `main` project has charts too |
| `ChartDocument.HitTest(x, y)` | what the last `Paint` drew at a point, in the coordinates it drew in: `{ Series, At, Value }` — the bar, the point or the slice a click there means, `At` an index into that series' `Values` — or `null`. What a drawing that holds a document of its own (a dashboard, a page) answers a click with, since only a `Chart` hears the pointer. Nothing drawn yet is `null` |
| `ChartDocument.ToPng(width, height)` | the same drawing as `Save`, answered as `Bytes` — a chart to attach or put in a reply, with nothing on disk |

```js
// project.json: { "main": "Main", "uses": ["charts"] }
function Main() {
    const c = new ChartDocument();
    c.Type   = "Bar";
    c.Title  = "Tickets by week";
    c.Labels = weeks;
    c.Series = [{ Name: "Opened", Values: opened }, { Name: "Closed", Values: closed }];
    c.Save("tickets.png", 900, 420);
    const png = c.ToPng(900, 420);         // the same picture as Bytes, nothing on disk
}
```

`Save` and `ToPng` draw through [`Drawing`](../globals/Drawing.md), whose painter
has no control behind it and **black ink** — so the title, the axes and the
legend are readable on a white page whatever the desktop's theme. The control's
`Save` is the opposite case: its canvas takes the theme's ink, which on a dark
desktop is light text on a transparent ground. **For paper, draw the document.**

`Paint` is the drawing on a painter somebody else opened: a `Drawing.SavePdf`
that puts a chart on a page beside other things, or a `Draw` or `DrawPage` of
your own. The ink is that painter's `Foreground`, so it
is black under `Drawing` and the theme's on a control.

## What it does not do

No animation, no radar, no candlesticks, no second x axis, no logarithmic scale,
and **no tooltip window of its own** — `Hover` and `Tooltip` are there so the
form can put the text where it wants it, and a drawing that owns the document
draws the card itself.

Three of Chart.js' are left out on purpose, that being the library this one was
measured against: its **plugin system**, because a component's subclass is the
extension point here; its **animation by default**, because a chart that animates
on every change of data is one nobody can read a number off; and its **config
object**, because a bag of nested options is the opposite of a designable
control — which is the whole argument of this environment, and the reason `Type`,
`Legend` and `Labels` are properties in a file.

## See also

[`Report`](Report.md) · [`Markdown`](Markdown.md) ·
[`DrawingArea`](../widgets/DrawingArea.md) ·
[`examples/charts`](https://github.com/getbintana/bintana/tree/main/examples/charts) ·
[llm/charts.md](../../llm/charts.md), the short form
