/**
 * Oil & Gas Visualization — Main entry point.
 *
 * This file is the lightweight bootstrap that QwenPaw loads at startup.
 * It registers the route, menu, and workspace renderer.
 * Three.js and other heavy dependencies are NOT imported here —
 * they live in the separate viewer-runtime.js bundle.
 *
 * Build outputs:
 *   dist/index.js          — this file (bootstrap, <150 KiB)
 *   dist/viewer-runtime.js — Three.js viewer (loaded lazily)
 */

import "./bootstrap";
