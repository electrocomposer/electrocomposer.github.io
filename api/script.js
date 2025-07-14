const API = "https://ecapi.olk1.com/tracks";
const albumsAPI = "https://ecapi.olk1.com/albums";


const totalTracksTitle = document.getElementById("totalTracksTitle");
const totalTracksTitleContainer = document.getElementById("totalTracksTitleContainer");

const totalAlbumsTitle = document.getElementById("totalAlbumsTitle");
const totalAlbumsTitleContainer = document.getElementById("totalAlbumsTitleContainer");

const reverseFetchData = document.getElementById('reverseFetchData');
const totalCount = document.getElementById('totalCount');

const searchHints = document.getElementById('searchHints');
const searchInput = document.getElementById('searchInput');

const sortAlphaCheckboxContainer = document.getElementById('sort-alpha-checkbox-container');
const sortAlphaCheckbox = document.getElementById('sort-alpha-checkbox');

const trackLengthCheckboxContainer = document.getElementById('sort-track-length-checkbox-container');
const trackLengthCheckbox = document.getElementById('sort-track-length-checkbox');

const albumLengthCheckboxContainer = document.getElementById('sort-album-length-checkbox-container');
const albumLengthCheckbox = document.getElementById('sort-album-length-checkbox');

let showAlbumsInReleaseOrder = false;
let albumLengthShowing = true;
albumLengthCheckboxContainer.classList.add('hidden');



sortAlphaCheckbox.addEventListener('change', () => {
  // If alpha is checked, disable track length checkbox
  trackLengthCheckbox.disabled = sortAlphaCheckbox.checked;

  // Optionally update styles for visual feedback
  trackLengthCheckboxContainer.classList.toggle('opacity-50', sortAlphaCheckbox.checked);
  trackLengthCheckboxContainer.classList.toggle('cursor-not-allowed', sortAlphaCheckbox.checked);

  if(searchInput.value === "*"){
    searchInput.value = "";
  }
});


/**
 * Compare fetched API data with localStorage data based on track.id
 * and return a merged dataset with states ("up" or "down") applied.
 *
 * @param {Array} apiData - The array of tracks fetched from the API.
 * @param {Object} localState - The state data from localStorage.
 * @returns {Array} - The updated dataset with state information.
 */
    const mergeTrackStates = (apiData, localState) => {
      // Ensure localState is an object
      const states = localState || {};

      // Iterate through API data and apply localStorage state if available
      return apiData.map((track) => {
        const state = states[track.id]; // Check localStorage state for this track
        return {
          ...track,
          state: state || null, // Add state ("up", "down", or null if no state exists)
        };
      });
    };

    const fetchApiData = async () => {
      try {
        const response = await fetch(API);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const json = await response.json();
        let data = json.reverse(); // reverse chronological sort
        return data;
      } catch (error) {
        console.error('Failed to fetch data:', error);
        return [];
      }
    };

    let albumData = null;    

    const fetchAlbumApiData = async () => {
      try {
        const response = await fetch(albumsAPI);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const json = await response.json();
        albumData = json.reverse(); // Reverse chronological sort
        return albumData;
      } catch (error) {
        console.error('Failed to fetch album data:', error);
        return [];
      }
    };







// Return to 'track view'
totalTracksTitle.addEventListener('click', () => {
  showAlbumsInReleaseOrder = false; // Reset the flag so Albums button works again

  albumLengthCheckbox.checked = false;
  albumLengthCheckboxContainer.classList.add('hidden');
  trackLengthCheckboxContainer.classList.remove('hidden');
  sortAlphaCheckboxContainer.classList.remove('hidden');

  searchInput.value = "";
  // remove the searched/filtered query before resetting tracks
  filteredTracks = null;
  
  renderTracksWrapper(updatedTracks); // Refresh tracks
  totalCount.innerText = updatedTracks.length; // Refresh count
});


// Album toggle button
totalAlbumsTitle.addEventListener('click', () => {
  showAlbumsInReleaseOrder = !showAlbumsInReleaseOrder;
  
  albumLengthCheckbox.checked = false;
  albumLengthShowing = true;
  
  totalCount.innerText = albumData.length;

  searchInput.value = "";
  clearList();

  // Show/hide appropriate checkboxes
  albumLengthCheckboxContainer.classList.remove('hidden');
  trackLengthCheckboxContainer.classList.add('hidden');
  sortAlphaCheckboxContainer.classList.add('hidden');

  // Render albums in appropriate order
  const albumsToRender = showAlbumsInReleaseOrder
    ? [...albumData]               // Reverse chronological (default from fetch)
    : [...albumData].reverse();    // Forward chronological

  renderAlbums(albumsToRender);

  reverseFetchData.classList.add('hidden');
  searchHints.classList.add('hidden');
});


