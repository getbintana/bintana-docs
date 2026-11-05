# Bitmap

A picture as a value: load it, turn it, and hand it to whatever shows it.

What [`Picture`](../widgets/Picture.md) shows and [`Painter.Image`](../../llm/controls.md#painter)
paints, without either of them being the thing you transform. It is the same
bargain [`Bytes`](Bytes.md) makes for a file: an immutable value with the
operations an application actually performs on it.

```js
const logo    = Bitmap.Load("logo.png");
const thumb   = logo.Scale(64);               // 64x43: the height follows
const square  = logo.Crop(10, 10, 120, 120);  // clipped at the edge
const turned  = square.Rotate(90);            // exact: the sides swap
const slanted = square.Rotate(12.5);          // the canvas grows to fit

picture.Source = thumb;                       // the control shows it
painter.Image(Bitmap.FromBytes(download), x, y, 40);
```

## Every member

| | | |
|---|---|---|
| `Bitmap.Load(path)` | the picture a `Picture` would show | [making one](#making-one) |
| `Bitmap.FromBytes(bytes)` | the picture already in memory -- what `Http` answers with and `File.LoadBytes` reads -- decoded once | [making one](#making-one) |
| `Width` (ro) | pixels, read-only | [measuring one](#measuring-one) |
| `Height` (ro) | pixels, read-only | [measuring one](#measuring-one) |
| `Scale(width, [height])` | a new picture | [transforming](#transforming) |
| `Crop(x, y, width, height)` | the box kept | [transforming](#transforming) |
| `Rotate(degrees)` | clockwise, like `Painter.Rotate`; 90/180/270 are exact, any other angle expands the canvas to the turned rectangle | [transforming](#transforming) |
| `Flip(horizontal, [vertical])` | a mirror; both together is the same as `Rotate(180)` | [transforming](#transforming) |
| `Save(path)` | writes PNG, like `DrawingArea.Save` | [leaving it](#leaving-it) |
| `ToPng()` | the same PNG in memory, for an upload or a `Record` field | [leaving it](#leaving-it) |

## Making one

| | |
|---|---|
| `Bitmap.Load(path)` | the picture a `Picture` would show: PNG, JPEG, WebP, TIFF, BMP, and an SVG only where this machine has a loader. A path that is not one is refused by name, where `Probe.Image` answers `null` |
| `Bitmap.FromBytes(bytes)` | the picture already in memory -- what `Http` answers with and `File.LoadBytes` reads -- decoded once |

**There is no `new Bitmap`.** A picture comes from somewhere, and the two
somewheres are a path and bytes; a constructor with no arguments would only be
an empty picture that every member would then have to refuse. `new Bitmap()`
throws with the sentence naming the two.

**A missing file, a directory, or something that is not an image throws**, and
the message names the path and what went wrong. That is the difference from
[`Probe.Image`](Probe.md): a probe asks *is this a picture?* and answers `null`;
`Bitmap.Load` says *show me this picture* and a refusal is the answer a caller
can act on.

## Measuring one

| | |
|---|---|
| `Width` (ro) | pixels, read-only |
| `Height` (ro) | pixels, read-only |
| `toString()` | `"Bitmap(120x80)"` — a description, not the pixels, exactly as `Bytes(763)` is |

**The size is the value's own**, after every transform: `Scale`, `Crop`,
`Rotate` and `Flip` answer pictures that measure themselves. Nothing here asks
the file again, and nothing needs a display.

## Transforming

| | |
|---|---|
| `Scale(width, [height])` | a new picture. One side is enough: the other follows the picture's own proportions; both make that exact size, distorting if it has to |
| `Crop(x, y, width, height)` | the box kept. A box that runs past the edge is clipped to it, the way `Bytes.Slice` clamps; one with no overlap at all is refused |
| `Rotate(degrees)` | clockwise, like `Painter.Rotate`; 90/180/270 are exact, any other angle expands the canvas to the turned rectangle |
| `Flip(horizontal, [vertical])` | a mirror; both together is the same as `Rotate(180)` |

**Nothing mutates.** `Scale`, `Crop`, `Rotate` and `Flip` answer a **new**
`Bitmap` and leave the original exactly as it was. That is what makes one safe
to keep in a `Record`, hand to two controls, or reuse as the source of a
thumbnail and a full-size view — a value's bargain, and the reason there are no
setters here.

**Rotating by an arbitrary angle loses the pixels at the corners** rather than
stretching the picture to fill the new canvas: the turned rectangle is placed at
the centre of a larger one, and what falls outside is gone. Crop after turning,
not before, when the result must be a particular size.

## Showing one

| | |
|---|---|
| `Picture.Source` | the control's third source, after `File` and `LoadBytes`: assign a `Bitmap` and it shows that. Setting it clears `File`, and `null` clears it. **Not saved in a `.form`** — a Bitmap is runtime data, like `LoadBytes` |
| `Painter.Image(bitmap, x, y, [width], [height])` | a picture, put down with its top-left corner there. **One of `width`/`height` is enough** — the other follows the image's own proportions. With neither it is drawn at its natural size, one image pixel to one. A **string** is a file, absolute or relative to the working directory; **`Bytes`** are the image itself, which is what `Http` answers with; a **`Bitmap`** is a picture already decoded and transformed, and its pixels are what get drawn. Missing, or not an image, **throws** and ends the frame. A path is decoded once and cached, so a drawing may paint the same logo every frame; **bytes and a Bitmap are downloaded into cairo on every call** — the cache is keyed on the path, and neither has a key that stays true. A `Bitmap` is the one to reach for when the picture is scaled, cropped or turned first: the work happens once, in the value. Measured: 2.7 ms a call for a 640×480 PNG against 0.045 ms for the same file cached. A handler painting the same bytes every frame wants a `Picture` with `LoadBytes` instead |

A `Bitmap` is **not a control**: nothing draws until a `Picture` or a `Painter`
is given it. It is also not an [`Image`](../widgets/Image.md), which is the
control that draws an icon at a size, and not a [`Picture`](../widgets/Picture.md),
which is the control that shows a photograph. The three words name three things,
and only one of them is a value.

**It works in a `Task`.** The work is in GdkPixbuf, which needs no display: a
worker can decode, scale, crop and turn photographs with no form and no window.
**A `Bitmap` itself does not cross a task boundary** — the values that cross are
plain data, `Decimal` and [`Bytes`](Bytes.md) — so a thumbnail comes back as
`ToPng()` and the main thread reads it with `Bitmap.FromBytes` when it wants one
again.

## Leaving it

| | |
|---|---|
| `Save(path)` | writes PNG, like `DrawingArea.Save` |
| `ToPng()` | the same PNG in memory, for an upload or a `Record` field |

**PNG is the only output**, deliberately: a lossless format with an alpha
channel is the one whose result is the picture you had, and a `Quality` or a
`Format` option would be a second decision every caller would otherwise get
wrong. A JPEG for the web is a conversion somebody asks a tool for, not the
default of a value object.

## What goes wrong

- **`Bitmap.Load` threw where `Probe.Image` answered `null`.** The probe asks
  whether a file is a picture; `Load` asks for the picture. A missing file or a
  format this machine does not read is a throw here, and the message names it.
- **`Crop` refused a box.** It starts outside the picture, or is zero-sized.
  A box that merely runs past the edge is clipped, not refused.
- **`Picture.Source = "logo.png"` threw.** `Source` is a `Bitmap`, not a path:
  `File` takes the path, and the value comes from `Bitmap.Load`.
- **The picture came back smaller after a rotation.** An arbitrary angle keeps
  the turned rectangle and drops the corners; that is the geometry, not a bug.
- **`Source` was `null` after assigning `File`.** One control, one source:
  setting any of `File`, `LoadBytes` or `Source` clears the other two.

## What it does not do

- **No mutation, no drawing, no animation.** It is pixels; `Painter` draws and
  `Video` plays.
- **No `new`.** `Load` and `FromBytes` are the two ways in.
- **No JPEG output, no quality, no format argument.** `Save` writes PNG.
- **No EXIF orientation applied for you.** A photograph that carries its
  rotation in metadata is shown as the pixels are stored, exactly as
  `Picture.File` shows it; use `Rotate` when the orientation matters.

## See also

[`Picture`](../widgets/Picture.md) · [`Image`](../widgets/Image.md) ·
[`Probe`](Probe.md) · [`Bytes`](Bytes.md) ·
[`Painter.Image`](../../llm/controls.md#painter) · [`Drawing`](Drawing.md)
