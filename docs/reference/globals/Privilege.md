# Privilege

A privileged task is **a helper project**, not a function that runs as root.
The application asks the operating system to start that project elevated; the
OS shows its own consent dialog; the helper does one thing, prints its result
and exits. The window the person is using is never elevated.

```js
// project.btp
{
  "name": "myapp",
  "startup": "MainForm",
  "sources": ["MainForm.js"],
  "privileged": ["tools/install"]
}
```

```js
// MainForm.js
BtnInstall_Click() {
    if (!Privilege.CanElevate) {
        Message.Warning("This system has no way to ask for permission.");
        return;
    }
    Privilege.Run("tools/install", ["--all-users"], {},
        (line) => this.Log(line),
        (code) => { if (code === 0) Message.Info("Installed."); });
}
```

```js
// tools/install/Main.js
export function Main() {
    if (!Privilege.Elevated)
        throw new Error("this helper must be elevated");

    const who = Privilege.Invoker;   // the person at the desktop, not root
    // ... write /usr/share/... or HKLM ...
    print(JSON.stringify({ Ok: true, User: who.Name }));
}
```

## Every member

| | | |
|---|---|---|
| `CanElevate` | whether the OS can ask | [where the dialog comes from](#where-the-dialog-comes-from) |
| `Elevated` | whether this process already has root/administrator rights: true in a helper, false in the application that asked for one | [the helper](#the-helper) |
| `Invoker` | `{ Id, Name, Home }` of the user who asked for the helper | [the helper](#the-helper) |
| `Run(helper, [args], [options], [onLine], [onExit])` | runs a helper project declared in `project.btp`'s `"privileged"` list, with the platform's consent dialog | [running a helper](#running-a-helper) |
| `Wait(helper, [args], [options])` | the same, run to the end | [waiting](#waiting) |

## The helper

**The helper is a project with a `main`.** It is a console project: no GTK, no
window, no form. `project.btp`'s `"privileged"` array names the helper
directories, relative to the project and inside it; `Run` refuses anything else,
and refuses a helper whose `project.btp` declares `startup` instead of `main`.

The application is trusted; the guard is against a typo and against running an
unintended project as root, not a sandbox. The security boundary is the OS's
consent dialog, and the password never reaches the runtime.

The helper receives the arguments as `Application.Arguments`, and `print` is
its result: one line or JSON per line, which the job's `onLine` receives. It
ends when its `main` returns, like any console project.

## Where the dialog comes from

| | |
|---|---|
| Linux | `pkexec`, with polkit's agent asking. `Privilege.CanElevate` is false in a Flatpak and when `pkexec` is not installed |
| Windows | UAC: the runtime's `--elevate` launcher calls `ShellExecuteEx("runas")` on the helper, and `CanElevate` is true outside a sandbox |
| A process already elevated | no dialog: `Run` starts the helper directly, and `Elevated` is true |

The helper's `Privilege.Invoker` is the account that asked, not the account the
helper runs as. On Linux `pkexec` gives it as `PKEXEC_UID` (and `sudo` as
`SUDO_UID`) because `HOME` there is `/root`; on Windows the elevated token is
the same user's, so it is the current account.

## Running a helper

`Privilege.Run` answers the same handle `Exec` does: `Running`, `ExitCode`,
`Write`, `Stop`, `Kill`, and the `onLine`/`onExit` callbacks, all with the same
meaning. `options` are `Exec`'s too (`Timeout`, `Env`, `Dir`). The helper is a
child, so `Stop` ends it the way it ends any child.

On Windows the helper is started on the secure desktop and its output arrives
when it exits: the unelevated launcher forwards the file UAC let the helper
write. On Linux the lines arrive as `pkexec` forwards them. A window that wants
progress should show its own and read the lines; it does not need the helper to
draw one.

## Waiting

`Privilege.Wait` is the blocking spelling, with `{ ExitCode, Output }` (and
`Errors` when the streams were asked for apart). **It blocks the main loop**, so
it is for a console project or a place that can wait, not for a click handler.
`Run` is the one a window uses.

## What goes wrong

- **The helper is a form.** A `startup` project would open a window as root;
  `Run` refuses it before the dialog. A helper is a `main`.
- **The helper is not in `"privileged"`.** The refusal names the list; add the
  directory, relative to the project.
- **UAC was cancelled, or the polkit agent is not there.** The child exits with
  its status and the line the launcher printed; `onExit` sees it.
- **The helper reads `HOME` on Linux.** It is `/root`; use `Privilege.Invoker.Home`
  for the person's own files, and `chown` anything written into their home.
- **A `Task` called `Privilege.Run`.** A worker has no display for the OS
  dialog; it is refused. Ask from the main thread and hand the work to the
  helper.
- **The application was started elevated.** `Elevated` is true and `Run` starts
  the helper without a dialog; that is the person's choice, and the helper still
  has its own `main` and guard.

## See also

[`Exec`](Exec.md) · [`Application`](Application.md) ·
[`File`](File.md) · [`project.btp`](../../formats.md)
