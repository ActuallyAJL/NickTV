//Change the name of this file to 'Settings.js' and fill in the empty strings with your data.

//the XML Key or X-Plex-Token for a local Plex server
const localKey = '';
//the XML Key or X-Plex-Token for a remote Plex server
const remoteKey = '';

//the url and port for a local Plex server
const localPlex = "http://localhost:32400";
//the url and port for a remote Plex server
const remotePlex = "http://*IP*:*Port number*";

//Where the users/reviews/favorites data API lives.
//  - In local development this is the json-server you run from the `api/` folder.
//  - In production (the Azure Static Web App build) it is the bundled Azure Functions
//    API, served at the same origin under "/api".
//Change the dev URL here if you run json-server on a different port.
export const dbURL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8088";

//for url, choose either 'remotePlex' or 'localPlex' depending on the location of the server you want to access
export const url = remotePlex;
//for key, choose either 'remoteKey' or 'localKey' depending on the location of the server you want to access
export const key = remoteKey;

//the ID of the Movie Library on your Plex server. For me this was 1.
export const movieLibId = 1;