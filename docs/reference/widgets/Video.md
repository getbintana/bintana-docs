# Video

A clip that plays, in the window.

A file, a stream, a camera: one GStreamer `playbin3` per control, shown through
the paintable sink in a `GtkPicture` — which is why it styles like a
[`Picture`](Picture.md). Audio with no window is
[`AudioPlayer`](../../llm/library.md#audioplayer).

**GStreamer is optional at build time.** Without it the *verbs* refuse, naming
the package that is missing, and every property still answers — because a
designer and a serialiser read every value of a control and must not depend on an
optional dependency.

It is a `Widget` and a control like any other, so everything on
[Widget](Widget.md) is on it too; what follows is what is its own.

## Every member

**Properties**

| | | |
|---|---|---|
| `Available` (ro) | whether **this machine** could play a clip | [whether it can play](#whether-it-can-play) |
| `Buffering` (ro) | how full the buffer is, `0`…`100` | [streams](#streams) |
| `Duration` (ro) | seconds long, `-1` while unknown — which is always, on a live stream | [where it is](#where-it-is) |
| `Fit` | `Fill` `Contain` `Cover` `ScaleDown`, as a [`Picture`](Picture.md)'s | [what it looks like](#what-it-looks-like) |
| `Latency` | ms the RTSP jitterbuffer may hold | [streams](#streams) |
| `Loop` | reseek instead of ending | [playing](#playing) |
| `Muted` | silence without touching `Volume`, so unmuting comes back to where it was | [sound](#sound) |
| `Password` | the secret beside it | [streams](#streams) |
| `Playing` (ro) | whether it is going — what `Play` asked for, until `Pause`, `Stop`, the end or an error | [playing](#playing) |
| `Position` (ro) | seconds in, `0` when unknown — which includes playing live | [where it is](#where-it-is) |
| `Seekable` (ro) | whether `Seek` has anything to work on | [where it is](#where-it-is) |
| `SourceHeight` (ro) | the clip's own height | [what it looks like](#what-it-looks-like) |
| `SourceWidth` (ro) | the clip's own width, `0` until a frame has been decoded — `Picture`'s spelling | [what it looks like](#what-it-looks-like) |
| `Uri` | what to play: a URI (`file://`, `http(s)://`, `rtsp://`) **or a plain local path**, which is turned into one | [playing](#playing) |
| `User` | RTSP digest identity, applied to the source the playbin builds | [streams](#streams) |
| `Volume` | `0`…`1` | [sound](#sound) |

**Methods and events**

| | | |
|---|---|---|
| `Attach(sink)` | shows the frames of a pipeline the program built, instead of its own `Uri` | [a camera](#a-camera) |
| `Pause()` | holds the frame and the position | [playing](#playing) |
| `Play()` | plays, and replays from the top after `Ended` | [playing](#playing) |
| `Save(path)` | the frame on screen as a PNG — [`DrawingArea.Save`](DrawingArea.md)'s spelling | [what it looks like](#what-it-looks-like) |
| `Seek(seconds)` | jumps there | [where it is](#where-it-is) |
| `Stop()` | parks it: back to no state, the position forgotten | [playing](#playing) |
| **event** `Ended()` | the clip ran out | [playing](#playing) |
| **event** `Error(message, kind)` | it failed | [when it fails](#when-it-fails) |

## Playing

| | |
|---|---|
| `Uri` | what to play: a URI (`file://`, `http(s)://`, `rtsp://`) **or a plain local path**, which is turned into one. One property for both, so there is nothing to disagree. Setting it stops whatever was playing |
| `Play()` | plays, and replays from the top after `Ended`. **Refused with no `Uri`** |
| `Pause()` | holds the frame and the position |
| `Stop()` | parks it: back to no state, the position forgotten |
| `Playing` (ro) | whether it is going — what `Play` asked for, until `Pause`, `Stop`, the end or an error. **Not a sample of the pipeline**, which reads as stopped mid-loop and mid-rebuffer |
| `Loop` | reseek instead of ending. A live stream cannot seek, so it ends anyway |
| **event** `Ended()` | the clip ran out. It leaves the **last frame up** (a pause, not a black stop) |

## Where it is

| | |
|---|---|
| `Position` (ro) | seconds in, `0` when unknown — which includes playing live |
| `Duration` (ro) | seconds long, `-1` while unknown — which is always, on a live stream |
| `Seekable` (ro) | whether `Seek` has anything to work on. Answered once the stream is known, not with the first frame |
| `Seek(seconds)` | jumps there. **Refused on a stream that cannot seek**, naming it |

There is no *position changed* event: a slider under a clip is a
[`Timer.Every`](../../llm/library.md#timer) reading `Position`, which is what
[`examples/video`](https://github.com/getbintana/bintana/tree/main/examples/video) does, and it is the shape that does
not fight the pipeline.

## Sound

| | |
|---|---|
| `Volume` | `0`…`1`. Default `1` |
| `Muted` | silence without touching `Volume`, so unmuting comes back to where it was |

## What it looks like

| | |
|---|---|
| `Fit` | `Fill` `Contain` `Cover` `ScaleDown`, as a [`Picture`](Picture.md)'s. Default `"Contain"` |
| `SourceWidth` (ro) | the clip's own width, `0` until a frame has been decoded — `Picture`'s spelling |
| `SourceHeight` (ro) | the clip's own height |
| `Save(path)` | the frame on screen as a PNG — [`DrawingArea.Save`](DrawingArea.md)'s spelling. **Refused before anything has been decoded** |

A caption or a control **over** the picture wants an
[`AspectFrame`](AspectFrame.md) around the video and an
[`Overlay`](Overlay.md) over that: letterboxing happens inside this control, so
without the frame a corner is a corner of the black.

## A camera

| | |
|---|---|
| `Attach(sink)` | shows the frames of a pipeline the program built, instead of its own `Uri`: `sink` is a `gtk4paintablesink` from `Media.Element`. The Video's own playback stops, `SourceWidth`, `SourceHeight` and `Save` answer for the attached frames, and the next `Play` goes back to `Uri`. `Attach(null)` lets go and leaves the control empty. It follows the pipeline and does not drive it: starting, stopping and errors are the pipeline's `State` and `Bus`, and dropping the pipeline leaves its last frame up. It is how a form shows a camera while the same pipeline records it: the device's `Element()` (see `Media.Devices`), a `tee`, and a `queue` before each branch |

On Linux a camera is a URI too (`v4l2:///dev/video0`), and `Uri` plays
it. Everywhere else a camera is a *device*, and a form that records what it
shows needs the graph in its own hands — so the camera is found with
`Media.Devices`, its `Element()` goes into a pipeline the program builds, and
the Video shows that pipeline's `gtk4paintablesink`:

```js
const cam  = Media.Devices("Video/Source")[0];     // Name, Modes, Element()
const pipe = Media.Element("pipeline");
const src  = pipe.Add(cam.Element());
const dec  = pipe.Add(Media.Element("decodebin"));
const conv = pipe.Add(Media.Element("videoconvert"));
const sink = pipe.Add(Media.Element("gtk4paintablesink"));

src.Link(dec);
dec.On("pad-added", (pad) => pad.Link(conv));
conv.Link(sink);
this.Preview.Attach(sink);
pipe.State = "Playing";
```

A camera often offers its larger sizes only as JPEG (`Modes` says which), so
`decodebin` and not a bare `videoconvert`. Recording at the same time is a
`tee` after the decoder with a `queue` before each branch, and `Eos()` before
the pipeline is let go, so the file is closed properly. `Save(path)` on an
(https://github.com/getbintana/bintana/tree/main/examples/camera)
is the whole form: the list, a size chosen from `Modes`, the preview, a
photograph and a recording with sound.

## Streams

| | |
|---|---|
| `Buffering` (ro) | how full the buffer is, `0`…`100`. `100` is nothing to wait for — a local file never says otherwise — and less is a stream refilling, which **holds the picture while `Playing` stays true**. It is [`ProgressBar.Value`](ProgressBar.md)'s range, since that is where a form puts it |
| `Latency` | ms the RTSP jitterbuffer may hold. Default `2000`, the source's own. Read when the source is built, so a change lands on the next `Play` from a stopped player |
| `User` | RTSP digest identity, applied to the source the playbin builds. `""` for none |
| `Password` | the secret beside it. **Write-only**: it reads back `""` and is never serialised, so no `.form` carries it in clear text |

A stream that runs its buffer dry is held until it refills rather than left to
stutter; a live source is left alone, having nothing to catch up on.

## Whether it can play

| | |
|---|---|
| `Available` (ro) | whether **this machine** could play a clip: GStreamer's base plugins **and** the `gtk4paintablesink` element that puts frames in a `GtkPicture`. `Widget.Available("Video")` is the same answer asked of the class, and it is the one a palette asks before offering the control. `false` also on a runtime built without GStreamer |

**Why it is a question and not a constant.** GStreamer being linked in is not
enough: the sink ships in gst-plugins-rs, so a runtime built with GStreamer on a
machine whose registry lacks it can place a `Video` and never play one — a CI
runner with the base plugins is exactly that shape. `Terminal`'s `Available` is
the other kind, a constant of the build.

The answer is cached after the first ask, because the question is a read of
GStreamer's plugin registry — 6 ms with its cache warm and 573 ms without it.
`false` is what a palette stops offering the control on; the class itself is
always here, so a `.form` that already holds one still loads and every property
still answers.

## When it fails

| | |
|---|---|
| **event** `Error(message, kind)` | it failed. `message` names the control and the clip and says why; `kind` is one of `NotFound`, `NotAuthorized`, `Unreachable`, `Decode`, `Error` — a password to ask for and a camera to retry are not the same answer |

**The kind is there so the program can answer differently**: a password to ask
for and a camera to retry in thirty seconds are not the same answer, and matching
on the text of a message is how that breaks in the next language.

## What goes wrong

- **`Play()` did nothing.** No `Uri`, or this build has no GStreamer — the
  refusal names the package.
- **`Seek` was refused.** `Seekable` is false: a live stream has nowhere to go.
- **The picture froze but `Playing` is true.** The buffer ran dry; watch
  `Buffering`.
- **`Duration` is `-1` forever.** It is live.
- **A caption landed on the black.** See [what it looks like](#what-it-looks-like).
- **The password showed up in the `.form`.** It cannot: it is write-only and
  never serialised.

## See also

[`Picture`](Picture.md) · [`AspectFrame`](AspectFrame.md) ·
[`AudioPlayer`](../../llm/library.md#audioplayer) ·
[`examples/video`](https://github.com/getbintana/bintana/tree/main/examples/video)
