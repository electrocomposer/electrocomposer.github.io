// main.js

import {API_BASE} from './apiBase.js';
import {fetchJSON} from './fetchJson.js';
// import { normalizeQuery } from "./normalizeQuery.js";
import {parseIntent} from './intent.js';
import {steps} from './steps.js';
import {formatters} from './formatters.js';
import {intentRegistry} from './registry.js';
import {launchConfetti} from './confetti.js';
import { addMessage, addImage, addLink, addBlocks } from './uiHelper.js';


const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");


/* ============================================================
   DISPATCH ENGINE
   ============================================================ */

   async function executeArtwork(ctx) {

  /* Attempt direct album resolution */
  const albumCtx = { albumName: ctx.subject };

  try {
    await steps.fetchAlbums(albumCtx);
    await steps.resolveAlbum(albumCtx);
    return formatters.albumArtwork(albumCtx);
  } catch (_) {}

  /* Attempt track → album resolution */
  const tracks = await fetchJSON(
    `${API_BASE}/tracks?trackName=${encodeURIComponent(ctx.subject)}`
  );

  if (!tracks.length) {
    return `I couldn’t find an album or track called "${ctx.subject}".`;
  }

  const albumCtxFromTrack = {
    albumName: tracks[0].albumName
  };

  await steps.fetchAlbums(albumCtxFromTrack);
  await steps.resolveAlbum(albumCtxFromTrack);

  return formatters.albumArtwork(albumCtxFromTrack);
}


async function handleMessage(text) {

  /* ============================================================
     PHASE 1: Parse intent
     ============================================================ */



    // const normalized = normalizeQuery(text);
    // const parsed = parseIntent(normalized);
    const parsed = parseIntent(text);

  

  /* ============================================================
     PHASE 2: Artwork bypass (canonical)
     ============================================================ */

  if (parsed.intent === "artwork") {
    return await executeArtwork(parsed);
  }

  /* ============================================================
   PHASE 3: Registry-based intents
   ============================================================ */

const intent = intentRegistry[parsed.intent];

if (!intent) {
  launchConfetti();
  return "I don't understand that query, please try something else.";
}

const ctx = { ...parsed };

try {
  for (const stepName of intent.plan) {
    const step = steps[stepName];
    if (!step) throw new Error(`Unknown step: ${stepName}`);
    
    await step(ctx);
  }


  // If a formatter is defined, use it; otherwise return ctx directly (rich object)
  // Handle formatter: string → lookup in formatters, function → call directly
if (intent.format) {
  if (typeof intent.format === "string") {
    return formatters[intent.format](ctx);
  } else if (typeof intent.format === "function") {
    return intent.format(ctx);
  }
} else {
  // no formatter → return ready-to-render object (e.g., playlist)
  return ctx.playlistLink;
}


} catch (err) {
  console.error(err);
  return err.message || "Something went wrong.";
}
// 
// 
}



/* ============================================================
   EVENT WIRING
   ============================================================ */

form.addEventListener("submit", async e => {
  e.preventDefault();

  // Always clear autocomplete on submit
  suggestionsList.innerHTML = "";
  selectedIndex = -1;

  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const result = await handleMessage(text);

  if (Array.isArray(result)) {
  // multi-block response (track_info)
  addBlocks(result);
} else if (typeof result === "object") {
  // single object response (image/link)
  if (result.type === "image") addImage(result);
  else if (result.type === "link") addLink(result);
  else addMessage(JSON.stringify(result), "bot"); // fallback
} else {
  // plain string
  addMessage(result, "bot");
}

});

/* ============================================================
   BOOT MESSAGE
   ============================================================ */

addMessage(
  "Examples:\n" +
  "• List tracks on Limo\n" +
  "• Show artwork for Ache (clickable)\n" +
  "• What is the shortest album in Electronic\n"
  // "• Which album was released after Pimento\n" +
  // "• Longest album\n" +
  // "• Longest track on Limo\n" +
  // "• Playlist for Vertical (link)\n" +
  // "• Play Avid\n" +
  // "• Info for Limo\n" +
  // "• Limo duration \n" +
  // "• Which album is Rinse on\n"
);









/* ============================================================
   AUTOFILL prompts specifically for the entered album or track name
   ============================================================ */

/* ===============================
   CACHED DATA
================================ */

let ALL_TRACK_NAMES = [];
let ALL_ALBUM_NAMES = [];
let DATA_READY = false;

