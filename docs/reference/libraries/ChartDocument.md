# ChartDocument

A chart with no control: the type, the series, the axes and the drawing of
them, with nothing on a screen.

It is what a [`Chart`](Chart.md) shows — the control holds one as
`Chart.Document` and adds what a screen has: the pointer, the wheel, a drag, and
the `Select`, `Hover` and `Range` events. A `ChartDocument` is made with `new`
and is not a widget, so it is also what a `main` project draws charts with, and
what a drawing that paints several charts itself — a dashboard on one
[`DrawingArea`](../widgets/DrawingArea.md), a report's page — keeps one of per
chart. It ships in the `charts` library.

```json
{ "name": "Weekly", "main": "Main", "uses": ["charts"] }
```

```js
function Main() {
    const c = new ChartDocument();
    c.Type   = "Bar";
    c.Title  = "Tickets by week";
    c.Labels = weeks;
    c.Series = [{ Name: "Opened", Values: opened }, { Name: "Closed", Values: closed }];
    c.Save("tickets.png", 900, 420);
}
```

**What the properties mean is written once, on [`Chart`](Chart.md).** The
control's property and the document's are one value under one name —
`chart.Type = "Line"` is `chart.Document.Type` — so the kinds, the series and
their fields, the axes, the formats and the window are explained there. This
page is the document's members and what it does with no control.

## Every member

**What is drawn**

