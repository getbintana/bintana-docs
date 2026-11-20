# apps

The applications a user installs for themselves: one menu entry each, written
without root and without a package, and the one place to see them again, read
what each installed, and take them out.

```json
{ "name": "Notes", "startup": "MainForm", "uses": ["apps"] }
```

A user application is a `.desktop` file in `~/.local/share/applications` on
Linux and a `.lnk` in the Start Menu folder on Windows. The runtime reads and
writes both formats -- [`Desktop.Entries`](library.md#desktopentries) and
`Desktop.Shortcut` -- and `Apps` is what knows which of those entries came from
the IDE and what each one is called.

The IDE uses it in two places, *Project → Install as user application…* and
*Project → Installed applications…*, and `bintana apps` is the same list from a
terminal:

```sh
bintana apps                    # id, name and project, one per line
bintana apps files <id>         # what that entry installed
bintana apps remove <id>...     # out of the menu
bintana apps --json             # one object per line
```

A program that installs itself writes the same entry:

```js
Form_Open() {
    Apps.Install(Application.Directory, { Name: "Notes",
                                          Comment: "Write things down",
                                          AppId: Application.Id });
}
```

**What an install is, and what it is not.** It is one file: the menu entry, plus
the `.ico` Windows needs when the application's icon is a PNG. Nothing is
copied. The entry points at the project, so the project has to stay where it
is -- and removing the entry touches the project and its files in no way. An
entry whose project was moved, renamed or deleted is one pointing at nothing,
which is why it can be removed without the project.

## Apps

| | |
|---|---|
| `Apps.Install(project, fields)` | writes the entry, replacing this project's old one under another id; answers its path |
| `Apps.Uninstall(id)` | removes the entry, answering whether there was one |
| `Apps.Installed(project)` | the entry that points at this project, or `null` |
| `Apps.List()` | every entry this user has that the IDE installed, sorted by the name the menu shows |
| `Apps.Files(id)` | the files one entry installed: its entry, and the `.ico` on Windows |
| `Apps.Entry(project, fields)` | the entry as the platform's installer takes it: a `.desktop` shape, or a target and an argv |
| `Apps.EntryId(appId, name)` | the name an entry is installed under: `<id>.devel`, or a slug of the name |
| `Apps.IdFor(name)` | the id for a name -- letters, digits, `-`, `_` and `.` -- made from what was typed |
| `Apps.DefaultIcon(project, id)` | what the icon field starts on: the project's own drawing, or a theme name |

`fields` is `{ Name, Comment, Icon, AppId }`. `Name` is what the menu shows,
`Comment` its tooltip (left out when empty, which is better than an empty box),
`AppId` the project's application id, and `Icon` a theme name or a path.

**An entry is ours by the project it points at, and not by its file name.** The
key is `X-Bintana-Project` on Linux and `Project` on Windows, and it carries the
project's absolute path. The file name is the entry's id, which a rename moves;
the path is what the entry really points at. An entry without the key is
somebody else's -- a packaged application exports its own `.desktop` into the
same folder -- and neither `List` nor `Uninstall` touches it.

**`<id>.devel` and not `<id>`.** A `.desktop` file's name is its desktop-file
id, and `<id>.desktop` is exactly what a Flatpak of the same application
exports. A user-level entry of that name takes precedence, so installing from
the IDE would hide the packaged application from the menu and the menu would
start the source tree instead. `.devel` is the suffix GNOME's own development
builds use. The window's class is still the application's id -- a different key,
`StartupWMClass` -- and it is written only when the project declares an id,
because a window class nothing will ever have cannot be matched by a dock.
