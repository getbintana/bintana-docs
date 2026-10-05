/*
 * Does the documentation say what `api.json` says?
 *
 * `api.json` is the runtime's public surface as data -- built from the code by
 * `tools/apijson` in `bintana`, the manifest's repository -- and this is the
 * other half: every page of `docs/llm` and `docs/reference` is held to it, so
 * a member whose description was not regenerated, an event documented with the
 * wrong number of arguments and a page that never mentioned a member are all
 * failures here. It reads nothing but the manifest and the Markdown: no C, no
 * runtime, no library sources, which is what makes it runnable from a
 * checkout of this repository alone.
 *
 * **The half this cannot ask is whether the manifest tells the truth**, and
 * that is `bintana`'s own check (`tests/api.sh` holds `api.json` to the
 * tables, the events and the types). Two repositories, two questions, one
 * file between them.
 *
 * A console project (`"main"`, no display), because it reads files.
 */
"use strict";

function Main() {
    const root = Application.Arguments[0] || File.Directory(Application.Directory);
    const problems = [];

    let api = null;
    try {
        api = docApi(root);
    } catch (e) {
        print(`docs: ${e.message}`);
        Application.Quit(2);
        return;
    }
    const index = docIndex(root);

    const members = checkMembers(root, api, problems);
    const events  = checkEvents(root, api, problems);
    const libs    = checkLibraries(root, index, problems);
    const globals = checkGlobals(root, index, problems);
    const ref     = checkReference(root, index, problems);
    const glob    = checkGlobalPages(root, index, problems);
    const libsL   = checkLibraryPages(root, index, problems);
    const links   = checkLinks(root, problems);

    /* And the rows say what the manifest says: the same `docRows` that
     * `tools/docs` writes with. */
    for (const page of Dictionary.Keys(docRows(root)))
        problems.push(`${page}: a row does not say what the manifest says -- ` +
                      `run ./tools/docs.sh`);

    for (const p of problems) print(`  ${p}`);
    print(problems.length
        ? `docs: ${problems.length} wrong, of ${members} members, ` +
          `${events} events, ${libs} in the libraries' pages, ` +
          `${globals} on the globals'`
        : `docs: ${members} members and ${events} events, plus ${libs} in the ` +
          `libraries' pages and ${globals} on the globals' -- all documented -- ` +
          `and ${ref.checked} in the ${ref.pages} long page${ref.pages === 1 ? "" : "s"} ` +
          `of widgets (${ref.missing} still to write), ${glob.checked} in the ` +
          `${glob.pages} of globals and ${libsL.checked} in the ${libsL.pages} ` +
          `of libraries (${libsL.missing} still to write) -- and ` +
          `${links.links} link${links.links === 1 ? "" : "s"} over ${links.pages} ` +
          `page${links.pages === 1 ? "" : "s"} land somewhere`);
    Application.Quit(problems.length ? 1 : 0);
}

/* The events of every owner, name -> how many arguments, taking the largest a
 * name is ever declared with: one name can be raised by more than one class,
 * and a page documents the name once. */
function eventArities(api) {
    const out = {};

    const add = (list) => {
        for (const e of list || []) {
            const args = (e.Signature || "").slice(1, -1).trim();
            const n    = args === "" ? 0 : args.split(",").length;
            out[e.Name] = Math.max(out[e.Name] || 0, n);
        }
    };
    /* Only the widgets': a library's events are checked by its own page, and
     * a name two classes share -- `Select` is a chart's and a list's -- would
     * compare against the wrong one here. */
    for (const w of api.Widgets) add(w.Events);
    return out;
}

/* Every member a class declares, as `{ owner, name, kind }`, exactly once. */
function allMembers(api) {
    const out  = [];
    const seen = new Set();

    for (const w of api.Widgets)
        for (const m of w.Members) {
            const key = `${w.Name}.${m.Name}`;
            if (!seen.has(key)) { seen.add(key); out.push({ owner: w.Name, m }); }
        }
    return out;
}

/* The member name cell a row has to have: a method is `` `Name( ``, a property
 * `` `Name` ``. Statics are written qualified on the class that owns them. */
