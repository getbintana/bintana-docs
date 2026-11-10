# Keyring

The system's secret store: a token, a password or a key kept where the desktop
keeps them, instead of in a file. **One API, one provider per build** — the
provider is the platform's, and `Keyring.Provider` says which one a program is
talking to.

```js
Keyring.Provider
Keyring.Store(Application.Id, "https://zbx.lan/zabbix", token, (ok) => { … })
Keyring.Lookup(Application.Id, "https://zbx.lan/zabbix", (value) => { … })
Keyring.Delete(Application.Id, "https://zbx.lan/zabbix", (ok) => { … })
```

**A secret in a plain file is a secret anyone with the file has**, and a
settings file is copied by backups, synced to a share and attached to a bug
report. On Linux the Secret Service is the desktop's own vault — the one the
browser keeps its passwords in. Windows and macOS have their own store, and a
Linux build without libsecret has a `0600` file as its floor.

**The calls are asynchronous, and they have to be.** A vault may be locked: a
synchronous lookup would freeze every window and every timer until the user
answered a prompt, or until a service that is not there timed out. So each verb
takes a callback and returns at once, and the answer arrives on the loop — the
same bargain [`Http`](Http.md) and [`Clipboard`](Clipboard.md) make.

## Every member

| | | |
|---|---|---|
| `Provider` (ro) | which store this build uses | [provider](#provider) |
| `Store(service, key, value, cb)` | puts `value` in the provider's vault under `service` and `key`, and calls `cb(ok)` when it answers -- `false` when it could not store it | [store](#store) |
| `Lookup(service, key, cb)` | reads what `Store` saved, and calls `cb(value)` -- the text, or `null` when nothing is stored **or** the provider cannot be asked | [lookup](#lookup) |
| `Delete(service, key, cb)` | forgets it, and calls `cb(ok)` | [delete](#delete) |

## Provider

| | |
|---|---|
| `Provider` | which store this build uses: `"SecretService"` on a Linux build with libsecret, `"File"` on a Linux build without it, `"CredentialManager"` on Windows and `"Keychain"` on macOS. A secret is seen only by the provider that stored it, so a caller never mixes two stores in one program |

| platform | `Provider` | where the secret goes |
|---|---|---|
| Linux with libsecret | `"SecretService"` | the freedesktop Secret Service on the session bus |
| Linux without it | `"File"` | `Application.ConfigDirectory/secrets/<service>/<key>`, `0600` under `0700` |
| Windows | `"CredentialManager"` | one generic credential in the user's Credential Manager |
| macOS | `"Keychain"` | one generic password in the login Keychain |

There is **no runtime fallback**: a secret is seen only by the provider that
stored it, so a call never straddles two stores. `File` is the floor of a Linux
build without libsecret and not a choice; Windows and macOS have a vault that is
always there. A Secret Service that is not answering fails the call, and a
caller treats that like an empty vault.

**The caps are the same everywhere**: a `service` or `key` is percent-encoded,
and refused past 255 bytes encoded; a `value` is refused past 2560 bytes, which
is Windows' `CRED_MAX_CREDENTIAL_BLOB_SIZE`. One program stores the same secrets
on every platform.

## Store

| | |
|---|---|
| `Store(service, key, value, cb)` | puts `value` in the provider's vault under `service` and `key`, and calls `cb(ok)` when it answers -- `false` when it could not store it. The names are percent-encoded for the provider's own key; each is refused past 255 bytes encoded, and `value` past 2560 bytes |

`Keyring.Store(service, key, value, cb)` writes the secret and calls
`cb(ok)` when the provider answers. `ok` is `true` when it was stored, and
`false` when it was not — no service on the bus, a locked collection the user
refused to unlock, a provider that could not write. All are one answer, because
a caller that keeps a fallback does the same thing with any of them.

**`service` names the program and `key` the thing within it**, so one
application holds one secret per server:

```js
Keyring.Store(Application.Id, url, token, (ok) => { … });
```

The label a keyring browser shows is made of the two names. It is **data and not
prose**: nothing here goes through a catalogue, so the two are written exactly
as the program spells them.

A `service`, a `key` or a `value` that is not text is refused with a sentence,
and so is a call with no callback: a number would otherwise become a service
called `"5"` and a lookup that finds nothing would look like a vault that is
empty.

## Lookup

| | |
|---|---|
| `Lookup(service, key, cb)` | reads what `Store` saved, and calls `cb(value)` -- the text, or `null` when nothing is stored **or** the provider cannot be asked |

`Keyring.Lookup(service, key, cb)` reads the secret and calls `cb(value)`:
the text, or `null`. **Nothing stored and no provider to ask are one answer** —
see [Provider](#provider) — so a caller that has a fallback does not have to
tell them apart.

## Delete

| | |
|---|---|
| `Delete(service, key, cb)` | forgets it, and calls `cb(ok)`: `false` when there was nothing under those names or the provider could not be asked. Deleting what is not there is not an error |

`Keyring.Delete(service, key, cb)` forgets the secret and calls `cb(ok)`.
Deleting what is not there is **not an error**: `false` says it is not there now,
which is what the caller asked for. It is what a "remember me" checkbox does
when it is unticked.

## What goes wrong

- **A token in `settings.json`.** It was saved there before the vault existed, or
  the program chose the fallback. Use `Keyring` and keep the settings file only
  as the fallback.
- **A lookup that returns `null` on a desktop that has the secret.** The Secret
  Service is not running, or the collection is locked and the user dismissed the
  prompt. `Provider` cannot see either; the fallback is the answer.
- **A callback that never runs in a `main` project.** It cannot happen: the
  console loop counts a vault call as an answer owed and waits for it. A `Task`
  cannot use `Keyring` at all — the callback belongs to the main loop — and the
  call refuses there.
- **A secret written by a test.** The suite does not do it: writing into the
  developer's keyring is a side effect a test has no business causing. The
  `File` provider is the exception the `no-libsecret` job runs, because its
  store is the test's own temporary config directory.
- **`Provider === "File"` on a desktop with a vault.** The build did not find
  libsecret; install its development package and build again. The file is
  unencrypted and only as strong as the user's file permissions.

[examples/backup](https://github.com/getbintana/bintana/tree/main/examples/backup)
and `bintana-project` are the callers: an application that remembers a token
asks `Keyring` first and keeps `Settings` only for the machine that has no
vault.
