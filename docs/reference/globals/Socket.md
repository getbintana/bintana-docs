# Socket

A TCP or Unix-domain connection, asynchronous on the loop the application
already runs.

```js
const printer = new Socket({ Host: "192.168.1.50", Port: 9100, Line: true });
printer.OnConnected = () => printer.Write("STATUS\n");
printer.OnLine = (line) => { this.Lbl.Text = line; };
printer.OnError = (e) => { if (e.Kind === "Refused") this.retryLater(); };
printer.Connect();
```

`OnData` hands the bytes one read returned -- **a TCP chunk is not a message**.
`Line: true` is the only framing the runtime does; it buffers and raises
`OnLine` per `EndOfLine`. `Write` queues and never blocks; `OnWritable` says
the queue is empty. `Tls` is `true` for the system's store or `{ Ca, Cert }`
for a named one; `Path` is a Unix socket on Unix and refused on Windows.

## Every member

| | |
|---|---|
| `Close()` | close now; `OnClosed` is raised once. Answers the socket |
| `Connect([host], [port])` | start connecting; the optional arguments are a TCP shorthand for the properties. Answers the socket |
| `Connected` (ro) | whether the connection is up now |
| `EndOfLine` | the line separator `Line` uses, `"\n"` by default: `"\r\n"` for many devices |
| `Host` | the name or address to connect to. Set before `Connect`; a Unix socket uses `Path` instead |
| `Line` | `true`: buffer and raise `OnLine` for each complete `EndOfLine`; `false` (the default): `OnData` with the bytes one read returned. **TCP has no messages**, so a chunk is not a frame |
| `LocalHost` (ro) | the local address once connected, `""` before |
| `LocalPort` (ro) | the local port once connected, `0` before |
| `OnClosed` | assign `() => …`: the connection ended, by the peer, by `Close`, or after `OnError`. It is raised once per connection |
| `OnConnected` | assign `() => …`: the connection is ready, and the first `Write` belongs here. `null` takes it off |
| `OnData` | assign `(bytes) => …`: bytes arrived, **not** a message. `Line: true` uses `OnLine` instead |
| `OnError` | assign `(err) => …` with `{ Message, Kind }`, `Kind` one of `"Dns"`, `"Refused"`, `"Unreachable"`, `"Timeout"`, `"Tls"`, `"NotAllowed"`, `"Cancelled"` or `"Error"`. `OnClosed` follows |
| `OnLine` | assign `(line) => …`: one complete line, without the separator, in `Line: true` mode |
| `OnWritable` | assign `() => …`: the write queue is empty and the socket can take more. `Write` never blocks, so this is the flow-control answer |
| `Path` | a Unix domain socket path, instead of Host/Port. On Windows it makes `Connect` refuse; the portable local road is `Ipc.Pipe` |
| `Port` | the TCP port to connect to, 1 to 65535. `0` is refused by `Connect` |
| `RemoteHost` (ro) | the peer's numeric address (or Unix path) once connected |
| `RemotePort` (ro) | the peer's port once connected, `0` for a Unix socket |
| `Server` (ro) | the `ServerSocket` that accepted this socket, or `null` for one the program connected itself |
| `Timeout` | how long `Connect` may take, in milliseconds; `0` is none. The read side waits as long as the peer takes, which is what a scale or a printer does |
| `Tls` | `true` trusts the system's store; `{ Ca, Cert }` names a CA file and/or a certificate to pin; `null` (the default) is a plain socket. Read back as what was set |
| `Write(data)` | queue text (UTF-8) or `Bytes`; answers the socket. It throws when the socket is not connected, which is a mistake and not a late answer |
