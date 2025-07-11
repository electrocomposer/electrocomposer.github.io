const API = "https://ecapi.olk1.com/tracks";

async function fetchAndProcessData() {

  const res = await fetch(API);
  const json = await res.json();


  const h2 = document.querySelectorAll('h2');

  // Extract track names, album names, and durations
  const tracks = json.map(x => x.trackName);
  const albums = json.map(x => x.albumName);
  const albumDuration = json.map(x => x.albumDuration);

  // TRACKS
  const totalTracks = tracks.length;

  // ALBUMS
  const totalAlbumsInDiscography = [...new Set(albums)];

  // TIME
const uniqueAlbumDurations = new Map();
json.forEach(item => {
  if (!uniqueAlbumDurations.has(item.albumName)) {
    uniqueAlbumDurations.set(item.albumName, item.albumDuration);
  }
});

const totalAlbumMinutes = [...uniqueAlbumDurations.values()];

// console.log(totalAlbumMinutes);

function calculateTotalTime(timeArray) {
  const totalSeconds = timeArray.reduce((acc, duration) => {
    const minutes = Math.floor(duration);
    const seconds = Math.round((duration * 100) % 100);
    return acc + minutes * 60 + seconds;
  }, 0);

  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return { hours, minutes, seconds };
}


  const totalTime = calculateTotalTime(totalAlbumMinutes);

  const localStorageKey = "animateCounter";

  function incrementCounter(selector, current, target, duration, letter = "") {
    const element = document.getElementById(selector);

    if (current < target && element) {
      current++;
      element.innerText = `${current < 10 ? '0' : ''}${current}${letter}`;

      setTimeout(() => {
        incrementCounter(selector, current, target, duration, letter);
      }, Math.abs(Math.floor(duration / target)));
    }

    localStorage.setItem(localStorageKey, Date.now().toString());
  }

  const totalTracksTarget = totalTracks;
  const totalAlbumsTarget = totalAlbumsInDiscography.length;
  const totalHoursTarget = totalTime.hours;
  const totalMinutesTarget = totalTime.minutes;

  // delay slide down animation from running before elements load / zoom
  const captions = document.querySelectorAll('.caption');

  captions.forEach(element => {
    if (element instanceof HTMLElement) {
      setTimeout(() => {
        element.classList.remove('delay');
      }, 100);
    }
  });

  const didRun = localStorage.getItem(localStorageKey);
  const lastRunDate = didRun ? new Date(parseInt(didRun, 10)) : null;
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

  if (!lastRunDate || lastRunDate.getTime() <= twentyFourHoursAgo) {
    incrementCounter("totalTracks", 0, totalTracksTarget, 1);
    incrementCounter("totalAlbums", 0, totalAlbumsTarget, 2300);
    incrementCounter("totalHours", 0, totalHoursTarget, 1200);
    incrementCounter("totalMinutes", 0, totalMinutesTarget, 2000);

    h2.forEach(element => {
      element.classList.add('slideDown');
    });

  } else {
    const staticTracks = document.getElementById('totalTracks');
    const staticAlbums = document.getElementById('totalAlbums');
    const staticHours = document.getElementById('totalHours');
    const staticMins = document.getElementById('totalMinutes');

    // prevent janky load now slide down animation has been removed
    captions.forEach(element => {
    if (element instanceof HTMLElement) {
        element.classList.remove('delay');
      }
    });

    h2.forEach(element => {
      element.classList.remove('slideDown');
    });

    if (staticTracks) staticTracks.innerText = totalTracksTarget.toFixed();
    if (staticAlbums) staticAlbums.innerText = totalAlbumsTarget.toFixed();
    if (staticHours) staticHours.innerText = totalHoursTarget.toFixed();
    if (staticMins) {
      staticMins.innerText = totalMinutesTarget < 10 
        ? `0${totalMinutesTarget}` 
        : `${totalMinutesTarget}`;
    }
  }
}

// Run the function
fetchAndProcessData();
