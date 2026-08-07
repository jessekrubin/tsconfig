import pkgjson from "../package.json" with { type: "json" };

export const __version__ = pkgjson.version;
