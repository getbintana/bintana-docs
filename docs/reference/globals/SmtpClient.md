# SmtpClient

A mail client: one `Send` opens a `Socket`, speaks SMTP, and closes it.

```js
const mail = new SmtpClient({ Host: "smtp.example.com", Port: 465,
                              Tls: "Tls", From: "app@example.com" });
mail.User     = Settings.Get("smtp.user");
mail.Password = Keyring.Get("smtp");

mail.Send({ To: "person@example.com",
            Subject: "Backup finished",
            Body: "It finished at 03:12.",
            Attachments: ["/tmp/report.pdf"] },
          () => this.Lbl.Text = "sent",
          (e) => this.Lbl.Text = e.Message);
```

`Tls` is `"None"` for a plain connection on 25 or `"Tls"` for implicit TLS on
465, and also accepts `true` or the `{ Ca, Cert }` trust object `Socket`
takes. `"StartTls"` is refused: `Socket` is TLS from the first byte or plain,
and upgrading a live connection mid-stream is not built.

A message is `{ From, To, Cc, Bcc, Subject, Body, Html, Attachments, Headers }`.
`To`, `Cc` and `Bcc` are an address or a list; `From` falls back to the
client's; `Html` beside `Body` makes `multipart/alternative`; `Attachments`
holds a path, `{ Name, Path }` or `{ Name, Bytes }` and makes
`multipart/mixed`. `Headers` adds one header per name. A subject that is not
printable ASCII is RFC 2047 encoded.

`Send` is asynchronous: `onDone()` or `onError(err)` runs on a later turn,
and a reply that does not arrive within `Timeout` is an error rather than a
hang. A dot at the start of a DATA line is stuffed (`.line` becomes
`..line`), and the connection ends with `QUIT`.

## Every member

| | |
|---|---|
| `From` | the envelope sender, used when the message does not name one |
| `Host` | the SMTP server's name or address |
| `Password` | the AUTH LOGIN password; keep it out of the `.form` |
| `Port` | the port; 25 plain, 465 for implicit TLS |
| `Send(message, onDone, onError)` | send one message. `message` is `{ From, To, Cc, Bcc, Subject, Body, Html, Attachments, Headers }`; `onDone()` or `onError(err)` answers on a later turn. Answers the client |
| `Stop()` | stop the message in flight, answering `onError` with `"Cancelled"` |
| `Timeout` | how long one reply may take, in milliseconds; 0 waits for ever |
| `Tls` | `"None"`, `"Tls"` (implicit), `true`, or a `Socket.Tls` trust object |
| `User` | the AUTH LOGIN user, or "" for a server that needs none |

## On a form

`SmtpClient` is also a `FormPart`: a `components` entry of type `SmtpClient`
declares `Host`, `Port`, `Tls`, `From` and `Timeout`, and the form reaches it
by name and sends with `Mail.Send(...)`. `User` and `Password` are getters and
setters outside `static Properties`, so the serialiser never writes them;
set them in `Form_Open` from `Settings` or `Keyring`, and they survive a
changed `Host`. Closing the form stops a send in flight.

## See also

[`Socket`](Socket.md) · [`FormPart`](FormPart.md) · [`Keyring`](Keyring.md)
