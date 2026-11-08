# ServerSocket

A TCP or Unix-domain listener, asynchronous like `Socket`.

```js
const server = new ServerSocket({ Host: "local", Port: 7000 });
server.OnConnection = (client) => {
    client.OnLine = (line) => client.Write("echo: " + line + "\n");
};
server.Listen();
```

`Port: 0` asks the system and `Port` answers what it got. `"local"` is
loopback and the default; `"any"` opens the interface. `Stop` stops accepting
and closes every connection it holds. `Tls: { Cert, Key }` wraps each accepted
connection; the client side is [`Socket.Tls`](Socket.md).

## Every member

| | |
|---|---|
| `Count` (ro) | the connections that are alive now |
| `Host` | `"local"` (loopback, the default) or `"any"`, the same two words `Http.Server` uses |
| `Listen([port])` | start accepting; the optional port is shorthand for the property. Answers the server |
| `Listening` (ro) | whether it is accepting now |
| `OnConnection` | assign `(client) => …`: a `Socket` already connected. Set its handlers here; `client.Server` is this listener |
| `OnError` | assign `(err) => …` with `{ Message, Kind }`; an accept error does not stop the listener |
| `Path` | a Unix domain socket path, instead of Host/Port |
| `Port` | the TCP port to listen on, 0 to 65535. `0` asks the system for one; read it back after `Listen` |
| `Stop()` | stop accepting and close every connection the server still holds. Answers the server |
| `Tls` | `{ Cert, Key }`: the PEM files every accepted connection is wrapped with, or nothing for a plain listener. A file that cannot be read is refused where it is written |
