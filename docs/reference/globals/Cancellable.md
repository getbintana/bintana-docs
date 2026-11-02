# Cancellable

A cancellation signal a program can share.

```js
const stop = new Cancellable();

const t = new Sizer();
t.Done  = (r) => show(r);
t.Error = (m) => stopped(m);
t.Start({ roots }, stop);

stop.Cancel();      // asks every task and blocking call holding it to end
```

**It is handed over as the last argument** — of `Task.Start`, of a blocking
call — and never as an option: `{ Cancellable }` is refused with a sentence
saying so. A blocking call is cancelled by nothing it was not handed.

It is cooperative, like `Task.Stop()`: `Cancel()` raises the signal and wakes
the calls that take it, but a `Run` that never looks at `this.Stopping` or
`this.Cancellable` is not interrupted by it. `Task.Stop()` is still the way to
insist, with `KillAfter`.

## Every member

| | | |
|---|---|---|
| `Cancel()` | raises the signal; idempotent | [sharing it](#sharing-it) |
| `Cancelled` | whether the signal has been raised; read-only | [sharing it](#sharing-it) |

## Sharing it

`Task.Start(data, [options], cancellable)` links the task to the signal.
Inside `Run`, `this.Cancellable` is **the task's own** signal, which every
way of ending the task raises: the shared token, `Task.Stop()`, its
`Timeout` and `KillAfter`. Hand it to the blocking calls that should end with
the task:

```js
class Sizer extends Task {
    Run(msg) {
        for (const root of msg.roots) {
            if (this.Stopping)
                return { partial: true };
            const names = Directory.Files(root, { Recursive: true }, this.Cancellable);
            // ...
        }
        return { done: true };
    }
}
```

The blocking calls that take one, always last — `Exec.Wait`, `Http.*Wait`,
`File.Load`/`LoadBytes`/`Info`/`Copy`/`Trash` and
`Directory.List`/`Files`/`Folders`/`Copy`/`DeleteTree` — throw `cancelled`
when it is raised, also part-way. **One that was not handed it goes on**,
which is what a `Run` winding down after `Stopping` relies on: it can still
read the file it wrote or run the command that tidies up. On the main thread
the same calls take a token of the program's own.

It goes one way. Raising the shared token stops every task holding it, but
one task's `Stop()`, `Timeout` or `KillAfter` raises only that task's own
signal: the shared token is not raised, and its siblings go on. Raising
`this.Cancellable` inside a task stops that task alone.
[`examples/downloads`](https://github.com/getbintana/bintana/tree/main/examples/downloads)
is the whole of it: a ✕ per download, a timeout, and a Cancel all.
Over HTTP/2 a blocked `Http.*Wait` notices any of these late: see
[cancelling over HTTP/2](Http.md#cancelling-over-http2).

A task started without a shared token still has its own, so `this.Cancellable`
is never `null` inside `Run`.

## What it does not do

- **It does not kill a thread.** `Cancel()` is a request, and the same
  `KillAfter`/teardown rules apply as for `Stop()`.
- **It does not cross a message.** A `Cancellable` is an object, not plain data:
  it goes as `Task.Start`'s last argument, or is made inside the worker. A
  `Task` cannot put one in `msg`.
- **It has no timeout.** A timed operation is still `Timeout` on `Exec.Wait` /
  `Http.*Wait`; `Cancellable` is the shared switch, not a clock.
