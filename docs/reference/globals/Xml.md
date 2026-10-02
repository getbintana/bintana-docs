# Xml

An XML document: parse it, walk it, change it, write it.

XML is not JSON with pointier brackets. JSON and JavaScript are the same value
model — object, list, scalar — which is why a [`Record`](Record.md) survives a
JSON file as itself; XML is a **document** model, and attributes, element order
(an MSPDI schema is an `xsd:sequence`), namespaces and mixed content have
nowhere to go in a plain object. So this answers a tree, and a shape maps onto an
element by **declaring** it — [`Record`](Record.md)'s `static Xml` and its
`LoadXml`/`ToXml`/`SaveXml`. [`docs/plans/xml-plan.md`](https://github.com/getbintana/bintana/blob/main/docs/plans/xml-plan.md)
is where that design is argued.

## Every member

| | | |
|---|---|---|
| `Parse(text)` | the document, or a `SyntaxError` naming línea and columna | [reading](#reading) |
| `ParseBytes(bytes)` | the same, and the declaration's encoding is honoured — what `File.LoadXml` uses | [reading](#reading) |
| `Element(name)` | a detached element; its own tree, not in any document | [building](#building) |
| `Stringify(node)` | the canonical text: declaration, indented by two, one trailing newline | [writing](#writing) |
| `Available` (ro) | whether this build has libxml2; the verbs refuse with a sentence when it does not | [availability](#availability) |
| `Root` (ro) | the root element of a document, or `null` | [reading](#reading) |
| `Name` (ro) | the local name, the prefix, the URI — `""` when there is none | [names and namespaces](#names-and-namespaces) |
| `Prefix` (ro) | the prefix, `""` when there is none | [names and namespaces](#names-and-namespaces) |
| `Namespace` (ro) | the URI, `""` when there is none | [names and namespaces](#names-and-namespaces) |
| `SetNamespace(uri, [prefix])` | puts the element in that namespace, reusing a declaration already in reach -- in a detached tree too, where it used to declare it again | [names and namespaces](#names-and-namespaces) |
| `DeclareNamespace(uri, prefix)` | binds `prefix` to `uri` on this element, for its attributes and what is under it, **without putting the element in that namespace** -- what `SetAttrNS` then finds, as OOXML's `xmlns:r` on a workbook and `r:id` on each sheet | [names and namespaces](#names-and-namespaces) |
| `Text` | all the character data under an element; assigning replaces the children | [reading](#reading) |
| `Attr(name)` | the value of an attribute **with no namespace**, `""` for one that is present and empty, `null` for one that is not | [attributes](#attributes) |
| `SetAttr(name, value)` | both as text; creates or replaces | [attributes](#attributes) |
| `RemoveAttr(name)` | takes the attribute with no namespace away; one that is not there is not an error | [attributes](#attributes) |
| `AttrNS(uri, name)` | the same for an attribute in a namespace — `xml:lang` is `AttrNS("http://www.w3.org/XML/1998/namespace", "lang")`, since an unprefixed name means no namespace at all | [attributes](#attributes) |
| `SetAttrNS(uri, name, value)` | writes one | [attributes](#attributes) |
| `RemoveAttrNS(uri, name)` | takes away the attribute in that namespace; one that is not there -- or only a DTD's default -- is not an error | [attributes](#attributes) |
| `AttributeNames()` | the local names, sorted as the file had them | [attributes](#attributes) |
| `Children` (ro) | its element children, in order | [children](#children) |
| `Find(name)` | the first direct child element with that local name, or `null` | [children](#children) |
| `FindAll(name)` | every direct child element with it | [children](#children) |
| `Add(child)` | a node or an element name | [building](#building) |
| `Insert(index, child)` | before the element child at `index`, or at the end | [building](#building) |
| `Remove()` | takes the node out for good | [building](#building) |
| `Parent` (ro) | the parent element, or `null` for a root or a detached node | [children](#children) |
| `Copy()` | a detached subtree of its own | [building](#building) |

`File.LoadXml` and `File.SaveXml` are the file roads; see [`File`](File.md).

## Reading

| | |
|---|---|
| `Parse(text)` | the document, or a `SyntaxError` naming línea and columna |
| `ParseBytes(bytes)` | the same, and the declaration's encoding is honoured — what `File.LoadXml` uses |
| `Root` (ro) | the root element of a document, or `null` |
| `Text` | all the character data under an element; assigning replaces the children. **Text XML cannot carry is refused**, naming the character: a NUL, a control character other than tab, newline and return, U+FFFE/FFFF or half a surrogate pair -- written, each was a document `Xml.Parse` could not read back, and a NUL cut the text short in silence |

```js
const doc   = File.LoadXml("plan.xml");       // the error names the file
const tasks = doc.Root.Find("Tasks").FindAll("Task");

for (const task of tasks)
    print(`${task.Find("UID").Text} ${task.Find("Name").Text}`);
```

`File.LoadXml` reads **bytes** and lets the declaration say what encoding they
are in: decoding as UTF-8 first would destroy an ISO-8859-1 document before the
line that says so could be read. `Xml.Parse` is the string road, for text that
already came from somewhere else — an `Http` body, a `SourceEditor`.

A malformed document **throws**, with `línea:columna` in front of the parser's
sentence; there is no partial answer to check for.

## Children

| | |
|---|---|
| `Children` (ro) | its element children, in order |
| `Find(name)` | the first direct child element with that local name, or `null` |
| `FindAll(name)` | every direct child element with it |
| `Parent` (ro) | the parent element, or `null` for a root or a detached node |

`Children` is the **element** children only. Comments and processing
instructions are nodes in the tree and are written back where they were, but
they are not what a data walk is for; the same goes for text nodes, which an
element's `Text` collects. `Find` and `FindAll` look at direct children and
match the local name — a namespace is asked about with `Namespace`, and a deeper
walk is a loop, not a path language.

## Attributes

| | |
|---|---|
| `Attr(name)` | the value of an attribute **with no namespace**, `""` for one that is present and empty, `null` for one that is not |
| `SetAttr(name, value)` | both as text; creates or replaces. A value XML cannot carry is refused, as `Text` refuses one |
| `RemoveAttr(name)` | takes the attribute with no namespace away; one that is not there is not an error |
| `AttrNS(uri, name)` | the same for an attribute in a namespace — `xml:lang` is `AttrNS("http://www.w3.org/XML/1998/namespace", "lang")`, since an unprefixed name means no namespace at all. `SetAttrNS` refuses a namespace not declared in scope |
| `SetAttrNS(uri, name, value)` | writes one. The namespace has to have a prefix in scope -- declared on this element or an ancestor, by `DeclareNamespace` or by a parsed document |
| `RemoveAttrNS(uri, name)` | takes away the attribute in that namespace; one that is not there -- or only a DTD's default -- is not an error |
| `AttributeNames()` | the local names, sorted as the file had them |

**`Attr` and `AttrNS` are two different questions, and `xml:lang` is why.** In
XML an unprefixed name is an attribute with *no* namespace, so `xml:lang` and
`lang` are two attributes; `Attr("lang")` answers only for the second, and the
first is `AttrNS("http://www.w3.org/XML/1998/namespace", "lang")`. That is what
an AppStream metainfo needs to read and write translations:

```js
const XMLNS = "http://www.w3.org/XML/1998/namespace";

el.SetAttrNS(XMLNS, "lang", "es");     // <name xml:lang="es">Hola</name>
el.AttrNS(XMLNS, "lang");              // "es"
el.Attr("lang");                       // null -- a different attribute
```

The namespace has to have **a prefix in scope** for `SetAttrNS` -- declared on the
element or an ancestor; the XML one is built into every document (a detached
element too) and always works, and any other is refused by URI with a sentence,
because an invented declaration is a prefix on an element that never asked for
it. An attribute namespace cannot be a default one, so `SetNamespace` -- which
puts the *element* in a namespace -- is not the way to declare one:
`DeclareNamespace(uri, prefix)` is, below.

`AttributeNames()` lists the **local** name of every attribute, namespaced ones
included, so a record mapping a file reports `xml:lang` as unmodelled rather
than losing it in silence; `Attr` will not read it by that name.

An `xmlns` declaration is not in `AttributeNames()` and cannot be read with
`Attr`: in a document's tree it is the namespace, which is what `Namespace`,
`Prefix` and `SetNamespace` are for.

## Names and namespaces

| | |
|---|---|
| `Name` (ro) | the local name, the prefix, the URI — `""` when there is none |
| `Prefix` (ro) | the prefix, `""` when there is none |
| `Namespace` (ro) | the URI, `""` when there is none |
| `SetNamespace(uri, [prefix])` | puts the element in that namespace, reusing a declaration already in reach -- in a detached tree too, where it used to declare it again |
| `DeclareNamespace(uri, prefix)` | binds `prefix` to `uri` on this element, for its attributes and what is under it, **without putting the element in that namespace** -- what `SetAttrNS` then finds, as OOXML's `xmlns:r` on a workbook and `r:id` on each sheet. A prefix is required (a default namespace is `SetNamespace`'s); one already bound to the same URI in scope writes nothing, and one bound to another URI here or above is refused |

```js
const book = Xml.Element("workbook");
book.SetNamespace(MAIN);                       // the element is in MAIN
book.DeclareNamespace(RELS, "r");              // r: is bound here, the element stays in MAIN
book.Add("sheets").Add("sheet").SetAttrNS(RELS, "id", "rId1");
// <workbook xmlns="…main" xmlns:r="…relationships"><sheets><sheet r:id="rId1"/>…
```

**`DeclareNamespace` is how a format with prefixed attributes is written**, and it
was missing: OOXML declares `xmlns:r` on a workbook and writes `r:id` on each sheet,
and the only way to bind `r` was to move an element into that namespace and back,
which left a declaration on every sheet. A prefix is **required** -- a default
namespace declared on an element applies to that element itself, so that is
`SetNamespace`'s. A prefix already bound to the same URI in scope writes nothing;
one bound to *another* URI here or above is refused, because shadowing it would
change what the elements already using it mean. `xml` and `xmlns` are XML's own.

**An element added under a default namespace takes it**, and so does whatever is
under it with no namespace of its own -- because that is what the written text
says: a bare `<row>` under `<worksheet xmlns="…">` is in that namespace to every
reader. The tree used to answer `""` for it while the same document, written and
read back, answered the URI. So `SetNamespace` on the root of a part is the whole
of it, and nothing below repeats the declaration -- in a detached tree too, where
`SetNamespace` on a child used to declare the parent's namespace again. What is
given up is a child *meant* to have no namespace under a default one, which would
need `xmlns=""`; this API does not write that.

Asking twice for the same namespace is one declaration. A *different* URI for a
prefix (or a default namespace) the element already declares throws, naming the
one it has: rewriting that declaration would move every descendant using it
along with the element.

A name that is not one — with a space in it, say — is refused at `Add` and
`Element` rather than written into a document no parser could read.

## Building

| | |
|---|---|
| `Element(name)` | a detached element; its own tree, not in any document |
| `Add(child)` | a node or an element name. An element with no namespace added under a default namespace **takes it** -- and so does what is under it with none -- because that is what the written text says; the tree used to answer `""` for it while the text, read back, answered the URI |
| `Insert(index, child)` | before the element child at `index`, or at the end |
| `Remove()` | takes the node out for good |
| `Copy()` | a detached subtree of its own |

```js
const fresh = Xml.Element("Task");
fresh.Add("Name").Text = "Build";
doc.Root.Find("Tasks").Add(fresh);          // copied in; the variable stays detached
```

**A node from another tree is copied in, and `Add` answers the node that is in
*this* tree.** Within one tree `Add` moves the node, as a DOM does; across trees
it copies, because moving a subtree between documents would have to repoint
every wrapper under it — and one that was not repointed is memory that has been
freed. The idiom is always `const el = parent.Add(Xml.Element("Task"))`, and a
freshly built `Xml.Element` is *always* in another tree.

`Remove()` takes the node out and **that** wrapper stops answering, rather than
reading freed memory. `Copy()` first if the subtree is wanted elsewhere. A
wrapper is not the node — two `Find`s of one element are two wrappers — so
another one taken before the `Remove()` still answers, about a node that is now
detached, and can `Add` it back. So can a child kept across a `Text`
assignment, which detaches the children without silencing anybody.

## Writing

| | |
|---|---|
| `Stringify(node)` | the canonical text: declaration, indented by two, one trailing newline. A detached element is written with a document of its own |

**What `Xml` writes, `Xml` reads.** `Text`, `SetAttr` and `SetAttrNS` refuse text XML
cannot carry, naming the character and where it is: a NUL, a control character other
than tab, newline and return, U+FFFE/U+FFFF, and half of a surrogate pair. Each of
those used to be written -- and `Xml.Parse` refused the result (*PCDATA invalid Char
value 1*), the API writing documents it could not read; a NUL cut the text short with
nothing said. Whether such a character should be dropped instead is the program's
decision, not the runtime's: [`examples/clients`](https://github.com/getbintana/bintana/tree/main/examples/clients)' `Excel.js` drops them
from a cell, since a stray character pasted into a name should not stop an export.

`File.SaveXml` writes exactly that, by the atomic [`File.Save`](File.md). So a
parsed document comes back with different whitespace and attribute order — both
insignificant to XML, and one shape is worth more than byte fidelity. Comments
keep their place, and what is written is always UTF-8, whatever the file
declared. `Xml.Stringify(element)` takes a detached element too: it is copied
into a document of its own so the declaration is written with it.

## Availability

| | |
|---|---|
| `Available` (ro) | whether this build has libxml2; the verbs refuse with a sentence when it does not |

XML is optional at build time, like `Database.Sqlite`: without libxml2,
`Available` is `false` and every verb refuses with a sentence naming the
package. The class is installed in a worker too, so a big file can be parsed
off the main thread.

## What goes wrong

- **`Text` refused a value naming a character.** The text holds something XML cannot
  carry -- often a control character pasted from somewhere, or half an emoji cut by a
  `slice`. Take it out before assigning; the sentence says where it is.
- **`SetAttrNS` says no prefix is declared.** Declare one with `DeclareNamespace(uri,
  prefix)` on the element or an ancestor.

- **`Parse` threw naming a line and a column.** A malformed document is not an
  empty one. Catch it, or `File.Exists` first for the file road.
- **`File.LoadXml` threw naming the file.** A syntax error in *something* is
  not an answer; the file road adds which file.
- **An attribute read back `null`.** There is no such attribute. `""` means one
  is there and empty, which is a different fact.
- **A node stopped answering.** That wrapper was `Remove()`d. `Copy()` first
  when the subtree is wanted again, or keep a second wrapper to `Add` it back.
- **A child is no longer under its parent, and still answers.** The parent's
  `Text` was assigned, which detaches the children it replaces.
- **`Add` answered a different node than was handed in.** The argument came from
  another document and was copied; use the answer.
- **`Available` is `false`.** This build has no libxml2; CMake printed which
  packages it found, either way.

## See also

[`File`](File.md) · [`Record`](Record.md) · [`Bytes`](Bytes.md), which
`ParseBytes` takes · [`Http`](Http.md), whose body is often one of these ·
[`docs/plans/xml-plan.md`](https://github.com/getbintana/bintana/blob/main/docs/plans/xml-plan.md)
