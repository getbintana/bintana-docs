# Zip

Reading the container every office document, ebook and jar is.

```js
const z = Zip.Open("accounts.xlsx");
for (const e of z.Entries) print(e.Name, e.Size);
const sheet = Xml.ParseBytes(z.Read("xl/worksheets/sheet1.xml"));
z.Close();
```

**It reads, and does not write.** `Zip.Create` is waiting for the first application
that needs to make a `.xlsx` or an `.odt`.

## Every member

| | | |
|---|---|---|
| `Open(path)` | reads the archive's directory and answers a handle on it | [opening](#opening) |
| `Entries` | what the archive holds | [what is in it](#what-is-in-it) |
| `Read(name, [{ MaxSize }])` | one entry's bytes | [reading](#reading) |
| `Extract(name, path, [{ MaxSize }])` | one entry written to a path | [extracting](#extracting) |
| `ExtractAll(folder, [{ MaxSize }])` | every entry under a folder | [extracting](#extracting) |
| `Close()` | lets go of the archive | [closing](#closing) |

## Opening

| | |
|---|---|
| `Open(path)` | reads the archive's directory and answers a handle on it. Throws, naming the file and the reason, for anything that is not a zip, is cut short, is zip64 or split over disks, or lists one name twice. An archive up to 32 MiB is held in memory; a bigger one is mapped, so do not open one that is still being written |

A zip is read from its **central directory**, which is at the end of the file, and the
sizes and the CRC come from there — **not** from the header in front of each entry.
That is not a preference: 271 of the 859 entries in 49 real documents had a *data
descriptor*, meaning the header in front of the data does not know the size at all
(LibreOffice writes one on every entry), so a reader that trusted those headers would
fail a third of the files on a desktop. The local header is read only to find where the
data starts, and its **name must agree** with the directory's, or the entry is refused:
two readers that disagree about what is in a file is how a hostile archive shows a
scanner one thing and an application another.

Opening refuses, naming the file and the reason: something that is not a zip, one cut
short (it loses its directory), **zip64**, an archive split over several disks, and **a name
listed twice**.

An archive up to 32 MiB is copied into memory; a bigger one is mapped. A file in memory
cannot be hurt by another program truncating it, a mapped one can — with a `SIGBUS` that
ends this process — so **do not open a zip that is still being written.**

## What is in it

| | |
|---|---|
| `Entries` | what the archive holds |

An array of `{ Name, Size, Compressed, Modified, IsDir }`, in the order the directory
lists them. `Size` is what an entry inflates to and `Compressed` what it occupies.
A folder's `Name` ends in `/`. `Modified` is a `Date` in **local time** — a zip carries no
zone and counts in two-second steps — or `null` for a field that is not a date.

It is a copy, so what it answered outlives `Close()`.

Names are read as UTF-8. One that is not valid UTF-8 has its bad bytes replaced, rather
than being guessed at as a code page; reading it by that name still works.

## Reading

| | |
|---|---|
| `Read(name, [{ MaxSize }])` | one entry's bytes |

**It throws, and never answers wrong.** Each of these is a refusal with a sentence naming
the entry:

- the data does not match its **checksum** — the one an entry that inflated to the right
  length still gets caught by;
- the stream inflates to **more than the directory says**, or to less;
- the local header names something else than the directory does;
- it is **encrypted**, or uses a method other than stored and deflate;
- it is over **`MaxSize`** — 256 MiB unless told. A few hundred bytes of zip inflate to
  gigabytes, and the directory's `Size` is a number the archive's author chose, so it is
  compared with the ceiling *before* anything is allocated.

An entry that is refused does not stop the others being read.

```js
const doc = Xml.ParseBytes(z.Read("word/document.xml"));
z.Read("big.bin", { MaxSize: 2 ** 30 });          // a gigabyte, for an archive you trust
```

## Extracting

| | |
|---|---|
| `Extract(name, path, [{ MaxSize }])` | one entry written to a path |
| `ExtractAll(folder, [{ MaxSize }])` | every entry under a folder |

`Extract` writes one entry to the path you give it, atomically, as `File.Save` does; the
folder it is in must exist. `ExtractAll` makes the folders as it goes and answers how many
files it wrote. Existing files are replaced.

**`ExtractAll` refuses the whole archive, before it writes a byte, for a name that would
leave the folder:** `../x`, an absolute path, a drive letter (`C:`), a backslash — which
Windows reads as a separator and Linux as a letter — an empty or `.` part, and a NUL. That
is *zip-slip*, an entry called `../../.ssh/authorized_keys`. It checks **every** name, every
method and the **total size** first, so a refusal leaves the destination as it was and not
half an archive. Only files and folders are ever made: there is no mode and no link in what
this writes, so an archive cannot plant a symlink. One already in the destination is yours,
as with any extractor.

## Closing

| | |
|---|---|
| `Close()` | lets go of the archive |

Closing twice is not an error. Anything else after it throws.

## What it costs

Inflating is about 500 MB a second and the work is the reading of the file, so an
archive of ordinary size is not a pause. A big one belongs in a [`Task`](Task.md), which
has `Zip` — nothing here calls back — and the handle stays in the thread that opened it.

[`examples/sheets`](https://github.com/getbintana/bintana/tree/main/examples/sheets) is the whole of it in use: an `.xlsx` is a zip of XML
parts, so `Zip` opens the container, [`Xml`](Xml.md) reads the parts, a `Task` does both off
the window's thread, and a `TableView` in its on-demand mode holds none of the rows.

## What is refused, and what reopens it

| | |
|---|---|
| encryption | an encrypted *entry* — traditional or AES — says so and the others still read |
| zip64 | past 4 GiB or 65,535 entries |
| several disks | a split archive |
| a method but stored and deflate | bzip2, lzma and the rest, named by number |
| a code page for names | names are UTF-8 |

None of these appeared in the 49 documents measured. Each is a sentence naming the
feature, and a file that shows one is what reopens it.

## What goes wrong

- **`Open` says there is no end-of-directory record.** The file is not a zip, or it was
  cut short — a download that did not finish loses exactly the part a zip is read from.
- **`Read` says the checksum does not match.** The archive is damaged. It is never
  answered anyway.
- **`ExtractAll` refused an archive that opens fine.** One of its names would leave the
  folder, or it is over the ceiling. Nothing was written.
- **A name with an accent is not found.** Compare it exactly as `Entries` spells it; a zip
  made on Windows may spell the same name differently from one made on a Mac.
