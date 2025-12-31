# askEC - A rule-driven conversational music catalogue chatbot with deterministic intent resolution.

Below is a complete, exhaustive catalogue of all user-askable queries

1. SYSTEM / GENERAL
System explanation

help

explain this system

what is this system

what’s this system

whats this system

electro composer

electrocomposer

2. LINKS / PLAYBACK / INFO
YouTube / play / generic link

Subject = track or album

play [Track Name]

play [Album Name]

link [Track Name]

link [Album Name]

link for [Track Name]

link for [Album Name]

youtube [Track Name]

youtube [Album Name]

youtube link [Track Name]

youtube link [Album Name]

youtube link for [Track Name]

youtube link for [Album Name]

Album playlist

playlist for [Album Name]

link for [Album Name]

Information lookup

info for [Track Name]

info for [Album Name]

information for [Track Name]

information for [Album Name]

details for [Track Name]

details for [Album Name]

3. TRACK-CENTRIC QUERIES
Tracks beginning with a letter

list tracks beginning with A

show all tracks beginning with B

get tracks beginning with Z

(letter must be A–Z)

Track duration (single track)
Natural language

how long is [Track Name]

what is the duration of [Track Name]

what’s the duration of [Track Name]

what is the length of [Track Name]

what is the runtime of [Track Name]

Suffix style

[Track Name] track duration

[Track Name] track length

[Track Name] track runtime

[Track Name] track duration

[Track Name] track length

[Track Name] track runtime

Longest / shortest track (global)

longest track

shortest track

the longest track

the shortest track

longest track overall

shortest track in the catalogue

Longest / shortest track on an album

longest track on [Album Name]

shortest track on [Album Name]

longest track from [Album Name]

shortest track from [Album Name]

Tracks on an album

list tracks on [Album Name]

show tracks for [Album Name]

display songs on [Album Name]

tracklist for [Album Name]

Which album a track belongs to

which album features [Track Name]

what album features [Track Name]

[Track Name] album

4. ALBUM-CENTRIC QUERIES
Track count on album

how many tracks on [Album Name]

how many songs on [Album Name]

how many tracks are on [Album Name]

Album release order
Before

which album was released before [Album Name]

album released before [Album Name]

After

which album was released after [Album Name]

album released after [Album Name]

album albumName duration (single album)

how long is album [Album Name]

what is the duration of album [Album Name]

what’s the duration of album [Album Name]

[Album Name] album duration

Suffix style

[Album Name] album duration

[Album Name] album length

Album listings (general)

All albums

list albums

show all albums

Reverse order

list albums in reverse order

show all albums in reverse order

Alphabetical

list albums alphabetically

show albums alphabetically

Albums by duration (ordering)

list albums by duration

list albums by length

list albums by duration longest first

list albums by duration shortest first

Albums by duration threshold

list albums over 45 minutes

show albums under 30 minutes

display albums over 1 hour

query albums under 50 mins

Longest / shortest album (global)

longest album

shortest album

the longest album

shortest album in the catalogue

Longest / shortest album by genre

longest album in [Genre]

shortest album in [Genre]

5. ARTWORK

artwork for [Album Name]

cover for [Album Name]

show artwork for [Album Name]

display cover of [Album Name]

(album-explicit only)

6. NEGATIVE / FALLBACK CASES

Handled implicitly:

unsupported starting letters (e.g. no tracks for X)

unmatched queries → unknown

empty catalogue results

ambiguous subject resolution handled downstream

Summary

Your system currently supports five major semantic domains:

System/meta

Playback & links

Track-level facts

Album-level facts

Catalogue-level analytics