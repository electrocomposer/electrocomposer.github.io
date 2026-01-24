 // Define a palette of distinct colors
const trackColors = [
  "#f87171", // red-400
  "#fbbf24", // yellow-400
  "#34d399", // green-400
  "#60a5fa", // blue-400
  "#a78bfa", // purple-400
  "#f472b6", // pink-400
  "#facc15", // yellow-500 (more golden)
  "#22d3ee", // cyan-400
  "#f97316", // orange-500
  "#10b981", // teal-500
  "#6366f1", // indigo-500
  "#f33333", // red
];


/* =========================================================
   State
========================================================= */
let albums = [];
let tracks = [];
let currentView = "albums"; 

/* =========================================================
   DOM
========================================================= */
const main = document.getElementById("main");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

/* =========================================================
   Data Loading
========================================================= */
async function loadData() {
  tracks = await safeFetch("https://ecapi.olk1.com/tracks");
  albums = await safeFetch("https://ecapi.olk1.com/albums");

  normalizeData();
  populateGenres();
  render();
}

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/* =========================================================
   Normalisation
========================================================= */
function normalizeData() {
  tracks = tracks.map(t => ({
    id: t.id,
    trackName: String(t.trackName || ""),
    albumName: String(t.albumName || ""),
    artistName: String(t.artistName || ""),
    genre: String(t.genre || ""),
    trackNumber: t.trackNumber,
    trackDuration: t.trackDuration,
    ytUrl: t.ytUrl,
    ytPlaylistUrl: t.ytPlaylistUrl
  }));

  albums = albums.map(a => ({
    id: a.id,
    albumName: String(a.albumName || ""),
    artistName: String(a.artistName || ""),
    genre: String(a.genre || ""),
    trackCount: a.trackCount,
    albumDuration: a.albumDuration,
    artwork: a.artwork,
    ytPlaylistUrl: a.ytPlaylistUrl
  }));
}

/* =========================================================
   Utilities
========================================================= */
function getFilteredAlbums() {
  const q = getSearchQuery();
  const genre = genreFilter?.value || "";

  return albums.filter(album =>
    (!genre || album.genre === genre) &&
    matchesAlbumSearch(album, q)
  );
}

function getSearchQuery() {
  return searchInput?.value.trim().toLowerCase() || "";
}

function clearMain() {
  if (main) main.innerHTML = "";
}

function findAlbumForTrack(track) {
  return albums.find(a =>
    a.albumName === track.albumName &&
    a.artistName === track.artistName
  );
}

function getTracksForAlbum(album) {
  return tracks.filter(t =>
    t.albumName === album.albumName &&
    t.artistName === album.artistName
  );
}

function matchesTrackSearch(track, q) {
  if (!q) return true;

  return (
    track.trackName.toLowerCase().includes(q) ||
    track.albumName.toLowerCase().includes(q) ||
    track.artistName.toLowerCase().includes(q) ||
    track.genre.toLowerCase().includes(q)
  );
}

function matchesAlbumSearch(album, q) {
  if (!q) return true;

  return (
    album.albumName.toLowerCase().includes(q) ||
    album.artistName.toLowerCase().includes(q) ||
    album.genre.toLowerCase().includes(q)
  );
}

function resolveSearchContext(q) {
  if (!q) return currentView;

  const trackMatches = tracks.some(t => matchesTrackSearch(t, q));
  const albumMatches = albums.some(a => matchesAlbumSearch(a, q));

  if (trackMatches && !albumMatches) return "tracks";
  if (albumMatches && !trackMatches) return "albums";

  return currentView;
}

/* =========================================================
   Render Dispatcher
========================================================= */

function render() {
  clearMain();

  const q = getSearchQuery();
  const view = resolveSearchContext(q);

  switch(view) {
  case "albums":
    renderAlbums(); break;
  case "tracks":
    renderTracks(); break;
  case "timedist":
    renderTimedist(); break;
  case "analytics":
    renderAnalytics(); break;
  default:
    renderAlbums();
}

}





/* =========================================================
   All Album View
========================================================= */
function renderAlbums() {
  const filtered = getFilteredAlbums();

  const grid = document.createElement("div");
  grid.className = "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6";

  filtered.forEach(album => {
    const card = document.createElement("div");
    card.className = "group cursor-pointer";

    card.innerHTML = `
      <div class="relative">
        <img src="${album.artwork}" class="rounded shadow-lg" />
        <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
          <div class="text-sm font-medium">${album.albumName}</div>
          <div class="text-xs text-neutral-400">${album.artistName}</div>
          <div class="text-xs mt-1">${album.trackCount} tracks · ${album.albumDuration}</div>
        </div>
      </div>
    `;

    card.onclick = () => expandAlbum(album);
    grid.appendChild(card);
  });

  main.appendChild(grid);
}


