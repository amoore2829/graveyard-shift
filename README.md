# GRAVEYARD SHIFT 🕯

a zine for the sleep-deprived and superstitious — a campy, GeoCities-era horror blog.

Live at **https://amoore2829.github.io/graveyard-shift/**

Static site. No build step, no framework, no dependencies.

## Writing a post

1. Open `admin.html` locally (double-click it, or serve the folder).
2. Write. Pick a kind:
   - **review** — books, movies, games. Gets author/director, year, star rating, one-line verdict.
   - **pick** — someone else's creepypasta. Requires crediting the original author.
   - **post** — your own freeform writing.
3. Hit **GENERATE content/posts.js**, save it over `content/posts.js`, and commit.

Pushing to `main` deploys automatically.

Drafts stay local and never reach the live site. While running locally, unsaved
work shows on the real pages behind an amber preview banner.

## Layout

```
index.html       homepage — featured post, recents, category grid
category.html    ?cat=books — one section, filterable
post.html        ?id=... — a single tale
about.html       bio, stats ledger, highest rated
archive.html     everything, grouped by year, searchable
reviews.html     every rated thing, ranked

content/posts.js the single source of truth for all posts
content/site.js  title, tagline, bio, links, friends
assets/gs.css    all styling
assets/gs.js     shared runtime — data loading, cards, ratings, page shell

admin.html       keeper's control panel — LOCAL ONLY, never deployed
```

`admin.html` and `assets/admin-core.js` are tracked here so they stay backed up,
but the Pages workflow strips them out of every deploy.

## Editing by hand

`content/posts.js` is plain JavaScript and documents its own schema at the top.
Nothing stops you writing posts directly in a text editor.

best experienced with the lights off.
