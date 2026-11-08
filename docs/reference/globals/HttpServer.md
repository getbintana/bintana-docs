# HttpServer

Serving over the same transport, on the loop the application already runs.

A static file server, a local API, an endpoint something else calls back — with
no second process and no framework.

```js
const srv = Http.Server({ Port: 0 });   // 0 is ephemeral: read it back
srv.Request = (req) => {
    if (req.Path === "/hi") req.Answer(200, "hola");
    else req.Answer(404, "nope");
};
srv.Start();
```

## Every member

**The server**

| | | |
|---|---|---|
| `Allow` | a list of **exact** IPs, or nothing (open) | [who may reach it](#who-may-reach-it) |
| `Auth` | `{ Realm, Users }` | [who may reach it](#who-may-reach-it) |
| `MaxBody` | bytes of request body accepted | [who may reach it](#who-may-reach-it) |
| `Host` | `"local"` is loopback only and the default | [listening](#listening) |
| `Port` | `8080` unless told | [listening](#listening) |
| `Request` | assign `(req) => …` | [answering](#answering) |
| `WebSocket` | assign `(socket) => …`: a `WebSocket` already open, for the upgrade path `/` | [answering](#answering) |
| `Running` | `Port` is declared until `Start`, actual after | [listening](#listening) |
| `ServerName` | the `Server:` header | [listening](#listening) |
| `Start()` | listens; throws naming the reason (a busy port says which one) | [listening](#listening) |
| `Stop()` | `true` while something was listening, `false` after — like signalling a reaped child | [listening](#listening) |
| `Tls` | `{ Cert, Key }` files, or nothing | [listening](#listening) |
| `Url` | `""` until `Start`, the real one after, and empty again after `Stop` | [listening](#listening) |

**The request**

| | | |
|---|---|---|
| `Answer(status, [body], [opts])` | `body` follows the client's rules — an object serialises as canonical JSON — and `opts` carries `Headers` and `ContentType` | [answering](#answering) |
| `Hold([timeout])` | **answer this request later**: asked inside the handler, it lets the handler return without the `500` an unanswered request gets, and hands back the request to `Answer` from a callback — a `Task`'s `Done`, an `Exec`'s exit, another `Http` reply | [answering](#answering) |
| `Body` | always [`Bytes`](Bytes.md) | [what arrived](#what-arrived) |
| `Headers` | lower-cased | [what arrived](#what-arrived) |
| `Method` | `GET`, `POST`, … | [what arrived](#what-arrived) |
| `Multipart()` | the upload parsed: a `Multipart` to read with `Part(index)`, or to re-post | [what arrived](#what-arrived) |
| `Path` | the path, dot-segments already normalised | [what arrived](#what-arrived) |
| `Query` | the query string as an object | [what arrived](#what-arrived) |
| `Remote` | the caller's IP | [what arrived](#what-arrived) |

## Listening

| | |
|---|---|
| `Port` | `8080` unless told; **`0` is ephemeral** — read it back after `Start` to learn which one it got, which is how a test or a one-off tool avoids fighting for a number |
| `Host` | `"local"` is loopback only and the default; **`"any"` is an explicit word**, because opening a port to the network should be something somebody typed |
| `ServerName` | the `Server:` header; `""` for soup's own |
| `Tls` | `{ Cert, Key }` files, or nothing: `https` when set, `null` when not. **Missing files fail at `Start`, naming them** |
| `Start()` | listens; throws naming the reason (a busy port says which one). A second `Start` is refused |
| `Stop()` | `true` while something was listening, `false` after — like signalling a reaped child. **From inside a handler it waits for the handler**: `Answer` fills the message in and soup sends it when the handler returns, so `req.Answer(200, "bye"); srv.Stop();` answers first and disconnects after. `Running` stays true until the deferred disconnect runs |
| `Running` | `Port` is declared until `Start`, actual after; `Url` is `""` until then, and empty again after `Stop` |
| `Url` | `""` until `Start`, the real one after, and empty again after `Stop` |

A listening server **counts like a watch**: a console project that returned from
`main` with one running stays alive for its requests. Dropping it without
`Stop()` disconnects. **A `Stop` from inside a handler waits for the handler**:
`Answer` fills the message in and soup sends it when the handler returns, so
disconnecting during the dispatch cut the response the handler had already
written — `req.Answer(200, "bye"); srv.Stop();` answered with a closed
connection. `Running` stays true until the deferred disconnect runs, because the
port is still held.

## Who may reach it

| | |
|---|---|
| `Allow` | a list of **exact** IPs, or nothing (open). A refused remote gets `403` before the handler runs. Exact means exact: on a dual-stack `"any"` server, `::1` is not `127.0.0.1` |
| `Auth` | `{ Realm, Users }`: Basic over the whole server, `401` with the realm until the right password. Nothing set is open, and it reads back `null`. Like `Allow`, it takes effect at once |
| `MaxBody` | bytes of request body accepted. **1 MiB when nothing is said**, `0` for no limit; a declared `Content-Length` past it is answered `413` **with the body never read**, and a body that arrives without one (chunked) stops being kept once it passes the number and is refused the same way. The handler runs for neither |

## Answering

| | |
|---|---|
| `Request` | assign `(req) => …`. **Required before `Start`**, and replaceable while running — even from inside the handler: the running one finishes its request and the next goes to the new one |
| `Answer(status, [body], [opts])` | `body` follows the client's rules — an object serialises as canonical JSON — and `opts` carries `Headers` and `ContentType`. **The second argument is always the body and the third always the options**. Answers `true`; **`false` for a held request that already ended** — the deadline answered first, or the server stopped — since answering after that is an ordinary outcome. **A client that closed its end is noticed only when the answer is written**, so `true` means handed to the connection, not read. A second `Answer` throws |
| `Hold([timeout])` | **answer this request later**: asked inside the handler, it lets the handler return without the `500` an unanswered request gets, and hands back the request to `Answer` from a callback — a `Task`'s `Done`, an `Exec`'s exit, another `Http` reply. **Gives up after 30 s with `503`**; `timeout` is in milliseconds and `0` waits for ever. A held request the program lets go of unanswered is answered `500`, and one whose server stops ends there. Only inside the handler, once |

**A route that must ask something first holds the request.** A `…Wait` inside
the handler freezes the loop the server answers on; `req.Hold()` lets the
handler return without the `500` and hands back the request to answer from a
callback — a `Task`'s `Done`, an `Exec`'s exit, another `Http` reply:

```js
srv.Request = (req) => {
    const later = req.Hold(5000);                 // 503 after 5 s if nobody answers
    api.Get("/price", (r) => later.Answer(200, r.Body));
};
```

A second `Answer` is refused. A late one on a request that was not held is
refused too; on a held one it answers `false` once the request has ended — the
deadline answered `503`, or the server stopped. **A client that closed its end
is not noticed while the request waits**: soup sees it only when it writes, so
`true` means handed to the connection. A held request dropped unanswered is a
`500`, and a `Stop` right after a late `Answer` waits for it to be sent.

Why that is so, and what else was deliberately left out — WebSocket, CGI shapes
— is in [../../plans/http-server-plan.md](https://github.com/getbintana/bintana/blob/main/docs/plans/http-server-plan.md), with the argument for
each.

## WebSocket

Assign `srv.WebSocket = (socket) => …` before `Start`, and the server upgrades
`/` to a WebSocket instead of answering it as HTTP. The handler is the open
event: the connection it is handed is already open, and its `OnMessage`,
`OnClosed` and `OnError` are set there.

```js
const srv = Http.Server({ Port: 7000 });
srv.WebSocket = (ws) => {
    ws.OnMessage = (bytes, isText) => ws.Send(bytes, isText);
};
srv.Start();
```

A server with `WebSocket` and no `Request` is a WebSocket-only listener: no
HTTP route and no body guard are installed. A server with neither is refused
at `Start`. The server holds each connection until it closes; `Stop` closes
the live ones. The client side is [`WebSocket`](WebSocket.md).

| | |
|---|---|
| `WebSocket` | assign `(socket) => …`: a `WebSocket` already open, for the upgrade path `/`. Set its `OnMessage`/`OnClosed` handlers here; **the handler itself is the open event**. `Request` is not required when this is set |

## What arrived

| | |
|---|---|
| `Method` | `GET`, `POST`, … |
| `Path` | the path — **dot-segments are already normalised by soup**, which is why a ten-line static server needs no `".."` refusal of its own |
| `Query` | the query string as an object; a repeated key keeps one |
| `Headers` | lower-cased, like the client's answers |
| `Body` | always [`Bytes`](Bytes.md) |
| `Remote` | the caller's IP — what `Allow` compares against |
| `Multipart()` | the upload parsed: a `Multipart` to read with `Part(index)`, or to re-post. **Refused on a plain body** |

## What goes wrong

- **`Start` threw.** The port is busy — it says which — or a TLS file is missing.
- **Every request got a `500`.** A handler that returned without answering.
- **A `…Wait` inside the handler froze everything.** The server answers on the
  same loop.
- **`Url` was empty.** Before `Start`, or after `Stop`.
- **`Allow` let nobody in on a dual-stack server.** `::1` and `127.0.0.1` are
  different addresses.
- **A console tool exited immediately.** It does not, while a server is
  listening — but it also never returns on its own.

## See also

[`Http`](Http.md) · [`Bytes`](Bytes.md) ·
[`examples/serve`](https://github.com/getbintana/bintana/tree/main/examples/serve) ·
[../../plans/http-server-plan.md](https://github.com/getbintana/bintana/blob/main/docs/plans/http-server-plan.md)
