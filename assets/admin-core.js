/* ============================================================
   GRAVEYARD SHIFT — admin core
   Pure data logic: normalizing, validating, and serializing posts.
   No DOM in here, so it can be unit-tested directly in node.
   ============================================================ */

(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AdminCore = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CATS  = ["books", "creepypasta", "movies", "shows", "video games",
               "art", "spooky season"];
  var TYPES = ["review", "pick", "post", "art"];

  /* Only some sections split further. A post in a section with subs may
     still leave it blank — that just means "general". */
  var SUBS = {
    "spooky season": ["halloween", "summerween"]
  };

  function subsFor(cat) {
    return SUBS[String(cat || "").toLowerCase()] || [];
  }

  /* Header comment re-emitted on every export so content/posts.js
     always carries its own schema documentation. */
  var HEADER = [
    "/* ============================================================",
    "   GRAVEYARD SHIFT — THE CRYPT LEDGER",
    "   ------------------------------------------------------------",
    "   Single source of truth for every post on the site.",
    "   Written by admin.html, but safe to hand-edit.",
    "",
    "   {",
    "     id:    \"2026-07-19-house-of-leaves\",   // unique; used in URLs",
    "     type:  \"review\" | \"pick\" | \"post\",",
    "     cat:   \"books\" | \"movies\" | \"creepypasta\" | \"video games\",",
    "     title: \"House of Leaves\",",
    "     date:  \"2026-07-19\",                   // ISO",
    "     body:  \"prose.\\n\\nblank line = new paragraph\",",
    "     image: \"assets/covers/hol.jpg\",        // optional",
    "     draft: false                           // true = hidden from the site",
    "   }",
    "",
    "   type \"review\" adds:",
    "     work: { creator, year, rating (1-5, halves ok), verdict }",
    "   type \"pick\" adds:",
    "     source: { author, url }   // credit the original. always.",
    "   ============================================================ */",
    ""
  ].join("\n");

  function slugify(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "untitled";
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  /* Accepts ISO, or the locale strings the pre-Phase-3 admin wrote
     ("July 19, 2026"). Falls back to today rather than emitting junk. */
  function toISO(value) {
    var s = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    var t = Date.parse(s);
    if (!isNaN(t)) {
      var d = new Date(t);
      return d.getFullYear() + "-" +
             String(d.getMonth() + 1).padStart(2, "0") + "-" +
             String(d.getDate()).padStart(2, "0");
    }
    return todayISO();
  }

  function makeId(title, date, taken) {
    var base = toISO(date) + "-" + slugify(title);
    if (!taken || taken.indexOf(base) === -1) return base;
    var n = 2;
    while (taken.indexOf(base + "-" + n) !== -1) n++;
    return base + "-" + n;
  }

  function num(v) {
    var n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  /* Coerces anything post-shaped into the current schema, dropping
     fields that don't belong to its type. Idempotent. */
  function normalize(raw, taken) {
    raw = raw || {};
    var type = TYPES.indexOf(raw.type) !== -1 ? raw.type : "post";
    var cat  = CATS.indexOf(String(raw.cat || "").toLowerCase()) !== -1
               ? String(raw.cat).toLowerCase() : "books";
    var date = toISO(raw.date);
    var title = String(raw.title || "").trim();

    var out = {
      id:    String(raw.id || "").trim() || makeId(title, date, taken),
      type:  type,
      cat:   cat,
      title: title,
      date:  date
    };

    /* A subcategory only survives if the section actually has one by
       that name — so re-filing a post can't leave a stale sub behind. */
    var subs = subsFor(cat);
    var sub  = String(raw.sub || "").toLowerCase().trim();
    if (subs.length && subs.indexOf(sub) !== -1) out.sub = sub;

    if (type === "review") {
      var w = raw.work || {};
      out.work = {
        creator: String(w.creator || "").trim(),
        year:    num(w.year),
        rating:  num(w.rating),
        verdict: String(w.verdict || "").trim()
      };
      if (out.work.rating !== null) {
        out.work.rating = Math.max(0.5, Math.min(5, Math.round(out.work.rating * 2) / 2));
      }
    }

    if (type === "pick") {
      var s = raw.source || {};
      out.source = {
        author: String(s.author || "").trim(),
        url:    String(s.url || "").trim()
      };
    }

    if (type === "art") {
      var a = raw.art || {};
      out.art = {
        artist: String(a.artist || "").trim(),   /* who made it        */
        url:    String(a.url || "").trim(),      /* their own page     */
        via:    String(a.via || "").trim(),      /* where you found it */
        year:   num(a.year)
      };
    }

    out.body  = String(raw.body || "").trim();
    if (raw.image) out.image = String(raw.image).trim();
    out.draft = !!raw.draft;
    return out;
  }

  /* Errors block saving; warnings don't. */
  function validate(post) {
    var errors = [], warnings = [];

    if (!post.title) errors.push("A tale needs a title.");

    /* Picks and art can be bare entries — a recommendation or an image
       with a credit. Your own writing still has to contain writing. */
    if (!post.body) {
      if (post.type === "pick")     warnings.push("No note — this will list as a plain recommendation.");
      else if (post.type === "art") warnings.push("No note — this will hang in the gallery uncaptioned.");
      else errors.push("A tale needs a body.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) errors.push("Date must look like 2026-07-19.");

    if (post.type === "review") {
      var w = post.work || {};
      if (w.rating === null || w.rating === undefined) {
        warnings.push("No rating — this won't appear on the verdicts page.");
      }
      if (!w.creator) warnings.push("No author/director credited.");
      if (!w.verdict) warnings.push("No one-line verdict — cards will fall back to your opening prose.");
      if (w.year !== null && w.year !== undefined && (w.year < 1000 || w.year > 2999)) {
        errors.push("Year looks wrong.");
      }
    }

    if (post.type === "pick") {
      var s = post.source || {};
      /* Republishing someone else's story without naming them is the
         one thing this form refuses to do. */
      if (!s.author) errors.push("Picks must credit the original author.");
      if (!s.url) warnings.push("No source link — readers can't find the original.");
      else if (!/^https?:\/\//i.test(s.url)) errors.push("Source link must start with http:// or https://.");
    }

    if (post.type === "art") {
      var a = post.art || {};
      /* A gallery entry with no image is just an empty frame. */
      if (!post.image) errors.push("Art needs an image — put the file in assets/art/ and give its path.");
      /* Same rule as picks: never show someone's work without naming them. */
      if (!a.artist) errors.push("Art must credit the artist.");
      if (!a.url && !a.via) warnings.push("No artist link and no source — nobody can trace this back.");
      else if (a.url && !/^https?:\/\//i.test(a.url)) errors.push("Artist link must start with http:// or https://.");
      if (a.via && !/^https?:\/\//i.test(a.via)) errors.push("Source link must start with http:// or https://.");
      if (a.year !== null && a.year !== undefined && (a.year < 1000 || a.year > 2999)) {
        errors.push("Year looks wrong.");
      }
    }

    return { errors: errors, warnings: warnings, ok: errors.length === 0 };
  }

  function sortNewest(list) {
    return list.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return String(b.id) < String(a.id) ? -1 : 1;
    });
  }

  /* Bring a whole stored array up to schema — used on load to migrate
     posts written by the older admin. */
  function migrate(list) {
    var taken = [];
    return (Array.isArray(list) ? list : []).map(function (p) {
      var n = normalize(p, taken);
      taken.push(n.id);
      return n;
    });
  }

  function upsert(list, post) {
    var out = list.slice();
    var i = -1;
    out.forEach(function (p, n) { if (String(p.id) === String(post.id)) i = n; });
    if (i === -1) out.push(post); else out[i] = post;
    return sortNewest(out);
  }

  function remove(list, id) {
    return list.filter(function (p) { return String(p.id) !== String(id); });
  }

  function serialize(list) {
    return HEADER + "\nwindow.GS_POSTS = " + JSON.stringify(sortNewest(list), null, 2) + ";\n";
  }

  var THEMES = ["default", "summerween"];

  /* Rewrites content/site.js while carrying every existing value through.
     Hand-formatted rather than a bare JSON dump so the file keeps its
     comments and stays editable by hand. */
  function serializeSite(site) {
    var s = site || {};
    var about   = s.about || {};
    var links   = Array.isArray(s.links) ? s.links : [];
    var friends = Array.isArray(s.friends) ? s.friends : [];
    var j = function (v) { return JSON.stringify(v === undefined || v === null ? "" : v); };
    var theme = THEMES.indexOf(s.theme) !== -1 ? s.theme : "default";

    var listOf = function (arr, indent) {
      if (!arr.length) return "[]";
      return "[\n" + arr.map(function (o) {
        return indent + "  " + JSON.stringify(o);
      }).join(",\n") + "\n" + indent + "]";
    };

    return [
      "/* ============================================================",
      "   GRAVEYARD SHIFT — SITE SETTINGS",
      "   Everything here is yours to rewrite. No code required.",
      "   ============================================================ */",
      "",
      "window.GS_SITE = {",
      "",
      "  title:   " + j(s.title || "GRAVEYARD SHIFT") + ",",
      "  tagline: " + j(s.tagline || "") + ",",
      "  since:   " + j(s.since || String(new Date().getFullYear())) + ",",
      "",
      "  /* \"default\"    — blood red and acid green, lights off.",
      "     \"summerween\" — Halloween in July: watermelon, rind green, warm dusk.",
      "     Flip it from the admin panel, or just edit this line. */",
      "  theme:   " + j(theme) + ",",
      "",
      "  /* The about page + homepage blurb. Blank line = new paragraph. */",
      "  about: {",
      "    heading: " + j(about.heading || "ABOUT THE KEEPER") + ",",
      "    photo:   " + j(about.photo || "") + ",",
      "    bio:     " + j(about.bio || ""),
      "  },",
      "",
      "  /* Scrolling text at the top of every page. */",
      "  marquee: " + j(s.marquee || "") + ",",
      "",
      "  /* Sidebar \"now playing\" flavor. Purely decorative. */",
      "  midi: " + j(s.midi || "dead_hallway.mid") + ",",
      "",
      "  /* { label, text, url } — shown on the about page. */",
      "  links: " + listOf(links, "  ") + ",",
      "",
      "  /* { name, url } — shown in the homepage sidebar. */",
      "  friends: " + listOf(friends, "  ") + ",",
      "",
      "  /* The guestbook has no backend yet, so entries vanish on reload. */",
      "  guestbook: " + (s.guestbook === false ? "false" : "true"),
      "",
      "};",
      ""
    ].join("\n");
  }

  /* Deep-ish equality via canonical JSON, for the unsaved-changes badge. */
  function same(a, b) {
    return JSON.stringify(sortNewest(a || [])) === JSON.stringify(sortNewest(b || []));
  }

  return {
    CATS: CATS, TYPES: TYPES, THEMES: THEMES, SUBS: SUBS, HEADER: HEADER,
    subsFor: subsFor, serializeSite: serializeSite,
    slugify: slugify, todayISO: todayISO, toISO: toISO, makeId: makeId,
    normalize: normalize, validate: validate, migrate: migrate,
    upsert: upsert, remove: remove, sortNewest: sortNewest,
    serialize: serialize, same: same
  };
});
