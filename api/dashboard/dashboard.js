const API_URL = "https://ecapi.olk1.com/tracks"
const albumsAPI = "https://ecapi.olk1.com/albums";

const trackName = document.getElementById('trackName');
const trackLength = document.getElementById('trackLength');

document.addEventListener("DOMContentLoaded", function () {
  let chartInstances = [];

  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById("main-content");

  const tableBody = document.getElementById("table-body");
  const chartsSection = document.getElementById("charts-section");
  const tableSection = document.getElementById("table-section");
  const searchInput = document.getElementById("search-input");

  let allData = [];





// Ensure table is hidden on load
tableSection.classList.add("hidden");

// Show Charts
document.getElementById("nav-charts").addEventListener("click", (e) => {
  e.preventDefault();

  // Remove table section from DOM if present
  if (tableSection.parentNode) {
    tableSection.remove();
  }

  // Add and show charts section
  chartsSection.classList.remove("hidden");
  if (!chartsSection.parentNode) {
    mainContent.appendChild(chartsSection);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Show Table
document.getElementById("nav-table").addEventListener("click", (e) => {
  e.preventDefault();

  // Remove charts section from DOM if present
  if (chartsSection.parentNode) {
    chartsSection.remove();
  }

  // Add and show table section
  tableSection.classList.remove("hidden");
  if (!tableSection.parentNode) {
    mainContent.appendChild(tableSection);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
});








const navLinks = document.getElementById("dashboard-nav").querySelectorAll("a");
const themeIcon = document.getElementById("theme-icon");
const toggleThemeBtn = document.getElementById("toggle-theme");

// === THEME SETUP ===
const savedTheme = localStorage.getItem("theme");
const isDark = savedTheme !== "light";
document.documentElement.classList.toggle("dark", isDark);

// Set initial icon and invert class
themeIcon.src = isDark ? "Sun.svg" : "Moon.svg";
themeIcon.classList.toggle("invert", isDark);

// === NAVIGATION ACTIVE STATE ===
navLinks.forEach(link => link.classList.remove("bg-blue-600"));
// Default to 'Charts' being active
document.getElementById("nav-charts").classList.add("bg-blue-600", "text-white", "px-4");

// Update active nav link on click
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("bg-blue-600", "text-white", "px-4"));
    link.classList.add("bg-blue-600", "text-white", "px-4");
  });
});

// === THEME TOGGLE HANDLER ===
toggleThemeBtn.addEventListener("click", () => {
  const isCurrentlyDark = document.documentElement.classList.toggle("dark");

  themeIcon.src = isCurrentlyDark ? "Sun.svg" : "Moon.svg";
  themeIcon.classList.toggle("invert", isCurrentlyDark);

  localStorage.setItem("theme", isCurrentlyDark ? "dark" : "light");

  renderCharts(allData);
});












function formatDuration(val) {
  // if number like 3.1, pad it to 3.10
  if (!val) return "";
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return num.toFixed(2); // Ensures 3.1 becomes "3.10"
}



const searchFields = ['track', 'album', 'genre', 'id'];


searchInput.addEventListener("input", (e) => {
  const raw = e.target.value.trim();
  const query = raw.toLowerCase();

  // Detect album-mode (genre search)
  const genreSearchMatch = query.match(/^genre:(.+)$/);

  if (genreSearchMatch) {

    if (!albumData || albumData.length === 0) {
    console.warn("Album data not loaded yet");
    return;  // or show “loading albums…”
  }
  // -------------------------
  // ALBUM MODE
  // -------------------------
  showAlbumsInReleaseOrder = true;

  trackName.classList.add("hidden");
  trackLength.classList.add("hidden");

  const genreQuery = genreSearchMatch[1].trim().toLowerCase();

  // Filter ALBUMS ONLY
  let filteredAlbums = albumData.filter(
    album => album.genre.toLowerCase() === genreQuery
  );

  // Sort CatID: highest → lowest
  let initialAlbums = [...filteredAlbums].sort((a, b) => b.id - a.id);

  resultsCount.innerText = filteredAlbums.length;

  tableBody.innerHTML = "";     // optional clear
  renderAlbumTable(initialAlbums);

  return; // STOP HERE — track search must not run
}


  // -------------------------
  // TRACK MODE (default)
  // -------------------------
 
  const scopedSearchRegex = /(\w+):(.+)/;
  const keywords = [];

  trackName.classList.remove("hidden");
  trackLength.classList.remove("hidden");

  if (scopedSearchRegex.test(query)) {
    const match = query.match(scopedSearchRegex);
    const field = match[1];
    const value = match[2].trim();

    if (searchFields.includes(field)) {
      keywords.push({ field, value });
    }
  } else {
    keywords.push(...query.split(/\s+/).filter(Boolean));
  }

  const filtered = allData.filter(track => {
    const normalize = str =>
      str?.toLowerCase().trim().replace(/\s+/g, " ") || "";

    const searchable = {
      id: String(track.id),
      track: normalize(track.trackName),
      album: normalize(track.albumName),
      albumduration: normalize(formatDuration(track.albumDuration)),
      trackduration: normalize(formatDuration(track.trackDuration)),
      genre: normalize(track.genre),
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

  resultsCount.innerText = filtered.length;
  renderTable(filtered);
});


// default results displayed on load and fallback between queries
resultsCount.innerText = 500;










  function createChartCanvas(id) {
    const canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.className = "";
    return canvas;
  }

  function createCard(title, canvas) {
    const card = document.createElement("div");
    card.className = "p-4 cursor-pointer flex flex-col items-center justify-center"; // transition-transform 
    card.appendChild(canvas);
    card.setAttribute("data-chart-id", canvas.id);
  
    const titleEl = document.createElement("h2");
    titleEl.className = "text-xl font-semibold mb-4";
    titleEl.innerText = title;
    card.prepend(titleEl);

    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.className = "close hidden cursor-pointer text-7xl font-bold dark:text-white dark:hover:text-gray-600 text-black hover:text-gray-300";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "20px";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent toggling again
      toggleFocus(card);   // same logic as clicking to un-focus
    });

    card.appendChild(closeBtn);

    return card;
  }


let previousScrollY = 0;
function toggleFocus(card) {
  const charts = document.querySelectorAll("#charts-section > div");
  const isFocused = card.classList.contains("focused");

  // reset all cards
  charts.forEach(c => {
    c.classList.remove("focused", "hidden");
    c.classList.add("block", "fade-in");
    c.querySelector(".close")?.classList.add("hidden");
  });

  if (!isFocused) {
     // save scroll position before fullscreen
    previousScrollY = window.scrollY;

    // hide all others and focus the selected card
    charts.forEach(c => {
      if (c !== card) {
        c.classList.add("hidden");
        c.classList.remove("block");
      }
    });
    // remove scrollbars when chart is full screen
    document.querySelector('html').classList.add("overflow-hidden");
    sidebar.classList.add("hidden"); // hide sidebar only when focusing a chart

    card.classList.add("focused", "fade-in");
    card.querySelector(".close")?.classList.remove("hidden");
  } else {
    // add scrollbars back to UI
    document.querySelector('html').classList.remove("overflow-hidden");

    sidebar.classList.remove("hidden"); // show sidebar again when un-focusing

    // restore scroll position
    window.scrollTo({ top: previousScrollY, behavior: "instant" }); // "instant" avoids confusion
  }
}



// 
// 
// 
// 
// 


function renderCharts(data) {
  // Destroy old charts
  chartInstances.forEach(chart => chart.destroy());
  chartInstances = [];
  chartsSection.innerHTML = "";

  const isDarkMode = document.documentElement.classList.contains("dark");
  const labelColor = isDarkMode ? "#f9fafb" : "#111827"; // Tailwind gray-50 / gray-900

  const uniqueAlbums = Array.from(
    data.reduce((map, item) => {
      if (!map.has(item.albumName)) {
        map.set(item.albumName, item.albumDuration);
      }
      return map;
    }, new Map())
  );

  const albumNames = uniqueAlbums.map(([name]) => name);
  const albumDurations = uniqueAlbums.map(([, duration]) => duration);

  const genres = [...new Set(data.map(d => d.genre))];
  const genreCounts = genres.map(g => data.filter(d => d.genre === g).length);
  // const yearly = data.reduce((acc, d) => {
  //   acc[d.releaseYear] = (acc[d.releaseYear] || 0) + 1;
  //   return acc;
  // }, {});



const charts = [

{
  id: "radarChart",
  title: "Album Duration (Minutes/Seconds)",
  type: "radar",
  data: {
    labels: albumNames,
    datasets: [{
      label: "Albums",
      data: albumDurations,
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: labelColor
        }
      }
    },
    scales: {
      r: {
        angleLines: { color: labelColor },
        grid: { color: labelColor },
        pointLabels: { color: labelColor },
        ticks: { color: "#f33" }
      }
    }
  }
},

{
  id: "pieChart",
  title: "Genre Distribution",
  type: "pie",
  data: {
    labels: genres,
    datasets: [{
      data: genreCounts,
      backgroundColor: genres.map((_, i) => `hsl(${(i * 180) / genres.length}, 100%, 60%)`)
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: labelColor
        }
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            // let label = tooltipItem.label || '';
            let value = tooltipItem.raw || 0;
            return `${value} tracks`;
          }
        }
      }
    }
  }
},

  
{
      id: "barChart",
      title: "Album Duration (Minutes/Seconds)",
      type: "bar",
      data: {
        labels: albumNames,
        datasets: [{
          label: 'Album Duration (mins/secs)',
          data: albumDurations,
          backgroundColor: '#ee701e',
          borderColor: '#111111',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          x: { ticks: { display: false, color: labelColor } },
          y: { ticks: { color: labelColor } }
        },
        plugins: {
          legend: {
            labels: { color: labelColor }
          },
          datalabels: {
            color: "white",
            font: { weight: 'bold' },
            textAlign: 'center',
            formatter: (value, ctx) => ctx.chart.data.labels[ctx.dataIndex],
            anchor: 'center',
            align: 'center',
            rotation: -90
          }
        }
      },
      plugins: [
        ChartDataLabels,
        {
          id: 'yValueLabels',
          afterDatasetsDraw(chart) {
            const { ctx, data } = chart;
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = labelColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            data.datasets.forEach((dataset, i) => {
              const meta = chart.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                const value = dataset.data[index];
                ctx.fillText(value, bar.x, bar.y - 5);
              });
            });
          }
        }
      ]
    },


