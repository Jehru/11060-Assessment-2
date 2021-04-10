// Memory Flip Script

shuffle();

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

$('.memoryCard').on('click', function() {    
    if (lockBoard) return;
    if (this === firstCard) return;
 
    $(this).toggleClass('flip');   

    if (!hasFlippedCard) {
        // First Click
        hasFlippedCard = true;
        firstCard = this;
    } else {
        // Second click
        hasFlippedCard = false;
        secondCard = this;

        doCardsMatch();

    }
});

function doCardsMatch() {
    // Do Cards Match
    if (firstCard.dataset.framework === secondCard.dataset.framework) {
        // Its a match
        $(firstCard).unbind('click');
        $(secondCard).unbind('click');
        console.log("Cannot click", firstCard, secondCard);
    } else {
        // Not a match
        lockBoard = true;

        setTimeout(() => {
            $(firstCard).removeClass('flip');
            $(secondCard).removeClass('flip');

            resetBoard();
        }, 1000);
    }
}

function resetBoard() {   
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
}



function shuffle() {

    for (var i = 0; i < 12; i++) {

        let randomPos = Math.floor(Math.random() * 12);

        $('.memoryCard').css("order", randomPos);
        
    }
}

// function shuffle() {
//         $('.memoryCard').each(function() {
//             let randomPos = Math.floor(Math.random() * 12);
//             $('.memoryCard').css("order", randomPos);
//             console.log(this + randomPos);

//         });
//     }




