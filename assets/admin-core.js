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

  var CATS  = ["books", "creepypasta", "movies", "video games"];
  var TYPES = ["review", "pick", "post"];

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

    out.body  = String(raw.body || "").trim();
    if (raw.image) out.image = String(raw.image).trim();
    out.draft = !!raw.draft;
    return out;
  }

  /* Errors block saving; warnings don't. */
  function validate(post) {
    var errors = [], warnings = [];

    if (!post.title) errors.push("A tale needs a title.");

    /* Picks can be a bare recommendation — title, author, link, done.
       Your own writing still has to actually contain writing. */
    if (!post.body) {
      if (post.type === "pick") warnings.push("No note — this will list as a plain recommendation.");
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

  /* Deep-ish equality via canonical JSON, for the unsaved-changes badge. */
  function same(a, b) {
    return JSON.stringify(sortNewest(a || [])) === JSON.stringify(sortNewest(b || []));
  }

  return {
    CATS: CATS, TYPES: TYPES, HEADER: HEADER,
    slugify: slugify, todayISO: todayISO, toISO: toISO, makeId: makeId,
    normalize: normalize, validate: validate, migrate: migrate,
    upsert: upsert, remove: remove, sortNewest: sortNewest,
    serialize: serialize, same: same
  };
});
