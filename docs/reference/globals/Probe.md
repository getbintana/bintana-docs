# Probe

What a file *is*, read from its header without decoding it.

```js
Probe.Image("logo.png")          // { Width: 640, Height: 200 }
Probe.Image("notes.txt")         // null: not a picture this machine reads
Probe.Image("gone.png")          // null: not there
```

**No widget, no display, no pixels.** The header and nothing else, so a
12000×8000 photograph costs a few bytes of reading and no memory for its pixels,
and the answer is there before anything has been drawn — in `Form_Open`, while a
report is still measuring its bands, and in a `main` project, which never has a
display and cannot make a [`Picture`](../widgets/Picture.md) to ask.

## Every member

| | | |
|---|---|---|
| `Image(path)` | the picture's pixels, from its header | [image](#image) |

## Image

| | |
|---|---|
| `Image(path)` | the picture's pixels, from its header. `null` when `path` is not a picture this machine's loaders read -- exactly the files a `Picture` would not show, an `.svg` included where no SVG loader is installed, and its declared size where one is -- or is not there. **A file's header and nothing else**: the size of a picture already in memory is the handle's to answer, off the decode it already did. **No widget and no display**, which is what makes it answerable in a `main` project and before anything has been drawn |

`{ Width, Height }` in pixels, or `null`. A vector picture has no pixels of its
own, so an SVG answers the size it declares — `{ Width: 300, Height: 100 }` for a
`viewBox="0 0 300 100"`.

**It reads exactly the files a `Picture` shows.** Both go through the machine's
image loaders — `Probe` through GdkPixbuf's header reader, `Picture` through the
decoder built on the same loaders — so a `null` here means a `Picture` would have
shown nothing, and the reverse. **Which formats that is belongs to the machine**,
not to the runtime: on Fedora 44 the loaders are glycin's and include SVG, and
where no SVG loader is installed an `.svg` is `null` here and blank in a
`Picture` alike. A program that must know asks; it does not assume either way.

**`null` for "not there" and for "not a picture this machine reads"**, one answer
for one question, the same one [`File.Info`](File.md) gives for a missing file.
A path that is not text is **refused**, like every verb that takes one:
`Probe.Image(undefined)` must not quietly probe a file called `./undefined`.

```js
// a logo 40 points tall, as wide as its proportions say
const size  = Probe.Image(logo);
const width = size ? 40 * size.Width / size.Height : 0;
```

## Why it is not on `File`

**`File` is for working *on* a file** — `Load`, `Save`, `Info`, `Hash`, `Watch` —
and a question about a *picture* in the object that moves bytes around is the
wrong shelf. **`File.Info` already answers a `Type`**, as a MIME type, so a
`File.ImageSize` would be a second answer about one file under one owner, which
is how a vocabulary stops meaning one thing. `Info` was the other candidate and
is refused for the same reason; `Meta` already means *the data of a row* in a
runtime with [`Record`](Record.md) and `Field`.

*Probe* is the word the tools that do this already use — `ffprobe`, `exiftool`,
ImageMagick's `identify` read a header and say what the thing is. The namespace
grows by the **kind** of thing, a verb when something needs one: `Image` today.
There is deliberately no `Probe.File`, because a file's size and time are
`File.Info`'s.

## What goes wrong

- **`null` for a file that is there.** This machine has no loader for its
  format; a `Picture` would show nothing either. An `.svg` on a desktop without
  an SVG loader is the usual case.
- **A `TypeError` naming `Probe.Image`.** The path was not text — a key that was
  missing from a settings file, usually.
- **The size of an SVG is small.** It is the size the document declares; it
  scales to whatever it is drawn at.

A worker has it: nothing in it calls back or keeps a list, and a report sizing a
logo on a thread is the caller a widget could not have served anyway.

## See also

[`File`](File.md) · [`Picture`](../widgets/Picture.md) ·
[`Painter.Image`](../../llm/controls.md#painter) · [`Text`](Text.md), the same
bargain for a string