function memberRow(name, kind, fields) {
    const owner = fields && fields.owner
        ? "(?:" + Regex.Escape(fields.owner) + "\\.)?" : "";
    const base  = owner + Regex.Escape(name);
    return kind === "Method" || kind === "Static"
        ? new Regex("^\\|\\s*`" + base + "\\(", { Multiline: true })
        : new Regex("^\\|\\s*`" + base + "`", { Multiline: true });
}

/*
 * `docs/llm/controls.md` documents the whole surface: every member of every
 * widget class, by name, and every event with its arguments. This is the check
 * the old one made from the C tables, read out of the manifest.
 */
function checkMembers(root, api, problems) {
    const path = File.Join(root, "docs/llm/controls.md");
    const text = File.Load(path);
    let   counted = 0;

    for (const one of allMembers(api)) {
        const m = one.m;

        /* **A static is written `Widget.New(type)`**, and only a native one:
         * a class of the prelude hangs statics of its own (`Widget.TypeName`)
         * that were never a row this check asked for. */
        if (m.Kind === "Static") {
            if (!m.Native)
                continue;
            const row = new Regex("^\\|\\s*`" + Regex.Escape(one.owner + "." +
                                  m.Name) + "[`(]", { Multiline: true });
            if (!row.IsMatch(text))
                problems.push(`controls.md: ${one.owner}.${m.Name} has no row`);
            counted++;
            continue;
        }
        if (!memberRow(m.Name, m.Kind).IsMatch(text))
            problems.push(`controls.md: ${one.owner}.${m.Name} has no row`);
        counted++;
    }
    return counted;
}

function checkEvents(root, api, problems) {
    const text  = File.Load(File.Join(root, "docs/llm/controls.md"));
    const arity = eventArities(api);
    let   counted = 0;

    for (const name in arity) {
        const sig = new Regex("\\*\\*event\\*\\* `" + Regex.Escape(name) + "\\(([^)]*)\\)`")
                        .Match(text);
        if (!sig) {
            problems.push(`controls.md: event ${name} has no signature`);
            continue;
        }
        const args = sig.Group(1).trim();
        const n    = args === "" ? 0 : args.split(",").length;

        if (n !== arity[name])
            problems.push(`controls.md: event ${name} is documented with ${n} ` +
                          `argument(s), the runtime declares ${arity[name]}`);
        counted++;
    }
    return counted;
}

/*
 * `docs/llm/<library>.md` documents the library the runtime ships, which a
 * project reaches with `uses`: every member the class declares and every event
 * it raises. Both come from the manifest, which reads them out of the code
 * that declares and raises them.
 */
function checkLibraries(root, index, problems) {
    let counted = 0;

    for (const name of index.libraries) {
        const path = File.Join(root, `docs/llm/${name}.md`);
        if (!File.Exists(path)) {
            problems.push(`library ${name} has no reference at docs/llm/${name}.md`);
            continue;
        }
        const text = File.Load(path);

        for (const cls of index.classesOf(name)) {
            for (const m of cls.Members) {
                /* A static is documented in prose in `package.md` -- the class
                 * is a namespace of verbs and the old check never asked for a
                 * row per verb. */
                if (m.Kind === "Static" || cls.Events.some((e) => e.Name === m.Name))
                    continue;
                const bare = m.Name;
                const row  = m.Kind === "Method" || m.Kind === "Static"
                    ? new Regex("^\\|\\s*`" + Regex.Escape(bare) + "\\(",
                                { Multiline: true })
                    : new Regex("^\\|\\s*`" + Regex.Escape(bare) + "`",
                                { Multiline: true });
                if (!row.IsMatch(text))
                    problems.push(`${name}.md: ${cls.Name} publishes ${bare} and ` +
                                  `the page has no row for it`);
                counted++;
            }
            for (const e of cls.Events) {
                const sig = new Regex("\\*\\*event\\*\\* `" + Regex.Escape(e.Name) +
                                      "\\(([^)]*)\\)`").Match(text);
                if (!sig) {
                    problems.push(`${name}.md: event ${e.Name} has no signature`);
                    continue;
                }
                /* **Counted and not spelt**: a page may say `[options]` for a
                 * parameter a JavaScript declaration cannot mark optional,
                 * and both are one argument. */
                const args = sig.Group(1).trim();
                const n    = args === "" ? 0 : args.split(",").length;
                const want = (e.Signature || "").slice(1, -1).trim();
                const wn   = want === "" ? 0 : want.split(",").length;

                if (n !== wn)
                    problems.push(`${name}.md: event ${e.Name} is documented with ` +
                                  `${n} argument(s), the component declares ${wn}`);
                counted++;
            }
        }
    }
    return counted;
}

