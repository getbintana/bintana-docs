# UdpSocket

A datagram port: one `Send` is one `OnData`, and the boundaries are the
kernel's.

```js
const udp = new UdpSocket({ Port: 9000, Broadcast: true });
udp.OnData = (bytes, from) => {
    if (bytes.ToText() === "WHO") udp.Send("HERE", from);
};
udp.Bind();
udp.Send("WHO", "255.255.255.255", 9000);
```

`Send` takes an IP address, not a name: resolving on the loop is the freeze
this class avoids. This stage binds IPv4; multicast and IPv6 follow.

## Every member

| | |
|---|---|
| `Bind([port])` | hold a local port and start receiving; the optional port is shorthand for the property. Answers the socket |
| `Bound` (ro) | whether it holds a local port now |
| `Broadcast` | whether `Send` may reach a broadcast address. Set it before `Bind` (or later; the socket takes it while it is open) |
| `Close()` | release the port; answers the socket |
| `Host` | `"local"` (loopback, the default) or `"any"`, the interface the socket binds to. This stage binds IPv4 |
| `OnData` | assign `(bytes, from) => …`: one datagram and its sender as `{ Host, Port }`. Datagram boundaries are the kernel's, not this file's: one `Send` is one `OnData` |
| `OnError` | assign `(err) => …` with `{ Message, Kind }`; a receive error does not close the socket |
| `Port` | the local port, 0 to 65535. `0` asks the system for one; after `Bind` this is the port really held |
| `Send(data, host, port)` | send one datagram of text (UTF-8) or `Bytes`. `host` is an IP address, not a name; `from` is a record an `OnData` was handed, and `Send(data, from)` is the same call with its two fields. Sending before `Bind` binds an ephemeral port first |
