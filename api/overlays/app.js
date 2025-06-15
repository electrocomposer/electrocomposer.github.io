const api = 'https://ecapi.olk1.com/tracks';

import { downloadPngButtons } from './buttons.js';
import { renderColorBoxes } from './colors.js';

const trackList = document.getElementById('trackList');
const controlsContainerWrapper = document.getElementById('controls');
const loadMoreBtn = document.getElementById('load-more-btn')

const ITEMS_PER_PAGE = 12;
let allData = [];
let displayedData = [];
let currentPage = 1;

const fetchApiData = async () => {
  try {
    const response = await fetch(api);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return [];
  }
};



const displayData = (data) => {

  // Clear existing trackList
  trackList.innerHTML = '';

  data.forEach(item => { 
    const listItem = document.createElement('section');
    const trackDurationDecimal = item.trackDuration.toFixed(2);
    const albumDurationDecimal = item.albumDuration.toFixed(2);

    // Use listItem directly without wrapping it in another <div> with track-item
    // <div class="track-item xl:w-[1280px] xl:h-[720px]">
    listItem.innerHTML = `<div class="track-item xl:w-[1000px] xl:h-[1000px]">

      <div class="relative z-10">
        <p class="artistName"><span>${item.artistName}</span></p>
        <p class="id"><span>[Catalogue ID]</span><span>&rarr;${item.id}</span></p>
        <p class="trackName"><span>TrackName</span><span class="title">${item.trackName}</span></p>
        <p class="trackDuration"><span>Track Duration</span><span>${trackDurationDecimal}</span></p>
        <p class="trackNumber"><span>Sequence</span>#<span>${item.trackNumber}</span></p>
        <p class="albumName"><span>Album Title</span><span>${item.albumName}</span></p>
        <p class="albumDuration"><span>Album Duration</span><span>${albumDurationDecimal}</span></p>
        <!-- <p class="releaseYear"><span>First Released:</span><span>${item.releaseYear}</span></p> -->
        <p class="genre"><span>Genre</span><span>${item.genre}</span></p>
      </div>
      
      <div class="color-container"><!--  --></div>
      
      <div class="relative z-50 flex flex-wrap justify-start gap-1">
        <button class="download-btn">Download PNG</button> 
        <button class="bg-and-white-text-btn">White Title / White Text</button> 
        <!-- <button class="remove-bg-btn">PNG No Background</button> 
        <button class="white-text-btn">No BG / White Text</button>  -->
        <button class="bg-black-title-black-text-btn">Black Title / Black Text</button> 
        <button class="bg-black-title-white-text-btn">Black Title / White Text</button> 
        <!-- <button class="no-bg-black-title-black-text-btn">No BG Black Title</button> 
        <button class="no-bg-black-title-white-text-btn">No BG Black Title / White Text</button> -->
        <button></button><!-- empty button added so previous button cursor pointer shows correctly -->
      </div>
    <!--  -->
    <!--  -->
    </div>
    `;
    
    trackList.appendChild(listItem); 

    // download png buttons that appear on hover (see style.css)
    downloadPngButtons(listItem, item);
    const colorContainer = document.querySelector('.color-container');
    renderColorBoxes(colorContainer);

    // Position paragraphs inside the listItem
    const paragraphs = listItem.querySelectorAll('p');
    const containerWidth = listItem.clientWidth;
    const containerHeight = listItem.clientHeight;

    const doesCollide = (x, y, width, height, elements) => {
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const elX = rect.left - listItem.getBoundingClientRect().left;
        const elY = rect.top - listItem.getBoundingClientRect().top;
        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        if (
          x < elX + elWidth &&
          x + width > elX &&
          y < elY + elHeight &&
          y + height > elY
        ) {
          return true; 
        }
      }
      return false; 
    };

    const placedElements = [];
    paragraphs.forEach(paragraph => {
      const width = paragraph.offsetWidth;
      const height = paragraph.offsetHeight;
      let randomX, randomY;

      let maxAttempts = 100;
      do {
        randomX = Math.floor(Math.random() * (containerWidth - width));
        randomY = Math.floor(Math.random() * (containerHeight - height));
        maxAttempts--;
      } while (doesCollide(randomX, randomY, width, height, placedElements) && maxAttempts > 0);

      paragraph.style.position = 'absolute';
      paragraph.style.left = `${randomX}px`;
      paragraph.style.top = `${randomY}px`;

      placedElements.push(paragraph);
    });
  });
};


