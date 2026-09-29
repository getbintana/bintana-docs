/*
 * The rows of the documentation, written from `api.json`.
 *
 * A member says what it is for once, beside itself -- the lines after its
 * signature comment in the C, the JSDoc above it in JavaScript -- and the
 * runtime publishes it in `api.json`, which is the one file this repository
 * knows about the code: every widget class with what it declares and from
 * which class, every global with public members, the types no global holds,
 * and the libraries' classes with their events.
 *
 * This is the half that puts it in front of a reader: every table row of
 * `docs/llm` and `docs/reference` that names a member gets that member's
 * description in its text cell -- the whole of it in a two-column table, its
 * first sentence in an index row that links to a section. The tables
 * themselves -- which members, in what order, under which heading -- and all
 * the prose around them are written by hand, and stay so: what a table is
 * *about* is an editorial choice, and what a member *does* is not.
 *
 * Shared by `tools/docs`, which writes the result, and `check`, which fails
 * when a page is not what this would write -- so a description changed in the
 * runtime and not regenerated is caught the way an undocumented member is.
 * Both run out of `bintana`, the manifests' repository, and neither asks it
 * anything: the file is the whole answer.
 */

/* The manifest. `BINTANA_API` points a check at a file built from the runtime
 * in the same run; otherwise it is the one fetched for the pinned ref. */
function docApi(root) {
    const path = Environment.Get("BINTANA_API") || File.Join(root, "api.json");
    return File.LoadJson(path);
}

/*
 * Everything a row may ask for, once: `owner` -> its members, most derived
 * first, and its events.
 *
 * **`api.json` carries what a class declares and its `Parent`**, because the
 * accumulated list per class was the same seventy names written out
 * forty-eight times. Accumulating it here is the same walk the runtime does --
 * the class, then its base, a name once -- and this is the one place that
 * knows how.
 */
function docIndex(root) {
    const api        = docApi(root);
    const widgets    = {};
    const libClasses = {};

    for (const w of api.Widgets) widgets[w.Name] = w;
    for (const lib of api.Libraries)
        for (const c of lib.Classes) libClasses[c.Name] = c;

    const gather = (name) => {
        const out  = [];
        const seen = {};

        for (let at = name, guard = 0; at && guard < 64; guard++) {
            const own = widgets[at] || libClasses[at];
            if (!own) break;
            for (const m of own.Members)
                if (!seen[m.Name]) { seen[m.Name] = true; out.push(m); }
            at = own.Parent || "";
        }
        return out;
    };

    const members = {};
    const events  = {};

    for (const w of api.Widgets) {
        members[w.Name] = gather(w.Name);
        events[w.Name]  = w.Events || [];
    }
    for (const g of api.Globals)
        members[g.Name] = g.Members;
    for (const t of api.Types)
        members[t.Name] = t.Members;
    for (const lib of api.Libraries)
        for (const c of lib.Classes) {
            members[c.Name] = gather(c.Name);
            events[c.Name]  = c.Events || [];
        }

    return {
        api, members, events,
        libraries: api.Libraries.map((l) => l.Name).sort(),
        classesOf: (name) => {
            const lib = api.Libraries.find((l) => l.Name === name);
            return lib ? lib.Classes : [];
        },
        globalNames: api.Globals.map((g) => g.Name),
        typeNames:   api.Types.map((t) => t.Name),
    };
}

/* The pages whose rows are written. */
function docPages(root, index) {
    const pages = ["docs/llm/controls.md", "docs/llm/library.md", "docs/llm/forms.md"];
    for (const lib of index.libraries)
        if (File.Exists(File.Join(root, `docs/llm/${lib}.md`)))
            pages.push(`docs/llm/${lib}.md`);
    /* A page's name is a repository path and is always spelt with `/`, while
     * `Directory.Files` joins with the platform's separator -- so on Windows
     * every key came back backslashed, `docRelative` split it as one component
     * and counted the `..` wrong: every row carrying a link read as stale, and
     * `tools/docs` would have written the wrong links into it. `File.Join`
     * takes a forward-slash page back on either platform. */
    for (const p of Directory.Files(File.Join(root, "docs/reference"),
                                    { Pattern: "*.md", Recursive: true }).sort())
        pages.push(p.slice(root.length + 1).replace(/\\/g, "/"));
    return pages;
}

/* Which classes or globals a row under this heading of this page can be about:
 * the heading's first word on the compact pages, the file's name on a long
 * one, and the few pages that document more than one thing between them. */
