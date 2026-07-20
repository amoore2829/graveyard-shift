/* ============================================================
   GRAVEYARD SHIFT — THE CRYPT LEDGER
   ------------------------------------------------------------
   This file is the single source of truth for every post on the
   site. Edit it here by hand, or let admin.html write it for you.

   Keep it in git and your writing can never be lost.

   ---- POST SHAPE -------------------------------------------

   {
     id:    "2026-07-19-house-of-leaves",   // unique; used in URLs
     type:  "review" | "pick" | "post",
     cat:   "books" | "movies" | "creepypasta" | "video games",
     title: "House of Leaves",
     date:  "2026-07-19",                   // ISO. shown as "July 19, 2026"
     body:  "prose here.\n\nblank line = new paragraph",
     image: "assets/covers/hol.jpg",        // optional
     draft: false                           // true = hidden from the site
   }

   ---- TYPE-SPECIFIC FIELDS ---------------------------------

   type: "review"  — books, movies, video games
     work: {
       creator: "Mark Z. Danielewski",   // author / director / studio
       year:    2000,
       rating:  5,                       // 1–5, halves ok (4.5)
       verdict: "the book that made me afraid of hallways"
     }

   type: "pick"    — creepypasta you didn't write but love
     source: {
       author: "u/Maliagirl1314",
       url:    "https://..."             // credit the original. always.
     }
     body is optional on picks — leave it empty for a plain
     recommendation, or add a line or two on why you love it.

   type: "post"    — freeform essay. no extra fields.

   ============================================================ */

window.GS_POSTS = [
  {
    "id": "2026-07-20-calling-all-creeps",
    "type": "art",
    "cat": "art",
    "title": "Calling All Creeps!",
    "date": "2026-07-20",
    "image": "assets/art/calling-all-creeps.webp",
    "art": {
      "artist": "Tim Jacobus — Scholastic",
      "url": "",
      "via": "",
      "year": 1996
    },
    "body": "",
    "draft": false
  },
  {
    "id": "2026-07-20-grim-reaper-saxophone",
    "type": "art",
    "cat": "art",
    "title": "The Grim Reaper Plays Us Out",
    "date": "2026-07-20",
    "image": "assets/art/grim-reaper-saxophone.jpg",
    "art": {
      "artist": "Maxis / EA — The Sims",
      "url": "",
      "via": "https://www.pinterest.com/pin/913878949403200458/",
      "year": null
    },
    "body": "",
    "draft": false
  },
  {
    "id": "2026-07-20-whisper-halloween",
    "type": "art",
    "cat": "art",
    "title": "Whisper Dressed for the Occasion",
    "date": "2026-07-20",
    "image": "assets/art/whisper-halloween.jpg",
    "art": {
      "artist": "Level-5 — Yo-kai Watch",
      "url": "",
      "via": "https://www.pinterest.com/pin/913878949396353588/",
      "year": null
    },
    "body": "",
    "draft": false
  },
  {
    "id": "2026-07-20-spooky-fruit",
    "type": "art",
    "cat": "art",
    "title": "Spooky Fruit",
    "date": "2026-07-20",
    "image": "assets/art/skeleton-fruit-snacks.jpg",
    "art": {
      "artist": "Sunkist Fun Fruits commercial",
      "url": "",
      "via": "",
      "year": null
    },
    "body": "",
    "draft": false
  },
  {
    "id": "2026-07-19-my-wife-has-been-peeking-at-me",
    "type": "pick",
    "cat": "creepypasta",
    "title": "My wife has been peeking at me from around corners and behind furniture",
    "date": "2026-07-19",
    "source": {
      "author": "u/Maliagirl1314",
      "url": "https://www.reddit.com/r/nosleep/comments/sva7z6/my_wife_has_been_peeking_at_me_from_around/"
    },
    "body": "",
    "draft": false
  }
];
