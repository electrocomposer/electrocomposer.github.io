class ScrollingText extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const text = this.getAttribute("text") || "electroComposer";
        const highlight = this.getAttribute("highlight") || "";
        const speed = this.getAttribute("speed") || "10s"; // Default speed
        const url = this.getAttribute("url") || null;

        // Function to wrap highlighted words
        const getHighlightedText = (text, highlight) => {
            if (!highlight) return text;
            const regex = new RegExp(`(${highlight})`, "gi");
            return text.replace(regex, `<span class="highlighted">$1</span>`);
        };


        const processedText = getHighlightedText(text, highlight);
        const content = url
          ? `<a href="${url}" tabindex="-1" target="_blank" class="cursor-pointer">${processedText}</a>`
          : processedText;

        this.innerHTML = `
            <style>
                .scroll-container {
                    width: 100%;
                    /* height: 30px; */
                    overflow: hidden;
                    white-space: nowrap;
                    position: relative;
                    /* padding: 10px 0; */
                }

                .scroll-text {
                    padding-top: 2px;
                    display: inline-block;
                    font-size: 1rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    padding-right: 1rem;
                    animation: scrollText ${speed} linear infinite;
                    line-height: .8rem;
                }

                .highlighted {
                    color: #FD6A6D; /* Customize highlight color */
                    font-weight: bold;
                    background: yellow; /* Example background color */
                    padding: 0 4px;
                }

                .gold-star {
                    color: gold;
                    font-size: 2rem;
                    display: inline-block;
                    position: relative;
                    top: 2px; /* Nudges the stars downward by 5px */
                }

                @keyframes scrollText {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(-100%);
                    }
                }
            </style>
            <div class="scroll-container">
                <span class="scroll-text">
                    ${content} 
                    &nbsp; <span class="gold-star">&starf;&starf;&starf;&starf;&starf;</span> &nbsp; 
                    ${content} 
                    &nbsp; <span class="gold-star">&starf;&starf;&starf;&starf;&starf;</span>
                </span>
            </div>
        `;
    }
}

// Define the custom element
customElements.define("scrolling-text", ScrollingText);
