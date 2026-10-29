# Test

What `bintana test` runs: a project's own tests.

**The folder is fixed and so is the shape**: `tests/<Name>Test.js`, one class
per file named like it, extending `Test`; every method whose name starts with
`test` is one test.

```js
// tests/InvoiceTest.js
class InvoiceTest extends Test {
    Setup()      { this.inv = new Invoice([10, 5]); }
    testTotal()  { this.Eq(this.inv.Total, 15); }
    testRefuse() { this.Check(this.Throws(() => new Invoice([-1])) instanceof RangeError); }
    testLater()  { this.inv.Fetch(); this.Until(() => this.inv.Ready, () => this.Eq(this.inv.Lines, 2)); }
}
```

```sh
bintana test myproject              # every test
bintana test myproject Invoice      # the ones whose Class.method contains it
bintana test --json myproject       # one JSON line per test, which the IDE reads
```

## Every member

| | | |
|---|---|---|
| `Check(cond, [what])` | fails the test unless `cond` is true | [asserting](#asserting) |
| `Eq(got, want, [what])` | fails the test unless `got` equals `want` -- the same value, or for arrays and plain objects the same JSON, or for a `Decimal` or a `Day` the same text | [asserting](#asserting) |
| `Fail(message)` | fails the test now, with that message | [asserting](#asserting) |
| `Setup()` | runs before each test method, on the instance it runs on; override it | [the run](#the-run) |
| `Teardown()` | runs after each test method, passed or not; override it | [the run](#the-run) |
| `Throws(fn, [what])` | fails the test unless `fn` throws, and answers what it threw -- so the message can be checked too | [asserting](#asserting) |
| `Until(cond, then, [options])` | waits: asks `cond` every 10 ms and runs `then` once it holds | [waiting](#waiting) |

## The run

`bintana test <project> [filter]` loads the project's sources and libraries as a
run does, then every `tests/*Test.js` in name order, and calls each `test…`
method — in the order written, a base class's after the class's own — on **a new
instance**, with `Setup()` before and `Teardown()` after. The startup form is
not opened and `main` is not called.

It ends **`0` when every test passed and `1` when one did not**, which is what
CI reads. A project with a startup form needs a display, as its run does; one
that declares `main` needs none.

**A test fails alone.** An assertion throws, and so may the code under test;
either way that test is marked and the next one runs. An error nobody caught in
a callback while a test runs — a `Timer`, an `Http` answer — is that test's.

**A normal run never loads `tests/`**, with a `sources` list or without one.

## Asserting

`Eq`, `Check`, `Throws` and `Fail` throw on failure, which ends the test there.
The message says what was wanted and what was got, and the failure is reported
at the line of the test file it was raised on.

## Waiting

`Until(cond, then, { Ms, What })` is the only way a test waits, and it is
counted: a test with a wait still pending is not over. One that never holds is
a failure naming `What`, at the line `Until` was called on — never a test that
silently did not finish.

## The JSON

With `--json`, one line per test and one at the end:

```json
{"Event":"Test","Class":"InvoiceTest","Name":"testTotal","Ok":true,"File":"tests/InvoiceTest.js","Line":0,"Ms":1,"Message":""}
{"Event":"Done","Passed":3,"Failed":1}
```

Anything else the run prints — the program's own `print`, a traceback — is an
ordinary line beside them. A file whose class is missing is a `Test` line with
`Ok: false` and the reason, so it is a red line and not a smaller total.

## What goes wrong

- **"the file declares no class InvoiceTest".** The class is named differently
  from its file.
- **A test never finished.** It does: a wait that never holds fails after its
  `Ms`. A test that waited with a bare `Timer` instead of `Until` was over
  before its callback ran.
- **The program's window opened.** A test called `Show()`; building forms and
  controls without showing them opens nothing.

## See also

[`Application`](Application.md) · [`Timer`](Timer.md)
