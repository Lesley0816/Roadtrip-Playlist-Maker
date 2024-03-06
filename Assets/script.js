let tomtomApi = "IBYSi29ETuqpmdsPhsyO6zEAKq1dUa3C";
let arrival = document.querySelector("#to");
let departure = document.querySelector('#from');
let generateBtn = document.querySelector("#generate-btn");
let genplaylist = document.querySelector("#playlist-form");

function generatePlaylist(event) {
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
            start = departCor.lat +"%2C"+ departCor.lon;
            
        })

        .catch(error => {
            console.error("Error: ", error);
        })
    
        
    // destination coordinates
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
            let arrivalCor = data.results[0].position;
            end = arrivalCor.lat +"%2C"+ arrivalCor.lon;
            console.log("start", start);
            console.log("end", end);
           

            tripLength(start,end);
        })

        .catch(error => {
            console.error("Error: ", error);
        })

    
}
genplaylist.addEventListener("submit", generatePlaylist);

function tripLength(begin,finish) {
    tomApiUrl = "https://api.tomtom.com/routing/1/calculateRoute/"+begin +":"+ finish +"/json?key=" + tomtomApi
    console.log(tomApiUrl);


    fetch(tomApiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network reponse was not okay");
        }
        return response.json();
    })

    .then(data => {
        let minutes = data.routes[0].summary.travelTimeInSeconds;
        let time = minutes / 60;
        console.log("minutes",time);
        
    })

    .catch(error => {
        console.error("Error: ", error);
    })

}
