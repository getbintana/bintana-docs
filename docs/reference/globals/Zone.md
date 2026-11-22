# Zone

What the clock reads in a place at an instant: the IANA time zones.

[`Day`](Day.md) is a date with no zone and [`Time`](Time.md) a time of day with
no zone. **An instant -- a `Date` -- has neither until a zone is chosen**, and
`Zone` is that bridge: offsets, abbreviations, the next time the clocks move, and
an instant turned into the `Day` and `Time` a place reads, and back.

## Every member

| | | |
|---|---|---|
| `At(id, when)` | what the clock in `id` is doing at the instant `when` (a `Date`, or milliseconds) | [reading a clock](#reading-a-clock) |
| `Day(id, when)` | the date it is in `id` at the instant `when`, as a [`Day`](../../llm/library.md#day) (`"YYYY-MM-DD"`) -- what `Locale.Date` writes in the reader's language | [reading a clock](#reading-a-clock) |
| `Directory` | where the time zone database is read from | [the database](#the-database) |
| `Info(id)` | where a zone is | [places](#places) |
| `Instant(id, day, [time])` | the instant at which the clock in `id` reads `day` and `time` (`"YYYY-MM-DD"`, `"HH:MM"` or `"HH:MM:SS"`, midnight when left out), as a `Date` | [from a clock to an instant](#from-a-clock-to-an-instant) |
| `List()` | every zone that is a place a person picks -- the rows of `zone.tab` and `zone1970.tab`, about four hundred, sorted | [places](#places) |
| `Local` | the zone this machine is set to, as an IANA id (`"America/Argentina/Buenos_Aires"`) | [the database](#the-database) |
| `Next(id, when)` | the next time the clocks in `id` move after `when` | [reading a clock](#reading-a-clock) |
| `Time(id, when)` | the time of day it is in `id` at the instant `when`, as a [`Time`](../../llm/library.md#time) with seconds (`"21:03:58"`), the way `Time.Now` answers | [reading a clock](#reading-a-clock) |
| `Version` | which release of the IANA database is being read (`"2026f"`), from its `tzdata.zi` or `+VERSION` | [the database](#the-database) |

## Reading a clock

| | |
|---|---|
| `At(id, when)` | what the clock in `id` is doing at the instant `when` (a `Date`, or milliseconds): `{ Offset, Abbreviation, Dst }` -- the offset in **minutes east of Greenwich** (Buenos Aires `-180`, Kathmandu `345`), the abbreviation the database gives (`"JST"`, or `"-03"` where there is none in use), and whether it is daylight saving time |
| `Day(id, when)` | the date it is in `id` at the instant `when`, as a [`Day`](../../llm/library.md#day) (`"YYYY-MM-DD"`) -- what `Locale.Date` writes in the reader's language |
| `Time(id, when)` | the time of day it is in `id` at the instant `when`, as a [`Time`](../../llm/library.md#time) with seconds (`"21:03:58"`), the way `Time.Now` answers |
| `Next(id, when)` | the next time the clocks in `id` move after `when`: `{ When, Before, After }`, a `Date` and the two readings `At` gives either side of it -- so "clocks go back an hour, EDT to EST" is `Before` and `After`. Only a change of **offset** counts: a new abbreviation at the same offset moves no clock. `null` for a zone that does not change |

```js
const when = new Date("2026-11-22T15:00:00Z");

Zone.At("Asia/Tokyo", when)          // { Offset: 540, Abbreviation: "JST", Dst: false }
Zone.At("Asia/Kathmandu", when)      // { Offset: 345, Abbreviation: "+0545", Dst: false }
Zone.Day("Asia/Tokyo", when)         // "2026-11-23" -- already tomorrow there
Zone.Time("Asia/Tokyo", when)        // "00:00:00"

const next = Zone.Next("America/New_York", when);
next.When                            // 2027-03-14T07:00:00Z
next.Before.Abbreviation + " → " + next.After.Abbreviation   // "EST → EDT"
(next.After.Offset - next.Before.Offset) / 60                  // 1: forward an hour
```

**`when` is an instant**: a `Date`, or milliseconds since 1970 (`Date.now()`).

**An offset is minutes east of Greenwich** -- `-180` for Buenos Aires, `345` for
Kathmandu. That is the sign of the `-03:00` an ISO date is written with, and the
opposite of `getTimezoneOffset()`, whose sign nobody guesses right twice.

**The abbreviation is the database's.** Where a zone has no abbreviation in
common use the database writes the offset (`"-03"`, `"+0545"`), and that is
what you get: an honest answer rather than an invented `"ART"`.

**`Next` counts a change of offset, not of name.** Grand Turk went from EDT to
AST in 2015 at -04:00 on both sides; no clock moved, so that is not a `Next`.

**`Day` and `Time` are text with no zone in them**, which is the point: what
Tokyo reads is a `Day` like any other, and [`Locale`](Locale.md) writes it in
the reader's language with no `Date` pretending to be local somewhere it is not:

```js
Locale.Date(Zone.Day("Asia/Tokyo", when), "Weekday")   // "lunes" on a Spanish desktop
```

## From a clock to an instant

| | |
|---|---|
| `Instant(id, day, [time])` | the instant at which the clock in `id` reads `day` and `time` (`"YYYY-MM-DD"`, `"HH:MM"` or `"HH:MM:SS"`, midnight when left out), as a `Date`. Twice a year a reading is ambiguous and once it does not exist: **an hour that happens twice is the first of them, and one the clocks skipped is moved forward by the gap** (02:30 on the morning New York springs forward is 03:30 EDT) -- the rule Temporal calls `"compatible"` |

```js
Zone.Instant("America/New_York", "2026-12-24", "18:00")   // 2026-12-24T23:00:00Z
Zone.Instant("Asia/Tokyo", "2026-12-24")                   // midnight there
```

Twice a year a reading is ambiguous, and once it does not exist. `Instant`
decides both the way Temporal's `"compatible"` does:

- **an hour that happens twice is the first of them** -- 01:30 on the morning
  New York falls back is 01:30 EDT;
- **an hour the clocks skipped is moved forward by the gap** -- 02:30 on the
  morning New York springs forward is 03:30 EDT.

## Places

| | |
|---|---|
| `List()` | every zone that is a place a person picks -- the rows of `zone.tab` and `zone1970.tab`, about four hundred, sorted. `UTC` and the `Etc/` zones are not places and are not in it, though `At` and the rest take them |
| `Info(id)` | where a zone is: `{ Id, Country, CountryName, Latitude, Longitude, Comment }` -- the ISO 3166 code and its English name, the principal city's position in degrees (north and east positive) and the table's note on what the zone covers. A retired name (`America/Buenos_Aires`) answers for the zone it links to, under that zone's `Id`. `null` for a zone that is no place (`UTC`); a refusal for one the machine does not have |

```js
Zone.List().length                   // 418 with tzdata 2026f
Zone.Info("America/Argentina/Buenos_Aires")
    // { Id: "America/Argentina/Buenos_Aires", Country: "AR", CountryName: "Argentina",
    //   Latitude: -34.6, Longitude: -58.45, Comment: "Buenos Aires (BA, CF)" }
Zone.Info("America/Buenos_Aires").Id // the same zone: a retired name follows its link
Zone.Info("UTC")                     // null: a zone, but no place
```

`List` is the rows of the database's `zone.tab` and `zone1970.tab`: the
maintained table leaves out zones that have agreed with another since 1970
(Europe/Vatican, Africa/Accra), which a person still looks for by their own
city, so both are read. The country name is the table's English one -- a word
to search by; the position is the principal city's, in degrees, north and east
positive, which is what a sunrise or a map wants.

## The database

| | |
|---|---|
| `Directory` | where the time zone database is read from: `TZDIR` when it is set, then the system's (`/usr/share/zoneinfo`), then the copy beside the runtime (`share/zoneinfo`, which is what Windows has), then `zoneinfo` in the desktop's data directories. `""` when there is none, and then every member that reads a zone refuses |
| `Local` | the zone this machine is set to, as an IANA id (`"America/Argentina/Buenos_Aires"`): `TZ` when it names a zone, else `/etc/localtime`, else on Windows the registry's zone through CLDR's table -- and `"UTC"` when the machine cannot say |
| `Version` | which release of the IANA database is being read (`"2026f"`), from its `tzdata.zi` or `+VERSION`; `""` when the copy does not say |

**There is no `Intl` here, and `toLocaleString({ timeZone })` ignores the
zone** -- it answers local time without a word. `Zone` is the way to ask.

The runtime reads the IANA database's compiled files itself, with the same
reader on every platform: the machine's own on Linux and macOS
(`/usr/share/zoneinfo`, which the distribution updates), and on Windows a copy
the runtime carries in `share/zoneinfo`. `TZDIR` points it anywhere else.
A machine with no database at all answers `Directory` as `""`, and every member
that reads a zone refuses, saying so.

`Local` is `TZ` when that names a zone, else `/etc/localtime`, else on Windows
the registry's zone through CLDR's table -- always an id the database has, and
`"UTC"` when the machine cannot say.

## What goes wrong

- **A time came out in the local zone.** That was `toLocaleString` with a
  `timeZone` -- ignored. Ask `Zone.Day`/`Zone.Time`, or `Zone.At` for the offset.
- **A meeting moved by an hour.** It was stored as an instant computed with
  *today's* offset for a date after a clock change. Store the `Day`, the `Time`
  and the zone's id, and make the instant with `Zone.Instant` when it is needed.
- **`"Mars/Olympus" is not a time zone this machine knows`.** The id is not in
  the database -- a typo, or a zone newer than the machine's tzdata. `List`
  says what there is.
- **The sign of an offset is backwards.** `getTimezoneOffset()` is minutes
  *west*; `Offset` is minutes east.

## See also

[`Day`](Day.md) · [`Time`](Time.md) · [`Locale`](Locale.md)
