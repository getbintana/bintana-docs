# Keyring

The system's secret store, through the freedesktop Secret Service: a token, a
password or a key kept where the desktop keeps them, instead of in a file.

```js
Keyring.Available
Keyring.Store(Application.Id, "https://zbx.lan/zabbix", token, (ok) => { … })
Keyring.Lookup(Application.Id, "https://zbx.lan/zabbix", (value) => { … })
Keyring.Delete(Application.Id, "https://zbx.lan/zabbix", (ok) => { … })
```

**A secret in a plain file is a secret anyone with the file has**, and a
settings file is copied by backups, synced to a share and attached to a bug
report. This is the desktop's own vault instead — the same one the browser
keeps its passwords in — and it is the place a token belongs.

**The calls are asynchronous, and they have to be.** The vault is a service on
the session bus, and it may be locked: a synchronous lookup would freeze every
window and every timer until the user answered a prompt, or until a bus that is
not there timed out. So each verb takes a callback and returns at once, and the
answer arrives on the loop — the same bargain [`Http`](Http.md) and
[`Clipboard`](Clipboard.md) make.

## Every member

| | | |
|---|---|---|
| `Available` | whether this build has libsecret | [available](#available) |
| `Store(service, key, value, cb)` | puts `value` in the system's keyring under `service` and `key`, and calls `cb(ok)` when the vault answers -- `false` when it could not store it, which is what a machine with no secret service says | [store](#store) |
| `Lookup(service, key, cb)` | reads what `Store` saved, and calls `cb(value)` -- the text, or `null` when nothing is stored **or** the vault cannot be asked | [lookup](#lookup) |
| `Delete(service, key, cb)` | forgets it, and calls `cb(ok)` | [delete](#delete) |

## Available

| | |
|---|---|
| `Available` | whether this build has libsecret. It says nothing about whether the machine is running a secret service -- a headless session has none -- so a caller treats a failed `Lookup` like an empty vault |

`Keyring` is **optional at build time**, the same bargain
[`Xml`](Xml.md) and [`Database`](Database.md) make: without libsecret the
global is there, `Available` is `false`, and every verb refuses with a sentence
naming the package. That is a better answer than a name that is not there,
because the reason is in the message instead of three lines away.

`Available` answers about the **build**, and it cannot answer about the machine:
a runtime linked against libsecret on a headless server has `Available === true`
and no service to talk to. A failed `Lookup` and an empty vault are therefore
one answer, `null`, and a caller that keeps its own fallback (an environment
variable, a settings file) does not have to tell them apart.

## Store

| | |
|---|---|
| `Store(service, key, value, cb)` | puts `value` in the system's keyring under `service` and `key`, and calls `cb(ok)` when the vault answers -- `false` when it could not store it, which is what a machine with no secret service says. The label a keyring browser shows is made of the two names |

`Keyring.Store(service, key, value, cb)` writes the secret and calls
`cb(ok)` when the vault answers. `ok` is `true` when it was stored, and `false`
when it was not — no service on the bus, a locked collection the user refused
to unlock, a keyring that is full. All three are one answer, because a caller
that keeps a fallback does the same thing with any of them.

**`service` names the program and `key` the thing within it**, so one
application holds one secret per server:

```js
Keyring.Store(Application.Id, url, token, (ok) => { … });
```

The label a keyring browser shows is made of the two names. It is **data and not
prose**: nothing here goes through a catalogue, so the two are written exactly
as the program spells them.

A `service`, a `key` or a `value` that is not text is refused with a sentence,
and so is a call with no callback: `JS_ToCString` converts anything, so a number
would become a service called `"5"` and a lookup that finds nothing would look
like a vault that is empty.

## Lookup

| | |
|---|---|
| `Lookup(service, key, cb)` | reads what `Store` saved, and calls `cb(value)` -- the text, or `null` when nothing is stored **or** the vault cannot be asked |

`Keyring.Lookup(service, key, cb)` reads the secret and calls `cb(value)`:
the text, or `null`. **Nothing stored and no vault to ask are one answer** — see
[Available](#available) — so a caller that has a fallback does not have to tell
them apart.

## Delete

| | |
|---|---|
| `Delete(service, key, cb)` | forgets it, and calls `cb(ok)`: `false` when there was nothing under those names or the vault could not be asked. Deleting what is not there is not an error |

`Keyring.Delete(service, key, cb)` forgets the secret and calls `cb(ok)`.
Deleting what is not there is **not an error**: `false` says it is not there now,
which is what the caller asked for. It is what a "remember me" checkbox does
when it is unticked.

## What goes wrong

- **A token in `settings.json`.** It was saved there before the vault, or the
  machine has no secret service. Use `Keyring` where it is available, and keep
  the fallback only as the fallback.
- **A lookup that returns `null` on a desktop that has the secret.** The service
  is not running, or the collection is locked and the user dismissed the prompt.
  `Available` cannot see either; the fallback is the answer.
- **A callback that never runs in a `main` project.** It cannot happen: the
  console loop counts a vault call as an answer owed and waits for it. A `Task`
  cannot use `Keyring` at all — the callback belongs to the main loop — and the
  call refuses there.
- **A secret written by a test.** The suite does not do it: writing into the
  developer's keyring is a side effect a test has no business causing. What is
  driven by hand is the real vault.

[`examples/backup`](https://github.com/getbintana/bintana/tree/main/examples/backup)
and `bintana-project` are the callers: an application that remembers a token
asks `Keyring` first and keeps `Settings` only for the machine that has no
vault.