// API Script

    // // When DOM and page is ready
    // $(document).ready(function() {

    //     // The main function in the code
    //     // Runs when the user clicks the "Show frogs near me" button
    //     function whereAmI() {

    //         // If the user successfully allows their location
    //         function success(position) {
    //             // Get users current latitude and longitude
    //             // Create constants for those variables
    //             const latitude  = position.coords.latitude;
    //             const longitude = position.coords.longitude;
        
    //             // Removes 'Locating...' text
    //             $('#status').empty();


    //             // Google Cloud development Key and Reverse Geolocation Api
    //             // This will allow us to get the users current location in street name and address
    //             const gDevApiKey = "AIzaSyBXbTrT4c4Fw_n7gAzh1UQ3PrUO8yEyjmQ";
    //             const gDevMapUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
    //                 latitude + "," + longitude +"&key=" + gDevApiKey;
    //             // console.log(gDevMapUrl);

    //             // Get the json data from the Google development Url, which will give us the name of the address of the user
    //             $.getJSON(gDevMapUrl, function(addressData) {
    //                 // console.log(addressData);

    //                 // Create a variable for the users current address as formatted (streetname, suburb state postcode, country)
    //                 let locatedAddress = addressData.results[0].formatted_address;

    //                 // Update the map link class so that it appends the address to the page.
    //                 $('#currentLocation').append("<h3> You are located at " + locatedAddress + "</h3>");
         

    //                 // Finding the nearby frogs in the users current location within a 5km radius
    //                 const locationUrl = "https://biocache-ws.ala.org.au/ws/explore/group/Amphibians.json?lat=" + latitude + "&lon=" + longitude + "&radius=5&start=0&pageSize=200";
    //                 // console.log(locationUrl);

    //                 // Get the json data from the above url which shows the frogs within 5km of the user
    //                 $.getJSON(locationUrl, function(locationData){
    //                     // console.log(locationData);

    //                     // For each frog that appears within 5km
    //                     for(let i = 0; i <locationData.length; i++) {
                        
    //                         // Create a constant for the frogs common name
    //                         const frogName = locationData[i].commonName;

    //                         // Query an api that includes information about each specific frog 
    //                         // Encode this url to reduce any spaces and any other characters to be url friendly and remove any whitespace if it exists
    //                         // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI
    //                         const frogUrl = encodeURI("https://bie.ala.org.au/ws/search.json?q=" + frogName + "&pageSize=5".trim())
    //                         // console.log(frogUrl);

    //                             // Query that specific url for each frog to get the json data
    //                             // This will provide  information about each of the species nearby
    //                             // Such as the frogs name and who found it
    //                             $.getJSON(frogUrl, function(speciesData){
    //                                 // console.log(speciesData);

    //                                 // Create a constant for the img url of the frogs
    //                                 const imgSrc = speciesData.searchResults.results[0].imageUrl

    //                                 // Create a constant to make indexing the information easier
    //                                 const speciesInfo = speciesData.searchResults
                                                
    //                                 // Removes the default items if they are present
    //                                 $('#ifNoItems').remove();

    //                                 // Cerate a constant for the species name that includes an underscore instead of a space
    //                                 const linkId = speciesData.searchResults.results[0].linkIdentifier

    //                                 // Url that links to the amphibiaweb sound files. These are hosted on the web and are audio files
    //                                 var soundFileUrl= "https://amphibiaweb.org/sounds/" + linkId + ".wav"
    //                                 // console.log(soundFileUrl);

    //                                 // Main append
    //                                 // Appends each frog item to the page includes the name, amount of frogs near the user
    //                                 // There is hidden information that is shown when the user clicks on the card
    //                                 $('.uk-grid-medium').append('<div><div class = "uk-card uk-card-default uk-card-body uk-card-hover"> <h3>' 
    //                                     + locationData[i].commonName + '</h3><p> <br>' + 'There have been ' + locationData[i].count 
    //                                     + ' ' + locationData[i].commonName +' sightings near you</p> <img src="'+ imgSrc  +'" alt="Image of '+ 
    //                                     locationData[i].commonName +'"> <p class="hiddenText" style="display: none"> Author: '+ speciesInfo.results[0].author 
    //                                     + '<br> Genus: ' + speciesInfo.results[0].genus + '<br>' + 'Name: '+ speciesInfo.results[0].name  +
    //                                     '<br> Class: '+ speciesInfo.results[0].class +'</p>' + '<div class="audio" style="display:none"><audio controls source src="' + 
    //                                     soundFileUrl + '" ></audio></div></div></div>' );
                                
    //                                 // When no image is found (on an error) then use a broken image image instead of the frog image
    //                                 // https://stackoverflow.com/questions/56166094/update-img-src-if-image-does-not-exist
    //                                 $('.uk-grid-medium img').on('error', function() {
    //                                     this.src = 'https://piotrkowalski.pw/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png';
    //                                     });
                                    

    //                             });
                                
    //                     }

    //                 });

                    
    //             });

    //         }

    //         // If an error occurs such as user clicks 'block' for their location then provide a message
    //         function error() {
    //             $('#status').empty();
    //             $('#status').append("Unable to retrieve your location ");
    //         }

    //         // If navigator is not found then tell the user its not supported
    //         // Otherwise use navigator to try and get the location of the user
    //         // If its allowed then run success. If its blocked then run the error
    //         if(!navigator.geolocation) {
    //             $('#status').empty();
    //             $('#status').append("Navigator geolocation is not supported by your browser, to use this feature try it on Google Chrome")

    //         } else {
    //             $('#status').empty();
    //             $('#status').append("Locating");
    //             navigator.geolocation.getCurrentPosition(success, error);
    //         }

    //     }

    //     // Default Function
    //     // This is what happens when the page loads the site provides 3 default frogs
    //     // These are limited in function and information as they are meant to be a 'sample'
    //     function defaultAction() {
    //         // Use an api query that is limited to 3 results
    //         defaultUrl = "https://bie.ala.org.au/ws/search.json?q=frog&pageSize=3"
    //         // console.log("starting");

    //         // Get the json data from querying that url above
    //         $.getJSON(defaultUrl, function(data){
    //             // console.log(data.searchResults.results);

    //             // Create a constant that makes indexing the information easer
    //             const defaultFrog = data.searchResults.results;
    //             // console.log(defaultFrog);

    //             // Create a loop for each of the default loaded frogs
    //             for(let i = 0; i < defaultFrog.length; i++) {
    //                 // Append each of these frogs to the webpage
    //                 // include the name, image and hide the common name 
    //                 $('#ifNoItems').append('<div><div class = "uk-card uk-card-default uk-card-body uk-card-hover"><h3>' + defaultFrog[i].name + '</h3  ><br>' + '<img src="' + defaultFrog[i].imageUrl 
    //                     + '" alt = "Image of '+ defaultFrog[i].commonNameSingle +'"> <p class="hiddenText" style="display: none"> Common Name: '+ defaultFrog[i].commonNameSingle + '</p></div></div>' )
    //             }
    //         })
    //     }

    //     // Run the default action
    //     defaultAction();

    //     // When the user clicks on the "show frogs near me" button run the function to find the user
    //     $('#findMe').click(whereAmI);

    //     // When user clicks on the class 'uk card' in the body find the hiddenText and audio class and show/hide them
    //     // https://stackoverflow.com/questions/29372003/click-event-is-not-working-when-data-loads-dynamic-in-jquery
    //     $('body').on('click','.uk-card' ,function(){
    //         $(this).find(".hiddenText").toggle();        
    //         $(this).find(".audio").toggle();

    //     });

    // });
