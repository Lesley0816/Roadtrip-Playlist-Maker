let tomtomApi = "IBYSi29ETuqpmdsPhsyO6zEAKq1dUa3C";
let arrival = document.querySelector("#to");
let departure = document.querySelector('#from');
let generateBtn = document.querySelector("#generate-btn");
let genplaylist = document.querySelector("#playlist-form");
let searchHistory = document.querySelector("#search-history");
let playlistLibrary = document.querySelector("#playlist-library");
let songList = document.querySelector("#song-list");
let playlists = [];






// fucntion to get the generate button to give geo code for origin and destination and class the trip lenght function
async function generatePlaylist(event) {

    // the point of origin api call for geo code
    departureApiUrl = "https://api.tomtom.com/search/2/geocode/" + departure.value + ".json?key=" + tomtomApi;
    let start = "";
    let end = "";

    // for modal 
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }


    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }


    event.preventDefault();



    if (departure.value == null) {
        alert("Add your destination");
        return;
    }


    fetch(departureApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network reponse was not okay");
            }

            return response.json();
        })
        .then(data => {
            let departCor = data.results[0].position;
            start = departCor.lat + "%2C" + departCor.lon;// lat and lan of origin 

        })

        .catch(error => {
            console.error("Error: ", error);
        })


    // destination api call for geocoordinates
    arrivalApiUrl = "https://api.tomtom.com/search/2/geocode/" + arrival.value + ".json?key=" + tomtomApi;
    if (arrival.value == null) {
        alert("Add your destination");
        return;
    }


    fetch(arrivalApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network reponse was not okay");
            }

            return response.json();
        })
        .then(data => {
            let arrivalCor = data.results[0].position;// lan and lat of destination
            end = arrivalCor.lat + "%2C" + arrivalCor.lon;
            console.log("start", start);
            console.log("end", end);


            tripLength(start, end);// calling the routing api to give trip length in minutes and pass start and end variables
        })

        .catch(error => {
            console.error("Error: ", error);
        })

    await fetchRecommendations();


    renderPlaylists();
    storePlaylists();
}



// eventlistner for the generate button
genplaylist.addEventListener("submit", generatePlaylist);

// the routing api call to get the trip length 
function tripLength(begin, finish) {
    tomApiUrl = "https://api.tomtom.com/routing/1/calculateRoute/" + begin + ":" + finish + "/json?key=" + tomtomApi



    fetch(tomApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network reponse was not okay");
            }
            return response.json();
        })

        .then(data => {
            let seconds = data.routes[0].summary.travelTimeInSeconds;//travel time in sections
            let milliseconds = seconds * 1000;
            let minutes = seconds / 60;// change travel time to minutes
            console.log("minutes", minutes);
            console.log("milliseconds", milliseconds);


            fetchRecommendations();
            time(milliseconds);


        })

        .catch(error => {
            console.error("Error: ", error);
        })


}

// eventlistner for the generate button
genplaylist.addEventListener("submit", generatePlaylist)


// Spotify API CALL //

const client_id = '732b07c591f7439f87bd99b0b6aa790c';
const client_secret = 'a7bde92878de447ea11a977ca1dfd454';
async function fetchToken() {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + client_id + '&client_secret=' + client_secret,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const parsedRes = await res.json();
    return parsedRes.access_token;
}
//Api call to get the recommendations
async function fetchRecommendations() {
    let genre = document.getElementById("genres-input").value;// gets the value of the dropdown menu
    console.log(genre);
    const token = await fetchToken();
    console.log("token", token);
    // Sample genres request with seed parameters
    const res = await fetch('https://api.spotify.com/v1/recommendations?seed_genres=' + genre + '', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // optional
        }

    });
    showTracks(await res.json());


}


// renders the tracks 
async function showTracks(response) {
    console.log("response", response);
    const recommendations = response.tracks;
    for (const track of recommendations) {
        console.log("*********")
        console.log("artists", track.artists.map(artist => artist.name).join(", "));
        console.log("track", track.name)
        console.log("duration", formatDuration(track.duration_ms));
        console.log("album", track.album.name)
        console.log("track id", track.uri)
        console.log("index #", recommendations[0].uri);
        console.log("*********\n\n")
        //creates the buttons with the song names
        let song = document.createElement("button");
        song.classList.add("song");
        song.dataset.spotifyId = track.uri;
        song.textContent = track.name;
        // adds the buttons to the html 
        songList.appendChild(song);
        // saves the songs as an obejct to save in local storage.
        let songObject = {
            name: track.name,
            url: track.external_urls.spotify
        };
        playlists.push(songObject);
    }


    //  creates an embeded link for the spotify player
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
            const element = document.getElementById('embed-iframe');
            const options = {
                width: '100%',
                uri: recommendations[0].uri
            };
            const callback = (EmbedController) => {
                // lets you pick form the buttons on the page what song you want to switch the player to
                document.querySelectorAll(".song").forEach(
                    song => {
                        song.addEventListener('click', () => {
                            EmbedController.loadUri(song.dataset.spotifyId)
                        });
                    })

            }; IFrameAPI.createController(element, options, callback);
        };
    //calls local storage.
    storePlaylists();
}


// formats the length of the tracks from millisecond to minutes
function formatDuration(duration_ms) {
    // Convert milliseconds to seconds
    let seconds = Math.floor(duration_ms / 1000);
    // Calculate hours, minutes, and remaining seconds
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    // Format the duration as HH:MM:SS
    let formattedDuration = "";
    if (hours > 0) {
        formattedDuration += `${hours}:`;
    }
    formattedDuration += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formattedDuration;
}




// fucntion renders playlists generated into a list as li elements
function renderPlaylists() {
    playlistLibrary.innerHTML = '';

    for (let i = 0; i < playlists.length; i++) {
        let playlist = playlists[i];
        let li = document.createElement("ol");
        li.textContent = playlist;
        li.setAttribute("data-index", i)

        playlistLibrary.appendChild(li);
    }


};
// function to get stored playslist 
function storedPlaylists() {

    let storedGeneratedPlaylists = JSON.parse(localStorage.getItem("playlists"));

    if (storedGeneratedPlaylists !== null) {
        playlists = storedGeneratedPlaylists;
    }

    renderPlaylists();

};
// stringify and set key in localstorage for the playlists
function storePlaylists() {
    localStorage.setItem("playlists", JSON.stringify(playlists));
}

console.log(localStorage);


// Function to create a playlist with a duration slightly above the allotted time
async function time(tomtime) {
    //trip time length
    const tripTime = tomtime;
    const extraTime = 60000; // 1 minutes in milliseconds (adjust as needed)
    let currentDuration = 0;
    let totalTrackTime = tripTime + extraTime; 
    const tracksToAdd = [];

    while (currentDuration < totalTrackTime) {
        const recommendations = await fetchRecommendations(); // Use your existing fetchRecommendations function
        for (const track of recommendations){
            const trackDuration = track.duration_ms || 0;
            const totalDuration = currentDuration + trackDuration;
            if (totalDuration <= totalTrackTime) {
                // Add the track to the playlist
                tracksToAdd.push(track.uri);
                currentDuration += trackDuration;
            } else {
                // Break out of the loop if adding the track exceeds the target duration
                break;
            }
        }
    }


}

// calls the stored playlists
storedPlaylists();