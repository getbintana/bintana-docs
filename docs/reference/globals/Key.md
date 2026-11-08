# Key

A private key the program signs with -- on a smart card, a USB token or a
software token, or in a file -- loaded the same way wherever it is.

```js
for (const t of Key.Tokens())                          // no PIN: certificates are public
    for (const s of t.Signers) print(t.Label, s.Subject, s.Key);

const key = Key.Load(signer.Key, pin);                 // a pkcs11: URI, from the list
const key = Key.Load("yo.p12", password);              // or a file
doc.Sign("factura-firmada.pdf", { Key: key });         // a PDF, signed with it
key.Close();                                           // the PIN, wiped
```

**One verb for every place a key lives.** A token is a `pkcs11:` URI, as
`Key.Tokens()` or `p11tool --list-all` prints it; a file is a PKCS#12 (`.p12`,
`.pfx`), or a PEM or DER private key, encrypted PKCS#8 included. The second
argument is the PIN or the password, whichever that place asks for.

**A token's key never leaves the token.** `Sign` hands it a digest and answers
what it signed; the runtime holds a handle and the PIN, never the key. A file's
key is in memory, as in any program that reads one.

## Every member

| | | |
|---|---|---|
| `Load(source, [pin])` | a private key, from a `pkcs11:` URI -- a smart card, a USB token, a software token, as `Tokens()` or `p11tool --list-all` names it -- or from a file | [loading](#loading) |
| `Tokens()` | the tokens plugged in, as p11-kit's modules see them | [loading](#loading) |
| `Available` | whether this build reads keys and talks to tokens, which is GnuTLS; when false every verb refuses naming the package | [loading](#loading) |
| `Source` (ro) | where it was loaded from: the file's absolute path, or the key's full `pkcs11:` URI on its token | [the key](#the-key) |
| `Open` (ro) | whether it still is | [the key](#the-key) |
| `Algorithm` (ro) | `RSA`, `ECDSA`, `Ed25519` or `Ed448` | [the key](#the-key) |
| `Bits` (ro) | the key's size: 2048 for a common RSA key, 256 for a P-256 one | [the key](#the-key) |
| `Certificate` (ro) | the signer's certificate, DER, when the place it came from had one -- a PKCS#12 does, a token usually does (the certificate with the key's id), a PEM with a `CERTIFICATE` block beside the key does | [the key](#the-key) |
| `Subject` (ro) | the common name on its certificate -- who signs | [the key](#the-key) |
| `Sign(digest, [algorithm])` | the signature over a **digest** already computed, `Bytes` of the algorithm's length -- `"SHA256"` (the default), `"SHA384"`, `"SHA512"` | [signing](#signing) |
| `Close()` | let it go: the token's session, the key in memory and the PIN, wiped | [the key](#the-key) |

## Loading

| | |
|---|---|
| `Load(source, [pin])` | a private key, from a `pkcs11:` URI -- a smart card, a USB token, a software token, as `Tokens()` or `p11tool --list-all` names it -- or from a file: PKCS#12 (`.p12`, `.pfx`), or a PEM or DER key, encrypted PKCS#8 included. `pin` is the token's PIN or the file's password. A URI that names only a token takes its one key, and refuses listing them when there are more. Throws, saying which: no such file, not a key, protected and no password, the wrong one, the PIN wanted or refused |
| `Tokens()` | the tokens plugged in, as p11-kit's modules see them: `{ Uri, Label, Manufacturer, Model, Serial, Signers }`, and `Signers` who can sign on each -- `{ Key, Label, Subject, Issuer, Expires }`, `Key` the URI to `Load`. No PIN: certificates are public. The system's store of CA certificates is not a signer's and is left out |
| `Available` | whether this build reads keys and talks to tokens, which is GnuTLS; when false every verb refuses naming the package |

**A URI may name only the token** (`pkcs11:token=Firma`): then the token must
hold one key, and two are refused with each one's URI, since which key signs
is not the runtime's to guess. Each refusal says which thing to do: no such
file, not a key, protected and no password, the wrong password, the token
wants its PIN, the token refused it.

**The tokens are p11-kit's**, the ones every GnuTLS program on the machine
sees: a smart card through OpenSC, a USB token through its vendor's module, a
SoftHSM. The system's store of CA certificates is a token too, and is left out;
so are CA certificates on a card -- `Signers` lists the certificates that sign,
each with the `Key` URI to load.

## The key

| | |
|---|---|
| `Source` (ro) | where it was loaded from: the file's absolute path, or the key's full `pkcs11:` URI on its token |
| `Open` (ro) | whether it still is |
| `Algorithm` (ro) | `RSA`, `ECDSA`, `Ed25519` or `Ed448` |
| `Bits` (ro) | the key's size: 2048 for a common RSA key, 256 for a P-256 one |
| `Certificate` (ro) | the signer's certificate, DER, when the place it came from had one -- a PKCS#12 does, a token usually does (the certificate with the key's id), a PEM with a `CERTIFICATE` block beside the key does; `null` otherwise, and the caller gives it |
| `Subject` (ro) | the common name on its certificate -- who signs; `""` with none |
| `Close()` | let it go: the token's session, the key in memory and the PIN, wiped. Closing twice is not an error |

**The PIN is kept for the key's life**, because a token asks for it again at
each signature, and wiped by `Close()` or when the key is collected. Close a
key once the signing is done.

## Signing

| | |
|---|---|
| `Sign(digest, [algorithm])` | the signature over a **digest** already computed, `Bytes` of the algorithm's length -- `"SHA256"` (the default), `"SHA384"`, `"SHA512"`: PKCS#1 v1.5 for RSA, DER for ECDSA. On a token the token signs, and asks for the PIN again. Exactly what `PdfDocument.Sign`'s `Signer` is asked, so `{ Key: key }` signs a PDF |

```js
const digest = Bytes.FromHex(Hash.Sha256(text));
const signature = key.Sign(digest);                    // PKCS#1 v1.5, as openssl's
```

**It signs a digest, not a message** -- what a PDF, a CMS or an XAdES signature
asks of a key. The digest's length is checked against the algorithm, since a
token signs whatever it is handed and a signature over the wrong bytes verifies
nowhere. An Ed25519 key signs messages only and refuses.

**`Key` is `PdfDocument.Sign`'s `Signer` made a value, never the only way to
sign**: `Sign` takes `{ Key: key }`, or any `Signer(digest, algorithm)` -- a
remote signing service is a function. Not in a `Task`: a token's session and
its PIN belong to the main thread.

## See also

[`PdfDocument`](PdfDocument.md#signing) · [`Cipher`](Cipher.md) ·
[`Hash`](Hash.md) · [`Keyring`](Keyring.md), where a program keeps a password
