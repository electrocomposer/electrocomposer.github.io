const artistName = "electroComposer";

const timeoutDelay = 1000;

class RecordLabelHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.extraClass = this.getAttribute("extra-class") || "";
        this.render();
        this.setupInteractivity();
        this.highlightCurrentPage();
        this.catApiSubNav();
        this.mobileNav();
    }

  render() {
    this.innerHTML = `<div class="fade-in z-50 h-[28px] bg-[#202123] text-white">
          <scrolling-text id="dynamic-scroller" speed="60s"></scrolling-text></div>

    <div class="w-full">
      <header class="relative flex items-center justify-between">



<!--  -->
<!--  -->
<!--  -->

<div id="header-container" class="select-none relative md:fixed top-0 z-40 flex items-center transition-all duration-300 overflow-hidden w-[max-content]">
  <!-- Panel that grows -->
  <div id="expanding-panel" class="flex items-center bg-white text-[#0c0c0c] transition-all duration-300 translate-w w-[max-content]">
    <!-- Artist Name -->
    <h1 id="artist-title" class="cursor-pointer px-1 sm:pt-0.5 pb-0.5 w-auto">
      ${artistName}
    </h1>

    <!-- Hidden links -->
    <div id="panel-links"
         class="w-0 translate-w flex items-center space-x-2 px-0 transition-all duration-300 opacity-0 translate-x-[-10px] pointer-events-none">
      <a href="/" tabindex="-1" class="bg-slate-50 hover:underline ml-3 pb-0.5 md:pb-0">Home</a>
      <span class="bg-slate-50">\\</span>
      <a href="/bio" tabindex="-1" class="bg-slate-50 hover:underline pb-0.5 md:pb-0">Bio</a>
    </div>
  </div>

  <!-- Triangle wrapper that will move right -->
  <div id="triangle-container" class="transition-transform duration-300 translate-x-0">
    <div class="w-0 h-0 border-y-[14px] border-l-[14px] border-y-transparent border-l-white shrink-0"></div>
  </div>
</div>





          <!-- Right-pointing Triangle extension -->
          <!-- <div class="w-0 h-0 border-y-[14px] border-l-[14px] border-y-transparent border-l-white"></div> -->




<!--  -->
<!--  -->
<!--  -->
<!--  -->



      <nav class="md:bg-white px-2 md:fixed top-0 right-0 z-40">
  
        <!-- Left-pointing Triangle extension -->
        <!-- <div class="hidden md:block w-0 h-0 border-y-[14px] border-r-[14px] border-y-transparent border-r-white absolute left-[-14px]"></div> -->

        <ul class="hidden md:flex">
          
              <!-- Catalogue API with automatic Dropdown Menu Nav-->
              <li class="relative">
                <button id="apiDropdownBtn" class="bg-transparent nav-link hover:text-[#000] -mt-1 cursor-default" aria-haspopup="true" aria-expanded="false">Catalogue API <span class="text-2xl">&#x25BC;</span></button>
                
                <ul id="apiDropdownMenu"
                    class="absolute -left-2 mt-0 w-48 bg-white shadow-md invisible"
                    role="menu"
                    aria-label="Catalogue API submenu">
                  <li><a href="/api/" class="nav-link block px-4 py-2 hover:bg-gray-100 hover:text-[#FD6A6D]" role="menuitem" tabindex="-1">Track Search</a></li>
                  <li><a href="/api/overlays" class="nav-link block px-4 py-2 hover:bg-gray-100 hover:text-[#FD6A6D]" role="menuitem" tabindex="-1">Overlays</a></li>
                  <li><a href="/api/gallery" class="nav-link block px-4 py-2 hover:bg-gray-100 hover:text-[#FD6A6D]" role="menuitem" tabindex="-1">Gallery</a></li>
                  <li><a href="/api/albums" class="nav-link block px-4 py-2 hover:bg-gray-100 hover:text-[#FD6A6D]" role="menuitem" tabindex="-1">Albums</a></li>
                  <li><a href="/api/dashboard" class="nav-link block px-4 py-2 hover:bg-gray-100 hover:text-[#FD6A6D]" role="menuitem" tabindex="-1">Dashboard</a></li>
                  <li><a href="/api/docs" class="nav-link block px-4 py-2 hover:bg-gray-100 hover:text-[#FD6A6D]" role="menuitem" tabindex="-1">API Docs</a></li>
                </ul>

              </li>

          </ul>

          <!-- <button id="burger" class="md:hidden text-3xl mt-2.5 text-black">&#9776;</button> -->

                             <!-- down triangle -->
          <button id="burger" class="bg-transparent md:hidden text-4xl mr-0 -mt-2 text-[#FD6A6D]">&#x25BC;</button>
    
 </nav>
</header></div>






    <!-- Mobile Modal Overlay Nav -->
    <div id="mobileMenu">
  
    <div id="nav-content">

      <div class="text-xl relative -mt-32">
      <!-- X to close -->
          <button id="close-nav-btn" class="absolute right-0 -top-8 text-7xl">&#10006;</button>
          
        <div id="nav-links" class="leading-8">
          
          <p class="pt-12 pb-2 flex justify-center"><span class="w-fit block bg-white text-black ">Catalogue API</span></p>

          <div class="leading-10 text-center">
            <a href="/api/" class="block">Track Search</a>
            <a href="/api/overlays" class="block">Overlays</a>
            <a href="/api/gallery" class="block">Gallery</a>
            <a href="/api/albums" class="block">Albums</a>
            <a href="/api/dashboard" class="block">Dashboard</a>
            <a href="/api/docs" class="block">API Docs</a>
          </div>

        </div>
      </div>

    </div>

    </div>
    `;
    }




    catApiSubNav() {
  document.addEventListener("DOMContentLoaded", () => {
    const apiDropdownBtn = document.getElementById("apiDropdownBtn");
    const apiDropdownMenu = document.getElementById("apiDropdownMenu");

    if (apiDropdownBtn && apiDropdownMenu) {
      const dropdownLinks = apiDropdownMenu.querySelectorAll("a");
      let hideTimeout;

      // Apply initial transform style to all links
      dropdownLinks.forEach(link => {
        link.classList.add("transition-transform", "duration-300", "translate-y-[-10px]", "opacity-0");
      });

      const showDropdown = () => {
        clearTimeout(hideTimeout);
        apiDropdownMenu.classList.remove("invisible");
        apiDropdownBtn.classList.add("text-black");

        // Animate links into view
        dropdownLinks.forEach((link, index) => {
          setTimeout(() => {
            link.classList.remove("translate-y-[-10px]", "opacity-0");
            link.classList.add("translate-y-0", "opacity-100");
          }, index * 50); // staggered animation
        });
      };

      const hideDropdown = () => {
        // Reset animation before hiding
        dropdownLinks.forEach(link => {
          link.classList.remove("translate-y-0", "opacity-100");
          link.classList.add("translate-y-[-10px]", "opacity-0");
        });

        hideTimeout = setTimeout(() => {
          apiDropdownMenu.classList.add("invisible");
          apiDropdownBtn.classList.remove("text-black");
        }, 0); // Allow animation to complete
      };

      // Hover behavior
      apiDropdownBtn.addEventListener("mouseenter", showDropdown);
      apiDropdownMenu.addEventListener("mouseenter", () => clearTimeout(hideTimeout));

      apiDropdownBtn.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(hideDropdown, 0);
      });
      apiDropdownMenu.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(hideDropdown, 0);
      });

      // Keyboard navigation on the button
      apiDropdownBtn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          showDropdown();
          dropdownLinks[0]?.focus();
        } else if (e.key === "Escape") {
          hideDropdown();
          apiDropdownBtn.focus();
        }
      });

      // Keyboard navigation inside dropdown
      apiDropdownMenu.addEventListener("keydown", (e) => {
        const focusedIndex = Array.from(dropdownLinks).indexOf(document.activeElement);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = (focusedIndex + 1) % dropdownLinks.length;
          dropdownLinks[nextIndex].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex = (focusedIndex - 1 + dropdownLinks.length) % dropdownLinks.length;
          dropdownLinks[prevIndex].focus();
        } else if (e.key === "Escape") {
          hideDropdown();
          apiDropdownBtn.focus();
        }
      });

      // Click outside to close
      document.addEventListener("click", (e) => {
        if (!apiDropdownBtn.contains(e.target) && !apiDropdownMenu.contains(e.target)) {
          hideDropdown();
        }
      });
    }
  });
}



     highlightCurrentPage() {
        const links = this.querySelectorAll(".nav-link");
        let currentPath = window.location.pathname.replace(/\/$/, ""); // Normalize path

        // Select the API dropdown button
        const apiDropdownBtn = document.querySelector("#apiDropdownBtn");

        // Check if the current path is under /api/
        if (currentPath.startsWith("/api")) {
            apiDropdownBtn?.classList.add("text-[#FD6A6D]");
        }

        links.forEach(link => {
            let linkPath = link.getAttribute("href");

            if (linkPath) {
                linkPath = linkPath.replace(/\/$/, "").split("/").pop(); // Normalize link path

                // Apply active class if paths match
                if (linkPath === currentPath.split("/").pop()) {
                    link.classList.add("border-b-2", "border-[#FD6A6D]", "pb-1", "text-[#FD6A6D]");
                }
            }
      });
    }








