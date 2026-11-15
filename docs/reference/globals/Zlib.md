# Zlib

The zlib wrapper and raw DEFLATE: the two framings that are neither gzip nor a
zip archive.

```js
const packed = Zlib.Compress("some text")                 // zlib framing, Bytes
const raw    = Zlib.Compress("some text", { Raw: true })  // raw DEFLATE
Zlib.Decompress(packed).ToText()                          // "some text"
Zlib.Decompress(raw, { Raw: true }).ToText()
```

Zlib framing (RFC 1950) is what PNG's `IDAT`, a Git loose object and HTTP's
`deflate` usually carry; raw DEFLATE (RFC 1951) is the bare stream inside
draw.io's compressed pages, `permessage-deflate`, and a zip entry. **`Gzip` is
the one with a header, a timestamp and members**; this is the same engine with a
different wrapper, and it is the half a format that says "zlib" or "deflate"
means.

## Every member

| | | |
|---|---|---|
| `Compress(data, [{ Raw, Level }], [cancellable])` | `data` (text as its UTF-8, or a `Bytes`) as one stream: zlib framing (RFC 1950) unless `Raw` is true, which writes raw DEFLATE (RFC 1951) | [values](#values) |
| `Decompress(bytes, [{ Raw, MaxSize }], [cancellable])` | what `bytes` holds, **all of it** | [values](#values) |

## Values

| | |
|---|---|
| `Compress(data, [{ Raw, Level }], [cancellable])` | `data` (text as its UTF-8, or a `Bytes`) as one stream: zlib framing (RFC 1950) unless `Raw` is true, which writes raw DEFLATE (RFC 1951). `Level` is 1 (fast) to 9 (small), 6 unless told. An option it does not know, or a value that is neither text nor `Bytes`, is refused. About 50 MB a second: a big one belongs in a `Task`, and a `Cancellable` last stops it between two 64 KB chunks |
| `Decompress(bytes, [{ Raw, MaxSize }], [cancellable])` | what `bytes` holds, **all of it**: `Raw` says the bytes are raw DEFLATE rather than zlib-framed, a stream that stops inside one **throws** (naming how far it got) rather than answering what it had, and so does anything that is not the format asked for. Bytes after the stream are refused. The answer may not pass `MaxSize` bytes (256 MiB unless told). **Raw DEFLATE carries no checksum**: a damaged byte can decode to a different document without an error, so zlib framing is the one that catches damage. A `Cancellable` last stops it |

`Compress(data)` takes text — compressed as its **UTF-8** — or a
[`Bytes`](../../llm/library.md#bytes), and answers `Bytes`. `Raw` is a boolean,
`false` unless told: `true` writes raw DEFLATE, and leaving it out writes the
zlib wrapper. `Level` is 1 (fast) to 9 (small), 6 unless told; 0 is refused,
as it is by [`Gzip`](Gzip.md).

`Decompress(bytes)` takes `Bytes` — compressed data is not text — and answers
`Bytes`; `.ToText()` is the way to a string, and it throws on bytes that are not
UTF-8. **Say which framing the bytes are in**: zlib-framed bytes with
`{ Raw: true }`, or the reverse, throw rather than guess.

**It answers all of it, or it throws.**

- **One stream, read whole.** Bytes after the end are refused, naming the byte:
  zlib has no defined answer for concatenation the way gzip does.
- **A stream that stops inside one throws**, saying how many bytes of input it
  had consumed. What was decoded before the break is not returned.
- **Empty input is not a stream.** `Compress("")` answers a valid empty stream
  which `Decompress` reads back as zero bytes; `Decompress` of zero bytes throws.
- **Anything that is not the format asked for throws.**

### Raw DEFLATE checks nothing

The zlib wrapper ends in Adler-32, so a damaged zlib stream is refused. **Raw
DEFLATE has no checksum at all**: a flipped bit inside a literal is a different
document and a success. Nothing here can tell. A caller that needs to know its
bytes arrived intact uses zlib framing, or a checksum of its own.

### The ceiling

A few kilobytes inflate to gigabytes, so `Decompress` has the same ceiling as
`Gzip`: `MaxSize`, **256 MiB** unless told. The refusal says it is the ceiling
and how to raise it; `{ MaxSize: Infinity }` is no ceiling at all.

## A draw.io page

draw.io writes a compressed page as raw DEFLATE, then Base64, inside
`<diagram>`. The runtime's `Bytes` already speaks Base64:

```js
const xml = Zlib.Decompress(Bytes.FromBase64(diagram.Text.trim()),
                            { Raw: true }).ToText()
```

`Bytes.FromBase64` is strict — no spaces, no missing padding — so trim the text
(and URL-decode it first if the page came from a URL rather than a file).

## Not here

- **No file verbs.** `Gzip` has `CompressFile`/`DecompressFile`; a zlib file is
  rare enough that the caller loads it and uses the value verbs. They can come
  later if something needs them.
- **No concatenated streams.** gzip defines members glued together; zlib does
  not, so a second stream after the first is refused.
- **No streaming API.** `Zlib` is the primitive a `Stream` or `Socket` would
  use, not the stream itself.