/*
 * `docs/llm/library.md` is one section per global, and a member counts as
 * written down when its name is in backticks **inside its own section** --
 * `Load` belongs to `File` and to `Locale`, and a file-wide search would let
 * either cover the other.
 *
 * **Which section documents which owner is the one fact a manifest cannot
 * carry**: it says what a class has, not which heading a writer chose. The
 * list below is that fact, and it is the translation of the C tables and the
 * object-building runs the same check read before -- `GLOBAL_TABLES` and
 * `GLOBAL_VARS` in the runtime's repository. A global whose page is prose
 * alone (`Message`, `Settings`, `Timer`, `Regex`, `Date`, `Painter`) is not
 * here; its long page under `docs/reference/globals` is what holds it.
 */
const GLOBAL_SECTIONS = [
    ["Application",       "Application"],
    ["Environment",       "Environment"],
    ["Desktop",           "Desktop"],
    ["Desktop.Entries",   "Desktop.Entries"],
    ["Locale",            "Locale"],
    ["File",              "File"],
    ["Xml",               "Xml", "XmlDocument", "XmlNode"],
    ["Directory",         "Directory"],
    ["Probe",             "Probe"],
    ["Task",              "Task"],
    ["Lock",              "Lock"],
    ["Dialog",            "Dialog"],
    ["Printer",           "Printer"],
    ["Drawing",           "Drawing"],
    ["Hash",              "Hash"],
    ["Random",            "Random"],
    ["Gzip",              "Gzip"],
    ["Keyring",           "Keyring"],
    ["Zip",               "Zip", "ZipArchive", "ZipWriter"],
    ["Notification",      "Notification"],
    ["Bytes",             "Bytes"],
    ["Decimal",           "Decimal"],
    ["Day",               "Day"],
    ["Text",              "Text"],
    ["Screen",            "Screen"],
    ["Time",              "Time"],
    ["Logger",            "Logger"],
    ["Record and Field",  "Record", "Field"],
    ["Database and Table", "Connection", "Table"],
    ["Http",              "Http", "HttpClient", "Multipart"],
    ["Http Server",       "HttpServer", "HttpRequest"],
    ["AudioPlayer",       "AudioPlayer"],
];

function checkGlobals(root, index, problems) {
    const sections = {};
    const sectionsOf = (file) => {
        if (sections[file])
            return sections[file];
        const text  = File.Load(File.Join(root, file));
        const out   = {};
        const heads = new Regex("^## (.+)$", { Multiline: true }).Matches(text);

        for (let i = 0; i < heads.length; i++) {
            const from = heads[i].Index + heads[i].Length;
            const to   = i + 1 < heads.length ? heads[i + 1].Index : text.length;
            out[heads[i].Group(1).trim()] = text.slice(from, to);
        }
        sections[file] = out;
        return out;
    };

    let counted = 0;
    const check = (file, heading, owners) => {
        const body = sectionsOf(file)[heading];
        if (body === undefined) {
            problems.push(`${file} has no "## ${heading}" section`);
            return;
        }
        const object = heading.split(/[ :]/)[0];

        for (const owner of owners)
            for (const m of index.members[owner] || []) {
                /* Bare or qualified, since a section may spell either --
                 * `Debug` inside `Logger.Debug`, or `Load(path)` on its own. */
                const spelt = [`\`${m.Name}(`, `\`${m.Name}\``,
                               `\`${object}.${m.Name}(`, `\`${object}.${m.Name}\``,
                               `\`${owner}.${m.Name}(`, `\`${owner}.${m.Name}\``];
                if (!spelt.some((form) => body.includes(form)))
                    problems.push(`${object}.${m.Name} is not written down ` +
                                  `under "## ${heading}" in ${file}`);
                counted++;
            }
    };

    for (const [heading, ...owners] of GLOBAL_SECTIONS)
        check("docs/llm/library.md", heading, owners);

    check("docs/llm/forms.md", "Menus", ["MenuItem"]);
    check("docs/llm/forms.md", "Actions: one command in several places", ["Action"]);
    return counted;
}

