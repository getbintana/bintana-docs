# Notification

A desktop notification, for when the window is not what the user is looking at.

```js
Notification.Send(Locale.Text("Backup finished"), Locale.Text("{0} files", n))
```

## Every member

| | | |
|---|---|---|
| `Send(title, [body], [options])` | shows a desktop notification and answers its id | [sending](#sending) |
| `Withdraw(id)` | takes a notification back, by the id `Send` answered or was given | [withdrawing](#withdrawing) |

## Sending

| | |
|---|---|
| `Send(title, [body], [options])` | shows a desktop notification and answers its id. With no body, the second argument may be the options: `{ Id, Urgency, Icon }`. `Urgency` is `"Low"`, `"Normal"` (the default), `"High"` or `"Urgent"`; `Icon` is a theme icon name; sending again with the same `Id` **replaces** what is showing. The title and body are not looked up in a catalogue -- wrap them in `Locale.Text`. Refused in a project with a `main`, which has no application to send from |

`Message` is modal and takes the window; this does not, which is the whole of
what it is for — a long job that ended while the user was in another program.

```js
Notification.Send("Backup finished", "412 files, 1.8 GB");

const id = Notification.Send("Disk almost full", "3% left",
                             { Urgency: "Urgent", Icon: "drive-harddisk-symbolic" });
```

**It answers an id**, which is `Id` when the options gave one and a fresh one
otherwise, so that every notification has something to withdraw.

| Option | |
|---|---|
| `Id` | text. Sending again with the same one **replaces** what is showing |
| `Urgency` | `"Low"`, `"Normal"` (the default), `"High"` or `"Urgent"`, in any case |
| `Icon` | a theme icon name |

With no body the second argument may be the options. An option that is not one of
these is refused, and so is an `Urgency` that is none of the four.

**On a freedesktop desktop `High` and `Normal` are the same.** The daemon's
protocol has three levels — low, normal, critical — and `"High"` maps to normal;
only `"Urgent"` is critical, which is the one a daemon may keep on screen. Desktops
that go by the portal or a native service tell all four apart.

### The project needs an `id`

A notification is sent in the name of an application, so `project.json` has to
declare an `id` (reverse DNS, as [the project format](../../formats.md) says). With
none, GLib fails an assertion and **sends nothing, without telling the program** —
five calls and zero on the bus, measured — so this refuses with a sentence naming
the key.

### A project with a `main` cannot send

It has no display and no application to send from. It refuses and says so; a tool
that wants to say it is done writes to stdout, which is what a shell script that
`notify-send`s would have wanted a wrapper for.

### The words

The title and body are **not** looked up in a catalogue by `Send`. Wrap them in
[`Locale.Text`](Locale.md) at the call site — which is where the extractor looks,
and where `{0}` interpolates — and never build them with a template literal.

### How it gets there

Through the application, which uses what the platform has: the freedesktop daemon
on a desktop, **the notification portal inside a Flatpak**, a native service
elsewhere. A direct call to `org.freedesktop.Notifications` would be shorter and
would need a hole in every package's sandbox.

## Withdrawing

| | |
|---|---|
| `Withdraw(id)` | takes a notification back, by the id `Send` answered or was given. An id nothing is showing under is not an error |

By the id `Send` answered or was given. An id nothing is showing under is not an
error, and neither is withdrawing one the user already dismissed.

## What is not here

- **A click that calls back.** A notification's action belongs to the application
  and a callback is held by something the desktop owns, for as long as it chooses
  to keep it — past the window that sent it. Nothing needs one yet; the first
  application that does is the case to design it from.
- **Buttons, sound, a progress bar and an image.** The freedesktop protocol has
  them and the portal supports fewer.
- **A notification from a console project.** See above.

## What goes wrong

- **Nothing appeared.** There is no notification daemon in the session, the user
  has turned notifications off for the application, or *do not disturb* is on. None
  of these is visible to the program.
- **It threw about an `id`.** The project does not declare one in `project.json`.
- **It threw about the display.** The project declares `main`, which never
  initialises GTK.
- **`"High"` looked the same as `"Normal"`.** It is the daemon's protocol; see above.
