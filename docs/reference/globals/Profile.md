# Profile

What a Sysprof capture carries, and how an application marks its own work on it.

A sampled profile of this runtime is a stack of `JS_CallInternal`: QuickJS
interprets, so no native stack names the `.js` function that was running. The
marks are the other half — the runtime raises them where the time goes (opening
the program, loading a script, building a form, drawing a frame, running a
[`Task`](Task.md), an event's handler), and `Begin`/`End`/`Mark`/`Counter` are
how an application adds its own.

**Installed in every run, and inert unless a profiler is listening.** With no
`--profile` and not under Sysprof, `Active` is `false` and the verbs do
nothing at all — not even `End`'s mismatch refusal — so a program instrumented
for a capture runs unchanged without one. The two ways in, and what the capture
looks like, are under
[Profiling](https://github.com/getbintana/bintana/blob/main/docs/installing.md#profiling).

```js
Profile.Begin("Load");
const clients = Database.Sqlite(path).Table(Client).All();
Profile.Counter("Clients", clients.length);
Profile.End("Load");

Profile.Mark("Ready");
```

## Every member

| | | |
|---|---|---|
| `Active` | whether the marks are going anywhere: true while this run is under Sysprof or was started with `--profile` | [the marks](#the-marks) |
| `Begin(name)` | opens a span on the timeline | [the marks](#the-marks) |
| `Counter(name, value)` | one number on a track of its own — rows loaded, items in a cache, a queue's depth — defined the first time the name is seen and updated after, so a capture shows it as a graph beside the marks | [the marks](#the-marks) |
| `End(name)` | closes the innermost `Begin`, which has to be the same name | [the marks](#the-marks) |
| `Mark(name)` | one instant on the timeline with no duration — a point in the program rather than a stretch | [the marks](#the-marks) |

## The marks

| | |
|---|---|
| `Active` | whether the marks are going anywhere: true while this run is under Sysprof or was started with `--profile`. False in an ordinary run, where `Begin`/`End`/`Mark` do nothing at all |
| `Begin(name)` | opens a span on the timeline. `End(name)` closes it and the pair becomes one mark of the whole stretch — what an application uses around its own work (loading, computing, laying out), since a sampled profile cannot say which of its functions was running. Inert when `Active` is false |
| `Counter(name, value)` | one number on a track of its own — rows loaded, items in a cache, a queue's depth — defined the first time the name is seen and updated after, so a capture shows it as a graph beside the marks. The capture keeps 31 characters of the name; the value is a number, and one that is not finite is refused even with nobody listening, because a typo should not wait for a capture. Inert when `Active` is false |
| `End(name)` | closes the innermost `Begin`, which has to be the same name. A `name` that does not match is refused naming both, since a span closed in the wrong order would put one name's time on another's. Inert when `Active` is false |
| `Mark(name)` | one instant on the timeline with no duration — a point in the program rather than a stretch. Inert when `Active` is false |

**A span is per thread and nests LIFO.** A [`Task`](Task.md) worker runs its own
runtime on its own thread and can nest its own spans; the language has no
`async`, so a thread's spans nest strictly and no `End` can cross a `Begin` that
has not closed.

**What the runtime marks by itself** needs no call: `Startup` (to the window
being up, or to a console `main` returning), a `Script` span per loaded file, a
`Form` span per form built, `Draw`/`DrawPage` per frame, a `Task` span per
worker body, and an `Event` span per event whose handler ran, named
`<Control>_<Event>`. The application's own marks share the same capture, so a
`Begin("Load")` sits beside the `Script` span that loaded the file that did the
loading.

## See also

[`Stopwatch`](Stopwatch.md) measures in the program and answers a number, which
is a different question: this leaves a record for a profiler to read, and costs
nothing when nobody is.