/*
 * `docs/reference/widgets/<Class>.md` is the long form of a class, and the
 * rule is the one the old check made: **twice**, once in `## Every member` --
 * the index somebody scans -- and once outside it, where it is explained. A
 * member listed and never explained is a long page quietly turning back into a
 * short one. Which members belong to a class is what the manifest says the
 * class declares; what it inherits is its base's page.
 */
function checkReference(root, index, problems) {
    const dir = File.Join(root, "docs/reference/widgets");
    if (!File.IsDir(dir))
        return { checked: 0, pages: 0, missing: 0 };

    let checked = 0, pages = 0, counted = 0;
    const seen  = {};

    /* Only the classes with members of their own: a class that declares
     * nothing has nothing its page has to hold it to, and requiring a page
     * for one would be requiring it for every pure container. */
    for (const w of index.api.Widgets)
        if (w.Members.length) seen[w.Name] = true;

    for (const path of Directory.Files(dir, "*.md")) {
        const name = File.BaseName(path);
        if (name === "README")
            continue;
        pages++;

        const cls = index.api.Widgets.find((w) => w.Name === name);
        if (!cls) {
            problems.push(`docs/reference/widgets/${name}.md documents ${name}, ` +
                          `which the runtime does not register`);
            continue;
        }
        if (name in seen)
            counted++;

        const text = File.Load(path);
        const split = pageSplit(text, name);
        if (!split)
            continue;

        for (const m of cls.Members) {
            /* **The C surface, which is what a class page was always held
             * to.** A member the prelude hangs on the class (`Caption`,
             * `Serialize`, the designer's `Apply`) is real and is in the
             * manifest; it is written where its own page explains it, and a
             * reference page is the control's own table. */
            if (!m.Native || m.Kind === "Static")
                continue;
            const row = memberRow(m.Name, m.Kind, {});
            if (!row.IsMatch(split.summary))
                problems.push(`${name}.md: ${m.Name} is not in "Every member"`);
            else if (!row.IsMatch(split.body))
                problems.push(`${name}.md: ${m.Name} is listed and never explained`);
            else if (m.Kind === "Method" || m.Kind === "Static") {
                const full = new Regex("^\\|\\s*`" + Regex.Escape(m.Name) +
                                       "\\(([^)]*)\\)", { Multiline: true })
                                 .Match(split.summary);
                const want = (m.Signature || "").slice(1, -1);
                if (!full || full.Group(1) !== want)
                    problems.push(`${name}.md: ${m.Name} is documented as ` +
                                  `(${full ? full.Group(1) : "?"}), the runtime ` +
                                  `declares ${m.Signature}`);
            }
            checked++;
        }

        /* An event is one the class raises -- inherited ones included, since
         * `Events` in the manifest is what the class answers -- and it is
         * written with the arguments it declares. */
        for (const e of new Regex("\\*\\*event\\*\\* `(\\w+)\\(([^)]*)\\)`").Matches(text)) {
            const event = e.Group(1);
            const found = (index.events[name] || []).find((x) => x.Name === event);
            if (!found) {
                problems.push(`${name}.md: event ${event} is not one the class raises`);
                continue;
            }
            const args = e.Group(2).trim();
            const want = (found.Signature || "").slice(1, -1);
            if (args !== want)
                problems.push(`${name}.md: event ${event} is documented as ` +
                              `(${args}), the runtime declares (${want})`);
            checked++;
        }
    }
    return { checked, pages, missing: Dictionary.Count(seen) - counted };
}

