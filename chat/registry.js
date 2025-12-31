// registry.js

import { formatters } from "./formatters.js";

export const intentRegistry = {

  /* ---------- GENERIC ---------- */

  link_for_title: {
    plan: ["resolveTitle"],
    format: formatters.linkForTitle
  },

  info_for_title: {
    plan: ["resolveTitle"],
    format: formatters.infoForTitle
  },

  /* ---------- TRACK ---------- */
  tracks_by_initial: {
  plan: ["tracksByInitial"],
  format: formatters.tracksByInitial
},

  track_album_lookup: {
  plan: ["fetchTrackByName"],
  format: ctx => {
    const t = ctx.track;

    return `The track "${t.trackName}" appears on the album "${t.albumName}" as track ${t.trackNumber}.`;
  }
},


track_by_duration_in_album: {
  plan: ["normalizeAlbumName", "fetchTracksByAlbum", "computeTrackDurationsInAlbum"],
  format: ctx =>
    formatters.trackByDurationInAlbum(ctx, ctx.durationType || "longest")
},

  // track_by_duration: {
  //   plan: ["computeTrackDurations"],
  //   format: ctx =>
  //     formatters.trackByDuration(ctx, ctx.durationType || "longest")
  // },
track_duration: {
  plan: ["fetchTrackDuration"],
  format: formatters.trackDuration
},

  /* ---------- ALBUM ---------- */
albums_alphabetical: {
  plan: ["listAlbumsAlphabetical"],
  format: formatters.albumsList
},

albums_by_length: {
  plan: ["listAlbumsByLength"],
  format: formatters.albumsList
},

albums_by_id: {
  plan: ["listAlbumsById"],
  format: formatters.albumsList
},

albums_by_id_reverse: {
  plan: ["listAlbumsById"],
  format: formatters.albumsList
},

albums_by_duration_threshold: {
  plan: ["listAlbumsByDurationThreshold"],
  format: formatters.albumsList
},


album_duration: {
  plan: ["normalizeAlbumName", "fetchAlbums", "resolveAlbum"],
  format: formatters.albumDuration
},


track_count_by_album: {
  plan: ["fetchAlbums", "resolveAlbum"],
  format: "trackCountByAlbum"
},


album_playlist: {
  plan: ["resolveTitle"],
  format: ctx => {
    if (!ctx.album?.ytPlaylistUrl) {
      throw new Error(`No playlist found for album "${ctx.subject}"`);
    }
    return {
      type: "link",
      url: ctx.album.ytPlaylistUrl,
      label: `Listen to the album "${ctx.album.albumName}" on YouTube`
    };
  }
},

  tracks_by_album: {
    plan: ["fetchTracksByAlbum"],
    format: formatters.tracksByAlbum
  },

  album_after: {
    plan: ["fetchAlbums", "resolveAlbum", "resolveNextAlbum"],
    format: formatters.albumAfter
  },

  album_before: {
    plan: ["fetchAlbums", "resolveAlbum", "resolvePrevAlbum"],
    format: formatters.albumBefore
  },

  album_by_duration: {
    plan: ["computeAlbumDurations"],
    format: ctx =>
      formatters.albumByDuration(ctx, ctx.durationType || "longest")
  },

  /* ---------- GENRE ---------- */

  longest_album_in_genre: {
    plan: ["computeGenreAlbumDurations"],
    format: formatters.longestAlbumInGenre
  },

  shortest_album_in_genre: {
    plan: ["computeGenreAlbumDurations"],
    format: formatters.shortestAlbumInGenre
  },
  
  /* ---------------- ARTWORK ---------------- */
  artwork: {
    plan: ["resolveTitle"],
    format: formatters.albumArtwork
  },

  
  /* ---------------- GENERAL ---------------- */
  system_explanation: {
  plan: ["explainSystem"],
  format: formatters.systemExplanation
},

};