// NAVIGATION
    mobileNav(){
      document.addEventListener("DOMContentLoaded", function () {

      const burger = document.getElementById('burger');
      const mobileMenu = document.getElementById("mobileMenu");
      const navContent = document.getElementById("nav-content");
      const navLinks = document.querySelectorAll("#nav-links a");
      const closeNavBtn = document.getElementById("close-nav-btn");;
      let isOpening = false;


      burger.addEventListener("click", openNav);
      closeNavBtn.addEventListener("click", closeNav);
      // closeNavBtn.classList.add('hidden');
      // comment out for testing (same with css #mobileMenu style)

      function openNav() {
        if (!isOpening) {
          isOpening = true;
          
          closeNavBtn.classList.remove("hidden");
          // burger.classList.add("hidden");
          
          navContent.classList.add('fade-in');

          mobileMenu.style.display = "flex";
          mobileMenu.classList.add("open");
          
          document.addEventListener("keydown", handleEscKeyPress);
          // mobileMenu.addEventListener("click", handleOutsideNavClick);

          document.documentElement.style.overflow = "hidden";
          
          setTimeout(() => {
            document.documentElement.style.position = "fixed";
          }, 500); // ios safari fix
          
          document.body.style.paddingRight = getScrollbarWidth() + "px";

          setTimeout(() => {
            isOpening = false;
          }, timeoutDelay);
        }
      }

      function closeNav(callback) {
        mobileMenu.classList.add("close");

        // Prevent icon flicker
        setTimeout(() => {
          closeNavBtn.classList.add('hidden');
          burger.classList.remove("hidden");
        }, 500); // Match CSS animation duration

        document.documentElement.style.position = "relative"; // ios safari fix (see above also)

        setTimeout(() => {
          document.documentElement.style.overflow = "auto";
          document.body.style.paddingRight = "0";
        }, timeoutDelay);

        setTimeout(() => {
          mobileMenu.style.display = "none";
          mobileMenu.classList.remove("open", "close");

          document.removeEventListener("keydown", handleEscKeyPress);
          // mobileMenu.removeEventListener("click", handleOutsideNavClick);

          if (typeof callback === "function") {
            callback();
          }
        }, timeoutDelay);
      }

      // // Intercept link clicks to prevent instant page load
      navLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default navigation
            const href = this.href; // Store the destination URL

            closeNav(() => {
                window.location.href = href; // Navigate after animation
            });
        });
      });


      function handleEscKeyPress(event) {
        if (event.key === "Escape") {
          closeNav();
        }
      }

      // function handleOutsideNavClick(event) {
      // if (event.target === mobileMenu || event.target === navContent) {
      //     closeNav();
      //   }
      // }
    });



    function getScrollbarWidth() {
      const outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.width = "100px";
      outer.style.msOverflowStyle = "scrollbar"; // For Microsoft Edge
      document.body.appendChild(outer);
      
      const widthNoScroll = outer.offsetWidth;
      outer.style.overflow = "scroll";
      
      const inner = document.createElement("div");
      inner.style.width = "100%";
      outer.appendChild(inner);    
      const widthWithScroll = inner.offsetWidth;
      
      outer.remove();
      
      return widthNoScroll - widthWithScroll;
    }
  }






