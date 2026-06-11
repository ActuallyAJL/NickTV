# Remote-Watch

Remote-Watch provides an alternative web-based interface for viewing movies that are part of a Plex Media Server collection.

![Remote-Watch Homepage](/public/images/Homepage.png "Remote Watch Homepage")

## Installation

Fork or clone this project down and place the contents wherever. You will need to take the two files "Settings-template.js" and "database-template.json". Change the names of these files to "Settings.js" and "database.json", respectively. Do not move the files. In your new "Settings.js" file, fill in all the empty strings with data relelvant to your personal Plex server. This includes the Plex Key (known as X-Plex-Token), port numbers and static IP address for your Plex Server, and your Movie Library ID. Finally, in Terminal, navigate to the root directory of remote watch and run `npm install`.

## Usage

After all installation steps are complete, navigate to the root directory of the project and run `npm start`. In a second terminal tab, navigate to the 'API' subdirectory and run `json-server -p 8088 -w database.json`. You will need to have json-server installed in terminal. If you choose to use a different port number, you will have to input the port number into your 'Settings.js' file. 

Happy Viewing

## Deploying to Azure (Static Web App)

Remote-Watch can be hosted as an **Azure Static Web App**: the React UI is served as static
files, and the users/favorites/reviews API ships as a bundled **Azure Functions** app
(`api/`) backed by **Azure Table Storage** — this replaces the dev-only `json-server`. The
GitHub Actions workflow in `.github/workflows/` already builds and deploys both.

### 1. Provision Azure resources

1. **Storage account** (for Table Storage) — create one, then copy its **connection
   string** (Access keys blade).
2. **Static Web App** — create one pointed at this GitHub repo, branch `main`, with build
   settings: app location `/`, api location `api`, output location `build`. Azure adds the
   deployment-token secret to the repo automatically.
3. In the Static Web App → **Configuration** (application settings), add
   `TABLES_CONNECTION_STRING` = the storage connection string from step 1.
4. **Seed the admin user** once: from `api/`,
   `TABLES_CONNECTION_STRING="<conn string>" npm run seed`.

### 2. Make Plex reachable (required, or no movies will load)

The browser streams **directly** from your Plex server, so a deployed HTTPS app needs:

- **Plex Remote Access enabled** so the server is reachable from the internet
  (Plex → Settings → Remote Access).
- An **HTTPS** Plex URL. A plain `http://<ip>:<port>` URL is blocked by the browser as
  *mixed content* on an HTTPS site. Use your server's secure `*.plex.direct` address (Plex
  issues these certs) — e.g. `https://<dash-encoded-ip>.<hash>.plex.direct:32400`.
- Plex **CORS** permitting your Static Web App origin.

Put the HTTPS Plex URL, token, and library ID in `Settings.js` (it is bundled into the
build). **Note:** the X-Plex-Token ends up in the public client bundle, so only deploy a
collection/token you're comfortable exposing.

### 3. Deploy

Push to `main`. The workflow builds the app + API and deploys. `dbURL` automatically points
at `/api` in the production build (see `Settings-template.js`), so no code change is needed
between local and cloud.

## Help

If you need assistance with any of the above, reach me on Github or Twitter, @ActuallyAJL and I will send resources that will help.

## Contribution

Certain parts of this project were found online as open source. As such, the entire project is open-source and free to use. Feel free to add or change features and commit to a branch for approval.

## ERD

Here is my ERD for how data is handled by this app
![Remote-Watch ERD](/public/images/ERD.png "Remote Watch ERD")

## User Stories

### User 1 : Stephen Bluette

As a frequent traveler,
I want to watch my personal movie collection on the go,
so that I don't have to pay a dozen different streaming subscriptions.

Given that I want to watch Boss Baby,
and I am not at home,
and I did not bring Boss Baby with me,
and I have Boss Baby on a remote server at home,
then I can stream it from this application.

### User 2: Amelia Eagerne

As a security-conscious collector,
I want to make sure only approved users are viewing my collection,
so that I dont have to worry about my collection's security.

Given that I attempts to log in to my collection,
and they have not logged in before,
then they will be asked to sign in or register using and email address.

### User 3: Conrad Hamilton

As someone who loves Romantic Comedies,
I want to watch only movies with a love story,
so that I dont have to waste my time scrolling through a big list.

Given that I want to watch a specific genre,
then I can select a genre in the navbar,
and view only movies that fit that genre.

### User 4: Leopold Angleplick

As a sophisticated cinophile,
I want to tell everyone what's wrong with their favorite movie,
so that I can educate the plebs and improve the world of Kino.

Given that I'd like to share my opinion about a movie
and I've clicked to view details of the movie,
when I click to add a review,
then I can rate a movie 1-5 stars, favorite it, and write a review,
and it will be stored for me to view again later.
