# Picture

A photograph, which is not an icon.

Reach for it whenever the thing being shown is an image in its own right — a
photo, a screenshot, a scan, a downloaded picture — rather than a symbol at a
size. What it adds over [`Image`](Image.md) is the two questions a viewer has to
answer: **what to do with the room there is**, and **how big to be whatever the
room is**.

It is a `Widget` and a control like any other, so everything on
[Widget](Widget.md) is on it too; what follows is what is its own.

## Every member

| | | |
|---|---|---|
| `File` | the path | [what it shows](#what-it-shows) |
| `Fit` | what to do with the room there is | [fit and zoom](#fit-and-zoom) |
| `SourceHeight` (ro) | the picture's own height, from the file or the Bitmap | [fit and zoom](#fit-and-zoom) |
| `SourceWidth` (ro) | what is really in the picture — the file's or the Bitmap's — which is the number a zoom is computed from and the one a title bar shows | [fit and zoom](#fit-and-zoom) |
| `Zoom` | how big to be, whatever the room is: a factor, where `1` is one image pixel to one screen pixel | [fit and zoom](#fit-and-zoom) |
| `LoadBytes(bytes)` | the photograph out of memory instead — a download shown without a temporary file | [what it shows](#what-it-shows) |
| `Source` | a `Bitmap` to show -- the value `Scale`, `Crop` and `Rotate` answer | [what it shows](#what-it-shows) |

## What it shows

| | |
|---|---|
| `File` | the path. What `GdkTexture` reads: PNG, JPEG, WebP, TIFF, BMP. **SVG is not among them** — a scalable icon is the pixbuf loaders' business, which is why an [`Image`](Image.md) draws one and this does not. Setting it clears `Source` |
| `LoadBytes(bytes)` | the photograph out of memory instead — a download shown without a temporary file. Clears `File` and `Source`; `SourceWidth` and `SourceHeight` measure it the same way |
| `Source` | a `Bitmap` to show -- the value `Scale`, `Crop` and `Rotate` answer. Setting it clears `File`; `null` clears it. The getter answers the `Bitmap` it was given, or `null` for a file or bytes. **Not saved**: a Bitmap is runtime data, like `LoadBytes` |

**The three sources are one**: `File`, `LoadBytes` and `Source` are the same
question answered three ways, and the last one set wins. A photograph that
comes from a path is `File`; one downloaded into memory is `LoadBytes`; one
already scaled, cropped or turned is `Source` with the [`Bitmap`](../globals/Bitmap.md)
that did it. `SourceWidth` and `SourceHeight` measure whichever is in force.

## Fit and zoom

| | |
|---|---|
| `Fit` | what to do with the room there is: `Contain` (the whole picture, letterboxed), `Cover` (fill the room, cropping), `Fill` (stretch, distorting) or `ScaleDown` (never enlarge). Default `"Contain"` |
| `Zoom` | how big to be, whatever the room is: a factor, where `1` is one image pixel to one screen pixel. `0` means *let `Fit` decide* |
| `SourceWidth` (ro) | what is really in the picture — the file's or the Bitmap's — which is the number a zoom is computed from and the one a title bar shows. `0` when nothing is loaded |
| `SourceHeight` (ro) | the picture's own height, from the file or the Bitmap |

**`Fit` and `Zoom` answer two different questions**, and which one a program wants
says what kind of program it is:

- a picture **on a form** — a thumbnail, an avatar, an illustration — wants
  `Fit`, and the room is whatever the layout gives it;
- a picture **in a viewer** wants `Zoom`, inside a [`Scroller`](Scroller.md),
  because scrolling around a photograph means the picture is bigger than the
  window.

*Fit to window* in a viewer is therefore not a mode this control has: it is a
zoom worked out from the room — `SourceWidth` and the scroller's size — which is
what [`examples/viewer`](https://github.com/getbintana/bintana/tree/main/examples/viewer) does and why `SourceWidth` is
published at all.

## What goes wrong

- **An SVG shows nothing from `File`.** Not a texture format; use [`Image`](Image.md)
  with `Icon`, or load it through [`Bitmap`](../globals/Bitmap.md) where this
  machine has an SVG loader and assign `Source`.
- **The picture is distorted.** `Fit: "Fill"` stretches; `Contain` is the one
  that keeps the proportion.
- **Zooming does nothing.** `Fit` is deciding: set `Zoom` to a factor, and the
  control stops fitting.
- **The picture is enormous in a form.** A `Picture` with no room to fit into is
  as big as the file; give it a size, an `Expand`, or `ScaleDown`.
- **`SourceWidth` is 0.** Nothing is loaded, or the file is not an image.
- **`Source = "logo.png"` threw.** `Source` takes a [`Bitmap`](../globals/Bitmap.md),
  not a path: `File` takes the path.

## What it does not do

- **No scrolling of its own.** A [`Scroller`](Scroller.md) around it, which is
  what makes the pair a viewer.
- **No rotation, no cropping, no editing of its own.** Those happen on a
  [`Bitmap`](../globals/Bitmap.md), and `Source` shows the answer.
- **No animation.** A video is [`Video`](Video.md).

## See also

[`Image`](Image.md) · [`Bitmap`](../globals/Bitmap.md) · [`Scroller`](Scroller.md) ·
[`Video`](Video.md) ·
[`examples/viewer`](https://github.com/getbintana/bintana/tree/main/examples/viewer)
