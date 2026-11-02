# Task

A class that runs in a thread of its own: the third shape of long work, after
`Timer` slices in-process and a child through [`Exec`](Exec.md).

```js
class Sizer extends Task {
    Run(msg) {
        let size = 0, files = 0;
        // ... walk msg.roots with Directory/File ...
        return { size, files };
    }
}

const t = new Sizer();
t.Progress = (p) => status(p);
t.Done     = (r) => show(r);
t.Error    = (m, stack) => complain(m);
t.Start({ roots: subs });
```

One shot: a `Task` runs once and answers exactly once — `Done` xor `Error` —
and work that repeats is a new `Task`.

## Every member

| | | |
|---|---|---|
| `Start(data, [options])` | serialises the message, loads the class's file in a fresh runtime on a fresh thread, builds the class, and calls `Run(msg)` | [starting](#starting) |
| `Stop([options])` | **asks** it to end, and enforces `KillAfter` ms later (5000 by default, 0 = at once) | [ending](#ending) |
| `Report(value)` | the worker's voice, called from `Run`; arrives as `Progress` | [reporting](#reporting) |
| `Stopping` | inside `Run` | [ending](#ending) |
| `Done` | assign `(result) => …` | [answering](#answering) |
| `Error` | assign `(message, stack) => …` | [answering](#answering) |
| `Progress` | assign `(partial) => …` | [reporting](#reporting) |
| `Running` | `false` once it has ended | [answering](#answering) |
| `Cancelled` | whether `Stop()` is what ended it | [ending](#ending) |
| `TimedOut` | whether the guard is what ended it | [ending](#ending) |
| `Task.Max([limit])` (static) | the most tasks alive at once, `0` (the default) for no limit | [starting](#starting) |

`Task` itself is abstract — `new Task()` throws, and `Start` throws for a
class the project has no file for, for a class with no `Run(msg)`, and for a
second `Start` on the same task.

## Starting

| | |
|---|---|
| `Start(data, [options])` | serialises the message, loads the class's file in a fresh runtime on a fresh thread, builds the class, and calls `Run(msg)`. **Once** — a second `Start` is refused; work that repeats is a new `Task` |
The file is found the way a form is: `<ClassName>.js` anywhere in the project
or its libraries, the project shadowing a library. Two files claiming one
name is refused naming the name; the class must be self-contained in its file.

`Timeout` is milliseconds before the run is aborted, absent waits forever.
`Cancellable` is a shared [`Cancellable`](Cancellable.md): the task is linked
to that signal, and inside `Run` the same one is `this.Cancellable`. A task
started without one gets its own, so `this.Cancellable` is never null.
`Task.Max([limit])` is a ceiling on live tasks, refused rather than queued;
set it before fanning out, and `0` restores no limit. Whatever `data` holds
must be plain — see below.

## Answering

Exactly once, however the job went:

- `Run` returned → `Done(result)`. **A `Run` with no `return` answers
  `Done(null)`** — a task whose work is its effect has nothing to report, and
  that is not a message with an `undefined` in it.
- `Run` threw → `Error(message, stack)`, the two halves
  `Application.OnError` takes. An `Error` carries its message and stack; a
  thrown string is the message, a thrown object is its JSON when it has one,
  and anything else is `String(value)` with an empty stack.
- `Stop()` was called → `Error("Task: cancelled")` and `Cancelled` reads
  `true`.
- the `Timeout` fired → `Error("Task: timed out after N ms")` and
  `TimedOut` reads `true`.

**Which ending it was, read as a flag and not out of the sentence.**
`Cancelled` and `TimedOut` are there so nothing has to match on the message —
a program that has to do `String(m).includes("cancelled")` is one the API did
not answer.

`Running` is written `false` before either callback runs, because the ordinary
place to read it is after the job is gone — the same reason `Exec` writes its
`ExitCode` first. An exception thrown *inside* `Done`/`Error`/`Progress` is
reported where it was raised and the run goes on, the way `Exec` treats a
throwing line callback.

A stopped or stale answer still arrives, so the application tells live answers
from dead ones where they land — a generation counter, as in
[`examples/usage`](https://github.com/getbintana/bintana/tree/main/examples/usage). A handler may be assigned any
time before the job ends.

## Reporting

| | |
|---|---|
| `Report(value)` | called as `this.Report(partial)` inside `Run`; arrives as `Progress(partial)` — zero or more calls, in order, every one before `Done` | For a progress bar, a live
count, a batch of paths already walked. Report in batches (every N roots, not
every file); one message per row of a hundred thousand is a hundred thousand
wakeups of the main thread.

A report with no `Progress` handler is dropped in silence — an event nobody
handles never happened, which is also what the main side does with a `Click`
nobody wrote. `Report` on the proxy (outside `Run`) is refused.

## Ending

| | |
|---|---|
| `Stop([{ KillAfter }])` | **asks** it to end, and enforces `KillAfter` ms later (5000 by default, 0 = at once). Two stages like `Exec`'s guard. Answers whether there was a live job to ask |
| `Stopping` | inside `Run`: `true` once `Stop()` has asked, so the job can `Report` what it has and return. Delphi's `Terminated`, BackgroundWorker's `CancellationPending` |

**Asked first, and only then enforced.** `Stop()` raises a flag and lets the
run keep going, so a `Run` that watches `this.Stopping` can hand back what it
has:

```js
Run(msg) {
    const found = [];
    for (const root of msg.roots) {
        found.push(this.measure(root));
        if (this.Stopping) {
            this.Report(found);      // arrives as Progress, before the ending
            return { partial: true };
        }
    }
    return { found };
}
```

Without that flag the engine's interrupt ends the run at the next opcode and
everything it had measured is lost. Every environment with threads has the
same one and makes it the central idiom — Delphi's `while not Terminated`,
`BackgroundWorker`'s `CancellationPending`, Qt's `isCanceled()` — because a
thread cannot be signalled the way a child can.

`KillAfter` milliseconds later (**5000** by default, `0` for at once), a run
that never looked is ended where it stands. Two stages and the same two names
as [`Exec`](Exec.md)'s guard, because it is the same bargain: ask, then
insist. `Timeout` is the same enforcement on a clock rather than on request,
and it answers `TimedOut` instead of `Cancelled`.

A run that saw the flag and returned politely is **still a cancelled run** —
the caller asked and it stopped, so the ending is `Error` with `Cancelled`
set. What changes is how much of the work survives.

The flag alone does not reach native code. Each job also carries a
cancellation signal, and `Stop`, `Timeout` and `KillAfter` raise it:
`Exec.Wait`, `Http.*Wait`, `File.Load`/`LoadBytes`/`Info`/`Copy`/`Trash` stop
where they are and the run ends as cancelled. The directory walk, `File.Hash`
and the compressors do not take one yet; those still wait for the flag or for
`KillAfter` to end them between opcodes.

Teardown waits **two seconds** for each live task and then closes anyway,
saying so on stderr: the program exits, and the thread is left adrift rather
than joined, because freeing memory a live thread still writes to is worse
than leaking it on the last line.

## Messages

A message — the argument, each report, the answer — is a tree of **plain
data**: objects, arrays, strings, numbers, booleans, null. Plus `Decimal`,
which crosses as its own digits (`{$decimal: "19.99"}`) and arrives as a real
`Decimal` on the far side, because both sides have the same class out of the
same file. `(10/3)*3` is `10` in a worker exactly as it is outside one, and
`Round`, `Trim`, `Abs` and `Split` are all there.

`Bytes` cross too, as base64 under their own tag, and arrive as a real `Bytes`
with the same class on both sides. Refused out loud, because `JSON.stringify`
would silently drop or null them: functions, class instances, cycles,
`undefined` and non-finite numbers. A `Record` crosses as what `Serialize`
writes and comes back through `Load`. Integers past 2⁵³ lose precision in
transit — cross those as text or as `Decimal`.

The one `undefined` that is not a message is a `Run` that returns nothing: the
answer is `null` (see [Answering](#answering)), not a value with a hole in it.

## What a worker sees

**This language, not a subset of it.** The worker builds its context the way
the main thread does — the same `init` functions, then the same `rad.js` — so
the classes are the same classes: `Decimal` and `Bytes` out of their own
files, and `Dictionary`, `Regex`, `Stopwatch`, `Record`, `Field`, `Table` and
`Namespace` out of the prelude. Plus `print`, `Logger`, `Day`/`Time`, `Hash`,
`File` and `Directory` for reading, `Database`/`Sqlite`, and an `Application`
that answers facts (`Name`, `Version`, `Directory`, `ConfigDirectory`,
`Executable`, `Arguments`).

**What is missing is what would leave a callback hanging off the main loop**,
and that is the whole rule — not reading against writing:

| Not there | Because |
|---|---|
| every widget, `Dialog`, `Message`, `Clipboard`, `Screen`, menus, printing | GTK off the main thread is a crash, not an error |
| `File.Watch`, `Timer`, the callback spelling of `Exec` and `Http` | the source would fire on the main thread holding this context |

**Process state is readable and not writable.** `Environment` is there without
`Set` and with `CurrentDirectory` as the value at `Start`; `Settings.Get`,
`Has` and `Keys` are there, and `Settings.Set`/`Delete`/`Clear` refuse with a
sentence. The
blocking `Exec.Wait` and `Http.*Wait` are there too: they run on the worker's
own thread, with a session or a child of its own, and answer once.

**`Locale` is there whole, with a catalogue of its own.** It is built from the
project's and its libraries' `po/` files and pinned to the language the
application had when `Start` was called; a language change on the main thread
does not move the words under a running task. `Locale.Current` inside a task
reloads only that task's catalogue. `Locale.Read`/`Write` are there too — they
are the catalogue editor's pair and touch no catalogue at all.

**A library crosses only when the file a worker imports is pure.** `xlsx` and
`qr`'s encoder are modules with no widget in them, so a task imports them. A
library of several modules declares the subset a task may evaluate in its
`project.json`'s `worker` list. `markdown` declares an **empty** one: its only
module is the control (`Markdown extends Component`), and it parses while it
lays out, so importing it in a task refuses with that sentence. `report` and
`charts` have no module to import at all, and their documents would need
`Drawing`/`Text` besides.

A task computes and reports; what is drawn happens where the answer arrives.

### Writing, and what concurrency actually costs

A worker writes: `File.Save`, `File.Delete`, `File.Rename`, `Directory.Make`
and the rest are all there. They were refused once *"until there is a lock"*,
which named a real gap and aimed it at the wrong danger — `File.Save` is
`g_file_set_contents`, which writes a temporary and renames over the target,
so two threads saving one path produce one of the two whole files and never a
torn one. `File.Delete` and `File.Rename` are a syscall each.

What concurrency costs is the **lost update**:

```js
const book = File.LoadJson(path);      // two tasks read the same thing
File.SaveJson(path, add(book, row));   // the second wins; the first row never happened
```

No automatic lock reaches that, because the gap is *between* two calls and
only the program knows which two. `Lock.Hold(name, fn)` is what orders them —
a tool to reach for when a sequence needs it, not a condition of writing at
all.

`File.Copy`, `Directory.Copy` and `Directory.DeleteTree` leave a state a
reader can see half of, which is true of the `Exec(["cp", …])` beside them too
and is not a reason to refuse either.

