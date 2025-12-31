// formatters.js

import { formatSeconds } from "./utils.js";

export const formatters = {
  trackCountByAlbum: ctx => {
  const album = ctx.album;

  if (!album) {
    return `Album "${ctx.albumName}" not found.`;
  }

  const count =
    album.trackCount ??
    album.tracks?.length;

  if (count == null) {
    return `Track count is unavailable for "${album.albumName}".`;
  }

  return `"${album.albumName}" contains ${count} tracks.`;
},

  tracksByAlbum: ctx => {
    if (!ctx.tracks?.length) return `No tracks found for album "${ctx.albumName}".`;
    return ctx.tracks
      .map(t => `${t.trackNumber}. ${t.trackName} (${t.trackDuration})`)
      .join("\n");
  },

  albumAfter: ctx => {
    if (!ctx.nextAlbum) return `No album was released after "${ctx.albumName}".`;
    return `The album released after "${ctx.albumName}" was "${ctx.nextAlbum.albumName}".`;
  },

  albumBefore: ctx => {
    if (!ctx.prevAlbum) return `No album was released before "${ctx.albumName}".`;
    return `The album released before "${ctx.albumName}" was "${ctx.prevAlbum.albumName}".`;
  },

  albumArtwork: ctx => {
    if (!ctx.album?.artwork) return `No artwork found for album "${ctx.albumName}".`;
    return {
      type: "image",
      title: ctx.album.albumName,
      src: ctx.album.artwork,
      link: ctx.album.ytPlaylistUrl
    };
  },

albumsByDurationThreshold: ctx => {
  if (!ctx.albumsList?.length) {
    return `No albums found ${ctx.comparator} ${ctx.minutes} minutes.`;
  }

  return ctx.albumsList
    .map(a => `${a.albumName} (${a.albumDuration})`)
    .join("\n");
},


albumDuration: ctx => {
  if (!ctx.album?.albumDuration) {
    return `Duration not found for album "${ctx.albumName}".`;
  }

  return `The duration of "${ctx.album.albumName}" is ${ctx.album.albumDuration}.`;
},


  albumByDuration: (ctx, type = "longest") => {
    if (!ctx.albumsWithDuration?.length) return "No albums found.";

    const sorted = [...ctx.albumsWithDuration].sort((a, b) => b.totalSeconds - a.totalSeconds);
    const album = type === "longest" ? sorted[0] : sorted[sorted.length - 1];

    return `${type === "longest" ? "Longest" : "Shortest"} album is "${album.albumName}" (${formatSeconds(album.totalSeconds)})`;
  },

  longestAlbumInGenre: ctx => {
    if (!ctx.albumsWithDuration?.length) return `No albums found.`;

    const album = ctx.albumsWithDuration.reduce((prev, curr) =>
      curr.totalSeconds > prev.totalSeconds ? curr : prev
    );

    return `Longest album in ${ctx.genre} is "${album.albumName}" (${formatSeconds(album.totalSeconds)})`;
  },

  shortestAlbumInGenre: ctx => {
    const album = ctx.albumsWithDuration.reduce((prev, curr) =>
      curr.totalSeconds < prev.totalSeconds ? curr : prev
    );
    return `Shortest album in ${ctx.genre} is "${album.albumName}" (${formatSeconds(album.totalSeconds)})`;
  },

  trackByDurationInAlbum: (ctx, type = "longest") => {
  if (!ctx.tracksWithDuration?.length) {
    return `No tracks found for album "${ctx.albumName}".`;
  }

  const sorted = [...ctx.tracksWithDuration].sort(
    (a, b) => b.durationSeconds - a.durationSeconds
  );

  const track =
    type === "longest"
      ? sorted[0]
      : sorted[sorted.length - 1];

  return `${
    type === "longest" ? "Longest" : "Shortest"
  } track on "${ctx.albumName}" is "${track.trackName}" (${formatSeconds(track.durationSeconds)})`;
},

albumsList: ctx => {
  if (!ctx.albumsList?.length) return "No albums found.";
  return ctx.albumsList
    .map(a => `${a.albumName} (${a.albumDuration || "Unknown duration"})`)
    .join("\n");
},

  trackByDuration: (ctx, type = "longest") => {
    if (!ctx.tracksWithDuration?.length) return "No tracks found.";

    const sorted = [...ctx.tracksWithDuration].sort((a, b) => b.durationSeconds - a.durationSeconds);
    const track = type === "longest" ? sorted[0] : sorted[sorted.length - 1];

    return `${type === "longest" ? "Longest" : "Shortest"} track is "${track.trackName}" (${track.albumName}) (${formatSeconds(track.durationSeconds)})`;
  },

  track_ytLink: ctx => ({
    type: "link",
    url: ctx.track?.ytUrl || "",
    label: ctx.track
      ? `Listen to the track "${ctx.track.trackName}" on YouTube`
      : "Track not found"
  }),

  trackInfo: (ctx, { plainText = false } = {}) => {
    if (!ctx.track) return `Track "${ctx.trackName}" not found.`;

    // Artist: ${ctx.track.artistName || "Unknown"}
    
    // Base track info
    const infoText = `Track Name: ${ctx.track.trackName}
    Track Number: ${ctx.track.trackNumber}
    Duration: ${ctx.track.trackDuration}
    Album: ${ctx.track.albumName}
    Album Duration: ${ctx.track.albumDuration}
    Genre: ${ctx.track.genre}
    `;

    // Links
    const links = [];
    if (ctx.track.ytUrl) {
      links.push({ type: "link", url: ctx.track.ytUrl, label: `Listen to ${ctx.track.trackName} on YouTube` });
    }
    if (ctx.track.ytPlaylistUrl) {
      links.push({ type: "link", url: ctx.track.ytPlaylistUrl, label: "Album Playlist" });
    }

    if (plainText) {
      // Flatten everything to string for CLI / logs
      return [infoText, ...links.map(l => `${l.label}: ${l.url}`)].join("\n");
    }

    // Return structured blocks for UI
    const blocks = [{ type: "text", text: infoText }, ...links];
    return blocks;
  },


linkForTitle: ctx => {
  const out = [];

  if (ctx.track?.ytUrl) {
    out.push({
      type: "link",
      url: ctx.track.ytUrl,
      label: `Listen to the track "${ctx.track.trackName}" on YouTube`
    });
  }

  if (ctx.album?.ytPlaylistUrl) {
    out.push({
      type: "link",
      url: ctx.album.ytPlaylistUrl,
      label: `Listen to the album "${ctx.album.albumName}" on YouTube`
    });
  }

  return out.length ? out : "No links found.";
},

tracksByInitial: ctx => {
  if (!ctx.tracksList?.length) return `No tracks found beginning with "${ctx.initial.toUpperCase()}".`;

  return ctx.tracksList
    .map(t => `${t.trackName} (${t.albumName})`)
    .join("\n");
},


trackDuration: ctx => {
  if (!ctx.track?.trackDuration) {
    return `Duration not found for track "${ctx.trackName}".`;
  }

  return `The duration of "${ctx.track.trackName}" is ${ctx.track.trackDuration}.`;
},


infoForTitle: ctx => {
  const blocks = [];

  if (ctx.track) {
    blocks.push({
      type: "text",
      text: `Track Name: ${ctx.track.trackName}
Album: ${ctx.track.albumName}
Duration: ${ctx.track.trackDuration}
Genre: ${ctx.track.genre}`
    });
  }

  if (ctx.album) {
    blocks.push({
      type: "text",
      text: `Album Name: ${ctx.album.albumName}
Duration: ${ctx.album.albumDuration}
Genre: ${ctx.album.genre}`
    });
  }

  return blocks.length ? blocks : "No information found.";
},

systemExplanation: ctx => {
  return ctx.systemDescription;
},

};
