# WebSocket

A WebSocket client, and the server-side connection `Http.Server.WebSocket`
hands to its handler.

```js
const ws = new WebSocket({ Url: "wss://example.com/feed" });
ws.OnOpen    = () => ws.Send("subscribe");
ws.OnMessage = (bytes, isText) => { if (isText) this.add(bytes.ToText()); };
ws.OnClosed  = (code, reason) => this.Lbl.Text = `closed ${code}`;
ws.OnError   = (e) => this.Lbl.Text = e.Message;
ws.Open();
```

On the server:

```js
srv.WebSocket = (ws) => {
    ws.OnMessage = (bytes, isText) => ws.Send(bytes, isText);
};
srv.Start();
```

`Send` sends text or `Bytes`, with an optional type override. `Close` starts
the close handshake; `OnClosed` arrives when it completes. `Protocols` and
`Headers` are applied to the client handshake; `Protocol` reads the one that
was agreed.

## Every member

| | |
|---|---|
| `Close([code], [reason])` | start the close handshake, code `1000` by default; answers the socket |
| `OnClosed` | assign `(code, reason) => …`: the close handshake finished, from either side |
| `OnError` | assign `(err) => …` with `{ Message, Kind }`; a fatal error is followed by `OnClosed` |
| `OnMessage` | assign `(bytes, isText) => …`: one message; `isText` is the frame's type, not a guess from the bytes |
| `OnOpen` | assign `() => …`: the handshake finished and `Send` is allowed. On a server-side connection the handler itself is the open event |
| `Open()` | connect a client; answers the socket |
| `Opened` (ro) | whether it can `Send` now |
| `Protocol` (ro) | the subprotocol the handshake agreed on, `""` when there is none |
| `Send(data, [text])` | one message: text or `Bytes`; `text` overrides the type the value implies. Answers the socket |
| `State` (ro) | `"Connecting"`, `"Open"`, `"Closing"` or `"Closed"` |
| `Url` (ro) | the `ws://` or `wss://` address the client opens; a server-side connection answers the path it arrived on |
