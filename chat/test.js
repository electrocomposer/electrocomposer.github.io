// run `node test.js` in bash
// comment out any code (or files imported) which references document or dom as conflicts with node execution:
    // comment out import { formatSeconds } from "./utils.js"; in formatters.js
    // comment out import { parseAlbumDuration } from "./utils.js"; in steps.js



import { normalizeQuery } from "./synonyms.js";
import { parseIntent } from "./intent.js";

const rawQuery = "biggest song from the record Pimento";
const normalizedQuery = normalizeQuery(rawQuery);
console.log("Normalized query:", normalizedQuery);

const ctx = parseIntent(normalizedQuery);
console.log("Parsed intent:", ctx);




// test one without synonyms file
// import { parseIntent } from "./intent.js";
// import { intentRegistry } from "./registry.js";

// const ctx = parseIntent("longest track on Pimento");
// console.log("Parsed intent:", ctx);

// if (!intentRegistry[ctx.intent]) {
//   console.error("No registry entry found for intent:", ctx.intent);
// } else {
//   console.log("Registry entry exists for intent:", ctx.intent);
// }



