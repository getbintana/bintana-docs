# Cancellable

A cancellation signal a program can share.

```js
const stop = new Cancellable();

const t = new Sizer();
t.Done  = (r) => show(r);
t.Error = (m) => stopped(m);
t.Start({ roots }, { Cancellable: stop });

stop.Cancel();      // asks every task and blocking call holding it to end
```

It is cooperative, like `Task.Stop()`: `Cancel()` raises the signal and wakes
the calls that take one, but a `Run` that never looks at `this.Cancellable` or
`this.Stopping` is not interrupted by it. `Task.Stop()` is still the way to
insist, with `KillAfter`.

## Every member

| | | |
|---|---|---|
| `Cancel()` | raises the signal; idempotent | [sharing it](#sharing-it) |
| `Cancelled` | whether the signal has been raised; read-only | [sharing it](#sharing-it) |

## Sharing it

`Task.Start(data, { Cancellable })` links the task to the signal, and inside
`Run` the same signal is `this.Cancellable`:

```js
class Sizer extends Task {
    Run(msg) {
        for (const root of msg.roots) {
            if (this.Cancellable.Cancelled)
                return { partial: true };
            // ...
        }
        return { done: true };
    }
}
```

`Cancel()` from the main thread sets `Stopping` and `Cancelled` inside the
worker; `this.Cancellable.Cancel()` inside a task raises the same signal and is
visible to the main thread's object. The blocking calls that take a cancellation
signal — `Exec.Wait`, `Http.*Wait`, `File.Load`/`LoadBytes`/`Info`/`Copy`/`Trash`
— stop when it is raised, the same way `Task.Stop()` stops them.

A task started without a `Cancellable` gets one of its own, so `this.Cancellable`
is never `null` inside `Run`; `Task.Stop()` raises that one.

## What it does not do

- **It does not kill a thread.** `Cancel()` is a request, and the same
  `KillAfter`/teardown rules apply as for `Stop()`.
- **It does not cross a message.** A `Cancellable` is an object, not plain data:
  it goes in `Task.Start`'s options, or is made inside the worker. A `Task`
  cannot put one in `msg`.
- **It has no timeout.** A timed operation is still `Timeout` on `Exec.Wait` /
  `Http.*Wait`; `Cancellable` is the shared switch, not a clock.