// Declare this once
albumLengthCheckbox.addEventListener('change', () => {
  const sorted = albumLengthCheckbox.checked
    ? [...albumData].sort((a, b) => a.albumDuration - b.albumDuration)
    : [...albumData].sort((a, b) => b.albumDuration - a.albumDuration);

  albumLengthShowing = false;
  clearList();
  renderAlbums(sorted);
});









    function createTruncatedElement(label, value, maxLength = 22) {
      const p = document.createElement('p');

      const strong = document.createElement('strong');
      strong.textContent = label + ': ';
      p.appendChild(strong);

      const isTruncated = value.length > maxLength;
      const truncatedValue = isTruncated ? value.slice(0, maxLength) + '...' : value;

      p.innerHTML = `<strong>${label}</strong>: ${truncatedValue}`;

      if (isTruncated) {
        p.title = value; // Show full track name on hover
        p.classList.add('cursor-pointer');
      }

      return p;
    }


    const greenBgClass = "bg-green-100";
    const redBgClass = "bg-red-100";
    
    const trackList = document.getElementById('trackList');

    // Load persisted state from localStorage
    const loadState = () => JSON.parse(localStorage.getItem('trackStates')) || {};
    const saveState = (state) => localStorage.setItem('trackStates', JSON.stringify(state));

    let states = loadState(); // Load states before rendering tracks

    const storedData = document.getElementById('storedData');
  






// SEARCH
let filteredTracks = null; // Track the current filtered subset

function formatDuration(val) {
  // if number like 3.1, pad it to 3.10
  if (!val) return "";
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return num.toFixed(2); // Ensures 3.1 becomes "3.10"
}


const searchFields = ['track', 'album', 'genre', 'id'];

const searchTracks = (query, tracks) => {
  const normalizedQuery = query.toLowerCase();
  const isReverseSearch = normalizedQuery.includes("*");

  // Clean query for parsing
  const cleanedQuery = normalizedQuery.replace("*", "").trim();

  // Detect scoped search (e.g., track:in one voice)
  const scopedSearchRegex = /(\w+):(.+)/;
  const keywords = [];

  if (scopedSearchRegex.test(cleanedQuery)) {
    const match = cleanedQuery.match(scopedSearchRegex);
    const field = match[1];
    const value = match[2].trim();

    if (searchFields.includes(field)) {
      keywords.push({ field, value });
    }
  } else {
    keywords.push(...cleanedQuery.split(/\s+/).filter(kw => kw.length > 0));
  }

  const normalize = str => str?.toLowerCase().trim().replace(/\s+/g, ' ') || '';

  const filtered = tracks.filter(track => {
    const searchable = {
      id: String(track.id).toLowerCase(),
      track: normalize(track.trackName),
      album: normalize(track.albumName),
      albumduration: normalize(formatDuration(track.albumDuration)),
      trackduration: normalize(formatDuration(track.trackDuration)),
      genre: normalize(track.genre),
      // year: String(track.releaseYear).toLowerCase(),
    };

    return keywords.every(kw => {
      if (kw.field) {
        return searchable[kw.field] === normalize(kw.value);
      } else {
        return Object.values(searchable).some(val =>
          val.includes(kw) || val.includes(kw + "0")
        );
      }
    });
  });

  if (isReverseSearch) {
    filtered.reverse();
  }

  return filtered;
};



let updatedTracks = [];

const handleSearch = (event) => {
  const query = event.target.value;
  filteredTracks = query ? searchTracks(query, updatedTracks) : null;

  const tracksToRender = filteredTracks || updatedTracks;

  renderTracksWrapper(determineSortingOrder(tracksToRender));
  totalCount.innerText = tracksToRender.length;

  const trackElements = document.querySelectorAll('#trackList li');
  trackElements.forEach((li) => {
    const trackId = li.getAttribute('data-track-id');
    const state = states[trackId];

    if (state === 'up') {
      li.classList.add(greenBgClass);
      li.classList.remove(redBgClass);
    } else if (state === 'down') {
      li.classList.add(redBgClass);
      li.classList.remove(greenBgClass);
    } else {
      li.classList.remove(greenBgClass, redBgClass);
    }

    const thumbsUp = li.querySelector('button[data-type="thumbsUp"]');
    const thumbsDown = li.querySelector('button[data-type="thumbsDown"]');

    if (state === 'up') {
      thumbsUp?.classList.remove('opacity-50');
      thumbsDown?.classList.add('opacity-50');
    } else if (state === 'down') {
      thumbsDown?.classList.remove('opacity-50');
      thumbsUp?.classList.add('opacity-50');
    } else {
      thumbsUp?.classList.remove('opacity-50');
      thumbsDown?.classList.remove('opacity-50');
    }
  });
};




