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
        const response = await fetch('https://ecapi.olk1.com/tracks');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data.reverse(); // reverse chronological sort
      } catch (error) {
        console.error('Failed to fetch data:', error);
        return [];
      }
    };


    function createTruncatedElement(label, value, maxLength = 22) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = `${label}: `;
      p.appendChild(strong);

      if (value.length > maxLength) {
        const truncatedValue = value.slice(0, maxLength) + '...';
        p.innerHTML = `<strong>${label}</strong>: ${truncatedValue}`;
        p.title = value; // mouseover tooltip for full string
      } else {
        p.innerHTML = `<strong>${label}</strong>: ${value}`;
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
  

let updatedTracks = [];
const totalCount = document.getElementById('totalCount');

let filteredTracks = null; // Track the current filtered subset

let sortAlbumLengthContainer = document.getElementById('album-length-checkbox-container');

// Search functionality
const searchTracks = (query, tracks) => {
  const normalizedQuery = query.toLowerCase();

  // Check if the query contains the exact word '()' (case-insensitive)
  const isAlbumSearch = normalizedQuery.includes("()");

  // Adjust visibility of sortAlbumLengthContainer based on the search type
  if (isAlbumSearch) {
    sortAlbumLengthContainer.style.visibility = "hidden"; // Hide for album-specific searches
  } else {
    sortAlbumLengthContainer.style.visibility = "visible"; // Show for all other searches
  }

  let filteredTracks = tracks.filter((track) => {
    // If the query contains '()', search only by albumName
    if (isAlbumSearch) {
      const albumNameMatch = track.albumName?.toLowerCase().includes(normalizedQuery.replace("()", "").trim());
      
      return albumNameMatch;
    }

    // Otherwise, search by trackName or releaseYear
    const trackNameMatch = track.trackName?.toLowerCase().includes(normalizedQuery);
    const releaseYearMatch = track.releaseYear?.toString().includes(normalizedQuery);

    return trackNameMatch || releaseYearMatch;
  });

  // If searching for albums, sort the filtered tracks by trackNumber
  if (isAlbumSearch) {
    filteredTracks.sort((a, b) => a.trackNumber - b.trackNumber);
  }

  return filteredTracks;
};


const handleSearch = (event) => {
  const query = event.target.value;
  filteredTracks = query ? searchTracks(query, updatedTracks) : null; // Update filteredTracks
  renderTracksWrapper(determineSortingOrder(filteredTracks || updatedTracks)); // Render with sorting
  totalCount.innerText = (filteredTracks || updatedTracks).length;

  // Update visual states if necessary
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

    // Update button opacity
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





      // Attach event listener to the search input
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
      }





// Get elements
let allCountElement;
let upCountElement;
let downCountElement;

// Function to determine sorting order
const determineSortingOrder = (tracks) => {
  const sortAlphabetically = document.getElementById('sort-alpha').previousElementSibling.checked;
  const sortTrackLength = document.getElementById('sort-track-length').previousElementSibling.checked;
  const sortAlbumLength = document.getElementById('sort-album-length').previousElementSibling.checked;

  let sortedTracks = [...tracks]; // Clone tracks to avoid mutating the original array

  sortedTracks.sort((a, b) => {
    if (sortAlbumLength) {
      if (b.albumDuration !== a.albumDuration) {
        return b.albumDuration - a.albumDuration;
      }
      if (sortTrackLength && b.trackDuration !== a.trackDuration) {
        return b.trackDuration - a.trackDuration;
      }
    }

    if (sortTrackLength && !sortAlbumLength) {
      if (b.trackDuration !== a.trackDuration) {
        return b.trackDuration - a.trackDuration;
      }
    }

    if (sortAlphabetically) {
      return a.trackName.localeCompare(b.trackName);
    }

    return 0;
  });

  return sortedTracks;
};





// Function to render sorted tracks
const renderSortedTracks = () => {
  renderTracksWrapper(determineSortingOrder(filteredTracks || updatedTracks));
};

// Add event listeners to checkboxes
document.getElementById('sort-alpha').previousElementSibling.addEventListener('change', renderSortedTracks);
document.getElementById('sort-track-length').previousElementSibling.addEventListener('change', renderSortedTracks);
document.getElementById('sort-album-length').previousElementSibling.addEventListener('change', renderSortedTracks);





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
      <p class="cursor-pointer bg-gray-200 p-2" id="allCount">All</p>
      <p class="cursor-pointer bg-green-200 p-2" id="upCount">Up: <strong>${upCount}</strong></p>
      <p class="cursor-pointer bg-red-200 p-2" id="downCount">Down: <strong>${downCount}</strong></p>`;

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

// Add event listeners to checkboxes
document.getElementById('sort-alpha').previousElementSibling.addEventListener('change', renderSortedTracks);
document.getElementById('sort-track-length').previousElementSibling.addEventListener('change', renderSortedTracks);
document.getElementById('sort-album-length').previousElementSibling.addEventListener('change', renderSortedTracks);






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

    const year = document.createElement('p');
    year.innerHTML = `<strong>First Released:</strong> ${track.releaseYear}`;
    details.appendChild(year);

    const trackDuration = document.createElement('p');
    trackDuration.innerHTML = `<strong>Track Duration:</strong> ${Number(track.trackDuration).toFixed(2)}`;

    details.appendChild(trackDuration);

    const albumDuration = document.createElement('p');
    albumDuration.innerHTML = `<strong>Album Duration:</strong> ${Number(track.albumDuration).toFixed(2)}`;

    details.appendChild(albumDuration);

    const ytUrl = document.createElement('p');
    ytUrl.innerHTML = `<a class="block mt-2 w-fit bg-green-200 rounded-md text-sm text-black font-bold tracking-wider pt-0.5 pb-1 px-1" href="${track.ytUrl}" target="_blank">Play Track</a>`;

    track.ytUrl && details.appendChild(ytUrl);

    //
    details.className = 'relative p-5 mt-0.5';
    //

    // Thumbs container
    const controls = document.createElement('div');
    controls.className = 'h-full rounded p-1 relative';

    // Thumbs Up button
    const thumbsUp = document.createElement('button');
    thumbsUp.innerHTML = '👍';
    thumbsUp.className = 'text-md absolute top-2 right-1';

    // Thumbs Down button
    const thumbsDown = document.createElement('button');
    thumbsDown.innerHTML = '👎';
    thumbsDown.className = 'text-md absolute bottom-2 right-1';

    // Event listener for thumbsUp
    thumbsUp.addEventListener('click', () => {
      const updatedState = loadState();
      updatedState[track.id] = 'up';
      saveState(updatedState);

      li.classList.add(greenBgClass);
      li.classList.remove(redBgClass);
      thumbsUp.classList.remove('opacity-50');
      thumbsDown.classList.add('opacity-50');
      
      renderStoredData(); // Refresh counts
      // renderTracksWrapper(updatedTracks); // Refresh tracks
    });

    // Event listener for thumbsDown
    thumbsDown.addEventListener('click', () => {
      const updatedState = loadState();
      updatedState[track.id] = 'down';
      saveState(updatedState);

      li.classList.add(redBgClass);
      li.classList.remove(greenBgClass);
      thumbsDown.classList.remove('opacity-50');
      thumbsUp.classList.add('opacity-50');
      
      renderStoredData(); // Refresh counts
      // renderTracksWrapper(updatedTracks); // Refresh tracks
    });

    // Initial state check to update button opacity
    if (savedData[track.id] === 'up') {
      thumbsUp.classList.remove('opacity-50');
      thumbsDown.classList.add('opacity-50');
    } else if (savedData[track.id] === 'down') {
      thumbsDown.classList.remove('opacity-50');
      thumbsUp.classList.add('opacity-50');
    }

    // Click listener for removing a track state
    li.addEventListener('click', (event) => {
      if (event.target === thumbsUp || event.target === thumbsDown) return;

      const updatedState = loadState();
      delete updatedState[track.id];
      saveState(updatedState);

      li.classList.remove(greenBgClass);
      li.classList.remove(redBgClass);
      thumbsDown.classList.remove('opacity-50');
      thumbsUp.classList.remove('opacity-50');

      renderStoredData(); // Refresh counts
      // renderTracksWrapper(updatedTracks); // Refresh tracks
    });

    controls.appendChild(thumbsUp);
    controls.appendChild(thumbsDown);

    li.appendChild(details);
    li.appendChild(controls);
    trackList.appendChild(li);
  });
};








const clearList = () => {
  while (trackList.firstChild) {
    trackList.removeChild(trackList.firstChild);
  }
};

const renderTracksWrapper = (tracks) => {
  clearList();
  renderTracks(tracks);
};


const initialize = async () => {
  const apiData = await fetchApiData(); // Fetch API data
  const localState = loadState(); // Load states from localStorage
  updatedTracks = mergeTrackStates(apiData, localState); // Merge states

  renderStoredData(); // Display counts
  renderSortedTracks(); // Render tracks with initial sorting
};

    // renderStoredData();
    initialize();