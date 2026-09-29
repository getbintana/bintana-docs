# Bintana's documentation

The pages a person reads to write a Bintana application, and the check that
holds every one of them to the runtime's own surface. The code is in
[`bintana`](https://github.com/getbintana/bintana); a model without an IDE
should start at [`bintana-llm`](https://github.com/getbintana/bintana-llm).

| | |
|---|---|
| [docs/reference/](docs/reference/README.md) | one page per class and per global, for the person writing an application: what it is, which neighbour to use instead, an example off the tree, every member explained, and what goes wrong. The long form of `docs/llm`, and what the IDE shows as help (`F1`) |
| [docs/llm/](docs/llm/) | the compact contract: [controls.md](docs/llm/controls.md) — every class and member, with signatures and accepted values — [library.md](docs/llm/library.md) — every global — [forms.md](docs/llm/forms.md), and one page per shipped library |
| [docs/first-app.md](docs/first-app.md) | a five-minute tutorial in the IDE, ending in a greeting |
| [docs/ide.md](docs/ide.md) | the IDE and its designer, as a Bintana application with no privileges |
| [docs/formats.md](docs/formats.md) | `project.json`, the `.form` grammar, the serialiser, icons |
| [docs/runtime-api.md](docs/runtime-api.md) | everything a project sees as a global, and what `rad.js` adds to the prototypes |
| [docs/widgets.md](docs/widgets.md) | per-widget semantics: what each control is made of in GTK, and the behaviour a table cannot state |
| [docs/resources.md](docs/resources.md) | text as a resource: prose properties, `po/` catalogues, `Locale`, extraction |

## How it is checked

`api.json` is the runtime's public surface as data: every widget class with what
it declares and from which class, every global with public members, the types no
global holds, and the libraries' classes with their events. It is **built in
`bintana`** out of the descriptions written beside each member (`tools/apijson`,
held to the C by `tests/api.sh`), and this repository reads it at the ref in
[`bintana-ref.txt`](bintana-ref.txt):

```sh
tools/fetch-api.sh      # api.json, for the ref in bintana-ref.txt
BINTANA=<path to bintana> ./check.sh
```

`check.sh` is `check/`, a Bintana console project, and it fails when a member
has no row in a page, an event is documented with the wrong number of arguments,
a long page lists a member and never explains it, a page is not what the row
writer would write, or a link does not land. The rows themselves are written
from the manifest:

```sh
BINTANA=<path> tools/docs.sh           # rewrite the pages whose rows are stale
BINTANA=<path> tools/docs.sh --check   # say which, writing nothing
```

So a description is written once, beside its member in the code, and the pages
here are what it turns into. CI builds the runtime at `bintana-ref.txt`, checks
that the manifest fetched from it is byte for byte what that runtime generates,
and runs the check against it; a weekly job does the same against `bintana`'s
`main` and opens an issue when the surface moved without the documentation.
