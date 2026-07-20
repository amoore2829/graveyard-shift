/* ============================================================
   GRAVEYARD SHIFT — SITE SETTINGS
   Everything here is yours to rewrite. No code required.
   ============================================================ */

window.GS_SITE = {

  title:   "GRAVEYARD SHIFT",
  tagline: "a zine for the sleep-deprived and superstitious",
  since:   "2026",          /* shown in the about page ledger */

  /* "default" — blood red and acid green, lights off.
     "summerween" — Halloween in July: watermelon, rind green, warm dusk.
     Flip it from the admin panel, or just edit this line. */
  theme:   "default",

  /* The about page + homepage blurb. Blank line = new paragraph. */
  about: {
    heading: "ABOUT THE KEEPER",
    photo:   "",              /* e.g. "assets/keeper.jpg" — blank shows a placeholder */
    bio:
      "Write your introduction here.\n\n" +
      "Who you are, what scares you, and why you started keeping this site. " +
      "Open content/site.js and replace this text."
  },

  /* Scrolling text at the top of every page. */
  marquee: "welcome to the graveyard shift — new tales whenever the house makes noises",

  /* Sidebar "now playing" flavor. Purely decorative. */
  midi: "dead_hallway.mid",

  /* Where people can find you. Shown on the about page.
     { label: "...", text: "...", url: "..." } — url is optional. */
  links: [],

  /* Other sites you like. Shown in the homepage sidebar.
     { name: "...", url: "..." } — leave the list empty to hide the box. */
  friends: [],

  /* The guestbook has no backend yet, so entries vanish on reload.
     Set this to false to hide it until it's wired up for real. */
  guestbook: true

};
