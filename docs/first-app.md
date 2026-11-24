# Your first Bintana app

Five minutes, in the IDE, no code written by hand except one method.
What you build is a window with a field, a button, and a greeting —
the same shape as [`examples/hello`](https://github.com/getbintana/bintana/tree/main/examples/hello), minus its extras.

## 1. New project

`Ctrl+Shift+N`, name it, pick a folder. Keep the id it proposes
(`io.github.you.MyApp`) or write your own: every application needs one, since
its settings and data are kept under it. The IDE creates the shape every
project has:

```
myapp/
  project.btp      what to run: `startup` names the class to open
  forms/Form1.form  the window: a widget tree, in JSON
  forms/Form1.js    its behaviour: one class
```

`Form1` is already open in the designer: an empty window.

## 2. Draw the window

From the palette, drop a `Label`, a `TextBox` and a `Button` onto the form.
In the property grid:

- `Label1.Text = "Your name:"`
- `Button1.Text = "Greet"`

Positions and sizes belong in the `.form` — that is what the designer writes.
Nothing in the `.js` will name a coordinate.

## 3. Answer the button

Double click `Button1`. The IDE opens `Form1.js` with the handler it will
call, named after what raises it:

```js
Button1_Click() {
    let name = this.TextBox1.Text.trim();
    if (!name) {
        Message.Warning("Type a name first.");
        return;
    }
    Message.Info("Hello {0}!", name);
}
```

The name *is* the wiring: `Button1_Click`, `TextBox1_Change`, `Form_Open`.
Nothing is registered, there is no `addEventListener`.

`Message.Info` owns its text position, so the literal with `{0}` holes is
what the translator sees — and never a template literal in it, which would
arrive already filled in and no catalogue could match. `Message` shows and
returns: it does not block, and there is no answer. A question that needs
one is a form of your own.

## 4. Run it

Run. Type a name, press the button — or Enter, once you wire
`TextBox1_Activate` to call the same method. Try it empty to meet the
`Warning`.

## 5. Where everything lives

- **Layout** in `Form1.form` (what the designer drew).
- **Behaviour** in `Form1.js` (what you wrote).
- **Text a person reads** in the `.form` needs nothing; text built at
  runtime goes through `Message`'s `{0}` holes or `Locale.Text`.

### Where the program's own files go

The project folder is the program, not its data: it is what you hand to
somebody, export, and package. What the program reads and writes while it runs
goes by what it is:

| what | where | |
|---|---|---|
| a file the project brings — an image, a template, reference data | `File.Join(Application.Directory, "…")` | travels with the program |
| what the program makes and keeps — a database, a saved document | `File.Join(Application.DataDirectory, "…")` | `~/.local/share/<id>`, `%LOCALAPPDATA%\<id>` on Windows |
| what can be made again — thumbnails, a downloaded copy | `File.Join(Application.CacheDirectory, "…")` | a backup skips it |
| a setting a person chose | `Settings.Set(…)` | in `Application.ConfigDirectory` |

**Never a bare relative path.** `Database.Sqlite("clients.db")` is relative to
the folder the program was *started from*, and that is a different folder
every time:

| started by | a relative path lands in |
|---|---|
| Run, in the IDE | the project folder — so it is packaged with the program |
| the Start Menu, after the Windows installer | the installation folder — replaced by the next update, deleted by the uninstaller |
| a desktop menu entry on Linux | usually the user's home |

It works while you try it and loses the data once it is installed. The
installer and `tools/pack` name every database they carry
(`carries: clients.db`), which is how one left in the project by a Run is
caught before it ships.

**Shipping a database on purpose** is ordinary — keep it in the project, in a
folder of its own, and choose by whether the program changes it:

```js
/* Reference data the program only reads: in place, so an update brings the
 * new one. */
const prices = Database.Sqlite(File.Join(Application.Directory, "data", "prices.db"));

/* A starting copy the program then changes: copied the first time, and the
 * copy is the one it writes. The installed one is never written. */
const mine = File.Join(Application.DataDirectory, "clients.db");
if (!File.Exists(mine))
    File.Copy(File.Join(Application.Directory, "data", "clients.db"), mine);
const db = Database.Sqlite(mine);
```

## 6. Put it in your menu

*Project → Install as user application…* writes one `.desktop` file under
`~/.local/share/applications` pointing at this runtime and this project, with
the name and the icon you choose. The app appears in the desktop's menu for
this user — no root, no package — and the same dialog removes it. See
[installing it in the menu](ide.md#installing-it-in-the-menu).

## Next

- [`examples/hello`](https://github.com/getbintana/bintana/tree/main/examples/hello): this same app with a check box
  (reading `Active`), an `About` component of its own, and `po/es.po` —
  run it with `LANGUAGE=es` to see the greeting translated.
- [`reference/`](reference/README.md): one page per control and per global,
  for the person at the IDE — press F1 over anything. This is where you go
  when you know *which* control and want *every member explained*.
- [`llm/`](https://github.com/getbintana/bintana-llm/blob/main/docs/llm/README.md): the same surface said briefly, for a model — or
  for writing every file by hand. Not this road.
