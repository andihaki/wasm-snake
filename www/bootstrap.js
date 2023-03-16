// in case fail load index.js
import("./index").catch((e) => console.error("Error importing index: ", e));
