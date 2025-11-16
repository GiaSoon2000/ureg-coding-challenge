// frontend/src/api.js
import axios from "axios";

// In production the nginx frontend will proxy API calls to the backend
// so we keep a relative baseURL here (same-origin). Adjust if you
// change deployment topology.
const API = axios.create({
  baseURL: ""  // relative: will call same origin (/rates)
});

export default API;
