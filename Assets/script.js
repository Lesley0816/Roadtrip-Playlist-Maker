let tomtomApi = "IBYSi29ETuqpmdsPhsyO6zEAKq1dUa3C";
let arrival = document.querySelector("#to");
let departure = document.querySelector('#from');
let generateBtn = document.querySelector("#generate-btn");
let genplaylist = document.querySelector("#playlist-form");
let generatedPlaylist = document.querySelector("#generated-playlist");
let searchHistory = document.querySelector("#search-history");
let playlistLibrary = document.querySelector("#playlist-library");
let playlists = [];


// fucntion to get the generate button to give geo code for origin and destination and class the trip lenght function
function generatePlaylist(event) {
    
    // the point of origin api call for geo code
    departureApiUrl = "https://api.tomtom.com/search/2/geocode/" + departure.value + ".json?key=" + tomtomApi;
    let start = "";
    let end = "";
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
            start = departCor.lat +"%2C"+ departCor.lon;// lat and lan of origin 
            
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
            end = arrivalCor.lat +"%2C"+ arrivalCor.lon;
            console.log("start", start);
            console.log("end", end);
           

            tripLength(start,end);// calling the routing api to give trip length in minutes and pass start and end variables
        })

        .catch(error => {
            console.error("Error: ", error);
        })

        let genre= document.getElementById("genres-input");
        fetchRecommendations();

        storePlaylists();
        renderPlaylists();
}

 

// eventlistner for the generate button
genplaylist.addEventListener("submit", generatePlaylist);

// the routing api call to get the trip length 
function tripLength(begin,finish) {
    tomApiUrl = "https://api.tomtom.com/routing/1/calculateRoute/"+begin +":"+ finish +"/json?key=" + tomtomApi
    


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
        console.log("minutes",time);

         
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
async function fetchToken () {
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
async function fetchRecommendations () {
    let genre= document.getElementById("genres-input").value;// gets the value of the dropdown menu
    console.log(genre);
    const token = await fetchToken();
    console.log("token", token);
    // Sample genres request with seed parameters
    const res = await fetch('https://api.spotify.com/v1/recommendations?seed_genres='+genre+'',{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // optional
        }
        
    });
    showTracks(await res.json());
    

}
// renders the tracks 
async function showTracks (response) {
    console.log("response", response);
    const recommendations = response.tracks;
    for (const track of recommendations) {
        console.log("*********")
        console.log("artists", track.artists.map(artist => artist.name).join(", "));
        console.log("track", track.name)
        console.log("duration", formatDuration(track.duration_ms));
        console.log("album", track.album.name)
        console.log("track id", track.uri)
        console.log("track number", track.track_number)
        console.log("*********\n\n")
    }

   
    
}

// fetch call to create a playlist 
async function fetchCreatePlaylist () {
    const token = await fetchToken();
    console.log("token", token);
    // create playlist request
    const resCreatePlaylist = await fetch ('https://api.spotify.com/v1/users/31kfksypgskzynzrmosohbcjtfgm/playlists',{
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' // optional
    },
    
    data: {
        "name": "Road trip Playlist",
        "description": "Playlist that was created through Road trip playlist generator",
        "public": true
    }
    
});
const parsedRes = await resCreatePlaylist.json();
console.log("created playlist", parsedRes);
}

 console.log(fetchCreatePlaylist());

// fetch call to add songs to playlist
async function fetchAddsongs(){
    const token = await fetchToken();
    // add songs to play list request call
    const resAddItems = await fetch ('https://api.spotify.com/v1/playlists/{playlist-id}/tracks?&uris=spotify%3Atrack%3A{trackuri}', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' // optional
    },
    
    data: {
        "uris": [
            "{song-uri}"
        ],
        "position": 0
    }
});

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
function renderPlaylists(){
    playlistLibrary.innerHTML = "";
    searchHistory.textContent = playlists.length;

    for ( let i = 0; i <playlists.length; i ++){
        let li = document.createElement("li");
        li.textContent = playlists;
        li.setAttribute("data-index", i)

        playlistLibrary.appendChild(li);
    }


};
// function to get stored playslist 
function storedPlaylists(){

    let storedGeneratedPlaylists = JSON.parse(localStorage.getItem("playlists"));

    if (storedGeneratedPlaylists !== null ){
        playlists = storedGeneratedPlaylists;
    }

    renderPlaylists();

};
// stringify and set key in localstorage for the playlists
function storePlaylists(){
     localStorage.setItem("playlists", JSON.stringify(playlists));
}

console.log(localStorage);
// calls the store
storedPlaylists();