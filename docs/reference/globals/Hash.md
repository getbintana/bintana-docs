# Hash

A checksum, of a string or of a file.

```js
Hash.Sha256("abc")                       // ba7816bf…f20015ad
File.Hash(path)                          // the same digest, over the file
```

## Every member

| | | |
|---|---|---|
| `Md5(v)` | the MD5 digest | [the four](#the-four) |
| `Sha1(v)` | likewise, and likewise | [the four](#the-four) |
| `Sha256(v)` | **the one to reach for** unless something else decided | [the four](#the-four) |
| `Sha512(v)` | when what you are comparing against used it | [the four](#the-four) |
| `Hmac(key, message, [algorithm])` | the keyed digest (RFC 2104) as lower-case hex, `"Sha256"` unless told | [signing](#signing-and-checking-a-signature) |
| `Verify(key, message, signature, [algorithm])` | whether `signature` is the keyed digest of `message`, compared in constant time | [signing](#signing-and-checking-a-signature) |

[`File.Hash(path, [algorithm])`](File.md#asking-about-one) is the file's digest
and lives there, with the rest of what a file answers.

## The four

| | |
|---|---|
| `Md5(v)` | the MD5 digest. Old and broken for anything adversarial; fine for a cache key or an etag somebody else chose. `v` is text (hashed as its UTF-8) or a [`Bytes`](../../llm/library.md#bytes) (hashed as the bytes it is) |
| `Sha1(v)` | likewise, and likewise |
| `Sha256(v)` | **the one to reach for** unless something else decided |
| `Sha512(v)` | when what you are comparing against used it |

`v` is text — hashed as its **UTF-8** — or [`Bytes`](Bytes.md), hashed as the
bytes it is.

**What is hashed is the text's UTF-8 bytes**, which is what every other tool means
by the hash of a string: `Hash.Sha256("abc")` is what `sha256sum` says about a
file holding `abc`, and `Hash.Sha256("ñandú")` agrees too.

Something that is **not** text has to become text first — `JSON.stringify`, a
[`Decimal`](Decimal.md)'s own digits — and *which* text is part of what was
hashed, so that is the caller's decision and not a default this could pick.

## Signing and checking a signature

A keyed digest is how a message is signed — a webhook carries one, and so does a
signed cookie. `Hash.Hmac(key, message)` makes it and `Hash.Verify(key, message,
signature)` checks it.

```js
const sig = Hash.Hmac("secret", body);                 // hex, Sha256
Hash.Hmac("secret", body, "Sha512");                   // any of the four

if (!Hash.Verify("secret", body, req.Headers["x-signature"]))
    return req.Answer(401, "no");
```

| | |
|---|---|
| `Hmac(key, message, [algorithm])` | the keyed digest (RFC 2104) as lower-case hex, `"Sha256"` unless told. `key` and `message` are text (its UTF-8) or a [`Bytes`](../../llm/library.md#bytes), and **nothing else**: a number or `undefined` is refused rather than signed as the word it spells. For a signature somebody sent you, **do not compare the answer with `===`** -- that is what `Verify` is for |
| `Verify(key, message, signature, [algorithm])` | whether `signature` is the keyed digest of `message`, compared in constant time. `signature` is hex (either case) or a [`Bytes`](../../llm/library.md#bytes) of the raw digest; text that is not hex of the right length is `false`, not an error, since it is what a forged one looks like. Never answers by throwing for a wrong signature |

**Check with `Verify` and not with `===`.** Comparing the two strings stops at
the first character that differs, so how long it takes says how many leading
characters were right, and that is enough to forge a signature one character at a
time. `Verify` looks at every byte whatever the first difference was. It takes the
signature as hex, in either case, or as a [`Bytes`](Bytes.md) of the raw digest,
and answers `false` — **not an error** — for text that is not hex or not the right
length, because that is what a forged one looks like and a caller should be able
to branch on it without a `try`.

**The key and the message are text or `Bytes`, and nothing else.** `Hash.Sha256(v)`
will hash what it is given; a signature cannot be so lenient, since
`Hmac(secret, undefined)` would sign the word `"undefined"` and hand back a
signature that looks valid and covers nothing. A number or a missing argument is
refused naming which one.

[`examples/webhook`](https://github.com/getbintana/bintana/tree/main/examples/webhook) is the whole of this running: a receiver that
verifies a signature over the timestamp and the body's own bytes, and six deliveries —
a good one, a retry, a changed body, somebody else's secret, a good signature ten
minutes old, and none at all — each answered as it must be. It exits `1` when one is
not, so it is also a check.

It is held to RFC 4231's vectors (the case with a key longer than the hash's block
size included) and RFC 2202's, and not to itself.

## A hash is not a password

These are **checksums**: same input, same digest, as fast as the machine can go.
That is what makes them right for comparing a download against a published
digest, keying a cache, telling two files apart or noticing that a file changed —
and **wrong for storing what somebody typed**. There is no salt, no work factor,
and no `bcrypt` here.

## What goes wrong

- **The digest did not match `sha256sum`.** Something other than the UTF-8 of the
  text was hashed — a trailing newline the file has and the string does not, most
  often.
- **A JPEG hashed to the wrong thing.** `File.Load` answers a string; a file that
  is not text is [`File.Hash`](File.md#asking-about-one) or
  [`Bytes`](Bytes.md).
- **A signature that is right does not verify.** The two sides signed different
  bytes: text is its UTF-8, so a body read as text and one read as `Bytes` agree
  only if the text round-tripped, and a trailing newline is part of what was signed.
- **Hashing a video ate the memory.** It does not — `File.Hash` reads in blocks —
  but `Hash.Sha256(File.LoadBytes(path))` holds the whole thing.

## See also

[`File`](File.md) · [`Bytes`](Bytes.md)
