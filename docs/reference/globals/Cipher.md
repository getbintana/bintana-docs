# Cipher

A key, some bytes, and the one operation [`Hash`](Hash.md) cannot do: encrypt
them so that only the key opens them again.

AES-256-GCM through GnuTLS, which is already the TLS library under
[`Http`](Http.md) on a Linux desktop. It is the reversible half of the three:
`Hash` proves a message was not changed, `Hash.Hmac` signs it, and this hides it
and hands it back.

```js
const key    = Random.Bytes(32);              // keep it in the Keyring
const sealed = Cipher.Encrypt(File.LoadBytes("clients.db"), key);
File.SaveBytes("clients.db.enc", sealed);

const opened = Cipher.Decrypt(sealed, key);   // Bytes, or a throw
opened.Equals(File.LoadBytes("clients.db"));  // true
```

## Every member

| | | |
|---|---|---|
| `Available` | whether this build has a cipher at all: false without GnuTLS, and then both verbs refuse naming the package | [the build](#the-build) |
| `Encrypt(data, key)` | AES-256-GCM | [encrypting](#encrypting) |
| `Decrypt(sealed, key)` | the plaintext, or a **throw** when the key is wrong or the value was changed -- GCM authenticates, so there is no half-right answer | [decrypting](#decrypting) |

## The build

| | |
|---|---|
| `Available` | whether this build has a cipher at all: false without GnuTLS, and then both verbs refuse naming the package |

GnuTLS is optional at build time. The runtime still builds without it, and a
program that never encrypts needs none of it.

## Encrypting

| | |
|---|---|
| `Encrypt(data, key)` | AES-256-GCM. `data` is text (its UTF-8) or `Bytes`; `key` is text or `Bytes`, hashed with SHA-256 to the 32 bytes the cipher takes. The answer is a marker, a fresh 12-byte nonce and the ciphertext with its tag -- two seals of the same data differ, and a changed byte or a wrong key is refused by `Decrypt` |

**A new nonce for every call**, so two seals of the same data are different
values and nobody can tell from the outside that the plaintexts match. The
nonce is not secret and travels in the value; reusing one would be the mistake,
and the runtime never does.

**The sealed value is `Bytes`**: `"BTA1"`, the 12-byte nonce, then the
ciphertext with its 16-byte authentication tag. The marker is what `Decrypt`
refuses by name when handed something this cipher never sealed.

## Decrypting

| | |
|---|---|
| `Decrypt(sealed, key)` | the plaintext, or a **throw** when the key is wrong or the value was changed -- GCM authenticates, so there is no half-right answer |

**There is no key in the value and no way to recover one.** Losing the key
loses the data, which is what encryption means. Keep it in
[`Keyring`](Keyring.md) or in the user's head, never beside the file.

**This is not a password hash.** A password stored for checking is
`Hash.Sha256` with a salt and a work factor, and this runtime deliberately has
no `bcrypt`; `Cipher` is for data that has to come back, not for a password that
must not.

## What it does not do

- **No key exchange, no public key, no signature.** `Hash.Hmac` is the
  signature; this is symmetric and both sides already hold the key.
- **No password-based key derivation with a work factor.** The key is hashed
  once with SHA-256; a passphrase that a person chose is as weak as the
  passphrase, and the caller who cares stretches it first.
- **No streaming.** `Encrypt` takes the whole value; a very large file belongs
  in a [`Task`](Task.md) with `File.LoadBytes`.
- **No format of its own on disk.** The sealed value is `Bytes`; writing it,
  naming it and keeping the key are the application's.

## See also

[`Hash`](Hash.md) · [`Random`](Random.md) · [`Bytes`](Bytes.md) ·
[`File`](File.md) · [`Keyring`](Keyring.md) · [`Task`](Task.md)