{
      id: "lineChart1",
      title: "Album Duration (Minutes/Seconds)",
      type: "line",
      data: {
        labels: albumNames,
        datasets: [{
          label: 'Album Duration (mins/secs)',
          data: albumDurations,
          backgroundColor: '#2c7f80',
          borderColor: '#2c7f80',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            ticks: {
              stepSize: 5,
              color: labelColor
            }
          },
          x: {
            ticks: { color: labelColor }
          }
        },
        plugins: {
          legend: {
            labels: { color: labelColor }
          }
        }
      }
    },


{
  id: "bubbleChart",
  title: "Album Duration (Hours/Minutes/Seconds)",
  type: "bubble",
  data: {
    labels: albumNames,
    datasets: [{
      label: 'Album Duration (h/m/s)',
      data: albumNames.map((name, index) => ({
        x: index,  // Use album index for the x-axis
        y: albumDurations[index],  // Use album duration for the y-axis
        r: albumDurations[index] / 3  // The radius size of each bubble (scale it accordingly)
      })),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      backgroundColor: genres.map((_, i) => `hsl(${(i * 180) / genres.length}, 100%, 65%)`),
      borderWidth: 1
    }]
  },
  options: {
  plugins: {
    legend: {
      labels: {
        color: labelColor
      }
    },
    tooltip: {
      callbacks: {
        // Show album name as the title
        title: function (context) {
          const index = context[0].raw.x;
          return albumNames[index]; // Album name from x-index
        },
        // Show formatted duration as the label
        label: function (context) {
          const totalSeconds = context.raw.y;
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = (totalSeconds % 60).toFixed(2).padStart(5, '0');
          return `${minutes}:${seconds}`;

          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: labelColor,
          display: false
        }
      },
      y: {
        ticks: {
          color: labelColor
        }
      }
    }
   }
  },

  {
    id: "lineChart2",
    title: "Track Durations",
    type: "line",
    data: {
      labels: data.map((_, index) => index + 1), // X-axis: 1, 2, 3, ...
      datasets: [{
        label: "Track Name (mins/secs)",
        data: data.map(x => x.trackDuration),
        borderColor: "#f33",
        fill: false,
        tension: 0.1,
        // Optional: store track names for tooltip use
        trackNames: data.map(x => x.trackName)
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: labelColor } },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              const index = tooltipItems[0].dataIndex;
              return data[index].trackName; // show track name as title on hover
            },
            label: (tooltipItem) => {
              return `${tooltipItem.formattedValue} mins/secs`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Catalogue Number"
          },
          ticks: { color: labelColor }
        },
        y: {
          title: {
            display: true,
            text: "Track Duration (mins/secs)"
          },
          ticks: { color: labelColor }
        }
      }
    }
  }