if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    const value = event.target.value.trim();

    if(value){
      showAlbumsInReleaseOrder = false; // ensure we're back in track mode
      
      albumLengthCheckboxContainer.classList.add('hidden');
      albumLengthCheckbox.checked = false;

      albumLengthCheckbox.checked = false;
      albumLengthCheckboxContainer.classList.add('hidden');
      trackLengthCheckboxContainer.classList.remove('hidden');
      sortAlphaCheckboxContainer.classList.remove('hidden');
      
      renderSortedTracks(); // Rerun default render
    }

    renderSortedTracks(); // Rerun default render

    handleSearch(event);
  });
}

// \SEARCH








// Get elements
let allCountElement;
let upCountElement;
let downCountElement;

const determineSortingOrder = (tracks) => {
  const sortAlphabetically = document.getElementById('sort-alpha').previousElementSibling.checked;
  const sortTrackLength = document.getElementById('sort-track-length').previousElementSibling.checked;


  let sortedTracks = [...tracks]; // Default is all tracks

  if (sortTrackLength) {
    sortedTracks.sort((a, b) => b.trackDuration - a.trackDuration);
  }

  if (sortAlphabetically) {
    sortedTracks.sort((a, b) => a.trackName.localeCompare(b.trackName));
  }

  return sortedTracks;
};




// const getUniqueAlbums = (tracks) => {
//   const seen = new Map();
//   tracks.forEach(track => {
//     if (!seen.has(track.albumName)) {
//       seen.set(track.albumName, track);
//     } else {
//       const existing = seen.get(track.albumName);
//       if (track.albumDuration > existing.albumDuration) {
//         seen.set(track.albumName, track);
//       }
//     }
//   });
//   return Array.from(seen.values());
// };


  

// Function to render sorted tracks
const renderSortedTracks = () => {
  const baseTracks = filteredTracks || updatedTracks;

  let tracksToRender = determineSortingOrder(baseTracks);

  totalCount.innerText = tracksToRender.length;
  renderTracksWrapper(tracksToRender);
};







// Update renderStoredData
const renderStoredData = () => {
  const savedData = localStorage.getItem('trackStates');

  if (savedData && Object.keys(JSON.parse(savedData)).length > 0) {
    const states = JSON.parse(savedData); // Parse the stored JSON data

    // Count occurrences of "up" and "down"
    const upCount = Object.values(states).filter(state => state === 'up').length;
    const downCount = Object.values(states).filter(state => state === 'down').length;

    // Display the counts
    storedData.innerHTML = `
      <p class="select-none cursor-pointer bg-gray-200 p-2" id="allCount">All</p>
      <p class="select-none cursor-pointer bg-green-200 p-2" id="upCount">Up: <strong>${upCount}</strong></p>
      <p class="select-none cursor-pointer bg-red-200 p-2" id="downCount">Down: <strong>${downCount}</strong></p>`;

    // Reassign global variables to the newly created DOM elements
    allCountElement = document.getElementById('allCount');
    upCountElement = document.getElementById('upCount');
    downCountElement = document.getElementById('downCount');

    // Add event listeners for counts
    allCountElement.addEventListener('click', () => {
      allCountElement.classList.add("border-2", "border-red-500");
      upCountElement.classList.remove("border-2", "border-red-500");
      downCountElement.classList.remove("border-2", "border-red-500");

      clearList();
      renderSortedTracks(); // Render all tracks with sorting applied
    });

    upCountElement.addEventListener('click', () => {
      upCountElement.classList.add("border-2", "border-red-500");
      allCountElement.classList.remove("border-2", "border-red-500");
      downCountElement.classList.remove("border-2", "border-red-500");

      const upTracks = updatedTracks.filter(track => states[track.id] === 'up');
      renderTracksWrapper(determineSortingOrder(upTracks)); // Render "up" tracks with sorting
    });

    downCountElement.addEventListener('click', () => {
      downCountElement.classList.add("border-2", "border-red-500");
      allCountElement.classList.remove("border-2", "border-red-500");
      upCountElement.classList.remove("border-2", "border-red-500");

      const downTracks = updatedTracks.filter(track => states[track.id] === 'down');
      renderTracksWrapper(determineSortingOrder(downTracks)); // Render "down" tracks with sorting
    });

  } else {
    storedData.innerHTML = ``;
  }
};





