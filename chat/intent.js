// intent.js

// trackName = (.+?)

function extractSubject(raw) {
  return raw
    .replace(/^(?:the\s+)?(?:track|album)\s+/i, "")
    .trim();
}

export function parseIntent(text) {
  const normalized = text.trim();

  const patterns = [

    /* ---------------- LINK / INFO (NEW, GENERIC) ---------------- */

    {
  intent: "link_for_title",
  match: /^(?:youtube\s+(?:link(?:\s+for)?\s+)?|link(?:\s+for)?\s+|play\s+)(.+)$/i,
  extract: m => {
    const raw = m[1].trim();
    return {
      subject: extractSubject(raw),
      explicitTrack: /^\s*track\b/i.test(raw),
      explicitAlbum: /^\s*album\b/i.test(raw)
    };
  }
},

{
  intent: "album_playlist",
  match: /^(?:playlist|link)\s+for\s+(.+)$/i,
  extract: m => ({
    subject: extractSubject(m[1]),
    explicitAlbum: true
  })
},



  {
  intent: "info_for_title",
  match: /^(?:info|information|details) for (.+)$/i,
  extract: m => {
    const raw = m[1].trim();
    return {
      subject: extractSubject(raw),
      explicitTrack: /^\s*track\b/i.test(raw),
      explicitAlbum: /^\s*album\b/i.test(raw)
    };
  }
},

/* ---------------- TRACK ---------------- */

{
  intent: "tracks_by_initial",
  match: /^(?:get|show|list)\s+(?:all\s+)?tracks\s+begin(?:ning|ning)?\s+with\s+([a-zA-Z])$/i,
  extract: m => ({ initial: m[1].toLowerCase() })
},


    {
  intent: "track_by_duration_in_album",
  match: /^(longest|shortest)\s+track\s+(?:on|from)\s+(.+)$/i,
  extract: m => ({
    durationType: m[1].toLowerCase(),
    albumName: extractSubject(m[2])
  })
},




{
  intent: "track_by_duration",
  match: /^(?:the\s*)?(longest|shortest)\s+track(?:\s+(?:overall|in\s+(?:the\s+)?catalogue))?$/i,
  extract: m => ({ durationType: m[1].toLowerCase() })
},


    {
      intent: "tracks_by_album",
      match: /^(?:list|show|display)?\s*(?:tracks|tracklist|songs)\s*(?:on|for)\s+(.+)$/i,
      extract: m => ({ albumName: m[1].trim() })
    },


{
  intent: "track_duration",
  match: /^(?:how\s+long\s+is|what(?:'s| is)?\s+the\s+(?:duration|length|runtime)\s+of)\s+(?:the\s+)?track\s+(.+)$|^(.+?)\s+track\s+(?:duration|length|runtime)$/i,
  extract: m => ({
    trackName: extractSubject(m[1] || m[2])
  })
},

    /* ---------------- ALBUM ---------------- */

// how many tracks on albumName
{
  intent: "track_count_by_album",
  match: /^how many (?:tracks|songs)(?:\s+are)?\s+on\s+(.+)$/i,
  extract: m => ({
    albumName: m[1].trim()
  })
},


// what / which album features [track name]
{
  intent: "track_album_lookup",
  match: /^(?:((?:.+?)\s+album)|(?:(?:which|what)\s+album\s+features\s+(.+?)))$/i,
  extract: m => ({
    trackName: (m[1] || m[2]).replace(/\s+album$/i, "").trim()
  })
},


   {
  intent: "album_before",
  match: /^(?:(?:which|what)(?:'s| is)?\s+)?album(?:\s+was)?(?:\s+released)?\s+before\s+(.+)$/i,
  extract: m => ({
    albumName: extractSubject(m[1])
  })
},


// which album was released after ache
    {
  intent: "album_after",
  match: /^(?:(?:which|what)(?:'s| is)?\s+)?album(?:\s+was)?(?:\s+released)?\s+after\s+(.+)$/i,
  extract: m => ({
    albumName: extractSubject(m[1])
  })
},


/* ---------- ALBUM LISTING ---------- */
{
  intent: "albums_alphabetical",
  match: /^(?:list|show)\s+(?:all\s+)?albums\s+alphabetically$/i,
  extract: () => ({})
},

{
  intent: "albums_by_length",
  match: /^(?:list|show)\s+(?:all\s+)?albums\s+by\s+(?:length|duration)\s*(?:(longest|shortest)(?:\s+first)?)?$/i,
  extract: m => ({
    type: m[1]?.toLowerCase() || "longest" // default to "longest" if not specified
  })
},



{
  intent: "albums_by_id",
  match: /^(?:list|show)\s+(?:all\s+)?albums$/i,
  extract: () => ({ reverse: false })
},

{
  intent: "albums_by_id_reverse",
  match: /^(?:list|show)\s+(?:all\s+)?albums\s+in\s+reverse\s+order$/i,
  extract: () => ({ reverse: true })
},


{
  intent: "album_duration",
  match: /^(?:how\s+long\s+is|what(?:'s| is)?\s+the\s+(?:duration|length)\s+of)\s+(?:the\s+)?album\s+(.+)$|^(.+?)\s+album\s+(?:duration|length)$/i,
  extract: m => ({
    albumName: extractSubject(m[1] || m[2])
  })
},

{
  intent: "albums_by_duration_threshold",
  match: /^(?:list|show|display|query)\s+(?:all\s+)?albums\s+(over|under)\s+(\d+)\s*(hour|hours|minute|minutes|mins|min)$/i,
  extract: m => {
    const value = parseInt(m[2], 10);
    const unit = m[3].toLowerCase();

    const minutes =
      unit.startsWith("hour")
        ? value * 60
        : value;

    return {
      comparator: m[1].toLowerCase(), // "over" | "under"
      minutes
    };
  }
},


{
  intent: "album_by_duration",
  match: /^(?:the\s*)?(longest|shortest)\s+album(?:\s+(?:overall|in\s+(?:the\s+)?catalogue))?$/i,
  extract: m => ({ durationType: m[1].toLowerCase() })
},


    /* ---------------- GENRE ---------------- */

    {
      intent: "longest_album_in_genre",
      match: /longest album in (.+)$/i,
      extract: m => ({ genre: m[1].trim().toLowerCase() })
    },

    {
      intent: "shortest_album_in_genre",
      match: /shortest album in (.+)$/i,
      extract: m => ({ genre: m[1].trim().toLowerCase() })
    },

/* ---------------- ARTWORK ---------------- */
    {
  intent: "artwork",
  match: /^(?:show|get|fetch|display)?\s*(?:the\s*)?(?:artwork|cover)\s*(?:for|of)?\s+(.+)$/i,
  extract: m => ({
    subject: extractSubject(m[1]),
    explicitAlbum: true
  })
},

/* ---------------- GENERAL ---------------- */
{
  intent: "system_explanation",
  match: /^(?:help|explain\s+this\s+system|what(?:s|'s| is)\s+this\s+system)$/i,
  extract: () => ({})
},
{
  intent: "system_explanation",
  match: /(?:electro composer|electrocomposer)$/i,
  extract: () => ({})
},


  ];

  for (const p of patterns) {
    const match = normalized.match(p.match);
    if (match) return { intent: p.intent, ...p.extract(match) };
  }

  return { intent: "unknown" };
}
