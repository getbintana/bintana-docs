# Gzip

The one compression format, on the zlib that GIO already links.

```js
const z = Gzip.Compress("some text")                  // Bytes
Gzip.Decompress(z).ToText()                           // "some text"

Gzip.CompressFile(path, path + ".gz")                 // streamed; answers the bytes written
Gzip.DecompressFile(path + ".gz", path)
```

## Every member

| | | |
|---|---|---|
| `Compress(data, [{ Level }])` | `data` (text as its UTF-8, or a [`Bytes`](../../llm/library.md#bytes)) as one gzip member | [values](#values) |
| `Decompress(bytes, [{ MaxSize }])` | what `bytes` holds, **all of it**: members glued together are read to the end, a stream that stops inside one **throws** (naming how far it got) rather than answering what it had, and so does anything that is not gzip | [values](#values) |
| `CompressFile(source, destination, [{ Level }])` | gzips a file into another **without loading it**, 64 KB at a time, and answers the bytes written | [files](#files) |
| `DecompressFile(source, destination, [{ MaxSize }])` | the reverse, streamed, with the same ceiling and the same promise about the destination | [files](#files) |

## Values

| | |
|---|---|
| `Compress(data, [{ Level }])` | `data` (text as its UTF-8, or a [`Bytes`](../../llm/library.md#bytes)) as one gzip member. `Level` is 1 (fast) to 9 (small), 6 unless told. A second option, or a value that is neither text nor `Bytes`, is refused. About 50 MB a second: a big one belongs in a [`Task`](../../llm/library.md#task) |
| `Decompress(bytes, [{ MaxSize }])` | what `bytes` holds, **all of it**: members glued together are read to the end, a stream that stops inside one **throws** (naming how far it got) rather than answering what it had, and so does anything that is not gzip. The answer may not pass `MaxSize` bytes (256 MiB unless told), because a few kilobytes can inflate to gigabytes. Text comes out as `ToText()` of the answer |

`Compress(data)` takes text — compressed as its **UTF-8** — or a
[`Bytes`](Bytes.md), and answers `Bytes`. A number or `undefined` is refused
rather than compressed as the word it spells. `Level` is 1 (fast) to 9 (small), 6
unless told; anything else is refused.

`Decompress(bytes)` takes `Bytes` — compressed data is not text — and answers
`Bytes`; `.ToText()` is the way to a string, and it throws on bytes that are not
UTF-8, which is where that should be said.

**It answers all of it, or it throws.**

- **Members glued together are read to the end.** `cat a.gz b.gz` is valid gzip,
  and what `gzip -c >>` makes. A decoder that stops at the first member and
  reports success hands back half the data with nothing to say so; this one goes on.
- **A stream that stops inside a member throws**, saying how many bytes of input it
  had consumed. What was decoded before the break is not returned.
- **Anything that is not gzip throws** — empty input, text, and bytes after the
  last member, the last naming the byte where the bad member starts.

The error says what happened in English on every machine. It never quotes the
system's own sentence, which is translated into the desktop's language and would
read differently on each.

### The ceiling

A few kilobytes of gzip inflate to gigabytes, and `Decompress` over a body that
came off the network is the standard way to end a program. So the output has a
ceiling: `MaxSize`, **256 MiB** unless told.

```js
Gzip.Decompress(bytes)                         // refuses past 256 MiB
Gzip.Decompress(bytes, { MaxSize: 2 ** 30 })   // a gigabyte, for data you trust
```

The refusal says it is the ceiling and how to raise it. `{ MaxSize: Infinity }` is
no ceiling at all, written out.

**An option the verb does not know is refused**, so `{ Lvel: 9 }` is an error and
not a quiet level 6.

## Files

| | |
|---|---|
| `CompressFile(source, destination, [{ Level }])` | gzips a file into another **without loading it**, 64 KB at a time, and answers the bytes written. The destination appears only when it is whole: a failure leaves no half-written file, and an existing one is untouched |
| `DecompressFile(source, destination, [{ MaxSize }])` | the reverse, streamed, with the same ceiling and the same promise about the destination. Answers the bytes written |

`CompressFile(source, destination)` and `DecompressFile(source, destination)` read
**64 KB at a time**, so the cost of a video is the buffer and not the video. Both
answer the number of bytes written, and `DecompressFile` has the same `MaxSize`.

**The destination appears only when it is whole.** The stream goes into a
temporary beside it that is renamed over once everything was written; a failure
removes the temporary and an existing destination is untouched. A half-written
`.gz` looks exactly like one that worked, which is why it is never left. The new
file keeps the permissions of the old one, as `gzip` does.

[`examples/backup`](https://github.com/getbintana/bintana/tree/main/examples/backup) is the file verbs in use: a folder compressed file
by file in a `Task`, every copy decompressed to a scratch file and its SHA-256
compared with the original's, and a copy that does not match deleted — so the
destination never holds a backup that is known to be wrong.

## What it costs

On 47 MB of text: about **960 ms to compress** and **90 ms to decompress**. A
settings file is nothing; a document is a pause in the window. Big ones belong in
a [`Task`](Task.md), which has `Gzip` — nothing here calls back or keeps a list.

## What is not here

**zlib framing, raw deflate, tar, and a stream type.** One name per published
format, and a name goes out when something needs one; the file verbs are the
answer to a file too big to hold, and the language has no stream to hand out.
**zip is [`Zip`](Zip.md)**, which reads archives and writes them.

## What goes wrong

- **`Decompress` threw *not gzip data*.** The input is a zlib stream, a zip, or
  text that was never compressed. gzip starts with the bytes `1f 8b`.
- **It threw *truncated*.** The download was cut short, or the file was copied while
  it was still being written.
- **It threw about `MaxSize`.** The data inflates past the ceiling. If it is yours,
  raise it; if it came from somebody else, that is the ceiling doing its job.
- **`ToText()` threw after a good `Decompress`.** The data was not UTF-8; it is a
  picture or a database. Keep it as `Bytes`.
