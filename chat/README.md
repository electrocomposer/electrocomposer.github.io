## askEC
[LIVE SITE](askec.olk1.com)

---
# todo

also catch track singular with tracks/s

add "what is the" and other sentence structure to prompts that dont currently include it in their regex

add list/show type alternative words to prompts

---

Examples:
• List tracks on Ache
• Which album was released after Pimento
• Show artwork for Sister (clickable)
• Longest album
• What is the shortest album in Electronic
• Longest track on Limo
• Playlist for Vertical (link)
• Play Avid
• Info for Limo
• Limo album duration
• Which album is Rinse on

---

ALL intent.js REGEXES explained:

# 1. LINK / INFO (generic)

```
Intent: link_for_title
Regex: /^(?:youtube\s+(?:link(?:\s+for)?\s+)?|link(?:\s+for)?\s+|play\s+)(.+)$/i
```

Examples:

youtube [Album Name]

youtube [Track Name]

youtube link [Album Name]

youtube link [Track Name]

youtube link for [Album Name]

youtube link for [Track Name]

link [Album Name]

link [Track Name]

link for [Album Name]

play [Album Name]

play [Track Name]
```
Intent: album_playlist
Regex: ^(?:playlist|link)\s+for\s+(.+)$
```

Examples:

playlist for [albumName]

link for [albumName]

```
Intent: info_for_title
Regex: ^(?:info|information|details) for (.+)$
```

Examples:

info for [trackName]

info for [albumName]

information for [trackName]

information for [albumName]

details for [trackName]

details for [albumName]

# 2. TRACK INTENTS

```
{
  intent: "tracks_by_initial",
  match: /^(?:show|list)\s+(?:all\s+)?tracks\s+begin(?:ning|ning)?\s+with\s+([a-zA-Z])$/i,
  extract: m => ({ initial: m[1].toLowerCase() })
},
```
Examples:
"get tracks beginning with [letter]",
"list tracks beginning with [letter]",
"show all tracks beginning with [letter]",
"show tracks beginning with [letter]",

```
Intent: track_by_duration_in_album
Regex: ^(longest|shortest)\s+track\s+(?:on|from)\s+(.+)$
```

Examples:

longest track on [albumName]

shortest track from [albumName]

longest track from [albumName]

shortest track on [albumName]

```
Intent: track_by_duration
Regex: ^(?:the\s*)?(longest|shortest)\s+track(?:\s+(?:overall|in\s+(?:the\s+)?catalogue))?$
```

Examples:

longest track

shortest track

the longest track

the shortest track

longest track overall

shortest track overall

longest track in the catalogue

shortest track in catalogue


```
Rgex: /^(?:how\s+long\s+is|what(?:'s| is)?\s+the\s+(?:duration|length|runtime)\s+of)\s+(.+)$|^(.+?)\s+(?:track\s+)?(?:duration|length|runtime)$/i,
```

Examples:
how long is trackName

what is the duration of trackName
what is the length of trackName

trackName length

trackName runtime



```
Intent: tracks_by_album
Regex: ^(?:list|show|display)?\s*(?:tracks|tracklist|songs)\s*(?:on|for)\s+(.+)$
```

Examples:

list tracks for [albumName]

show tracklist on [albumName]

display songs for [albumName]

tracks on [albumName]

# 3. ALBUM INTENTS

```
Intent: track_count_by_album
Regex: ^how many (?:tracks|songs)(?:\s+are)?\s+on\s+(.+)$
```

Examples:

how many tracks on [albumName]

how many songs are on [albumName]

how many songs on [albumName]

```
Intent: track_album_lookup
Regex: ^(?:(?:which|what)\s+album\s+is\s+(.+?)(?:\s+on)?)$
```

Examples:

which album is [trackName]

what album is [trackName]

which album is [trackName] on

what album is [trackName] on

```
Intent: album_before
Regex: ^(?:(?:which|what)(?:'s| is)?\s+)?album(?:\s+was)?(?:\s+released)?\s+before\s+(.+)$
```

Examples:

which album was released before [albumName]

what album is before [albumName]

album released before [albumName]

album before [albumName]

```
Intent: album_after
Regex: ^(?:(?:which|what)(?:'s| is)?\s+)?album(?:\s+was)?(?:\s+released)?\s+after\s+(.+)$
```

Examples:

which album was released after [albumName]

what album is after [albumName]

album released after [albumName]

album after [albumName]

# 4. ALBUM LISTING INTENTS

```
Intent: albums_alphabetical
Regex: ^(?:list|show)\s+(?:all\s+)?albums\s+alphabetically$
```

Examples:

list albums alphabetically

show all albums alphabetically

```
Intent: albums_by_length
Regex: ^(?:list|show)\s+(?:all\s+)?albums\s+by\s+(?:length|duration)\s*(?:(longest|shortest)(?:\s+first)?)?$
```

Examples:

show albums by length

list albums by duration

show all albums by length longest

show albums by length shortest first

list albums by duration shortest

```
Intent: albums_by_id
Regex: ^(?:list|show)\s+(?:all\s+)?albums$
```

Examples:

list albums

show all albums

```
Intent: albums_by_id_reverse
Regex: ^(?:list|show)\s+(?:all\s+)?albums\s+in\s+reverse\s+order$
```

Examples:

show albums in reverse order

list all albums in reverse order

```
Intent: album_duration
Regex: ^(?:how long is|what(?:'s| is)? the duration of)\s+(.+)$|^(.+)\s+(?:duration|length)$
```

Examples:

how long is [albumName]

what's the duration of [albumName]

what is the duration of [albumName]

[albumName] duration

[albumName] length


```
{
  intent: "albums_by_duration_threshold",
  match: /^(?:list|show|display)\s+(?:all\s+)?albums\s+(over|under)\s+(\d+)\s*(hour|hours|minute|minutes|mins|min)$/i,
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
```
Examples:

list albums over 45 minutes


list albums under 45 minutes

show albums over 1 hour

query albums over 1 hour

```
Intent: album_by_duration
Regex: ^(?:the\s*)?(longest|shortest)\s+album(?:\s+(?:overall|in\s+(?:the\s+)?catalogue))?$
```

Examples:

longest album

shortest album

the longest album overall

shortest album in the catalogue

# 5. GENRE INTENTS

```
Intent: longest_album_in_genre
Regex: longest album in (.+)
```

Examples:

longest album in ambient

longest album in rock

longest album in jazz

```
Intent: shortest_album_in_genre
Regex: shortest album in (.+)
```

Examples:

shortest album in ambient

shortest album in rock

# 6. ARTWORK INTENT

```
Intent: artwork
Regex: ^(?:show|get|fetch|display)?\s*(?:the\s*)?(?:artwork|cover)\s*(?:for|of)?\s+(.+)$
```

Examples:

show artwork for [albumName]

fetch cover of [albumName]

display the album cover for [albumName]

get artwork [albumName]


# 7. GENERAL INTENT

```
{
  intent: "system_explanation",
  match: /^(?:explain|what(?:'s| is))\s+(?:this\s+)?system$/i,
  extract: () => ({})
}
```

Examples:
"help",
"explain this system",
"what is this system",
"what's this system",
"whats this system"

---
---
---
---

# key files for adding new questions/answers
```
The intent pipeline, (intent-handling system):

intent.js → detect what the user wants.

registry.js → decide which plan of steps to execute.

steps.js → perform the actions to gather or compute the data.

formatters.js → return the final output.
```



