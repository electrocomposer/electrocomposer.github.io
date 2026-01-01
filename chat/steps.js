// steps.js

import { fetchJSON } from "./fetchJson.js";
import { API_BASE } from "./apiBase.js";
import { parseAlbumDuration } from "./utils.js";

export const steps = {

  normalizeAlbumName: async ctx => {
    if (!ctx.albumName && ctx.subject) {
      ctx.albumName = ctx.subject;
    }
  },

  // --- Album-related steps ---
  fetchAlbums: async ctx => {
    ctx.albums = await fetchJSON(`${API_BASE}/albums`);
  },

  fetchTracksByAlbum: async ctx => {
    ctx.tracks = await fetchJSON(
      `${API_BASE}/tracks?albumName=${encodeURIComponent(ctx.albumName)}&_sort=trackNumber&_order=asc`
    );
  },

  resolveAlbum: async ctx => {
    ctx.album = ctx.albums.find(
      a => a.albumName.toLowerCase() === ctx.albumName.toLowerCase()
    );
    if (!ctx.album) throw new Error("Album not found");
  },

  resolveNextAlbum: async ctx => {
    ctx.nextAlbum = ctx.albums
      .filter(a => a.id > ctx.album.id)
      .sort((a, b) => a.id - b.id)[0];
  },

  resolvePrevAlbum: async ctx => {
    ctx.prevAlbum = ctx.albums
      .filter(a => a.id < ctx.album.id)
      .sort((a, b) => b.id - a.id)[0];
  },

  fetchAlbumPlaylist: async ctx => {
    if (!ctx.albums) await steps.fetchAlbums(ctx);
    await steps.resolveAlbum(ctx);

    if (!ctx.album.ytPlaylistUrl) throw new Error("No playlist found");

    ctx.playlistLink = {
      type: "link",
      url: ctx.album.ytPlaylistUrl,
      label: `Listen to "${ctx.album.albumName}" on YouTube`
    };
  },


listAlbumsAlphabetical: async ctx => {
  if (!ctx.albums) await steps.fetchAlbums(ctx);
  ctx.albumsList = [...ctx.albums].sort((a, b) =>
    a.albumName.localeCompare(b.albumName)
  );
},

listAlbumsByDurationThreshold: async ctx => {
  if (!ctx.albums) await steps.fetchAlbums(ctx);

  const thresholdSeconds = ctx.minutes * 60;

  ctx.albumsList = ctx.albums.filter(album => {
    const albumSeconds = parseAlbumDuration(album.albumDuration);

    if (ctx.comparator === "over") {
      return albumSeconds > thresholdSeconds;
    }

    return albumSeconds < thresholdSeconds;
  });
},

listAlbumsByLength: async ctx => {
  if (!ctx.albums) await steps.fetchAlbums(ctx);

  ctx.albumsList = [...ctx.albums].sort((a, b) => {
    const aSeconds = parseAlbumDuration(a.albumDuration);
    const bSeconds = parseAlbumDuration(b.albumDuration);

    if (ctx.type === "shortest") return aSeconds - bSeconds; // ascending
    return bSeconds - aSeconds; // descending for longest
  });
},


listAlbumsById: async ctx => {
  if (!ctx.albums) await steps.fetchAlbums(ctx);
  ctx.albumsList = [...ctx.albums].sort((a, b) => ctx.reverse ? b.id - a.id : a.id - b.id);
},



  computeAlbumDurations: async ctx => {
    if (!ctx.albums) await steps.fetchAlbums(ctx);
    ctx.albumsWithDuration = ctx.albums.map(album => ({
      ...album,
      totalSeconds: parseAlbumDuration(album.albumDuration)
    }));
  },

  computeGenreAlbumDurations: async ctx => {
    if (!ctx.albums) await steps.fetchAlbums(ctx);

    if (!ctx.genre) throw new Error("Please specify a genre, e.g., 'in Ambient'");

    const genreLower = ctx.genre.trim().toLowerCase();
    const filteredAlbums = ctx.albums.filter(a => {
      const albumGenres = (a.genre || "")
        .split(/[\/,|]/) // split by / , |
        .map(g => g.trim().toLowerCase());
      return albumGenres.includes(genreLower);
    });

    if (!filteredAlbums.length) throw new Error(`No albums found in genre "${ctx.genre}"`);

    ctx.albumsWithDuration = filteredAlbums.map(a => ({
      ...a,
      totalSeconds: parseAlbumDuration(a.albumDuration)
    }));
  },


albumCountByGenre: async ctx => {
  if (!ctx.albums) await steps.fetchAlbums(ctx);

  ctx.albumCount = ctx.albums.filter(a =>
    a.genre?.toLowerCase() === ctx.genre
  ).length;
},

albumsByGenre: async ctx => {
  if (!ctx.albums) await steps.fetchAlbums(ctx);

  ctx.albumsList = ctx.albums.filter(a =>
    a.genre?.toLowerCase() === ctx.genre
  );
},


computeTrackDurationsInAlbum: async ctx => {
    if (!ctx.tracks?.length) {
      throw new Error(`No tracks found for album "${ctx.albumName}"`);
    }

    ctx.tracksWithDuration = ctx.tracks.map(track => ({
      ...track,
      durationSeconds: parseAlbumDuration(track.trackDuration)
    }));
  },
  
  // --- Track-related steps ---
  computeTrackDurations: async ctx => {
    ctx.tracks = await fetchJSON(`${API_BASE}/tracks`);

    ctx.tracksWithDuration = ctx.tracks.map(track => ({
      ...track,
      durationSeconds: parseAlbumDuration(track.trackDuration) // reuse utility
    }));
  },


fetchTrackDuration: async ctx => {
  const tracks = await fetchJSON(
    `${API_BASE}/tracks?trackName=${encodeURIComponent(ctx.trackName)}`
  );

  if (!tracks.length) {
    throw new Error(`Track "${ctx.trackName}" not found`);
  }

  ctx.track = tracks[0];
},



 fetchTrackYtLink: async ctx => {
  const [tracks, albums] = await Promise.all([
    fetchJSON(`${API_BASE}/tracks?trackName=${encodeURIComponent(ctx.trackName)}`),
    fetchJSON(`${API_BASE}/albums?albumName=${encodeURIComponent(ctx.trackName)}`)
  ]);

  // Ambiguous: track + album share same name
  if (tracks.length && albums.length) {
    ctx.disambiguation = [
      {
        type: "link",
        url: tracks[0].ytUrl,
        label: `Listen to the track "${tracks[0].trackName}" on YouTube`
      },
      {
        type: "link",
        url: albums[0].ytPlaylistUrl,
        label: `Listen to the album "${albums[0].albumName}" on YouTube`
      }
    ];
    return;
  }

  // Track not found
  if (!tracks.length) {
    throw new Error(`Track "${ctx.trackName}" not found`);
  }

  ctx.track = tracks[0];

  if (!ctx.track.ytUrl) {
    throw new Error("No YouTube link found for this track");
  }
},


fetchTracksList: async ctx => {
  // Assuming the API allows fetching all tracks without a specific trackName
  const tracks = await fetchJSON(`${API_BASE}/tracks`);
  if (!tracks.length) throw new Error("No tracks found in the catalogue.");
  ctx.tracks = tracks;
},

tracksByInitial: async ctx => {
  if (!ctx.tracks) await steps.fetchTracksList(ctx);

  ctx.tracksList = ctx.tracks.filter(track => {
    return track.trackName?.[0]?.toLowerCase() === ctx.initial;
  });
},


fetchTrackInfo: async ctx => {
  const tracks = await fetchJSON(`${API_BASE}/tracks?trackName=${encodeURIComponent(ctx.trackName)}`);
  if (!tracks.length) throw new Error(`Track "${ctx.trackName}" not found`);
  ctx.track = tracks[0];
},



fetchTrackByName: async ctx => {
  const tracks = await fetchJSON(
    `${API_BASE}/tracks?trackName=${encodeURIComponent(ctx.trackName)}`
  );

  if (!tracks.length) {
    throw new Error(`Track "${ctx.trackName}" not found.`);
  }

  // If duplicates exist later, this is where disambiguation would go
  ctx.track = tracks[0];
},


resolveTitle: async ctx => {
  const [tracks, albums] = await Promise.all([
    fetchJSON(`${API_BASE}/tracks?trackName=${encodeURIComponent(ctx.subject)}`),
    fetchJSON(`${API_BASE}/albums?albumName=${encodeURIComponent(ctx.subject)}`)
  ]);

  // 1. Explicit track request
  if (ctx.explicitTrack) {
    if (!tracks.length) {
      throw new Error(`Track "${ctx.subject}" not found`);
    }
    ctx.track = tracks[0];
    return;
  }

  // 2. Explicit album request  ← THIS IS WHERE IT GOES
  if (ctx.explicitAlbum) {
    if (!albums.length) {
      throw new Error(`Album "${ctx.subject}" not found`);
    }
    ctx.album = albums[0];
    return;
  }

  // 3. Ambiguous (track + album share same name)
  if (tracks.length && albums.length) {
    ctx.track = tracks[0];
    ctx.album = albums[0];
    ctx.ambiguous = true;
    return;
  }

  // 4. Track only
  if (tracks.length) {
    ctx.track = tracks[0];
    return;
  }

  // 5. Album only
  if (albums.length) {
    ctx.album = albums[0];
    return;
  }

  // 6. Nothing found
  throw new Error(`No album or track found for "${ctx.subject}"`);
},


explainSystem: async ctx => {
  ctx.systemDescription =
    "The system is designed to provide answers and information about the music catalogue created by ElectroComposer.";
},

};
