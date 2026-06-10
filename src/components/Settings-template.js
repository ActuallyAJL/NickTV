//Change the name of this file to 'Settings.js' and fill in the empty strings with your data.

//the XML Key or X-Plex-Token for a local Plex server
const localKey = '';
//the XML Key or X-Plex-Token for a remote Plex server
const remoteKey = '';

//the url and port for a local Plex server
const localPlex = "http://localhost:32400";
//the url and port for a remote Plex server
const remotePlex = "http://*IP*:*Port number*";

//the url and port for a local json server which will host your reviews, users, and favorites
export const dbURL = "http://localhost:8088";

//for url, choose either 'remotePlex' or 'localPlex' depending on the location of the server you want to access
export const url = remotePlex;
//for key, choose either 'remoteKey' or 'localKey' depending on the location of the server you want to access
export const key = remoteKey;

//the ID of the Movie Library on your Plex server. For me this was 1.
export const movieLibId = 1;