/* The two halves of a long page, and the "## Every member" a page must have. */
function pageSplit(text, name) {
    const at   = text.indexOf("\n## Every member");
    const ends = at < 0 ? -1 : text.indexOf("\n## ", at + 4);

    if (at < 0) {
        return null;
    }
    return {
        summary: text.slice(at, ends < 0 ? text.length : ends),
        body:    text.slice(0, at) + (ends < 0 ? "" : text.slice(ends)),
    };
}

/*
 * **Which long pages document members, and whose.** A page is written from
 * the classes it is about -- `Database.md` is `Connection`'s page, `Desktop.md`
 * holds the entries module too -- and a page that is not here is prose and
 * held to existing: `Message`, `Exec`, `Settings`, `Timer`, `Regex`,
 * `Stopwatch`, `Dictionary`, `Clipboard`, `Record` and `Field` are built in
 * ways the runtime's C tables do not describe, which is the same bargain the
 * old check made in `GLOBAL_PAGES`.
 */
const GLOBAL_PAGE_OWNERS = {
    AudioPlayer: ["AudioPlayer"],
    Application: ["Application"],
    Bytes:       ["Bytes"],
    Database:    ["Connection"],
    Day:         ["Day"],
    Decimal:     ["Decimal"],
    Desktop:     ["Desktop", "Desktop.Entries"],
    Dialog:      ["Dialog"],
    Directory:   ["Directory"],
    Drawing:     ["Drawing"],
    Environment: ["Environment"],
    File:        ["File"],
    Gzip:        ["Gzip"],
    Hash:        ["Hash"],
    Keyring:     ["Keyring"],
    Http:        ["Http", "HttpClient", "Multipart"],
    HttpServer:  ["HttpServer", "HttpRequest"],
    Locale:      ["Locale"],
    Notification: ["Notification"],
    Logger:      ["Logger"],
    Printer:     ["Printer"],
    Probe:       ["Probe"],
    Random:      ["Random"],
    Screen:      ["Screen"],
    Task:        ["Task"],
    Lock:        ["Lock"],
    Text:        ["Text"],
    Time:        ["Time"],
    Xml:         ["Xml", "XmlDocument", "XmlNode"],
    Zip:         ["Zip", "ZipArchive", "ZipWriter"],
};

function checkGlobalPages(root, index, problems) {
    const dir = File.Join(root, "docs/reference/globals");
    if (!File.IsDir(dir))
        return { checked: 0, pages: 0 };

    let checked = 0, pages = 0;
    const known = {};
    for (const g of index.api.Globals) known[g.Name] = true;
    for (const t of index.api.Types)   known[t.Name] = true;

    for (const path of Directory.Files(dir, "*.md")) {
        const name = File.BaseName(path);
        if (name === "README")
            continue;
        pages++;

        if (!(name in known)) {
            problems.push(`docs/reference/globals/${name}.md documents ${name}, ` +
                          `which the runtime does not publish`);
            continue;
        }
        const owners = GLOBAL_PAGE_OWNERS[name];
        if (!owners)
            continue;                       /* prose, held to existing */

        const text  = File.Load(path);
        const split = pageSplit(text, name);
        if (!split) {
            problems.push(`${name}.md has no "## Every member" section`);
            continue;
        }
        for (const owner of owners)
            for (const m of index.members[owner] || []) {
                /* The native surface, for the same reason the widget pages
                 * have one: what a global gained in the prelude is documented
                 * where that is, and `Application.Arguments` and its siblings
                 * are data properties whose `Native` flag says nothing -- the
                 * page lists them and this asks for what the C declared. */
                if (!m.Native || m.Kind === "Static")
                    continue;
                const row = memberRow(m.Name, m.Kind, {});
                if (!row.IsMatch(split.summary))
                    problems.push(`${name}.md: ${m.Name} is not in "Every member"`);
                else if (!row.IsMatch(split.body))
                    problems.push(`${name}.md: ${m.Name} is listed and never explained`);
                checked++;
            }
    }
    return { checked, pages };
}

