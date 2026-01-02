// main.js

import {API_BASE} from './apiBase.js';
import {fetchJSON} from './fetchJson.js';
import {parseIntent} from './intent.js';
import {steps} from './steps.js';
import {formatters} from './formatters.js';
import {intentRegistry} from './registry.js';
import {launchConfetti} from './confetti.js';
import { addMessage, addImage, addLink, addBlocks } from './uiHelper.js';
import {PROMPT_TEMPLATES} from './prompts.js';

const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");


let GENRES = [];
let ALBUMS = [];
let TRACKS = [];


async function executeArtwork(ctx) {

  const albumCtx = { albumName: ctx.subject };

  try {
    await steps.fetchAlbums(albumCtx);
    await steps.resolveAlbum(albumCtx);
    return formatters.albumArtwork(albumCtx);
  } catch (_) {}
  
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
  const parsed = parseIntent(text);

  // Artwork is intentionally bypassed
  if (parsed.intent === "artwork") {
    return await executeArtwork(parsed);
  }

  const intentDef = intentRegistry[parsed.intent];

  if (!intentDef) {
    launchConfetti();
    return "I don't understand that query, please try something else.";
  }

  const ctx = { ...parsed };

  try {
    for (const stepName of intentDef.plan) {
      const step = steps[stepName];
      if (!step) throw new Error(`Unknown step: ${stepName}`);
      await step(ctx);
    }

    if (!intentDef.format) {
      return ctx.playlistLink ?? ctx;
    }

    return typeof intentDef.format === "string"
      ? formatters[intentDef.format](ctx)
      : intentDef.format(ctx);

  } catch (err) {
    console.error(err);
    return err.message || "Something went wrong.";
  }
}


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









let DATA_READY = false;



(async function preloadCatalog() {
  const [albums, tracks] = await Promise.all([
    fetchJSON(`${API_BASE}/albums`),
    fetchJSON(`${API_BASE}/tracks`)
  ]);

  buildGenreIndex(albums);
  ALBUMS = albums.map(a => a.albumName);
  TRACKS = tracks.map(t => t.trackName);

  DATA_READY = true;
})();




function buildGenreIndex(albums) {
  GENRES = [
    ...new Set(
      albums
        .map(a => a.genre)
        .filter(Boolean)
        .map(g => g.toLowerCase())
    )
  ].sort();
}



const suggestionsList = document.getElementById("suggestions");



function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}



function generateSuggestions(inputValue) {
  if (!DATA_READY) return [];

  const lowerInput = inputValue.toLowerCase();
  const suggestions = [];

  PROMPT_TEMPLATES.forEach(template => {
    const lowerTemplate = template.toLowerCase();

    if (template.includes("[Album Name]")) {
      const prefix = template.split("[Album Name]")[0].toLowerCase();

      if (lowerTemplate.startsWith(lowerInput)) {
        suggestions.push(template);
        return;
      }

      if (lowerInput.startsWith(prefix)) {
        const partial = inputValue.slice(prefix.length).trim().toLowerCase();

        ALBUMS.forEach(name => {
          if (!partial || name.toLowerCase().startsWith(partial)) {
            suggestions.push(template.replace("[Album Name]", name));
          }
        });
      }
      return;
    }

    if (template.includes("[Track Name]")) {
      const prefix = template.split("[Track Name]")[0].toLowerCase();

      if (lowerTemplate.startsWith(lowerInput)) {
        suggestions.push(template);
        return;
      }


      if (lowerInput.startsWith(prefix)) {
        const partial = inputValue.slice(prefix.length).trim().toLowerCase();

        TRACKS.forEach(name => {
          if (!partial || name.toLowerCase().startsWith(partial)) {
            suggestions.push(template.replace("[Track Name]", name));
          }
        });
      }
      return;
    }


    if (template.includes("[Genre]")) {
      const prefix = template.split("[Genre]")[0].toLowerCase();

      // Phase 1: show template before genre typing starts
      if (lowerTemplate.startsWith(lowerInput)) {
        suggestions.push(template);
        return;
      }

      // Phase 2: expand genre once prefix is reached
      if (lowerInput.startsWith(prefix)) {
        const partial = inputValue
          .slice(prefix.length)
          .trim()
          .toLowerCase();

        GENRES.forEach(genre => {
          if (!partial || genre.toLowerCase().startsWith(partial)) {
            suggestions.push(
              template.replace("[Genre]", genre)
            );
          }
        });
      }

      return;
    }

    // Non-genre templates
    if (lowerTemplate.startsWith(lowerInput)) {
      suggestions.push(template);
    }
  });

  return [...new Set(suggestions)].slice(0, 10);
}


let selectedIndex = -1; // currently highlighted suggestion

function normalizeSuggestion(text) {
  return (
    text
      .replace(/\[[^\]]+\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim() + " "
  );
}




function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = "";
  selectedIndex = -1;

  for (const text of suggestions) {
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
  }
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


input.addEventListener("blur", () => {
  setTimeout(() => {
    suggestionsList.innerHTML = "";
  }, 150);
});
