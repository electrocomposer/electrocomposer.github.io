const baseUrl = "https://ecapi.olk1.com"; 

      function getAllData() {
        fetchAndDisplay("/tracks");
      }

      function getTrackById() {
        fetchAndDisplay("/tracks?id=5");
      }

      function getLimitedTracks() {
        fetchAndDisplay("/tracks?_limit=2");
      }

      function getPaginatedTracks() {
        fetchAndDisplay("/tracks?_start=5&_limit=2");
      }

      // function getSortedTracks() {
      //   fetchAndDisplay("/tracks?_sort=releaseYear&_order=desc");
      // }

      function getFilteredTrackDuration() {
        fetchAndDisplay("/tracks?trackMin=.38&trackMax=.40");
      }
      
      function getGenreTracks() {
        fetchAndDisplay("/tracks?genre=New Wave");
      }

      function searchAllHeart() {
        fetchAndDisplay("/tracks?_search=heart");
      }

      function searchTrackNameOnly() {
        fetchAndDisplay("/tracks?trackName=heart");
      }

      function searchAlbumNameOnly() {
        fetchAndDisplay("/tracks?albumName=heart");
      }

      // function searchBoth() {
      //   fetchAndDisplay("/tracks?_search=heart&albumName=heart");
      // }

      function getRandomTracks() {
        fetchAndDisplay("/tracks?_random=1");
      }

//  
      function getSortedAlbums() {
        fetchAndDisplay("/albums?_sort=releaseYear&_order=asc");
      }

      function getFilteredAlbumDuration() {
        fetchAndDisplay("/albums?albumMin=25&albumMax=30&_sort=albumDuration&_order=desc");
      }
//    
      function combinedQuery() {
        // uses encode to deal with word spaces
        const genre = encodeURIComponent("New Wave");
        fetchAndDisplay(`/tracks?trackMin=1&trackMax=2&_sort=trackDuration&_order=asc&genre=${genre}&_limit=5`);
      }



   async function fetchAndDisplay(endpoint) {
      document.getElementById("queryString").innerText = `GET ${baseUrl}${endpoint}`;

      try {
        const res = await fetch(`${baseUrl}${endpoint}`);
        const data = await res.json();

        // Robust count handling
        const count = Array.isArray(data)
          ? data.length
          : (typeof data === "object" && data !== null
            ? Object.keys(data).length
            : 1);

        document.getElementById("resultCount").innerText = `Results: ${count}`;

        // Display formatted JSON
        document.getElementById("output").innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        document.getElementById("resultCount").innerText = `Error fetching data`;
        document.getElementById("output").innerText = err.toString();
      }
  };