| | | |
|---|---|---|
| `Type` | `Bar` `Line` `Area` `Pie` `Doughnut` `Scatter` `Heatmap` `Gauge` | [what is drawn](#what-is-drawn) |
| `Series` | the data | [what is drawn](#what-is-drawn) |
| `Labels` | the category axis, as strings | [what is drawn](#what-is-drawn) |
| `Marks` | `[{ At, Text }]`, `At` being an index into the values — a **real** time axis, where the caller says where each label goes | [what is drawn](#what-is-drawn) |
| `Title` | above the plot | [what is drawn](#what-is-drawn) |
| `Stacked` | series piled instead of side by side | [what is drawn](#what-is-drawn) |
| `Curved` | rounded lines for `Line` and `Area`, **monotone**: between two samples the curve stays between their values and flattens at a peak instead of inventing a taller one | [what is drawn](#what-is-drawn) |
| `Bands` | a `Gauge`'s coloured ranges, `[{ To, Color, Name }]` in rising order: each runs from the end of the one before (the first from `YMin`) to `To`, and the value's arc takes the colour of the range it falls in | [what is drawn](#what-is-drawn) |

**The axes and the numbers**

| | | |
|---|---|---|
| `YMin` | pins the bottom of the y axis | [the axes](#the-axes) |
| `YMax` | likewise the top | [the axes](#the-axes) |
| `Decimals` | how the numbers are written, `0` to `6`; goes through `Locale.Number`, so the separators are the user's | [the axes](#the-axes) |
| `Grid` | the horizontal rules behind the data | [the axes](#the-axes) |
| `Legend` | `None` `Top` `Bottom` | [the axes](#the-axes) |
| `ShowValues` | the number on the bar or the percentage in the slice, drawn only where it measures as fitting | [the axes](#the-axes) |
| `Lines` | horizontal reference lines, `[{ Value, Color, Text, Width }]`, drawn across the plot at `yOf(Value)` with the text at the right edge | [the axes](#the-axes) |

**A long series and its window**

| | | |
|---|---|---|
| `From` | the first value on screen | [the window](#the-window) |
| `Count` | how many are on screen | [the window](#the-window) |
| `Reduced` | more points than pixel columns are decimated to a min and a max per column, which keeps the envelope — a one-sample spike survives it | [the window](#the-window) |
| `Antialias` | smooth edges | [the window](#the-window) |
| `Zoomable` | lets the wheel zoom and a drag pan — the arithmetic of it is `ZoomAt`/`PanBy`/`Press`/`Move`/`Release`, so a drawing that forwards a pointer gets the same window a `Chart` does | [the window](#the-window) |
| `ZoomAt(x, y, dy)` | zooms the window about `x` — the datum under it stays under it, which is what makes zooming feel like a lens — turning the wheel by `dy` | [the window](#the-window) |
| `PanBy(dx)` | pans the window by `dx` pixels: positive moves the values left, the way a drag does | [the window](#the-window) |
| `Press(x, y)` | the pointer down at (x, y): remembers where a drag would start and answers whether this document can pan at all — `Zoomable`, a window drawn, and something off it | [the window](#the-window) |
| `Move(x, y)` | the pointer at (x, y) after a `Press`: pans when it has dragged more than three pixels, and otherwise marks `hover` | [the window](#the-window) |
| `Release()` | the pointer up: forgets the press and answers `true` when the gesture never dragged — which is a click, and what raises `Select` | [the window](#the-window) |

**What is under a point**

| | | |
|---|---|---|
| `HitTest(x, y)` | what the last `Paint` drew at a point, in the coordinates it drew in | [under a point](#under-a-point) |
| `Tooltip(x, y)` | what a tooltip would say at a point, in the coordinates of the last `Paint` | [under a point](#under-a-point) |
| `LegendHit(x, y)` | the legend entry at a point, in the same coordinates | [under a point](#under-a-point) |
| `Refresh()` | redraws now and forgets what the last frame measured, for when the numbers changed **in place** | [under a point](#under-a-point) |

**The drawing**

| | | |
|---|---|---|
| `Paint(p, width, height)` | draws the chart with `p` into `width`×`height` — for a painter something else opened: a `Drawing`, a report's page, a `DrawPage` of your own | [the drawing](#the-drawing) |
| `Save(path, width, height)` | the drawing to a PNG of any size | [the drawing](#the-drawing) |
| `ToPng(width, height)` | the same drawing as `Save`, answered as `Bytes` — a chart to attach or put in a reply, with nothing on disk | [the drawing](#the-drawing) |

It raises no events: a document hears no pointer. The verbs that take one answer
what happened instead, and the drawing that forwarded the pointer decides what
it means.

## What is drawn

| | |
|---|---|
| `Type` | `Bar` `Line` `Area` `Pie` `Doughnut` `Scatter` `Heatmap` `Gauge`. Defaults to `"Bar"`. |
| `Series` | the data: `[{ Name, Values, Color, Colors, Axis, Type, X, Sizes, Format, Unit, Mirror, Hidden }]` — see below. Defaults to `[]`. Assigning it redraws |
| `Labels` | the category axis, as strings. As many as there are values is a label per bar; **fewer** is marks spread evenly across the plot; a pie names its slices from them. Defaults to `[]`. |
| `Marks` | `[{ At, Text }]`, `At` being an index into the values — a **real** time axis, where the caller says where each label goes. Replaces `Labels` on the x axis while it is set. Defaults to `[]`. |
| `Title` | above the plot. **Translated**. Defaults to `""`. |
| `Stacked` | series piled instead of side by side. Applies to `Bar` and `Area`; a line and a pie **ignore** it rather than refusing, so the order of two lines in a `.form` never matters. Defaults to `false`. |
| `Curved` | rounded lines for `Line` and `Area`, **monotone**: between two samples the curve stays between their values and flattens at a peak instead of inventing a taller one. Off by default because a curve says something about values nobody measured. Defaults to `false`. |
| `Bands` | a `Gauge`'s coloured ranges, `[{ To, Color, Name }]` in rising order: each runs from the end of the one before (the first from `YMin`) to `To`, and the value's arc takes the colour of the range it falls in. Other types ignore it. Defaults to `[]`. |

A series' fields — `Color`, `Colors`, `Axis`, its own `Type`, `Sizes`, `Format`,
`Unit`, `Mirror`, `Hidden` — and the three kinds that are not a category plot
are on [`Chart`](Chart.md#the-data), with [the mirror](Chart.md#the-mirror) and
[how a series writes its numbers](Chart.md#how-a-series-writes-its-numbers).

## The axes

| | |
|---|---|
| `YMin` | pins the bottom of the y axis; `""` (or `null`) works it out from the data, on *nice* numbers rather than on the data's own extremes. A value that is not a finite number is refused where it is assigned — stored, it left the axis with no ticks and every frame threw. Defaults to `""`. |
| `YMax` | likewise the top. Defaults to `""`. |
| `Decimals` | how the numbers are written, `0` to `6`; goes through `Locale.Number`, so the separators are the user's. Defaults to `0`. |
| `Grid` | the horizontal rules behind the data. Defaults to `true`. |
| `Legend` | `None` `Top` `Bottom`. It wraps to at most **three** rows and whatever did not fit is not drawn: a legend of thirty series is the wrong control, and eating the plot to hold one is worse. Defaults to `"Bottom"`. |
| `ShowValues` | the number on the bar or the percentage in the slice, drawn only where it measures as fitting. Defaults to `false`. |
| `Lines` | horizontal reference lines, `[{ Value, Color, Text, Width }]`, drawn across the plot at `yOf(Value)` with the text at the right edge. A `Value` outside the axis is not drawn; `Width` defaults to `1.5`, and `Color` to the chart's ink. Defaults to `[]`. |

## The window

| | |
|---|---|
| `From` | the first value on screen. Defaults to `0`. |
| `Count` | how many are on screen; `0` is all of them. Defaults to `0`. |
| `Reduced` | more points than pixel columns are decimated to a min and a max per column, which keeps the envelope — a one-sample spike survives it. Defaults to `true`. On by default |
| `Antialias` | smooth edges. Off is faster and looks it; `Reduced` is the knob that actually matters. Defaults to `true`. |
| `Zoomable` | lets the wheel zoom and a drag pan — the arithmetic of it is `ZoomAt`/`PanBy`/`Press`/`Move`/`Release`, so a drawing that forwards a pointer gets the same window a `Chart` does. Off by default, so a chart of four bars never steals a scroll from the `Scroller` around it. Defaults to `false`. |
| `ZoomAt(x, y, dy)` | zooms the window about `x` — the datum under it stays under it, which is what makes zooming feel like a lens — turning the wheel by `dy`. Answers whether the window moved; a notch that moved nothing is `false` |
| `PanBy(dx)` | pans the window by `dx` pixels: positive moves the values left, the way a drag does. Answers whether the window moved |
| `Press(x, y)` | the pointer down at (x, y): remembers where a drag would start and answers whether this document can pan at all — `Zoomable`, a window drawn, and something off it |
| `Move(x, y)` | the pointer at (x, y) after a `Press`: pans when it has dragged more than three pixels, and otherwise marks `hover`. Answers `"pan"` (a drag, whose window may or may not have moved), `"hover"` (a different point is under the pointer now) or `""` |
| `Release()` | the pointer up: forgets the press and answers `true` when the gesture never dragged — which is a click, and what raises `Select` |

**The arithmetic of zooming and panning is the document's**, which is why a
drawing that paints documents itself gets exactly what a `Chart` does: forward
the wheel to `ZoomAt`, the button to `Press`/`Move`/`Release`, and redraw when
one answers that the window moved. `Release()` answering `true` is a click —
what a `Chart` raises `Select` for. The measurements behind `Reduced` are on
[`Chart`](Chart.md#a-long-series).

## Under a point

| | |
|---|---|
| `HitTest(x, y)` | what the last `Paint` drew at a point, in the coordinates it drew in: `{ Series, At, Value }` — the bar, the point or the slice a click there means, `At` an index into that series' `Values` — or `null`. What a drawing that holds a document of its own (a dashboard, a page) answers a click with, since only a `Chart` hears the pointer. Nothing drawn yet is `null` |
| `Tooltip(x, y)` | what a tooltip would say at a point, in the coordinates of the last `Paint`: `{ Text, X, Y, Width, Height }` — the label, the series and the value under it, formatted with that series' `Format`, in a box measured with the font the frame drew with — or `null` when nothing is there. **The document does not draw it**: a drawing that keeps a document of its own places the card with its own ink and its own theme, which is why the box comes measured and placed beside the point |
| `LegendHit(x, y)` | the legend entry at a point, in the same coordinates: `{ Series, At }` — `Series` is the one to hide or show and `At` the entry that was hit (the slice's index on a pie, the series' own on a plot) — or `null`. Nothing when the legend is `None` or nothing has been drawn yet |
| `Refresh()` | redraws now and forgets what the last frame measured, for when the numbers changed **in place**: `doc.Series[k].Hidden = true` changes no property, so nothing knows to recompute the range |

The first three read **the last `Paint`**, in the coordinates it drew in:
nothing drawn yet is `null`. `Refresh()` is the other side of that: it forgets
what the last frame measured, for a change made in place. The document never draws a tooltip window; `Tooltip` answers the
text and a box measured with the frame's font, and the drawing puts the card
there with its own ink — see [the tooltip](Chart.md#the-tooltip) and
[a clickable legend](Chart.md#a-clickable-legend).

## The drawing

| | |
|---|---|
| `Paint(p, width, height)` | draws the chart with `p` into `width`×`height` — for a painter something else opened: a `Drawing`, a report's page, a `DrawPage` of your own. The ink is the painter's `Foreground`, so on paper it is black |
| `Save(path, width, height)` | the drawing to a PNG of any size. **No widget and no display**: it draws through `Drawing`, so a `main` project has charts too |
| `ToPng(width, height)` | the same drawing as `Save`, answered as `Bytes` — a chart to attach or put in a reply, with nothing on disk |

`Save` and `ToPng` draw through [`Drawing`](../globals/Drawing.md), whose painter
has no control behind it and **black ink**: the title, the axes and the legend
are readable on a white page whatever the desktop's theme, and they work in a
`main` run by the console runtime, `bintana`, with no display and no GTK. Not in
a [`Task`](../globals/Task.md): a worker installs no painter and no `Drawing`.

`Paint` is the chart on a painter somebody else opened — a `Drawing.SavePdf`
that puts it on a page beside a [`ReportDocument`](ReportDocument.md)'s, or a
`Draw` of your own — and its ink is that painter's `Foreground`. The control's
own `Save` is the opposite case: its canvas takes the theme's ink, so **for
paper, draw the document**.

## See also

[`Chart`](Chart.md), the control · [`ReportDocument`](ReportDocument.md) ·
[`Drawing`](../globals/Drawing.md) · [`DrawingArea`](../widgets/DrawingArea.md) ·
[llm/charts.md](../../llm/charts.md), the short form
