# Network

Whether there is a network, whether it reaches the internet, whether it is
metered — and, for one host, whether it answers.

**Advice, not a guarantee.** The answer to *can I reach my server* is a request
to it, or `Reach`; these properties decide what to show and whether to try.

```js
this.LblState.Text = Network.Online ? "" : "Offline";
Network.OnChange = () => { if (Network.Online) this.retryQueued(); };

Network.Reach("cam.local", 554, (ok, why) => {
    this.LblCam.Text = ok ? "" : why === "NotFound" ? "Unknown camera" : "The camera does not answer";
});

Network.Probe((r) => {
    if (r.Connectivity === "Portal") this.offerSignIn(r.Url);
});
```

## Every member

| | | |
|---|---|---|
| `Connectivity` (ro) | what the network reaches, as far as this machine can know | [the levels](#the-levels) |
| `Metered` (ro) | the connection costs by the byte or is capped -- a phone's hotspot -- so a large upload can wait | [the levels](#the-levels) |
| `OnChange` | assign `() => …`: called when `Connectivity` or `Metered` changed, once per change however many notices it took | [the levels](#the-levels) |
| `Online` (ro) | `Connectivity` is `"Full"`, and nothing weaker -- never *an interface is up* | [the levels](#the-levels) |
| `Probe(callback, [options])` | asks whether the internet answers or a captive portal does instead, and calls `callback({ Connectivity, Url, Why })` | [a captive portal](#a-captive-portal) |
| `Reach(host, port, callback, [options])` | whether `host` answers on `port`, which no global property can say: calls `callback(ok, why)` with `why` `""`, `"NotFound"` (the name did not resolve), `"Refused"`, `"Unreachable"`, `"Timeout"`, `"NotAllowed"` or `"Error"` | [one host](#one-host) |

## The levels

| | |
|---|---|
| `Connectivity` | what the network reaches, as far as this machine can know: `"Unknown"` (not answered yet), `"None"`, `"Local"` (a network with no way out), `"Routed"` (a way out that nobody checked reaches the internet -- what most backends can honestly say), `"Limited"`, `"Portal"` (a captive portal: a sign-in page first) or `"Full"` (the internet, checked). Advice, not a guarantee: whether a server answers is a request to it, or `Reach` |
| `Online` | `Connectivity` is `"Full"`, and nothing weaker -- never *an interface is up* |
| `Metered` | the connection costs by the byte or is capped -- a phone's hotspot -- so a large upload can wait. `false` where the system cannot tell |
| `OnChange` | assign `() => …`: called when `Connectivity` or `Metered` changed, once per change however many notices it took. Read them again inside; `null` takes it off |

**Which levels a machine can reach depends on who answers**, and the runtime
never claims more than that:

| on | it can say |
|---|---|
| Linux with NetworkManager, **connectivity check on** | every level, `"Portal"` included |
| Linux with NetworkManager, check off (Fedora without `NetworkManager-config-connectivity-fedora`, for one) | `"None"`, `"Local"`, `"Routed"` — never `"Full"`: nothing checked |
| Linux without NetworkManager, Windows, macOS | `"None"` and `"Routed"` |
| inside Flatpak | what the host's portal says, after `"Unknown"` for the first moment; `"None"` without `--share=network` |

So **`Online` is `false` on a machine that cannot check**, though its network
may be fine: a program that must decide anyway uses `Reach` or `Probe`.

**`"Unknown"` is real**: inside Flatpak the answer arrives a few milliseconds
after the first question, so reading `Online` in `Form_Open` there says *not
known yet*. `OnChange` is called when it is known.

## One host

| | |
|---|---|
| `Reach(host, port, callback, [options])` | whether `host` answers on `port`, which no global property can say: calls `callback(ok, why)` with `why` `""`, `"NotFound"` (the name did not resolve), `"Refused"`, `"Unreachable"`, `"Timeout"`, `"NotAllowed"` or `"Error"`. A real connection, closed at once -- inside a sandbox the desktop portal asks instead. `{ Timeout }` in ms, default `5000` |

It calls `callback(ok, why)`:

| `why` | |
|---|---|
| `""` | it answered |
| `"NotFound"` | the name did not resolve |
| `"Refused"` | the machine is there and nothing listens on that port |
| `"Unreachable"` | no route to it |
| `"Timeout"` | no answer within `Timeout` (ms, default `5000`) |
| `"NotAllowed"` | the sandbox has no network |
| `"Error"` | anything else |

It opens a real connection and closes it at once — a route lookup says yes to a
host whose name does not resolve. Inside Flatpak the desktop portal asks
instead, and it cannot tell `"NotFound"` from `"Unreachable"`. Not ICMP: a
blocked ping proves nothing.

## A captive portal

| | |
|---|---|
| `Probe(callback, [options])` | asks whether the internet answers or a captive portal does instead, and calls `callback({ Connectivity, Url, Why })`: `"Full"` (it answered 204), `"Portal"` with `Url` the sign-in page (a redirect, or another page in its place), `"Limited"` (an error status where the internet would have said 204) or `"None"` with `Why` the `Http` error kind (`Dns`, `Timeout`, `Refused`…). A plain-HTTP request to `Url` (default Google's `generate_204`), which must answer `204`; `Timeout` in ms, default `5000`. Needs `Http` |

It does what NetworkManager, Android, Apple
and Windows do: a **plain-HTTP** request to a URL that answers `204 No Content`
(Google's `generate_204` unless `Url` says otherwise), without following a
redirect. It calls `callback({ Connectivity, Url, Why })`:

| `Connectivity` | what the network reaches, as far as this machine can know: `"Unknown"` (not answered yet), `"None"`, `"Local"` (a network with no way out), `"Routed"` (a way out that nobody checked reaches the internet -- what most backends can honestly say), `"Limited"`, `"Portal"` (a captive portal: a sign-in page first) or `"Full"` (the internet, checked). Advice, not a guarantee: whether a server answers is a request to it, or `Reach` |
|---|---|
| `"Full"` | it answered `204` |
| `"Portal"` | a redirect (`Url` is where it sends: the sign-in page) or another page in place of `204` |
| `"Limited"` | an error status (`Why` is `HTTP 500`, for one) |
| `"None"` | no answer; `Why` is the `Http` error kind — `Dns`, `Timeout`, `Refused`… |

It is a verb the program calls, never something done behind its back: it costs
a request and asks a third party. It needs `Http`.

## What goes wrong

- **`Online` is `false` and the network works.** The machine cannot check (see
  the table); ask `Reach` or `Probe`.
- **`Reach` said `"Unreachable"` inside Flatpak for a name that does not
  exist.** The portal does not tell the two apart.
- **`Probe` said `"Portal"` on a working network.** `Url` answers something other
  than `204` — `http://fedoraproject.org/static/hotspot.txt` answers `200 OK`.

## See also

[`Http`](Http.md) · [`Environment`](Environment.md)