function docOwners(page, section) {
    const base = File.BaseName(page);
    const sec  = (section || "").split(" —")[0].split(":")[0].trim();
    if (page.endsWith("llm/controls.md"))
        return sec && sec !== "The classes" ? [sec.split(" ")[0]] : ["Widget"];
    if (page.endsWith("llm/library.md")) {
        const many = { "Database and Table": ["Connection", "Database"],
                       "Http": ["Http", "HttpClient", "Multipart"],
                       "Http Server": ["HttpServer", "HttpRequest"],
                       "Xml": ["Xml", "XmlDocument", "XmlNode"],
                       "Desktop.Entries": ["Desktop.Entries"] };
        return many[sec] || (sec ? [sec.split(" ")[0]] : []);
    }
    if (page.endsWith("llm/forms.md"))
        return sec === "Menus" ? ["MenuItem"] : sec === "Actions" ? ["Action"] : [];
    /* A library's page is headed by its classes. */
    if (page.startsWith("docs/llm/"))
        return sec ? [sec.split(" ")[0].replace(/`/g, "")] : [];
    const many = { Http: ["Http", "HttpClient", "Multipart"],
                   HttpServer: ["HttpServer", "HttpRequest"],
                   Xml: ["Xml", "XmlDocument", "XmlNode"],
                   Database: ["Database", "Connection"],
                   Desktop: ["Desktop", "Desktop.Entries"] };
    return many[base] || [base];
}

/* A path from one directory of the tree to a file of it, both written from the
 * root: `docs/llm/library.md` seen from `docs/reference/globals` is
 * `../../llm/library.md`. */
function docRelative(target, fromDir) {
    const a = target.split("/"), b = fromDir.split("/").filter((x) => x);
    let i = 0;
    while (i < a.length - 1 && i < b.length && a[i] === b[i]) i++;
    return "../".repeat(b.length - i) + a.slice(i).join("/");
}

/* The links in a description are written from the root of the tree, since the
 * same text lands in pages in different directories; each page gets them
 * relative to itself, and a link to a place in the page it is on is `#…`. */
function docLinks(text, page) {
    const dir = File.Directory(page);
    return text.replace(/\[([^\]]*)\]\((docs\/[^)#\s]+)(#[^)\s]*)?\)/g, (all, label, path, anchor) => {
        if (path === page && anchor) return `[${label}](${anchor})`;
        return `[${label}](${docRelative(path, dir)}${anchor || ""})`;
    });
}

/* The first sentence, which is what an index row and the completion popup
 * show. */
function docSummary(doc) {
    const t   = doc.split("\n")[0];
    const end = /[.:;](?=\s+[A-Z(`"*]|\s*$)/.exec(t);
    /* Without the mark that ended it: an index row is a clause, and a colon
     * left behind would promise something that is not there. */
    return (end ? t.slice(0, end.index) : t).trim();
}

function docCell(text) {
    return text.replace(/\n+/g, " ").replace(/\|/g, "\\|");
}

/* A row: `| [**event** ]`Name…`… | text |` or an index row with a link after
 * the text. The name cell is kept as written. */
const DOC_ROW = /^(\|\s*(\*\*event\*\*\s*)?`([^`]+)`[^|]*\|)(.*)\|\s*$/;

/*
 * `{ page: text }` for every page whose rows are not what the manifest says,
 * with the text they should be.
 */
function docRows(root) {
    const index = docIndex(root);

    const memberDoc = (owner, name, qualified) => {
        const list = index.members[owner] || [];
        const m    = list.find((x) => x.Name === name && x.Doc);

        /* `Widget.PropertyNames(type)` is a static and a name the class may
         * also have as a method; a row written with the class in front of it
         * is about the static, and the other's description is not its own. */
        if (m && qualified && m.Kind !== "Static" &&
            list.some((x) => x.Kind === "Static"))
            return null;
        return m ? m.Doc : null;
    };
    const eventDoc = (owner, name) => {
        const e = (index.events[owner] || []).find((x) => x.Name === name);
        return e && e.Doc ? e.Doc : null;
    };

    const out = {};
    for (const page of docPages(root, index)) {
        const path = File.Join(root, page);
        const text = File.Load(path);
        const lines = text.split("\n");
        let section = null, changed = false;

        for (let i = 0; i < lines.length; i++) {
            const h = /^##\s+(.*)/.exec(lines[i]);
            if (h) { section = h[1].trim(); continue; }
            const m = DOC_ROW.exec(lines[i]);
            if (!m) continue;
            /* A row naming two members is a sentence about both, and stays
             * the hand's. */
            if (/`\s*,\s*`/.test(m[1])) continue;

            let name = m[3], owners;
            const q = /^((?:[A-Z]\w*\.)+)([A-Z]\w*)/.exec(name);
            if (q) { owners = [q[1].slice(0, -1)]; name = q[2]; }
            else {
                const n = /^([A-Z]\w*)/.exec(name);
                if (!n) continue;
                name = n[1];
                owners = docOwners(page, section);
            }

            let doc = null;
            for (const o of owners) {
                doc = m[2] ? eventDoc(o, name) : memberDoc(o, name, !!q);
                if (doc) break;
            }
            if (!doc) continue;

            const cells = m[4].split(/(?<!\\)\|/);
            let row;
            if (cells.length === 1)
                row = `${m[1]} ${docCell(docLinks(doc, page))} |`;
            else if (cells.length === 2)
                row = `${m[1]} ${docCell(docLinks(docSummary(doc), page))} |${cells[1]}|`;
            else continue;

            if (row !== lines[i]) { lines[i] = row; changed = true; }
        }
        if (changed) out[page] = lines.join("\n");
    }
    return out;
}