// 
// 
];

  charts.forEach(({ id, title, type, data, options = {}, plugins = [] }) => {
    const canvas = createChartCanvas(id);
    const card = createCard(title, canvas);

    const chart = new Chart(canvas, {
      type,
      data,
      options: {
        responsive: true,
        animation: {duration: 5000},
        ...options
      },
      plugins
    });

    chartInstances.push(chart);
    card.addEventListener("click", () => toggleFocus(card));
    chartsSection.appendChild(card);
  });
}




// 
// 
// 
// 
// 






  function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(track => {
      const row = document.createElement("tr");
      row.className = "border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-center";
      row.innerHTML = `
        <td class="px-4 py-2">${track.id}</td>
        <td class="px-4 py-2 text-left">${track.trackName}</td>
        <td class="px-4 py-2">${track.trackDuration.toFixed(2)}</td>
        <td class="px-4 py-2">${track.albumName}</td>
        <td class="px-4 py-2">${track.albumDuration.toFixed(2)}</td>
        <!-- <td class="px-4 py-2">${track.releaseYear}</td> -->
        <td class="px-4 py-2">${track.genre}</td>
        <td class="px-4 py-2">${track.trackNumber}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      allData = data;
      renderCharts(data);
      renderTable(data);
    })
    .catch(err => console.error("API error:", err));



function renderAlbumTable(data) {
  tableBody.innerHTML = "";
  data.forEach(album => {
    const row = document.createElement("tr");
    row.className = "border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-center";
    row.innerHTML = `
      <td class="px-4 py-2">${album.id}</td>
      <td class="px-4 py-2">${album.albumName}</td>
      <td class="px-4 py-2">${album.albumDuration.toFixed(2)}</td>
      <td class="px-4 py-2">${album.genre}</td>
      <td class="px-4 py-2">${album.trackCount || "-"}</td>
    `;
    tableBody.appendChild(row);
  });
}

let albumData = [];

const fetchAlbumApiData = async () => {
  try {
    const response = await fetch(albumsAPI);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const tracks = await response.json();

    // Build album-only dataset
    const albumMap = new Map();

    tracks.forEach(t => {
      const key = t.albumName.toLowerCase();

      if (!albumMap.has(key)) {
        albumMap.set(key, {
          id: t.id,                      // CatID
          albumName: t.albumName,
          albumDuration: t.albumDuration,
          genre: t.genre,
          trackCount: t.trackCount
        });
      } else {
        const album = albumMap.get(key);
        album.trackCount++;
      }
    });

    // Convert Map → array
    albumData = Array.from(albumMap.values());

    // Sort newest CatID → oldest
    albumData.sort((a, b) => b.id - a.id);

    // console.log("Album data loaded:", albumData.length);
    return albumData;

  } catch (error) {
    console.error("Failed to fetch album data:", error);
    return [];
  }
};



    // Allow ESC key to close focused chart (fullscreen mode)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const focusedCard = document.querySelector("#charts-section .focused");
        if (focusedCard) {
          toggleFocus(focusedCard);
        }
      }
    });


  
  fetchAlbumApiData();   // load albums BEFORE searches

});