// LEFT SIDE MENU
setupInteractivity() {
  const artistTitle = this.querySelector("#artist-title");
  const panelLinks = this.querySelector("#panel-links");
  const headerContainer = this.querySelector("#header-container");

  const expand = () => {
    headerContainer.style.width = "max-content";

    panelLinks.classList.remove("w-0", "opacity-0", "translate-x-[-10px]", "pointer-events-none", "px-0");
    panelLinks.classList.add("w-[100%]", "opacity-100", "translate-x-0", "pointer-events-auto", "px-0");
  };

  const collapse = () => {
    panelLinks.classList.remove("w-[100%]", "opacity-100", "translate-x-0", "pointer-events-auto", "px-0");
    panelLinks.classList.add("w-0", "opacity-0", "translate-x-[-10px]", "pointer-events-none", "px-0");

    setTimeout(() => {
      headerContainer.style.width = "";
    }, 300);
  };

  const toggleMenu = () => {
    const isOpen = panelLinks.classList.contains("opacity-100");
    isOpen ? collapse() : expand();
  };

  const setupListeners = () => {
    // Remove any existing listeners first
    artistTitle.replaceWith(artistTitle.cloneNode(true));
    const newTitle = this.querySelector("#artist-title");

    if (window.innerWidth >= 1280) {
      newTitle.addEventListener("mouseenter", expand);
      this.addEventListener("mouseleave", collapse);
    } else {
      newTitle.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
      });

      document.addEventListener("click", (e) => {
        if (!this.contains(e.target)) {
          collapse();
        }
      });
    }
  };

  // Initial setup
  setupListeners();

  // Optional: re-check on resize
  // window.addEventListener("resize", () => {
  //   setupListeners();
  // });
}





    // 
    // 
    // 
    // 