// Static list of possible queries
const queries = [
  // LINK / PLAY
  "play [Track Name]",
  "play [Album Name]",
  "link [Track Name]",
  "link [Album Name]",
  "link for [Track Name]",
  "link for [Album Name]",
  "youtube [Track Name]",
  "youtube [Album Name]",
  "youtube link [Track Name]",
  "youtube link [Album Name]",
  "youtube link for [Track Name]",
  "youtube link for [Album Name]",

  // PLAYLIST
  "playlist for [Album Name]",

  // INFO
  "info for [Track Name]",
  "info for [Album Name]",
  "information for [Track Name]",
  "information for [Album Name]",
  "details for [Track Name]",
  "details for [Album Name]",

  // TRACK BY INITIAL
  "get tracks beginning with [Letter]",
  "list tracks beginning with [Letter]",
  "show tracks beginning with [Letter]",
  "list all tracks beginning with [Letter]",
  "show all tracks beginning with [Letter]",

  // TRACK DURATION (BY ALBUM)
  "longest track on [Album Name]",
  "longest track from [Album Name]",
  "shortest track on [Album Name]",
  "shortest track from [Album Name]",

  // TRACK DURATION (OVERALL)
  "longest track",
  "shortest track",
  "longest track overall",
  "shortest track overall",
  "longest track in the catalogue",
  "shortest track in catalogue",

  // TRACK DURATION (single track)
  "how long is track [Track Name]",
  "what is the duration of track [Track Name]",
  "[Track Name] track duration",
  "[Track Name] track length",
  "[Track Name] track runtime",
  "[Track Name] track length",


  // TRACK LISTING
  "list tracks for [Album Name]",
  "list tracks on [Album Name]",
  "show tracklist for [Album Name]",
  "display songs for [Album Name]",
  "show tracks on [Album Name]",
  "tracks on [Album Name]",

  // TRACK COUNT
  "how many tracks on [Album Name]",
  "how many songs on [Album Name]",
  "how many songs are on [Album Name]",

  // TRACK → ALBUM LOOKUP
  "which album features [Track Name]",
  "what album features [Track Name]",
  "which album is [Track Name] on",
  "what album is [Track Name] on",

  // ALBUM BEFORE / AFTER
  "which album was released before [Album Name]",
  "what was the album released before [Album Name]",
  "album before [Album Name]",
  "which album was released after [Album Name]",
  "what was the album released after [Album Name]",
  "album after [Album Name]",

  // ALBUM LISTING
  "list albums",
  "show all albums",
  "list albums alphabetically",
  "show all albums alphabetically",
  "list albums by length",
  "list albums by duration",
  "show albums by length",
  "show albums by length longest",
  "show albums by length shortest first",
  "show albums in reverse order",
  "list all albums in reverse order",

  // ALBUM DURATION
  "how long is album [Album Name]",
  "what is the duration of album [Album Name]",
  "[Album Name] album duration",
  "[Album Name] album length",

  "list albums over 45 minutes",
  "list albums under 45 minutes",
  "list albums over 1 hour",
  "show albums over 1 hour",
  "query albums over 1 hour",

  // ALBUM BY DURATION (OVERALL)
  "longest album",
  "shortest album",
  "longest album overall",
  "shortest album in the catalogue",

  // GENRE
  "longest album in [Genre]",
  "shortest album in [Genre]",

  // ARTWORK
  "show artwork for [Album Name]",
  "get artwork for [Album Name]",
  "display the album cover for [Album Name]",
  "fetch cover of [Album Name]",
  "fetch cover for [Album Name]",

  // GENERAL
  "help",
  "explain this system",
  "what is this system",

  // PROMPTS FILLER (for start letter not yet active)
  "oh whoops! no prompts here (try another start letter)",
  "jokes! no prompts start with j (try another start letter)",
  "knock knock!, no prompts here (try another start letter)",
  "z - no prompts beginning with z, try another letter",
  "x - no prompts beginning with x, try another letter",

];

const suggestionsList = document.getElementById("suggestions");

/* ===============================
   INITIAL LOAD (ONCE)
================================ */

