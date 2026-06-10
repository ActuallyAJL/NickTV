# Remote-Watch

Remote-Watch provides an alternative web-based interface for viewing movies that are part of a Plex Media Server collection.

![Remote-Watch Homepage](/public/images/Homepage.png "Remote Watch Homepage")

## Installation

Fork or clone this project down and place the contents wherever. You will need to take the two files "Settings-template.js" and "database-template.json". Change the names of these files to "Settings.js" and "database.json", respectively. Do not move the files. In your new "Settings.js" file, fill in all the empty strings with data relelvant to your personal Plex server. This includes the Plex Key (known as X-Plex-Token), port numbers and static IP address for your Plex Server, and your Movie Library ID. Finally, in Terminal, navigate to the root directory of remote watch and run `npm install`.

## Usage

After all installation steps are complete, navigate to the root directory of the project and run `npm start`. In a second terminal tab, navigate to the 'API' subdirectory and run `json-server -p 8088 -w database.json`. You will need to have json-server installed in terminal. If you choose to use a different port number, you will have to input the port number into your 'Settings.js' file. 

Happy Viewing

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
