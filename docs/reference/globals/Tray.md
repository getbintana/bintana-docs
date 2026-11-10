# Tray

A status icon for the application, with a native menu: the notification area on
Windows, the menu bar on macOS, a `StatusNotifierItem` on Linux. It is not a
control and not a `FormPart`: it outlives the window that made it.

```js
const tray = new Tray({ Icon: "org.example.Monitor-symbolic",
                        Tooltip: Locale.Text("Monitor PZEM") });

tray.Menu = [
    { Text: Locale.Text("Abrir"), Action: "show" },
    { Text: Locale.Text("Sondeo"), Action: "poll", Checked: true },
    { Separator: true },
    { Text: Locale.Text("Salir"), Action: "quit" },
];

tray.OnClick = () => this.Show();
tray.OnMenu  = (action) => {
    if (action === "show") this.Show();
    if (action === "poll") this.TogglePolling();
    if (action === "quit") Application.Quit();
};

tray.Show();
```

One tray per application: a second `new Tray()` is refused. `Show` adds the
icon and `Hide` removes it; the object keeps its icon, tooltip and menu, so a
second `Show` is cheap. A visible tray holds the application alive, so closing
the window does not end the program.

## Every member

| | | |
|---|---|---|
| `Available` (static, ro) | whether this platform can show a tray icon now | [the platforms](#the-platforms) |
| `CanMenu` (static, ro) | whether the platform can show the menu; false is a documented limit | [the platforms](#the-platforms) |
| `Hide()` | remove the icon but keep the object, so `Show` is cheap | [showing](#showing) |
| `Icon` | a theme name, or a `.ico`/image path | [the icon](#the-icon) |
| `Menu` | an array of `{ Text, Action, Enabled, Checked, Separator, Items }`; assigning it validates the whole tree and rebuilds the native menu | [the menu](#the-menu) |
| `OnClick` | assign `() => …`: the primary click | [clicking](#clicking) |
| `OnMenu` | assign `(action) => …`: a menu item was chosen | [clicking](#clicking) |
| `Show()` | add the icon and its menu; answers the tray | [showing](#showing) |
| `Tooltip` | the text the platform shows on hover | [the icon](#the-icon) |
| `Visible` (ro) | whether the icon is shown now | [showing](#showing) |

## Showing

| | |
|---|---|
| `Show()` | add the icon and its menu; answers the tray. Refused with no application, or with no status-notifier host on the desktop |
| `Hide()` | remove the icon but keep the object, so `Show` is cheap. Answers the tray |
| `Visible` (ro) | whether the icon is shown now |

`Show` is where the platform is asked. On Linux it needs a
`StatusNotifierWatcher`; GNOME without the AppIndicator extension has none, and
the sentence says so. Windows and macOS answer `Tray.Available` when their
backend is built; until then `Show` names the missing backend.

## The icon

| | |
|---|---|
| `Icon` | a theme name, or a `.ico`/image path. On Windows the theme name is resolved through the icon theme and a `.ico`/PNG/SVG path is loaded directly; an empty value falls back to the executable's icon. Set before or after `Show` |
| `Tooltip` | the text the platform shows on hover |

A theme name is the portable spelling: `"org.example.Monitor-symbolic"`. A path
is for a program that carries its own image; Windows expects an `.ico` and
macOS a template image, while on Linux the file is added to the icon theme path.
An unknown theme name is not an error — the desktop chooses its fallback.

## The menu

| | |
|---|---|
| `Menu` | an array of `{ Text, Action, Enabled, Checked, Separator, Items }`; assigning it validates the whole tree and rebuilds the native menu. `Text` and button labels are prose -- wrap them in `Locale.Text` |

`Menu` is an array of items:

| key | |
|---|---|
| `Text` | the prose the person reads; wrap it in `Locale.Text` |
| `Action` | the key `OnMenu` is handed. Required unless the item has `Items` |
| `Enabled` | `true` by default |
| `Checked` | makes it a check item; the platform draws the tick |
| `Separator` | `true` makes a separator; it takes no `Text`, `Action`, `Checked` or `Items` |
| `Items` | a submenu, an array of the same shape |

The whole tree is validated on assignment, before the native menu is touched: a
missing `Text`, an `Action` that is empty, a duplicate `Action`, a separator
with children, or an unknown key is a sentence. The old menu stays when the new
one is refused. Assigning `Menu` rebuilds the native menu; the platform does not
own the check state — the handler changes it and assigns `Menu` again.

## Clicking

| | |
|---|---|
| `OnClick` | assign `() => …`: the primary click. On macOS with a `Menu`, the click opens the menu and this is not called |
| `OnMenu` | assign `(action) => …`: a menu item was chosen; `action` is its `Action`. The menu is data and actions, never callbacks |

The menu is **data and action strings**, never callbacks: the desktop can keep
it for as long as the icon lives, and a JavaScript function must not be held by
something that outlives its window. `OnMenu` is looked up when the action
arrives.

## The platforms

| | |
|---|---|
| `Available` (ro) | whether this platform can show a tray icon now: Linux needs a StatusNotifierWatcher; Windows and macOS answer true when built |
| `CanMenu` (ro) | whether the platform can show the menu; false is a documented limit |

| | Linux | Windows | macOS |
|---|---|---|---|
| mechanism | `StatusNotifierItem` + `dbusmenu` | `Shell_NotifyIcon` + `HMENU` | `NSStatusItem` + `NSMenu` |
| state in this version | **built** | stub: `Available` false | stub: `Available` false |
| needs | a `StatusNotifierWatcher`; AppIndicator extension on GNOME | nothing extra | nothing extra |
| menu | `com.canonical.dbusmenu` | native popup | native menu |

On Linux the menu is drawn by the panel or shell, not by a window of ours; the
`dbusmenu` tree is exported at `/MenuBar`. A desktop with no watcher gets
`Available=false`; the program falls back to its window. Flatpak needs
`--talk-name=org.kde.StatusNotifierWatcher`.

## What goes wrong

- **`Show` threw about a watcher.** There is no `StatusNotifierWatcher` on the
  session bus: GNOME without its AppIndicator extension, or a session with no
  panel. `Tray.Available` told the truth before the call.
- **A second `new Tray` threw.** An application has one status icon.
- **A menu was not replaced.** The assignment was refused; the previous menu is
  still showing. The sentence names the item.
- **Nothing happened on a click.** On macOS a click opens `Menu` when there is
  one; on Linux the panel may call `Activate` or open the menu according to its
  own setting.

## What is not here

- **Several tray icons per application.** One is the API.
- **Notifications through the tray.** `Notification` is its own object; on
  Windows its WinRT toast adds no tray icon, so the two are independent.
- **A tray in a `Task`.** No main loop, no icon.
- **Global hotkeys.** They are the desktop's, not this object's.
- **The Windows and macOS backends in this version.** The API is ready; the
  plan and the stubs are in the runtime's `docs/plans/tray-plan.md`.
