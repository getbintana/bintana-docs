# Check — what the project says before it runs

The library behind the IDE's *Project → Check* and the `bintana check` command.
It reads a project's `.form` and `.js` files, asks the runtime about the classes
they name, and opens no window; a CI job, a git hook or an editor can run it
where no display exists.

```sh
bintana check myapp                 # errors fail, warnings do not
bintana check --strict myapp        # warnings fail too
bintana check --json myapp          # one JSON line per finding, then Done
```

The exit status is `1` for an error, or for a warning under `--strict`, and `0`
otherwise; `2` is the command being used wrongly. `--json` writes one object per
finding — `{ Event: "Finding", Kind, File, Line, Text }` — and a final
`{ Event: "Done", Errors, Warnings, Infos, Strict }`.

It needs no display, but it does need the runtime's GTK libraries, because the
binary is linked against them. The installed runtime carries the console project
and the library beside itself under `share/bintana/`; the source tree finds
`tools/check` one hop from `build/`.

## What it finds

- two controls of one name, a `.form` losing the first one silently;
- a control named `Actions` or `Close` -- a read-only member or a method of
  `Form` -- which makes the form refuse to load;
- a property the class does not have, which the loader applies and ignores;
- a `.js` that does not compile, whether or not a `.form` sits beside it;
- a `.js` on disk that `sources` does not list, so it is never loaded;
- a key in `project.json` that nothing reads;
- `this.Control.Member` where the class has no such member, and a
  `Control_Event` handler for an event the control does not raise;
- a name two modules export and a file uses without importing it;
- a member of a component or a form that hides a control's with another shape
  (`Expand(key)` over the layout property `Expand`, `get Remove` over the
  method `Remove()`): rename it for what it does;
- a control a screen reader cannot name, at the severity `project.json`'s
  `"accessibility"` chooses: `"warning"` (default), `"info"` or `"off"`. The
  same word governs the IDE's panel and the command.

A project that already has warnings stays green unless the caller asks for
`--strict`; that is what lets an existing application adopt the command without
a flag day.

## The library

A tool can use the same code by naming the library:

```json
{ "name": "lint", "main": "Main", "uses": ["check"] }
```

The classes are the implementation, not a second answer kept in step with the
IDE:

| Class | |
|---|---|
| `Check` | the pass over the project. `new Check(host).run()` answers every finding and reports them through the host; `forget()` takes them back; `applyFix(finding)` applies the one repair a finding carries (a caption's `Label.For`), which is what `bintana check --fix` and the IDE's *Fix* both call |
| `Names` | the member and handler checks, and the taken-away-name table. It asks the host for a component's events (`componentEvents(type)`) and for the owners of an exported name (`owners()`) |
| `Accessibility` | the three rules over a `.form`'s JSON, with `level(json)` and `kind(level)` |
| `ProjectFile` | `project.json` as a record: the keys it may hold, validation, and `Kind` |
| `LaunchConfig` | one named launch configuration, as `project.json` stores it |
| `ProjectFiles` | the project's files and the `.form` beside a `.js`, for a console host |
| `Owners` | which files export a top-level name, over `[{ path, text }]` |
| `Lex` | the scanner that tells code from comments and strings, keeping offsets and line numbers |

`Check` asks its host for `{ project, classes: { files, formOf }, names,
problems: { report, clear } }`. The IDE passes itself; `tools/check` passes a
`ProjectFiles` walk, an `Owners` map and a no-op problems sink. Nothing else is
needed, which is why the command is independent of the IDE.

## The manifest as a record

`ProjectFile` is the shape `project.json` has, and `LaunchConfig` the shape of
one entry in its `launch` list.

### ProjectFile

| Member | |
|---|---|
| `Validate()` | the rule no single field can state: a project declares `startup` or `main`, and neither is one that opens nothing. The answer goes to the console when the project loads, so it can still be opened and fixed |
| `Lists` | whether `sources` is the list that decides load order. A project without one is loaded by directory, so an empty list and no list mean the same thing |

### LaunchConfig

| Member | |
|---|---|
| `Validate()` | the rule no field can state: each `Name=value` in `Variables` has to be one, and a working directory that is not there is a launch that cannot start |
| `Variables` | the environment the run gets, as an object; a later assignment wins, the way a shell's own `A=1 A=2` does |