// \DOMContentLoaded
}









// 
// 
// 
// 
// 
// 
// 
// 
// 



const scrollMessages = [
  {
    text: "&gl;&gl; Live Update &gl;&gl; New Album Released! &gl;&gl;",
    highlight: "New Album Released!",
    url: "https://www.youtube.com/@electrocomposer"
  },
  {
    text: "&gl;&gl; Breaking News &gl;&gl; New Samplepack available &gl;&gl;",
    highlight: "New Samplepack available",
    url: "https://samplepacks.presetloops.com"
  },
  {
    text: "&gl;&gl; Check out the latest playlist &gl;&gl; Listen now",
    highlight: "Listen now",
    url: "https://www.youtube.com/@electrocomposer/playlists"
  }
];

let currentIndex = 0;
const interval = 59000; // 59 seconds

function updateScroller() {
  const scroller = document.getElementById("dynamic-scroller");
  if (!scroller || !scrollMessages?.length) return;

  const { text, highlight, url } = scrollMessages[currentIndex];

  const newScroller = document.createElement("scrolling-text");
  newScroller.setAttribute("id", "dynamic-scroller");
  newScroller.setAttribute("text", text);
  newScroller.setAttribute("highlight", highlight);
  newScroller.setAttribute("speed", "60s");
  newScroller.classList.add("fade-in");
  if (url) newScroller.setAttribute("url", url);

  scroller.replaceWith(newScroller);

  currentIndex = (currentIndex + 1) % scrollMessages.length;
}

window.addEventListener("DOMContentLoaded", () => {
  updateScroller(); // Initial render
  setInterval(updateScroller, interval);
});


customElements.define("record-label-header", RecordLabelHeader);