const renderTracks = (tracks) => {
  const savedData = loadState(); // Always fetch the latest state

  tracks.forEach(track => {
    const li = document.createElement('li');
    li.className = `px-0 py-0 rounded-lg bg-white flex justify-between items-center relative w-[300px]`;
    li.setAttribute('data-track-id', track.id);

    // Required delay for Tailwind classes to take effect
    setTimeout(() => {
      if (savedData[track.id] === "up") {
        li.classList.add(greenBgClass);
      } else if (savedData[track.id] === "down") {
        li.classList.add(redBgClass);
      }
    }, 0);

    // Track details
    const details = document.createElement('div');
    
    const catId = document.createElement('p');
    catId.innerHTML = `<span class="font-normal text-slate-400">CatID:</span> <span class="text-[#ff0000]">${track.id}</span>`;
    details.appendChild(catId);
    
    details.appendChild(createTruncatedElement('Track', track.trackName));
    details.appendChild(createTruncatedElement('Album', track.albumName));

    const trackDuration = document.createElement('p');
    trackDuration.innerHTML = `<strong>Track Duration:</strong> ${Number(track.trackDuration).toFixed(2)}`;

    details.appendChild(trackDuration);

    const albumDuration = document.createElement('p');
    albumDuration.innerHTML = `<strong>Album Duration:</strong> ${Number(track.albumDuration).toFixed(2)}`;

    details.appendChild(albumDuration);
    
    const genre = document.createElement('p');
    genre.innerHTML = `<strong>Genre:</strong> ${track.genre}`;

    details.appendChild(genre);
    
    const trackNumber = document.createElement('p');
    trackNumber.innerHTML = `<strong>Track Number:</strong> ${Number(track.trackNumber)}`;

    details.appendChild(trackNumber);
// 
// 
    const ytUrl = document.createElement('p');
    ytUrl.innerHTML = `<a class="block mt-2 w-fit bg-green-200 rounded-md text-sm text-black font-bold tracking-wider pt-0.5 pb-1 px-1" href="${track.ytUrl}" target="_blank">Play Track</a>`;

    track.ytUrl && details.appendChild(ytUrl);

    //
    details.className = 'relative p-5 mt-0.5';
    //

    // Thumbs container
    const controls = document.createElement('div');
    controls.className = 'h-full rounded p-1 relative';

    // Create buttons
    const thumbsUp = document.createElement('button');
    thumbsUp.innerHTML = '👍';
    thumbsUp.className = 'text-md absolute top-2 right-1';

    const thumbsDown = document.createElement('button');
    thumbsDown.innerHTML = '👎';
    thumbsDown.className = 'text-md absolute bottom-2 right-1';

    // Helper: Update UI state
    function updateVisualState(state) {
      if (state === 'up') {
        li.classList.add(greenBgClass);
        li.classList.remove(redBgClass);
        thumbsUp.classList.remove('opacity-50');
        thumbsDown.classList.add('opacity-50');
      } else if (state === 'down') {
        li.classList.add(redBgClass);
        li.classList.remove(greenBgClass);
        thumbsDown.classList.remove('opacity-50');
        thumbsUp.classList.add('opacity-50');
      } else {
        li.classList.remove(greenBgClass, redBgClass);
        thumbsUp.classList.add('opacity-50');
        thumbsDown.classList.add('opacity-50');
      }
    }

    // Initial state from saved data
    let currentState = savedData[track.id] || null;
    updateVisualState(currentState);

    // Event listener: Thumbs Up
    thumbsUp.addEventListener('click', () => {
      const updatedState = loadState();

      if (currentState === 'up') {
        delete updatedState[track.id];
        currentState = null;
      } else {
        updatedState[track.id] = 'up';
        currentState = 'up';
      }

      saveState(updatedState);
      updateVisualState(currentState);
      renderStoredData();
    });

    // Event listener: Thumbs Down
    thumbsDown.addEventListener('click', () => {
      const updatedState = loadState();

      if (currentState === 'down') {
        delete updatedState[track.id];
        currentState = null;
      } else {
        updatedState[track.id] = 'down';
        currentState = 'down';
      }

      saveState(updatedState);
      updateVisualState(currentState);
      renderStoredData();
    });

    controls.appendChild(thumbsUp);
    controls.appendChild(thumbsDown);


    li.appendChild(details);
    li.appendChild(controls);
    trackList.appendChild(li);
  });


  if (searchInput.value.trim()) {
    totalTracksTitle.innerText = "Reset Tracks";
    totalTracksTitle.classList.add('cursor-pointer');
  } else{
    totalTracksTitle.innerText = "Total Tracks";
    totalTracksTitle.removeEventListener('click', () => {});
    totalTracksTitle.classList.remove('cursor-pointer');
  }

  totalAlbumsTitle.innerText = "Total Albums";
  
  totalAlbumsTitleContainer.classList.add("totalAlbumsCTA");
  totalTracksTitleContainer.classList.remove("totalTracksCTA");
};