async function preloadCatalog() {
  try {
    console.log("[autocomplete] loading albums + tracks");

    const [tracks, albums] = await Promise.all([
      fetch(`${API_BASE}/tracks`).then(r => r.json()),
      fetch(`${API_BASE}/albums`).then(r => r.json())
    ]);

    ALL_TRACK_NAMES = tracks.map(t => t.trackName);
    ALL_ALBUM_NAMES = albums.map(a => a.albumName);

    DATA_READY = true;
    console.log("[autocomplete] cache ready");
  } catch (err) {
    console.error("[autocomplete] preload failed", err);
  }
}

preloadCatalog();

/* ===============================
   UTILITIES
================================ */

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function getTrackMatches(partial) {
  if (partial.length < 1) return [];
  return ALL_TRACK_NAMES.filter(name =>
    name.toLowerCase().startsWith(partial.toLowerCase())
  );
}

function getAlbumMatches(partial) {
  if (partial.length < 1) return [];
  return ALL_ALBUM_NAMES.filter(name =>
    name.toLowerCase().startsWith(partial.toLowerCase())
  );
}

/* ===============================
   SUGGESTION GENERATION
================================ */

function generateSuggestions(inputValue) {
  if (!DATA_READY) return [];

  const suggestions = [];
  const lowerInput = inputValue.toLowerCase();

  queries.forEach(template => {
    const lowerTemplate = template.toLowerCase();

    // Dynamic track replacement
    if (template.includes("[Track Name]")) {
      const prefix = template.split("[Track Name]")[0].toLowerCase();
      if (lowerInput.startsWith(prefix)) {
        const partial = inputValue.slice(prefix.length).trim();
        if (partial.length >= 1) {
          getTrackMatches(partial).forEach(track => {
            suggestions.push(template.replace("[Track Name]", track));
          });
        }
        return;
      }
    }

    // Dynamic album replacement
    if (template.includes("[Album Name]")) {
      const prefix = template.split("[Album Name]")[0].toLowerCase();
      if (lowerInput.startsWith(prefix)) {
        const partial = inputValue.slice(prefix.length).trim();
        if (partial.length >= 1) {
          getAlbumMatches(partial).forEach(album => {
            suggestions.push(template.replace("[Album Name]", album));
          });
        }
        return;
      }
    }

    // Static fallback
    if (lowerTemplate.startsWith(lowerInput)) {
      suggestions.push(template);
    }
  });

  return [...new Set(suggestions)].slice(0, 10);
}

/* ===============================
   RENDERING
================================ */

let selectedIndex = -1; // currently highlighted suggestion

function normalizeSuggestion(text) {
  return (
    text
      .replace(/\[(Album|Track) Name\]|\[Letter\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim() + " "
  );
}



function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = "";
  selectedIndex = -1;

  suggestions.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    li.style.cursor = "pointer";

    li.addEventListener("mousedown", e => {
      e.preventDefault();

      input.value = normalizeSuggestion(text);
      suggestionsList.innerHTML = "";
      selectedIndex = -1;
      input.focus();
    });

    suggestionsList.appendChild(li);
  });
}



input.addEventListener("keydown", e => {
  const items = suggestionsList.querySelectorAll("li");
  const hasSuggestions = items.length > 0;

  // Arrow navigation only when suggestions exist
  if (hasSuggestions && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    e.preventDefault();

    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % items.length;
    } else {
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    }

    updateHighlight(items);
    return;
  }

  // ENTER KEY LOGIC
  if (e.key === "Enter") {
    // Case 1: autocomplete selection
    if (hasSuggestions && selectedIndex >= 0) {
      e.preventDefault();

      input.value = normalizeSuggestion(
        items[selectedIndex].textContent
      );

      suggestionsList.innerHTML = "";
      selectedIndex = -1;
      input.focus();
      return;
    }

    // Case 2: no active suggestion → allow form submit
    // DO NOT preventDefault
  }
});


function updateHighlight(items) {
  items.forEach((item, i) => {
    if (i === selectedIndex) {
      item.style.backgroundColor = "#bde4ff"; // highlight color
    } else {
      item.style.backgroundColor = "";
    }
  });
}


/* ===============================
   INPUT HANDLER
================================ */

input.addEventListener(
  "input",
  debounce(() => {
    const value = input.value.trim();
    if (!value) {
      suggestionsList.innerHTML = "";
      return;
    }

    const suggestions = generateSuggestions(value);
    renderSuggestions(suggestions);
  }, 200)
);

/* ===============================
   BLUR CLEANUP
================================ */

input.addEventListener("blur", () => {
  setTimeout(() => {
    suggestionsList.innerHTML = "";
  }, 150);
});
