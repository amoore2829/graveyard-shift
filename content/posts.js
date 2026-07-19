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
       author: "Ted the Caver",
       url:    "https://..."             // credit the original. always.
     }

   type: "post"    — freeform essay. no extra fields.

   ============================================================ */

window.GS_POSTS = [];
