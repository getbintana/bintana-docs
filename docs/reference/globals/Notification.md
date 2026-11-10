# Notification

A desktop notification, for when the window is not what the user is looking at.

```js
Notification.Send(Locale.Text("Backup finished"), Locale.Text("{0} files", n))
```

## Every member

| | | |
|---|---|---|
| `CanActivate` (ro) | whether this platform delivers a click | [clicking it](#clicking-it) |
| `MaxButtons` (ro) | how many `Buttons` the platform shows: 3 on Linux and Windows, 1 on macOS | [clicking it](#clicking-it) |
| `OnActivate` | assign `(id, action) => …`: a notification was clicked | [clicking it](#clicking-it) |
| `Send(title, [body], [options])` | shows a desktop notification and answers its id | [sending](#sending) |
| `Withdraw(id)` | takes a notification back, by the id `Send` answered or was given | [withdrawing](#withdrawing) |

## Sending

| | |
|---|---|
| `Send(title, [body], [options])` | shows a desktop notification and answers its id. With no body, the second argument may be the options: `{ Id, Urgency, Icon, Buttons }`. `Urgency` is `"Low"`, `"Normal"` (the default), `"High"` or `"Urgent"`; `Icon` is a theme icon name (the Windows toast uses the shortcut's icon and ignores it); `Buttons` is `[{ Label, Action }]`, where `Label` is prose and `Action` is the key `OnActivate` is handed. Sending again with the same `Id` **replaces** what is showing. The title, body and labels are not looked up in a catalogue -- wrap them in `Locale.Text`. Refused in a project with a `main`, which has no application to send from. On Windows the first send also writes a Start Menu shortcut with the project's `id`, which is what registers the toast's AppUserModelID |

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
| `Buttons` | `[{ Label, Action }]`; `Label` is prose and `Action` is the key `OnActivate` is handed. Up to `MaxButtons`; the rest are ignored, and the notification still arrives |

With no body the second argument may be the options. An option that is not one of
these is refused, and so is an `Urgency` that is none of the four.

**On a freedesktop desktop `High` and `Normal` are the same.** The daemon's
protocol has three levels — low, normal, critical — and `"High"` maps to normal;
only `"Urgent"` is critical, which is the one a daemon may keep on screen. Desktops
that go by the portal or a native service tell all four apart.

### The project needs an `id`

A notification is sent in the name of an application, so `project.btp` has to
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
on a desktop, **the notification portal inside a Flatpak**, a native Cocoa
notification on macOS, and on Windows a WinRT `ToastNotification`. A direct
call to `org.freedesktop.Notifications` would be shorter and would need a hole in
every package's sandbox.

**Windows uses a WinRT toast so it can carry the interaction.** GLib's Windows
backend is `Shell_NotifyIcon` and has no notification actions, so the runtime
sends through `Windows.UI.Notifications` instead. An unpackaged WinRT toast
belongs to an AppUserModelID, registered by a Start Menu shortcut; the first
`Send` writes `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Bintana\<id>.lnk`
with the project's `id`, pointing at the runtime and the project directory. The
toast shows up to three buttons, `OnActivate` receives the action while the
program runs, and `Withdraw` hides it. `Icon` is ignored by the toast (it wears
the shortcut's icon); `Urgency`'s `"High"`/`"Urgent"` ask for a longer/reminder
toast.

[`examples/backup`](https://github.com/getbintana/bintana/tree/main/examples/backup) sends one when a long job ends and the window is not
the one the user is in — `this.Focused` on a form, which turns `false` the moment
another window is activated. [`examples/notify`](https://github.com/getbintana/bintana/tree/main/examples/notify) is the other half: the
message *inside* the window, for when it is the one being looked at.

## Clicking it

| | |
|---|---|
| `OnActivate` | assign `(id, action) => …`: a notification was clicked. `id` is the one `Send` answered; `action` is `null` for the notification itself or the `Action` of the button. `null` takes it off. The handler is looked up when the click arrives. On Windows it is called while the program runs; a click that launches a closed program carries no action yet |
| `CanActivate` (ro) | whether this platform delivers a click: `true` on Linux (the daemon or the portal), macOS, and Windows 10+ where the first `Send` can register the toast's shortcut |
| `MaxButtons` (ro) | how many `Buttons` the platform shows: 3 on Linux and Windows, 1 on macOS. Extra buttons are ignored; the notification still arrives |

```js
Notification.OnActivate = (id, action) => {
    this.Show();
    if (action === "retry") this.Retry();
};

Notification.Send("Backup failed", "The disk did not answer", {
    Id: "backup",
    Buttons: [{ Label: "Retry", Action: "retry" }],
});
```

The handler is looked up **when the click arrives**, not held by the
notification: the desktop may keep a notification after the window that sent it
has gone. On Linux and macOS `Send` installs `app.notification` as the
notification's action, with the id as its target; a click the desktop turns into
that action is what calls `OnActivate`. On Windows the WinRT toast's `Activated`
event is marshalled to the main loop, which calls the same handler.

On macOS only the first button is drawn. On Windows up to three are, and
`OnActivate` is called while the program runs; a click that launches a closed
program carries no action yet. A click with the application closed is not a
supported path; notifications are for a running program.

## Withdrawing

| | |
|---|---|
| `Withdraw(id)` | takes a notification back, by the id `Send` answered or was given. An id nothing is showing under is not an error. On Windows this hides the WinRT toast |

By the id `Send` answered or was given. An id nothing is showing under is not an
error, and neither is withdrawing one the user already dismissed. On Windows this
hides the WinRT toast.

## What is not here

- **Sound, a progress bar and an image.** The freedesktop protocol has them and
  the portal supports fewer; the Windows toast ignores the `Icon` option and
  draws no progress.
- **A notification from a console project.** See above.

## What goes wrong

- **Nothing appeared.** There is no notification daemon in the session, the user
  has turned notifications off for the application, or *do not disturb* is on. None
  of these is visible to the program.
- **It threw about an `id`.** The project does not declare one in `project.btp`.
- **It threw about the display.** The project declares `main`, which never
  initialises GTK.
- **`"High"` looked the same as `"Normal"`.** It is the daemon's protocol; see above.
- **The buttons did not appear.** The platform shows `MaxButtons` of them; macOS
  draws only the first, Windows three.
- **A click did nothing.** `OnActivate` must be assigned, the application must
  still be running, and on Windows the toast must have its Start Menu shortcut
  (the first `Send` writes it).
