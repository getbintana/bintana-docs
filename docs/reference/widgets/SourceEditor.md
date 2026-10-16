# SourceEditor

Code: highlighting, completion, search and gutter marks.

A `GtkSourceView`, which is a `GtkTextView` that knows about programs. It is an
[`Editor`](Editor.md) plus everything below, and it is what the IDE's own tabs
are made of.

## Every member

| | | |
|---|---|---|
| `Completion` | offer the buffer's own words while typing — the floor of what an editor owes, and the whole of what can be known without being told | [completion](#completion) |
| `CompletionTitle` | the heading of the popup your own provider fills | [completion](#completion) |
| `Language` | a GtkSourceView id — `js` `json` `c` `python3` `markdown` `css` `sh` `xml` `sql` `yaml` `diff`… `""` for none | [highlighting](#highlighting) |
| `MatchIndex` (ro) | which one the cursor is standing on — the `3` in *3/12* | [search](#search) |
| `Matches` (ro) | how many the last `Search` found | [search](#search) |
| `ShowLineNumbers` | the gutter's numbers | [highlighting](#highlighting) |
| `ShowMap` | a minimap of the whole file beside the text — its shape, the line the view is on, and a drag or a click to scroll | [the minimap](#the-minimap) |
| `FoldRanges` | the blocks that can be folded, as `[{ Start, End }]` lines, 1-based: what a fold of one would hide is `Start + 1` to `End` | [folding](#folding) |
| `Fold(line, [endLine])` | hides the lines after `line`, down to `endLine` -- or to the end of the range `FoldRanges` has for it, which is what a missing `endLine` asks for | [folding](#folding) |
| `Unfold(line)` | opens the fold that starts on that line | [folding](#folding) |
| `Folded(line)` | whether a fold starts on that line | [folding](#folding) |
| `FoldAll()` | folds every range `FoldRanges` has | [folding](#folding) |
| `UnfoldAll()` | opens every fold | [folding](#folding) |
| `Folds()` | what is folded now, in line order, as `[{ Start, End }]` -- `End` the last line hidden | [folding](#folding) |
| `ShowMarks` | the gutter's marks — see `Mark` | [marks](#marks) |
| `Theme` | `Adwaita` `Adwaita-dark` `classic` `classic-dark` `cobalt` `cobalt-light` `kate` `kate-dark` `oblivion` `solarized-light` `solarized-dark` `tango` | [highlighting](#highlighting) |
| `ClearMarks([kind])` | takes them off every line | [marks](#marks) |
| `FindNext()` | moves to the next match, wrapping around | [search](#search) |
| `FindPrevious()` | and backwards | [search](#search) |
| `Unmark(line, [kind])` | takes marks off that line | [marks](#marks) |
| `Mark(line, kind, [text])` | a gutter mark | [marks](#marks) |
| `InsertSnippet(template)` | text with places to move through, put at the cursor **in place of the selection** | [snippets](#snippets) |
| `Marks([kind])` | **a record per mark**, in line order | [marks](#marks) |
| `Replace(text)` | the match the cursor is standing on | [search](#search) |
| `ReplaceAll(text)` | every match | [search](#search) |
| `Search(text, [{CaseSensitive, WholeWord, Regex}])` | how many there are, highlighting every one | [search](#search) |
| `ShowCompletion()` | opens the completion popup from code | [completion](#completion) |
| **event** `Complete(word, line, column, text)` | a completion was asked for | [completion](#completion) |
| **event** `FoldChange(line, folded)` | the user clicked a fold marker in the margin | [folding](#folding) |

`Text` is [`Editor`](Editor.md)'s here and is **not** a translated property: a
catalogue must never rewrite code.

## Highlighting

| | |
|---|---|
| `Language` | a GtkSourceView id — `js` `json` `c` `python3` `markdown` `css` `sh` `xml` `sql` `yaml` `diff`… `""` for none. **`PropertyOptions("Language")` asks this machine what it has**, which is the honest list rather than one written down here |
| `Theme` | `Adwaita` `Adwaita-dark` `classic` `classic-dark` `cobalt` `cobalt-light` `kate` `kate-dark` `oblivion` `solarized-light` `solarized-dark` `tango`. Default `"classic"` |
| `ShowLineNumbers` | the gutter's numbers. Default `true` |

## The minimap

| | |
|---|---|
| `ShowMap` | a minimap of the whole file beside the text — its shape, the line the view is on, and a drag or a click to scroll. Default `false`. Built the first time it is turned on, so an editor that never shows one pays nothing |

A column beside the text drawing the **whole file** small: its shape, where the
view is, and a click or a drag to scroll. Off by default and built the first
time it is turned on, so an editor that never shows one pays nothing. It takes
about a hundred pixels of the room, which a wrapped text feels as more lines.

## Folding

| | |
|---|---|
| `FoldRanges` | the blocks that can be folded, as `[{ Start, End }]` lines, 1-based: what a fold of one would hide is `Start + 1` to `End`. **The program says** -- only whoever knows the language knows where a block ends -- and the editor draws a marker beside each `Start` (`▼` open, `▶` folded) that a click toggles. Assigning is all or nothing, and a row that is not `1 <= Start < End` is a `RangeError`. Keep it in step with the text |
| `Fold(line, [endLine])` | hides the lines after `line`, down to `endLine` -- or to the end of the range `FoldRanges` has for it, which is what a missing `endLine` asks for. The line itself stays whole. A fold is text made invisible, so the cursor is moved out of it, and **an edit at or inside a fold opens it**. **`RangeError`** for a line that is not there or a range `FoldRanges` does not have |
| `Unfold(line)` | opens the fold that starts on that line. `true` when there was one |
| `Folded(line)` | whether a fold starts on that line |
| `FoldAll()` | folds every range `FoldRanges` has. How many were closed |
| `UnfoldAll()` | opens every fold. How many were open |
| `Folds()` | what is folded now, in line order, as `[{ Start, End }]` -- `End` the last line hidden. Read off the text itself, so it is right after lines were added or taken away above |
| **event** `FoldChange(line, folded)` | the user clicked a fold marker in the margin. `folded` is what it is now. **Only the click**: a fold made by `Fold` from code is not announced, because the program that made it knows |

The editor hides lines and draws a marker; **the program says which blocks can be
folded**, because only whoever knows the language knows where one ends. A range
is `{ Start, End }` in lines, 1-based, and a fold of it hides `Start + 1` to `End`
**whole**, so the line it hangs from stays and so does whatever follows:

```js
ed.FoldRanges = [{ Start: 1, End: 3 }];       // lines 2 and 3 can be hidden
ed.Fold(1);                                    // ...and now they are
ed.Text;                                       // still all of the file
```

A marker (`▼` open, `▶` closed) is drawn beside each `Start`, and a click on it
toggles the fold and raises `FoldChange(line, folded)` — **only the click**: a fold
made by `Fold` from code is not announced, because the program that made it knows.
`FoldRanges` is yours to keep in step with the text; `Folds()` is read off the text
itself, so it is right after lines were added above a fold.

**A fold is a view and not an edit.** `Text`, `Selection` and `LineOf` count hidden
lines as lines, so saving a folded buffer saves the whole file.

**What opens a fold, because the alternative is text that cannot be seen:**

- an edit that lands inside it, or that inserts text which would be hidden. An edit
  at the end of the line it hangs from is an ordinary edit and leaves it shut;
- moving the cursor into it — `GotoLine`, `Select`;
- a search. **`Search` and `FindNext` open every fold**: the library's search does
  not look in hidden text (the same word is one match before a fold and none after),
  and *nothing found* about code that is in the file would be a wrong answer in silence.

**The line numbers skip the hidden lines**, which needed the editor to draw its own
the first time anything is folded (the library's counter prints a hidden line's number
over the next one's). `ShowLineNumbers` follows whichever is in use.

## Snippets

| | |
|---|---|
| `InsertSnippet(template)` | text with places to move through, put at the cursor **in place of the selection**. `${1:name}` is a place with a default that is selected when the cursor arrives, the same number twice is one place typed once and shown in each, and `$0` is where the cursor ends. Tab goes to the next place and Shift+Tab to the one before, which the editor does by itself while the snippet lasts; a template written at column 0 takes the indentation of the line it lands on. **`RangeError`** when the template does not parse |

A template with places in it, put at the cursor **in place of the selection**:

```js
/* the word "for" selected, then: */
ed.InsertSnippet("for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    $0\n}");
```

`${1:i}` is a place with a default, selected when the cursor arrives so typing
replaces it; the same number twice is **one place typed once and shown in each**;
`$0` is where the cursor ends. **Tab goes to the next place and Shift+Tab to the
one before, and the editor does that itself while the snippet lasts** — which is
why this is a verb and not a loop over `Insert` and `Select`. A template written
at column 0 takes the indentation of the line it lands on.

**It is the verb and not the trigger.** Turning a typed word and Tab into a
snippet is the program's, through [`KeyPreview`](Editor.md#keys-before-the-editor-has-them):
`Tab` has already been taken by the view when `KeyPress` hears of it.

**GtkSourceView's parser is lenient.** A template it cannot read at all (a lone
`$`) is a `RangeError`; most mistakes are not one — `${1:unclosed` is taken as
text — and a few (`$1` with no other place, `${0}`) make the library print its
own `CRITICAL` and insert nothing. Write the places and check what comes out.

## Search

| | |
|---|---|
| `Search(text, [{CaseSensitive, WholeWord, Regex}])` | how many there are, highlighting every one. **It opens every fold**: the search does not look in hidden text, and *nothing found* about code that is in the file would be wrong. **It does not move the cursor**: typing in a find field and jumping to a match happen at different moments. `Regex: true` is **PCRE2** — GtkSourceView's own engine and not the language's [`Regex`](../../llm/library.md#regex): always multiline, and `\d` `\w` `\b` are Unicode-aware. **It does not move the cursor**: typing in a find field and jumping to a match happen at different moments, and a find bar that jumped on every keystroke would drag the view about while somebody is still typing |
| `Matches` (ro) | how many the last `Search` found |
| `MatchIndex` (ro) | which one the cursor is standing on — the `3` in *3/12* |
| `FindNext()` | moves to the next match, wrapping around. **Opens every fold** first, as `Search` does |
| `FindPrevious()` | and backwards |
| `Replace(text)` | the match the cursor is standing on |
| `ReplaceAll(text)` | every match |

**`Regex: true` is not the language's [`Regex`](../../llm/library.md#regex), and
the differences are the kind a pattern notices.** The search is GtkSourceView's
`GtkSourceSearchContext`, which compiles with GRegex/PCRE2: it is **always
multiline** (`^` and `$` match at every line), `\d`, `\w` and `\b` are
**Unicode-aware** (`ñ` and `٣` are one of each), and `$` also matches before a
final newline. Its grammar is PCRE2's as well — `\p{L}`, `\K`, atomic groups and
possessive quantifiers all compile here — and in a `Regex` those either mean
something else or do not parse, while `\w` is ASCII, the pattern is single-line
unless `{ Multiline: true }` says otherwise, and `\p{L}` needs
`{ Unicode: true }`. A find bar and a lint that share a pattern should write it
the language's way.

## Marks

| | |
|---|---|
| `Mark(line, kind, [text])` | a gutter mark. `kind` is `Error` `Warning` `Info` `Bookmark` — or `Added` `Removed` `Gap`, which **paint the line** — and `text` is its tooltip |
| `Unmark(line, [kind])` | takes marks off that line |
| `Marks([kind])` | **a record per mark**, in line order: `{ Line, Kind, Text }` — not a list of line numbers, which is what "the lines that carry one" was read as by the first thing that used it |
| `ClearMarks([kind])` | takes them off every line |
| `ShowMarks` | the gutter's marks — see `Mark` |

### The three that paint the line

`Added`, `Removed` and `Gap` are about the **line** rather than about a message,
and they tint it: a translucent green, a translucent red and a dim grey, blended
over whatever the theme paints, so one pair of numbers is right in a light scheme
and in a dark one. `Added` and `Removed` carry a gutter icon as well, because a
diff read by somebody who cannot tell the two tints apart is a diff with nothing
in it.

`Gap` is the odd one: a line that is **not there** on this side. A side-by-side
diff pads, so that ten added lines on the right face the place they were added on
the left — and a blank line meaning *nothing here* must not look like a blank
line that is in the file.

```js
Before.Mark(12, "Removed");
After.Mark(12, "Added");
After.Mark(13, "Gap");        // the line 13 on the left has and this one has not
```

What they are *for* is yours: an error from a compiler, a breakpoint, the line a
search came from. The IDE marks the line an exception names, which is how a
message in its log becomes a place in a file — and its *Changes* window is these
three.

## Completion

| | |
|---|---|
| `Completion` | offer the buffer's own words while typing — the floor of what an editor owes, and the whole of what can be known without being told |
| `CompletionTitle` | the heading of the popup your own provider fills. **Translated** |
| `ShowCompletion()` | opens the completion popup from code |
| **event** `Complete(word, line, column, text)` | a completion was asked for. Answer with a list, or nothing. An entry is a **word**, or `{ Text, Detail }` for one that says what it is beside itself — a type, a one-line description. An entry that is neither is skipped, not refused |

```js
Editor_Complete(word, line, column, before) {
    if (!before.endsWith("this.")) return [];
    return this.controls.map((c) => ({ Text: c.Name, Detail: c.TypeName }));
}
```

**Nothing here is inferred**, which is the whole reason a completion this useful
is possible without a parser: the runtime publishes what it knows about itself
and the `.form` beside a class says what every control on it is, so the
completions worth having are table lookups. Where nothing says what a name is,
answer nothing — see [ide.md](../../ide.md).

## What goes wrong

- **A language is not highlighted.** This machine's GtkSourceView does not have
  it; ask `PropertyOptions("Language")`.
- **The search moved the view while somebody was typing.** It does not —
  something is calling `FindNext` on every keystroke.
- **A `.form` says `TextEditor` and the source properties do nothing.** The
  control was renamed: what loads is the plain editor, and the loader assigns
  what a file declares without asking whether the class has it. Renaming the type
  in the file is the whole of the fix.

## See also

[`Editor`](Editor.md) · [`TextEditor`](TextEditor.md) ·
[ide.md](../../ide.md), which is this control driven in anger
