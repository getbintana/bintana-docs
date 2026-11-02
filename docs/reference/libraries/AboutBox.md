# AboutBox

Who the program is and which version — the Help menu's last item. Part of
[`lib/dialog`](../../llm/dialog.md); read that for the options in full.

```js
AboutBox.Show({ Summary: Locale.Text("A small virtual machine manager."),
                Copyright: "Copyright © 2026 Somebody — MIT License",
                Website: "https://example.org/box" });
```

## Every member

| Member | What it is | More |
|---|---|---|
| `Show([options])` | builds the about box, shows it modal, and answers the shown window | [showing](#showing) |
| `Text` | the window title | [showing](#showing) |
| `Modal` | blocks its parent | [showing](#showing) |

Everything on `Widget` and on `Form` is on it too.

## Showing

| Member | |
|---|---|
| `Show([options])` | builds the about box, shows it modal, and answers the shown window. The name, version and icon come out of `project.json` unless given; the summary, copyright and website are shown only when given. There is no callback: nothing is asked |
| `Text` | the window title. **Translated**. `Caption` is an alias |
| `Modal` | blocks its parent. Made transient for the active window on `Show()` |

**The name, the version and the icon are the project's** — `Application.Name`,
`Application.Version` beside the runtime's `BTA_VERSION`, and the icon named
like `Application.Id` when `icons/` has one. `Summary`, `Copyright` and
`Website` are hidden until given. `Name`, `Version`, `Icon` and `Title` replace
what the class would write; [`dialog.md`](../../llm/dialog.md#aboutbox) has
the table.
