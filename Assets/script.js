let tomtomApi = "IBYSi29ETuqpmdsPhsyO6zEAKq1dUa3C";
let arrival = document.querySelector("#to");
let departure = document.querySelector('#from');
let generateBtn = document.querySelector("#generate-btn");
let genplaylist = document.querySelector("#playlist-form");





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


// fucntion to get the generate button to give geo code for origin and destination and class the trip lenght function
function generatePlaylist(event) {

    // the point of origin api call for geo code
    departureApiUrl = "https://api.tomtom.com/search/2/geocode/" + departure.value + ".json?key=" + tomtomApi;
    let start = "";
    let end = "";
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

    let genre = document.getElementById("genres-input");
    fetchRecommendations();
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
            let minutes = data.routes[0].summary.travelTimeInSeconds;//travel time in sections
            let time = minutes / 60;// chang travel time to minutes
            console.log("minutes", time);


            fetchRecommendations();

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
    console.log(response);
    const recommendations = response.tracks;
    for (const track of recommendations) {
        console.log("*********")
        console.log("artists", track.artists.map(artist => artist.name).join(", "));
        console.log("track", track.name)
        console.log("duration", formatDuration(track.duration_ms));
        console.log("album", track.album.name)
        console.log("*********\n\n")
    }
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