const renderAlbums = (albums) => {
  totalTracksTitle.classList.add('cursor-pointer');
  totalTracksTitle.innerText = "Reset Tracks";
  totalAlbumsTitle.innerText = "Toggle Order";

  totalTracksTitleContainer.classList.add("totalTracksCTA");
  totalAlbumsTitleContainer.classList.remove("totalAlbumsCTA");

  albums.forEach(album => {
    const li = document.createElement('li');
    li.className = `px-0 py-0 rounded-lg bg-white flex flex-col justify-between items-start relative w-[300px]`;
    li.setAttribute('data-album-id', album.id);

    // Top section: Text details
    const detailsText = document.createElement('div');
    detailsText.className = 'relative p-5 mt-0.5';

    // if (albumLengthShowing) {
    // }
    const catId = document.createElement('p');
    catId.innerHTML = `<span class="font-normal text-slate-400">CatID:</span> <span class="text-[#ff0000]">${album.id}</span>`;
    detailsText.appendChild(catId);

    detailsText.appendChild(createTruncatedElement('Album', album.albumName));

    const albumDuration = document.createElement('p');
    albumDuration.innerHTML = `<strong>Album Duration:</strong> ${Number(album.albumDuration).toFixed(2)}`;
    detailsText.appendChild(albumDuration);

    const genre = document.createElement('p');
    genre.innerHTML = `<strong>Genre:</strong> ${album.genre}`;
    detailsText.appendChild(genre);
    
    const trackCount = document.createElement('p');
    trackCount.innerHTML = `<strong>Tracks:</strong> ${album.trackCount}`;
    detailsText.appendChild(trackCount);

    li.appendChild(detailsText);

    // Bottom section: View Playlist link (left) and Image (right)
    const bottomSection = document.createElement('div');
    bottomSection.className = 'flex justify-between items-center w-full px-5 pb-3 -mt-3';

    // Playlist Link (left)
    if (album.ytPlaylistUrl) {
      const ytPlaylistLink = document.createElement('a');
      ytPlaylistLink.href = album.ytPlaylistUrl;
      ytPlaylistLink.target = "_blank";
      ytPlaylistLink.className = 'block w-fit bg-green-200 rounded-md text-sm text-black font-bold tracking-wider pt-0.5 pb-1 px-1';
      ytPlaylistLink.textContent = 'View Playlist';
      bottomSection.appendChild(ytPlaylistLink);
    } else {
      bottomSection.appendChild(document.createElement('div')); // placeholder to preserve space
    }

    // Album Artwork (right)
    if (album.artwork) {
      const image = document.createElement('img');
      image.src = album.artwork;
      image.classList.add('h-10', 'w-10', 'object-cover');

      if (album.ytPlaylistUrl) {
        const imgLink = document.createElement('a');
        imgLink.href = album.ytPlaylistUrl;
        imgLink.target = "_blank";
        imgLink.appendChild(image);
        bottomSection.appendChild(imgLink);
      } else {
        bottomSection.appendChild(image);
      }
    }

    li.appendChild(bottomSection);
    trackList.appendChild(li);
  });
};





// Add event listeners to 'track view' checkboxes (again)
sortAlphaCheckbox.addEventListener('change', renderSortedTracks);

trackLengthCheckbox.addEventListener('change', renderSortedTracks);


const clearList = () => {
  while (trackList.firstChild) {
    trackList.removeChild(trackList.firstChild);
  }
};

const renderTracksWrapper = (tracks) => {
  clearList();
  renderTracks(tracks);

  reverseFetchData.classList.remove('hidden');
  searchHints.classList.remove('hidden');
};


const initialize = async () => {
  const apiData = await fetchApiData(); // Fetch API data
  const localState = loadState(); // Load states from localStorage
  updatedTracks = mergeTrackStates(apiData, localState); // Merge states

  renderStoredData(); // Display counts
  renderSortedTracks(); // Render tracks with initial sorting

  await fetchAlbumApiData();
};

// renderStoredData();
initialize();