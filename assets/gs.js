/* ============================================================
   GRAVEYARD SHIFT — shared runtime
   Loaded by every public page, after content/site.js and
   content/posts.js. Exposes window.GS.
   ============================================================ */

window.GS = (function () {
  "use strict";

  var SITE = window.GS_SITE || {};

  /* ---------- themes ----------
     Colours live in gs.css as custom properties; this only carries the
     handful of strings CSS can't set. Flipped from the admin panel. */
  var THEMES = {
    "default": {
      icon: "🕯",
      construction: "SECTION UNDER CONSTRUCTION",
      footer: "do not read alone. best experienced with the lights off."
    },
    "summerween": {
      icon: "🍉",
      construction: "STAND UNDER CONSTRUCTION",
      footer: "do not read alone. best experienced after sunset, porch light on."
    }
  };

  var themeName = THEMES[SITE.theme] ? SITE.theme : "default";
  var THEME = THEMES[themeName];

  /* Set before first paint so nothing flashes the wrong palette. */
  if (document.documentElement) {
    document.documentElement.setAttribute("data-theme", themeName);
  }

  var CATS = {
    "books":       { title: "BOOKS",       sub: "tomes that bite back" },
    "creepypasta": { title: "CREEPYPASTA", sub: "copy-pasted nightmares" },
    "movies":      { title: "MOVIES",      sub: "films best watched through your fingers" },
    "shows":       { title: "SHOWS",       sub: "series to fall asleep to, badly" },
    "video games": { title: "VIDEO GAMES", sub: "haunted cartridges & cursed saves" },
    "art":         { title: "ART",         sub: "things best not hung above the bed" },
    "spooky season": {
      title: "SPOOKY SEASON",
      sub:   "the calendar's two best holidays",
      subs:  {
        "halloween":  { title: "HALLOWEEN",  sub: "october's own" },
        "summerween": { title: "SUMMERWEEN", sub: "june 22nd. bring your own watermelon." }
      }
    }
  };

  var NAV = [
    { href: "category.html?cat=books",       label: "books",       key: "books" },
    { href: "category.html?cat=creepypasta", label: "creepypasta", key: "creepypasta" },
    { href: "category.html?cat=movies",      label: "movies",      key: "movies" },
    { href: "category.html?cat=shows",       label: "shows",       key: "shows" },
    { href: "category.html?cat=video+games", label: "video games", key: "video games" },
    { href: "category.html?cat=art",         label: "art",         key: "art" },
    { href: "category.html?cat=spooky+season", label: "spooky season", key: "spooky season" },
    { href: "reviews.html",                  label: "reviews",     key: "reviews" },
    { href: "archive.html",                  label: "archive",     key: "archive" },
    { href: "about.html",                    label: "about",       key: "about" }
  ];

  /* ---------- tiny DOM helpers ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function link(href, text, cls) {
    var a = el("a", cls, text);
    a.href = href;
    return a;
  }

  /* Only allow links we're willing to render. Guards against a stray
     javascript: URL finding its way into a post's source field. */
  function safeUrl(url) {
    return /^https?:\/\//i.test(String(url || "")) ? url : null;
  }

  /* ---------- data ---------- */

  var isLocal = location.protocol === "file:" ||
                /^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);

  var usingDrafts = false;

  /* content/posts.js is the source of truth.

     While running locally, admin.html's working set takes over so you can
     preview before exporting — always behind a visible banner, never
     silently. It replaces rather than merges: the working set is a complete
     set, so a post deleted in admin must disappear from preview too. */
  function allPosts() {
    var published = Array.isArray(window.GS_POSTS) ? window.GS_POSTS.slice() : [];
    if (!isLocal) return published;

    var raw = null;
    try { raw = localStorage.getItem("gs_posts"); } catch (e) { return published; }
    if (raw === null) return published;

    var working;
    try { working = JSON.parse(raw); } catch (e) { return published; }
    if (!Array.isArray(working)) return published;

    usingDrafts = true;
    return working;
  }

  function sortNewest(a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return String(b.id) < String(a.id) ? -1 : 1;
  }

  /* Published posts, newest first. Drafts excluded. */
  function posts() {
    return allPosts()
      .filter(function (p) { return p && p.title && !p.draft; })
      .sort(sortNewest);
  }

  function byCat(cat, sub) {
    var c = String(cat || "").toLowerCase();
    var s = String(sub || "").toLowerCase();
    return posts().filter(function (p) {
      if (String(p.cat || "").toLowerCase() !== c) return false;
      return !s || String(p.sub || "").toLowerCase() === s;
    });
  }

  /* The subcategory map for a section, or null if it doesn't split. */
  function subsFor(cat) {
    var meta = CATS[String(cat || "").toLowerCase()];
    return (meta && meta.subs) || null;
  }

  /* Display name for a post's subcategory, e.g. "summerween" -> "SUMMERWEEN". */
  function subTitle(cat, sub) {
    var subs = subsFor(cat);
    var key = String(sub || "").toLowerCase();
    return (subs && subs[key] && subs[key].title) || "";
  }

  function byId(id) {
    var match = null;
    allPosts().forEach(function (p) { if (String(p.id) === String(id)) match = p; });
    return match;
  }

  /* ---------- formatting ---------- */

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!m) return String(iso || "");
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function year(iso) {
    var m = /^(\d{4})/.exec(String(iso || ""));
    return m ? m[1] : "undated";
  }

  /* Renders ★★★★☆ with the empty stars dimmed rather than absent,
     so ratings stay visually comparable down a list. */
  function starsEl(rating) {
    var n = Math.max(0, Math.min(5, Number(rating) || 0));
    var wrap = el("span", "stars");
    var full = Math.floor(n);
    var half = n - full >= 0.5;
    for (var i = 0; i < 5; i++) {
      var s = el("span", i >= full + (half ? 1 : 0) ? "off" : null);
      s.textContent = (i === full && half) ? "½" : "★";
      wrap.appendChild(s);
    }
    var num = el("span", "rating-num", " " + n + "/5");
    wrap.appendChild(num);
    return wrap;
  }

  function paragraphs(text, into) {
    String(text || "").split(/\n\s*\n/).forEach(function (para) {
      if (para.trim()) into.appendChild(el("p", null, para.trim()));
    });
    return into;
  }

  function excerpt(text, max) {
    var flat = String(text || "").replace(/\s+/g, " ").trim();
    if (flat.length <= (max || 180)) return flat;
    return flat.slice(0, max || 180).replace(/\s+\S*$/, "") + "…";
  }

  /* Short line under a card title: creator · year, or the source author. */
  function subtitleFor(post) {
    if (post.type === "review" && post.work) {
      return [post.work.creator, post.work.year].filter(Boolean).join(" · ");
    }
    if (post.type === "pick" && post.source && post.source.author) {
      return "originally by " + post.source.author;
    }
    if (post.type === "art" && post.art) {
      return [post.art.artist ? "by " + post.art.artist : "", post.art.year]
             .filter(Boolean).join(" · ");
    }
    return "";
  }

  /* ---------- components ---------- */

  function thumb(post, cls) {
    if (post.image) {
      var img = document.createElement("img");
      img.className = cls;
      img.src = post.image;
      img.alt = "";
      img.style.objectFit = "cover";
      return img;
    }
    var ph = el("div", "stripe-img " + cls);
    ph.textContent = post.type === "review" ? "no cover" : "";
    return ph;
  }

  /* The card used on category, archive, and reviews pages. */
  function card(post) {
    var wrap = el("div", "card");
    wrap.appendChild(thumb(post, "card-thumb"));

    var main = el("div", "card-main");
    main.appendChild(link("post.html?id=" + encodeURIComponent(post.id), post.title, "card-title"));

    var sub = subtitleFor(post);
    if (sub) main.appendChild(el("div", "card-sub", sub));

    if (post.type === "review" && post.work && post.work.rating) {
      var r = el("div");
      r.style.marginTop = "6px";
      r.appendChild(starsEl(post.work.rating));
      main.appendChild(r);
    }

    var verdict = (post.type === "review" && post.work && post.work.verdict)
      ? "“" + post.work.verdict + "”"
      : excerpt(post.body, 160);
    if (verdict) main.appendChild(el("div", "card-verdict", verdict));

    var meta = el("div", "card-meta");
    meta.appendChild(el("span", "type-tag " + (post.type || "post"), (post.type || "post").toUpperCase()));
    meta.appendChild(el("span", null, fmtDate(post.date)));
    meta.appendChild(link("category.html?cat=" + encodeURIComponent(String(post.cat || "").toLowerCase()),
                          post.cat, null));

    if (post.sub) {
      var st = subTitle(post.cat, post.sub);
      if (st) {
        meta.appendChild(link(
          "category.html?cat=" + encodeURIComponent(String(post.cat).toLowerCase()) +
          "&sub=" + encodeURIComponent(post.sub),
          st.toLowerCase(), null));
      }
    }

    /* A pick is a recommendation — let people go straight to the story
       instead of forcing a click through a page that just points elsewhere. */
    if (post.type === "pick" && post.source) {
      var src = safeUrl(post.source.url);
      if (src) {
        var out = link(src, "read it ↗");
        out.target = "_blank";
        out.rel = "noopener noreferrer";
        meta.appendChild(out);
      }
    }
    main.appendChild(meta);

    wrap.appendChild(main);
    return wrap;
  }

  /* Gallery tile. For art the image is the point, so it leads at full
     width and the credit sits underneath. Clicking opens the full file. */
  function artTile(post) {
    var fig = el("figure", "art-tile");

    var frame = link(post.image || "#", null, "art-frame");
    frame.target = "_blank";
    frame.rel = "noopener noreferrer";
    var img = document.createElement("img");
    img.className = "art-img";
    img.src = post.image;
    img.alt = post.title || "";
    img.loading = "lazy";
    frame.appendChild(img);
    fig.appendChild(frame);

    var cap = el("figcaption", "art-cap");
    cap.appendChild(el("div", "art-title", post.title));

    var a = post.art || {};
    if (a.artist) {
      var credit = el("div", "art-artist");
      credit.appendChild(document.createTextNode("by "));
      var u = safeUrl(a.url);
      if (u) {
        var who = link(u, a.artist);
        who.target = "_blank";
        who.rel = "noopener noreferrer";
        credit.appendChild(who);
      } else {
        credit.appendChild(document.createTextNode(a.artist));
      }
      if (a.year) credit.appendChild(document.createTextNode(" · " + a.year));
      cap.appendChild(credit);
    }

    /* "found via" is deliberately separate from the artist link — an
       aggregator is where you saw it, not who made it. */
    var via = safeUrl(a.via);
    if (via) {
      var v = el("div", "art-via");
      v.appendChild(document.createTextNode("found via "));
      var vl = link(via, "source");
      vl.target = "_blank";
      vl.rel = "noopener noreferrer";
      v.appendChild(vl);
      cap.appendChild(v);
    }

    if (post.body) cap.appendChild(el("div", "art-note", excerpt(post.body, 220)));

    fig.appendChild(cap);
    return fig;
  }

  /* The compact one-line row used on the homepage. */
  function row(post) {
    var r = el("div", "post-row");
    r.appendChild(link("post.html?id=" + encodeURIComponent(post.id), post.title));
    r.appendChild(el("span", null, post.cat + " · " + fmtDate(post.date)));
    return r;
  }

  function emptyState(label, note) {
    var e = el("div", "empty");
    e.appendChild(el("div", "label", THEME.icon + " " + label + " " + THEME.icon));
    var img = document.createElement("img");
    img.src = "assets/resetti.gif";
    img.alt = "a mole, digging";
    e.appendChild(img);
    e.appendChild(el("div", "note", note));
    return e;
  }

  /* ---------- page shell ---------- */

  /* Builds the marquee, hero, and nav into #gs-shell so all seven
     pages share one copy. `here` highlights the current nav item. */
  function shell(opts) {
    opts = opts || {};
    var host = document.getElementById("gs-shell");
    if (!host) return;

    if (usingDrafts) {
      var warn = el("div", "preview-bar",
        "⚠ PREVIEW — showing unsaved drafts from this browser. Export content/posts.js to publish them.");
      host.appendChild(warn);
    }

    var bar = el("div", "marq-bar");
    bar.appendChild(el("span", "marq", opts.marquee || SITE.marquee || ""));
    host.appendChild(bar);

    var hero = el("header", "hero" + (opts.big ? " big" : ""));
    var t = el("div", "site-title");
    if (opts.big) {
      t.textContent = SITE.title || "GRAVEYARD SHIFT";
    } else {
      t.appendChild(link("index.html", SITE.title || "GRAVEYARD SHIFT"));
    }
    hero.appendChild(t);
    hero.appendChild(el("div", "tagline", SITE.tagline || ""));
    host.appendChild(hero);

    var nav = el("nav");
    NAV.forEach(function (item) {
      nav.appendChild(link(item.href, item.label, item.key === opts.here ? "here" : null));
    });
    host.appendChild(nav);
  }

  function footer() {
    var host = document.getElementById("gs-footer");
    if (!host) return;
    var f = el("footer");
    f.appendChild(document.createTextNode(
      "© " + new Date().getFullYear() + " " + (SITE.title || "GRAVEYARD SHIFT") +
      " — " + THEME.footer + " · "));
    var door = link("admin.html", "☠");
    door.style.cssText = "color:#555;text-decoration:none";
    door.title = "keeper's entrance";
    /* admin.html is local-only and never deployed — hide the door in production */
    if (!isLocal) door.style.display = "none";
    f.appendChild(door);
    host.appendChild(f);
  }

  /* Call once per page: renders shell + footer, returns nothing. */
  function boot(opts) {
    posts();       /* primes usingDrafts before the shell renders */
    shell(opts);
    footer();
  }

  return {
    SITE: SITE, CATS: CATS, isLocal: isLocal,
    THEME: THEME, THEMES: THEMES, themeName: themeName,
    el: el, link: link, safeUrl: safeUrl,
    posts: posts, byCat: byCat, byId: byId, allPosts: allPosts,
    subsFor: subsFor, subTitle: subTitle,
    fmtDate: fmtDate, year: year, stars: starsEl, paragraphs: paragraphs,
    excerpt: excerpt, subtitleFor: subtitleFor,
    card: card, row: row, artTile: artTile, thumb: thumb, emptyState: emptyState,
    boot: boot
  };
})();