function checkLibraryPages(root, index, problems) {
    const dir = File.Join(root, "docs/reference/libraries");
    if (!File.IsDir(dir))
        return { checked: 0, pages: 0, missing: 0 };

    const known = {};
    const withMembers = {};
    for (const l of index.api.Libraries)
        for (const c of l.Classes) {
            known[c.Name] = c;
            if (c.Members.length)
                withMembers[c.Name] = true;
        }

    let checked = 0, pages = 0, counted = 0;
    for (const path of Directory.Files(dir, "*.md")) {
        const name = File.BaseName(path);
        if (name === "README")
            continue;
        pages++;

        const cls = known[name];
        if (!cls) {
            problems.push(`docs/reference/libraries/${name}.md documents ${name}, ` +
                          `which no shipped library publishes`);
            continue;
        }
        if (name in withMembers)
            counted++;

        const text  = File.Load(path);
        const split = pageSplit(text, name);
        if (!split) {
            problems.push(`${name}.md has no "## Every member" section`);
            continue;
        }

        for (const m of cls.Members) {
            if (m.Kind === "Static" || cls.Events.some((e) => e.Name === m.Name))
                continue;
            const row = memberRow(m.Name, m.Kind, {});
            if (!row.IsMatch(split.summary))
                problems.push(`${name}.md: ${m.Name} is not in "Every member"`);
            else if (!row.IsMatch(split.body))
                problems.push(`${name}.md: ${m.Name} is listed and never explained`);
            checked++;
        }

        for (const e of cls.Events) {
            const sig = new Regex("\\*\\*event\\*\\* `" + Regex.Escape(e.Name) +
                                  "\\(([^)]*)\\)`").Match(text);
            if (!sig) {
                problems.push(`${name}.md: event ${e.Name} has no signature`);
                continue;
            }
            const args = sig.Group(1).trim();
            const n    = args === "" ? 0 : args.split(",").length;
            const want = (e.Signature || "").slice(1, -1).trim();
            const wn   = want === "" ? 0 : want.split(",").length;
            if (n !== wn)
                problems.push(`${name}.md: event ${e.Name} is documented with ` +
                              `${n} argument(s), the code emits ${wn}`);
            checked++;
        }
    }
    return { checked, pages, missing: Dictionary.Count(withMembers) - counted };
}

/*
 * Every relative link and picture lands on a file, and every link at
 * `bintana` is checked against a checkout of it when one is named
 * (`BINTANA_SRC`), since the code, the examples and the runtime's own
 * documentation deliberately stayed in the other repository. A link to
 * somewhere else is somebody else's.
 */
const LINK = new Regex("(!?)\\[[^\\]]*\\]\\(([^)\\s]+)\\)");
const CODE = new Regex("```[^]*?```|`[^`\\n]*`");
const BINTANA_LINK = /^https:\/\/github\.com\/getbintana\/bintana\/(?:blob|tree)\/[^/]+\/(.+)$/;

function checkLinks(root, problems) {
    const files = Directory.Files(root, { Pattern: "*.md" });
    for (const f of Directory.Files(File.Join(root, "docs"),
                                    { Pattern: "*.md", Recursive: true }))
        files.push(f);

    const src = Environment.Get("BINTANA_SRC") || "";
    let links = 0, checked = 0, pages = 0;

    for (const file of files) {
        pages++;
        /* Code spans are not links: `` `[text](href)` `` in a table of
         * Markdown syntax is prose about the format. */
        const text = CODE.Replace(File.Load(file), "");

        for (const m of LINK.Matches(text)) {
            const href = m.Group(2).split("#")[0];
            if (href === "" || /^(?:https?|mailto):/.test(href))
                continue;

            links++;
            const at = BINTANA_LINK.exec(m.Group(2));
            if (at) {
                if (!src)
                    continue;               /* nothing to check it against */
                checked++;
                if (!File.Exists(File.Join(src, at[1].split("#")[0])))
                    problems.push(`${File.Relative(file, root)}: ${
                                  m.Group(2)} is not in the checkout at BINTANA_SRC`);
                continue;
            }

            const target = File.Absolute(File.Join(File.Directory(file), href));
            checked++;
            if (!File.Exists(target))
                problems.push(`${File.Relative(file, root)}: ${href} does not land`);
        }
    }
    return { links, checked, pages };
}