// 
// 
// 
// 

const loadMoreData = () => {
  // Save current scroll position before loading more data
  const scrollY = window.scrollY;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const nextItems = allData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  displayedData.push(...nextItems);
  displayData(displayedData);
  currentPage++;

  // Restore scroll position after new data is loaded
  window.scrollTo({ top: scrollY, behavior: 'instant' });

  // Hide the button when all data is loaded
  if (displayedData.length >= allData.length) {
    loadMoreBtn.style.display = 'none';
  }
};

// Attach event listener
loadMoreBtn.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent page jumps
  loadMoreData();
});




// Controls UI setup.
const setupUI = () => {
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'mt-1 controls-container flex justify-center items-center space-y-0 p-0 gap-1';

  // Reset Button
  const resetButton = document.createElement('button');

  resetButton.textContent = 'Reset Data';
  resetButton.className = 'mb-1 lg:mb-0 px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition';
  resetButton.addEventListener('click', () => {
     // Clear the displayed data so it resets the page view
    displayedData = [];

    // Reset pagination, but keep the previous reset data if any
    currentPage = 1;
    
    // Reload initial batch of data
    loadMoreData();

    // Reset input fields
    minIdInput.value = '';
    maxIdInput.value = '';

    // Show Load More button
    loadMoreBtn.style.display = 'block';
  });

  controlsContainer.appendChild(resetButton);


  const inputContainer = document.createElement('div');
  inputContainer.className = 'flex flex-col lg:flex-row gap-1 justify-center space-x-0';

  const minIdInput = document.createElement('input');
  minIdInput.type = 'number';
  minIdInput.placeholder = '1';
  minIdInput.min = '1';
  minIdInput.className = 'w-20 px-2 py-1 border rounded focus:ring focus:outline-none';
  inputContainer.appendChild(minIdInput);

  const maxIdInput = document.createElement('input');
  maxIdInput.type = 'number';
  maxIdInput.placeholder = allData.length.toString();
  maxIdInput.min = '1';
  maxIdInput.max = allData.length.toString();
  maxIdInput.className = 'w-20 mb-1 lg:mb-0 px-2 py-1 border rounded focus:ring focus:outline-none';
  inputContainer.appendChild(maxIdInput);

  controlsContainer.appendChild(inputContainer);

  const filterButton = document.createElement('button');

  filterButton.textContent = 'Filter by ID';
  filterButton.className = 'px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition';
  
  filterButton.addEventListener('click', () => {
    let minId = parseInt(minIdInput.value, 10);
    let maxId = parseInt(maxIdInput.value, 10);

    if (!isNaN(minId) && !isNaN(maxId) && minId >= 1 && maxId <= allData.length) {
        // Swap values if minId is greater than maxId
        if (minId > maxId) {
            [minId, maxId] = [maxId, minId]; // Swap using destructuring
            displayedData = allData.filter(item => item.id >= minId && item.id <= maxId).reverse();
        } else {
            displayedData = allData.filter(item => item.id >= minId && item.id <= maxId);
        }

        displayData(displayedData);
        loadMoreBtn.style.display = 'none';
    } else {
        alert('Please enter valid numeric values within the range.');
    }
  });

  controlsContainer.appendChild(filterButton);

  controlsContainerWrapper.append(controlsContainer);
};

fetchApiData().then((data) => {
  if (Array.isArray(data) && data.length > 0) {
    allData = data;
    displayedData = [];
    currentPage = 1;
    loadMoreData();
    setupUI();
  } else {
    console.error('No data available or data is invalid.');
    alert('Failed to load data. Please try again later.');
  }
}).catch((error) => {
  console.error('Error fetching data:', error);
  alert('An error occurred while loading data. Please check your connection and try again.');
});

