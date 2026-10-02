# Random

Numbers a program cannot predict, from the operating system.

```js
Random.Bytes(32)            // Bytes: a key, a nonce, a token's worth
Random.Bytes(16).ToHex()    // a 32-character hex token
Random.Int(1, 6)            // 1 to 6, both ends included
Random.Uuid()               // "3f1c0a9e-5b7d-4c2e-9a1f-0d8e6b4a2c10"
```

**`Math.random` is not a source for a token, a session id or a nonce.** It is a
generator seeded once, whose next output follows from the last; it is right for a
chart of invented data and wrong for anything somebody might want to guess. A
second `random` inside `Math` would have made "the secure one" a thing only a
footnote told apart from the other, so this has a name of its own.

## Every member

| | | |
|---|---|---|
| `Bytes(count)` | `count` bytes from the operating system's source, 0 to 1,048,576 | [bytes](#bytes) |
| `Int(min, max)` | a whole number from `min` to `max`, **both ends included**, every value exactly as likely | [int](#int) |
| `Uuid()` | a version 4 UUID in its lower-case 8-4-4-4-12 spelling, from the same source as `Bytes` | [uuid](#uuid) |

## Bytes

| | |
|---|---|
| `Bytes(count)` | `count` bytes from the operating system's source, 0 to 1,048,576. **The one to make a token, a key or a nonce from** -- `Math.random` is not. Throws, and never falls back to something weaker, if the system has no randomness to give |

`Random.Bytes(count)` answers a [`Bytes`](Bytes.md) of exactly `count` bytes, 0 to
1,048,576. `0` is an empty `Bytes`; a negative, a number past the limit and a value
that is not a number are refused. A megabyte is more than any key or token needs
and stops `Random.Bytes(1e9)` from freezing the program for an answer nobody could
use.

`Random.Bytes(16).ToHex()` is a token, and `.ToBase64()` a shorter one.

**It throws if the system has no randomness to give, and never uses something
weaker.** There is no fallback to a generator seeded from the clock: a silent
fallback in the one function whose job is to be unguessable is the bug, not a
robustness feature.

## Int

| | |
|---|---|
| `Int(min, max)` | a whole number from `min` to `max`, **both ends included**, every value exactly as likely. Throws for ends that are not whole numbers, for `min` above `max`, and for a range wider than 2^53 |

`Random.Int(min, max)` is a whole number from `min` to `max` — **both ends
included**, so `Random.Int(1, 6)` is a die.

**Every value is exactly as likely.** `r % span` is the usual way to write this
and is biased whenever the span does not divide the range the generator draws
from; a draw in the part that would make low values likelier is thrown away and
drawn again.

It is held to what a JavaScript number holds exactly: ends that are not whole
numbers, ends beyond 2^53, a `min` above `max` and a range wider than 2^53 values
are refused with a sentence, and not rounded.

## Uuid

| | |
|---|---|
| `Uuid()` | a version 4 UUID in its lower-case 8-4-4-4-12 spelling, from the same source as `Bytes`. Random, so it does not sort by creation: as a database key it scatters an index |

`Random.Uuid()` is a version 4 UUID in its lower-case 8-4-4-4-12 spelling, built
from the same source as `Bytes`.

**It does not sort by creation.** Every character is random, so as the key of a
database table each new row lands somewhere in the index and not at the end. If
the order rows were made in matters, keep a number beside it.

## What goes wrong

- **A token that someone guessed.** It was made with `Math.random`, or with the
  clock. Make it with `Random.Bytes`.
- **`Random.Int(0, 6)` gave a seven-sided die.** Both ends are included; a die is
  `Random.Int(1, 6)`, and picking from a list of `n` is `list[Random.Int(0, n - 1)]`.
- **A test that depends on it fails one run in a thousand.** There is no seed to
  fix, deliberately. Assert what must always hold — the length, the range, the
  shape of a UUID — and not a distribution.

A worker has all three: nothing here calls back or keeps a list.