/* =========================================================
   Track View
========================================================= */
function renderTracks() {
  const q = getSearchQuery();
  const genre = genreFilter?.value || "";

  const filtered = tracks.filter(t =>
    (!genre || t.genre === genre) &&
    matchesTrackSearch(t, q)
  );

  const table = document.createElement("table");
  table.className = "w-full text-sm";

  table.innerHTML = `
    <thead class="border-b border-neutral-800 text-neutral-400">
      <tr>
        <th class="text-left py-2">Track</th>
        <th class="text-left">Artist</th>
        <th class="text-left">Album</th>
        <th class="text-right">Duration</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  filtered.forEach(track => {
    const row = document.createElement("tr");
    row.className = "hover:bg-neutral-900";

    row.innerHTML = `
      <td class="py-2">
        <a href="${track.ytUrl}" target="_blank" class="underline">${track.trackName}</a>
      </td>
      <td>${track.artistName}</td>
      <td class="underline cursor-pointer">${track.albumName}</td>
      <td class="text-right">${track.trackDuration}</td>
    `;

    row.children[2].onclick = () => {
      const album = findAlbumForTrack(track);
      if (album) expandAlbum(album);
    };

    tbody.appendChild(row);
  });

  main.appendChild(table);
}


/* =========================================================
   Selected Album View
========================================================= */
function expandAlbum(album) {
  if (!main) return;
  clearMain();

  const albumTracks = getTracksForAlbum(album);

  /* ---------- Container ---------- */
  const container = document.createElement("div");
  container.className = "flex flex-col md:flex-row gap-6";

  /* ---------- Artwork ---------- */
  const artworkDiv = document.createElement("div");
  artworkDiv.className = "md:w-2/5 w-full flex-shrink-0";

  const artworkImg = document.createElement("img");
  artworkImg.src = album.artwork;
  artworkImg.className = "w-full rounded shadow-lg";

  artworkDiv.appendChild(artworkImg);
  container.appendChild(artworkDiv);

  /* ---------- Meta ---------- */
  const metaDiv = document.createElement("div");
  metaDiv.className = "md:w-3/5 w-full flex flex-col gap-4";

  const metaInfo = document.createElement("div");
  metaInfo.innerHTML = `
    <h2 class="text-2xl font-semibold">${album.albumName}</h2>
    <div class="text-neutral-400">${album.artistName}</div>
    <div class="text-sm mt-1">${album.trackCount} tracks · ${album.albumDuration}</div>
    <a href="${album.ytPlaylistUrl}" target="_blank" class="inline-block mt-2 text-sm underline">
      Play album on YouTube
    </a>
  `;
  metaDiv.appendChild(metaInfo);

  /* ---------- Timeline ---------- */
  const timeline = document.createElement("div");
  timeline.className = "flex h-6 rounded overflow-hidden shadow mt-2";

  const totalDuration = albumTracks.reduce((sum, t) => sum + t.trackDuration, 0);

  albumTracks.forEach((track, idx) => {
    const color = trackColors[idx % trackColors.length];

    const trackSegment = document.createElement("div");
    trackSegment.style.width = `${(track.trackDuration / totalDuration) * 100}%`;
    trackSegment.className = "h-full hover:opacity-80 transition cursor-pointer";
    trackSegment.style.backgroundColor = color;
    trackSegment.title = `${track.trackName} — ${track.trackDuration}`;
    trackSegment.onclick = () => window.open(track.ytUrl, "_blank");

    timeline.appendChild(trackSegment);
  });

  metaDiv.appendChild(timeline);

  /* ---------- Track List ---------- */
  const trackList = document.createElement("div");
  trackList.className = "flex flex-col gap-2 mt-4";

  albumTracks.forEach((track, idx) => {
    const color = trackColors[idx % trackColors.length];

    const row = document.createElement("div");
    row.className =
      "flex justify-between items-center px-3 py-2 rounded transition cursor-pointer";

    /* color mapping from timedist */
    row.style.backgroundColor = color; // 100% opacity by default

    row.onmouseenter = () => {
      row.style.filter = "brightness(1.1)";
    };

    row.onmouseleave = () => {
      row.style.filter = "brightness(1)";
    };

    row.classList.add("text-black");


    row.innerHTML = `
      <div class="flex gap-4 items-center">
        <span class="w-6">${track.trackNumber}</span>
        <span class="font-medium">${track.trackName}</span>
      </div>
      <div class="flex gap-4 items-center text-sm">
        <span>${track.trackDuration}</span>
        <a href="${track.ytUrl}" target="_blank" class="underline">Play</a>
      </div>
    `;

    row.onclick = () => window.open(track.ytUrl, "_blank");

    trackList.appendChild(row);
  });

  metaDiv.appendChild(trackList);

  container.appendChild(metaDiv);
  main.appendChild(container);
}


/* =========================================================
   time distribution
========================================================= */
function renderTimedist() {
  if (!main) return;
  clearMain();

  const filteredAlbums = getFilteredAlbums();

  filteredAlbums.forEach(album => {
    const albumDiv = document.createElement("div");
    albumDiv.className = "mb-6";

    const header = document.createElement("div");
    header.className = "flex justify-between items-center mb-2";
    header.innerHTML = `
      <div class="text-sm font-semibold text-neutral-200">${album.albumName}</div>
      <div class="text-xs text-neutral-400">${album.albumDuration} mins · ${album.trackCount} tracks</div>
    `;
    albumDiv.appendChild(header);

    const fingerprint = document.createElement("div");
    fingerprint.className = "flex h-6 rounded overflow-hidden shadow";

    const albumTracks = getTracksForAlbum(album);
    const totalDuration = albumTracks.reduce((sum, t) => sum + t.trackDuration, 0);

    albumTracks.forEach((track, idx) => {
      const bar = document.createElement("div");
      bar.style.width = `${(track.trackDuration / totalDuration) * 100}%`;
      bar.className = "h-full cursor-pointer hover:opacity-80 transition";
      bar.style.backgroundColor = trackColors[idx % trackColors.length];
      bar.title = `${track.trackName} — ${track.trackDuration} mins`;
      bar.onclick = () => window.open(track.ytUrl, "_blank");

      fingerprint.appendChild(bar);
    });

    albumDiv.appendChild(fingerprint);
    main.appendChild(albumDiv);
  });
}


/* =========================================================
   Analytics
========================================================= */
function renderAnalytics() {
  clearMain();

  const container = document.createElement("div");
  container.className = "w-full lg:max-w-2xl p-4 flex flex-col gap-8";

  const q = getSearchQuery();

  const filteredAlbums = albums.filter(a => matchesAlbumSearch(a, q));
  const filteredTracks = tracks.filter(t => matchesTrackSearch(t, q));

  /* --------- Stats Summary --------- */
  const stats = document.createElement("div");
  stats.className = "grid grid-cols-1 md:grid-cols-3 gap-4";

  const totalAlbumsCard = document.createElement("div");
  totalAlbumsCard.className = "p-4 bg-neutral-900 rounded shadow text-center";
  totalAlbumsCard.innerHTML = `
    <div class="text-sm text-neutral-400">Total Albums</div>
    <div class="text-2xl font-bold">${filteredAlbums.length}</div>
  `;

  const totalTracksCard = document.createElement("div");
  totalTracksCard.className = "p-4 bg-neutral-900 rounded shadow text-center";
  totalTracksCard.innerHTML = `
    <div class="text-sm text-neutral-400">Total Tracks</div>
    <div class="text-2xl font-bold">${filteredTracks.length}</div>
  `;

  /* --------- Average Album Duration --------- */
  const avgAlbumDuration = filteredAlbums.length
    ? (
        filteredAlbums.reduce((sum, a) => sum + a.albumDuration, 0) /
        filteredAlbums.length
      ).toFixed(2)
    : 0;

  const avgCard = document.createElement("div");
  avgCard.className = "p-4 bg-neutral-900 rounded shadow text-center";
  avgCard.innerHTML = `
    <div class="text-sm text-neutral-400">Average Album Duration</div>
    <div class="text-2xl font-bold">${avgAlbumDuration} mins</div>
  `;

  stats.appendChild(totalAlbumsCard);
  stats.appendChild(avgCard);
  stats.appendChild(totalTracksCard);
  container.appendChild(stats);

  /* --------- Tracks per Genre (Bar Chart) --------- */

  // Track counts per genre
  const trackCountsByGenre = {};
  filteredTracks.forEach(t => {
    if (!t.genre) return;
    trackCountsByGenre[t.genre] = (trackCountsByGenre[t.genre] || 0) + 1;
  });

  // Album counts per genre
  const albumCountsByGenre = {};
  filteredAlbums.forEach(a => {
    if (!a.genre) return;
    albumCountsByGenre[a.genre] = (albumCountsByGenre[a.genre] || 0) + 1;
  });

  const genreChartContainer = document.createElement("div");
  genreChartContainer.className = "p-4 bg-neutral-900 rounded shadow";

  const genreTitle = document.createElement("div");
  genreTitle.className = "text-sm font-semibold mb-2 text-center";
  genreTitle.textContent = "Tracks per Genre";
  genreChartContainer.appendChild(genreTitle);

  Object.entries(trackCountsByGenre).forEach(([genre, trackCount]) => {
    const albumCount = albumCountsByGenre[genre] || 0;

    const barWrapper = document.createElement("div");
    barWrapper.className = "flex items-center gap-2 mb-1";

    const label = document.createElement("div");
    label.className = "w-48 text-sm text-neutral-300";
    label.textContent = `${genre} (${albumCount} album${albumCount !== 1 ? "s" : ""})`;

    const bar = document.createElement("div");
    const widthPercent = (trackCount / filteredTracks.length) * 100;
    bar.style.width = `${widthPercent}%`;
    bar.className = "h-4 bg-blue-500 rounded transition-all";

    const value = document.createElement("div");
    value.className = "w-10 text-sm text-neutral-400 text-right";
    value.textContent = trackCount;

    barWrapper.appendChild(label);
    barWrapper.appendChild(bar);
    barWrapper.appendChild(value);

    genreChartContainer.appendChild(barWrapper);
  });

  container.appendChild(genreChartContainer);

  
  /* --------- Track Duration Histogram --------- */
  const histogramContainer = document.createElement("div");
  histogramContainer.className = "p-4 bg-neutral-900 rounded shadow";

  const histTitle = document.createElement("div");
  histTitle.className = "text-sm font-semibold mb-2 text-center";
  histTitle.textContent = "Track Duration Distribution (mins)";
  histogramContainer.appendChild(histTitle);

  const histCounts = [0, 0, 0, 0, 0];
  filteredTracks.forEach(t => {
    const d = t.trackDuration || 0;
    if (d < 2) histCounts[0]++;
    else if (d < 4) histCounts[1]++;
    else if (d < 6) histCounts[2]++;
    else if (d < 8) histCounts[3]++;
    else histCounts[4]++;
  });

  const bucketLabels = ["0–2", "2–4", "4–6", "6–8", "8+"];

  histCounts.forEach((count, i) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2 mb-1";

    const label = document.createElement("div");
    label.className = "w-16 text-sm text-neutral-300";
    label.textContent = bucketLabels[i];

    const bar = document.createElement("div");
    bar.style.width = `${(count / filteredTracks.length) * 100 || 0}%`;
    bar.className = "h-4 bg-green-500 rounded transition-all";

    const value = document.createElement("div");
    value.className = "w-8 text-sm text-neutral-400 text-right";
    value.textContent = count;

    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(value);

    histogramContainer.appendChild(row);
  });

  container.appendChild(histogramContainer);
  main.appendChild(container);
}



/* =========================================================
   Controls
========================================================= */
function updateActiveSidebarButton() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    if (btn.dataset.view === currentView) {
      btn.classList.add("bg-red-600", "font-semibold");
    } else {
      btn.classList.remove("bg-red-600", "font-semibold");
    }
  });
}


document.querySelectorAll(".view-btn").forEach(btn => {
  btn.className += " text-left px-2 py-1 rounded hover:bg-red-500";
  btn.onclick = () => {
    currentView = btn.dataset.view;
    updateActiveSidebarButton();
    render();
  };
});


updateActiveSidebarButton();


searchInput?.addEventListener("input", render);
genreFilter?.addEventListener("change", render);

/* =========================================================
   Genre Population
========================================================= */
function populateGenres() {
  if (!genreFilter) return;

  genreFilter.innerHTML = `<option value="">All Genres</option>`;

  const genres = new Set(tracks.map(t => t.genre).filter(Boolean));

  genres.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    genreFilter.appendChild(opt);
  });
}

/* =========================================================
   Init
========================================================= */
loadData();
