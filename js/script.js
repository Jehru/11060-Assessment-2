// By Jehru Harris 28/04/2001

// When document dom is ready
$(document).ready(function() {

    console.log("Starting");

    // Adds the "hidden" class to the body
    // Makes the board unable to be scrolled when the "Play Frog Memory" is pressed
    $('#playGame').on("click", function() {
        $("body").toggleClass("hidden");   
    });

    // When the reload button is pressed remove the hidden class 
    // This unlocks the board game so the user can scroll again
    $('.reload').on("click", function() {
        $("body").removeClass("hidden");   
    });


    // The main frog ALA API
    defaultUrl = "https://bie.ala.org.au/ws/search.json?q=frog&pageSize=6";    

    // Query the API to get the information 
    $.getJSON(defaultUrl, function(data){
        
        // Create a constant to make reaching the data simplier
        const defaultFrog = data.searchResults.results;

        // For each item item in the API create two memory card items that are appened to the page
        for(let i = 0; i < defaultFrog.length; i++) {
            $('.memoryGame').append('<div class="memoryCard" data-framework="' + defaultFrog[i].id +
             '"><img class="frontFace" src="' + defaultFrog[i].imageUrl + '" alt="Image of '+ defaultFrog[i].name + '">' +
            '<img class="backFace" src="img/qmark.png" alt="Memory Card"> </div>')
            
            $('.memoryGame').append('<div class="memoryCard" data-framework="' + defaultFrog[i].id +
             '"><img class="frontFace" src="' + defaultFrog[i].imageUrl + '" alt="Image of '+ defaultFrog[i].name + '">' +
            '<img class="backFace" src="img/qmark.png" alt="Memory Card"> </div>')
        }

        // Run the shuffle function
        shuffle();

        // Create some variables that will be used later to lock the game board, check if a card has been flipped. 
        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;

        // When a memory card is clicked, check if the board is locked or if it equals the firstcard
        $('.memoryCard').on('click', function() {    
            if (lockBoard) return;
            if (this === firstCard) return;
        
            // Add a class on the card called 'flip'
            $(this).toggleClass('flip');   

            // If the card is the first one clicked 
            if (!hasFlippedCard) {
                // Change flipped card to be true. Make the firstcard item equal the clicked card
                hasFlippedCard = true;
                firstCard = this;
            } else {
                // Otherwise, this is the second flipped card 

                // Turn the has flipped card to false to reset the cards as either there is match on the board or the cards dont match
                // Make the second card item equal the clicked card similar to the above
                hasFlippedCard = false;
                secondCard = this;

                // Function to check if the cards match 
                doCardsMatch();
            }
        });


        // Shuffle card function
        function shuffle() {

            // For each card item add to the css the "order" property with a random value
            $(".memoryCard").each(function(){
                $(this).css("order", createRandomNumber());
            })

            // Function to create a random number 
            function createRandomNumber() {
                var number = Math.floor((Math.random() * (75 - 15) + 1) + 15 );
                return number;
            }  
        }

        function doCardsMatch() {
            // Function to start the move counter
            // This will begin to count moves when the user flips two cards
            moveCounter();

            // Check if both the cards match using their API ID values
            if (firstCard.dataset.framework === secondCard.dataset.framework) {
                // If its a match

                // Remove the click event handers from the cards, this makes it so a card that has been found as a pair cannot be reclicked
                $(firstCard).off('click');
                $(secondCard).off('click');
                // console.log("Cannot click", firstCard, secondCard);
                
                // Then show the modal of those two cards
                showModal();
                
            } else {
                // If there is not a match with the two clicked cards
                // Lock the board so no more cards can be clicked
                lockBoard = true;

                // Create a delay, so the user can see that the cards dont match
                // Then remove the flip class from the cards
                // Then reset the board, so that the user can try again
                setTimeout(() => {
                    $(firstCard).removeClass('flip');
                    $(secondCard).removeClass('flip');
                    resetBoard();
                }, 1000);
            }
        }

        // Reset the board when the user fails to get a match with the cards
        // This enables them to try again
        function resetBoard() {   
            hasFlippedCard = false;
            lockBoard = false;
            firstCard = null;
            secondCard = null;
        }

        // Begin with a move counter of 0 moves
        let moves = 0;

        // Function to count the players moves
        function moveCounter(){
            // Increment the moves
            moves++;
            // If moves equals 1 then set the seconds and minutes to zero and begin the timer
            if(moves == 1){
                second = 0;
                minute = 0; 
                startTimer();
            }
            // If the moves are less than or equal to one then display one 'move' instead of 'moves'
            if (moves <= 1) {
                $('.moves').html(moves + " Move")
            } else {
                $('.moves').html(moves + " Moves")

            }
        }

        // Set the game timer to 00:00 
        let second = 0; 
        let minute = 0;
        var interval;
        
        // Start the timer function 
        // This function acts exactly like a timer, adding the result to the page
        // And incrementing each second, then for 60 seconds, one minute
        function startTimer(){
            interval = setInterval(function(){
                $('.timer').html(minute +" mins "+ second +" secs");
                second++;
                // If 60 seconds then increase the minute and reset the seconds
                if(second == 60){
                    minute++;
                    second=0;
                }
                // If the timer goes for 1 hour then reset the timer (its envisaged to take that long)
                if (minute == 60) {
                    minute=0;
                    second=0;
                }
            },1000);
        }

        // Create a tingle JS Modal 
        // This can be closed by clicking the overlay, the close button or the escape 
        var modal = new tingle.modal({
            footer: false,
            stickyFooter: false,
            closeMethods: ['overlay', 'button', 'escape'],
            closeLabel: "Close",
            cssClass: ['scrollClass'],
            onOpen: function() {
                console.log('modal open');
            },
            onClose: function() {
                console.log('modal closed');
                // When the modal is closed it checks if the all the cards are flipped
                checkIfGameWon();
            },
            beforeClose: function() {
                // here's goes some logic
                // e.g. save content before closing the modal
                return true; // close the modal
                return false; // nothing happens
            }
        });

        // This function checks if the user has 'won' the game by matching all the cards. 
        function checkIfGameWon(){

            // If the amount of cards flipped equals the amount of cards in total
            if($('.memoryGame .memoryCard.flip').length === $('.memoryGame .memoryCard').length){

                // Checks if the session storage API works
                if(typeof(Storage)!=="undefined"){
                    // Set the moves, minutes and seconds values in the session storage
                    sessionStorage.setItem("lastmoves", moves);
                    sessionStorage.setItem("lastmin", minute);
                    sessionStorage.setItem("lastsec", second);

                    // Then change the page to the winner html page
                    location.replace("winner.html");    

                } else {
                    // Otherwise log an error
                    console.log("Sorry, your browser does not support web storage...");
                }

            }
            else {
                // Otherwise the user has not won yet so do nothing
            }
        };

        // Function to show the modal, happens when a user gets a pair in the cards
        function showModal() {

            // For each frog in the array
            for(let i = 0; i < defaultFrog.length; i++) {
                // console.log(defaultFrog[i].image);

                let defaultFrogId = defaultFrog[i].id; 
                let cardDataId = firstCard.dataset.framework;

                // Check which frog Id matches up with the various frogs on the board
                if (cardDataId === defaultFrogId) {
                    console.log(defaultFrog[i]);

                    let idName = "";

                    // Check if concept name exists 
                    // https://stackoverflow.com/questions/2647867/how-can-i-determine-if-a-variable-is-undefined-or-null
                    // https://stackoverflow.com/questions/20792572/javascript-replace-all-20-with-a-space/20792627

                    if (defaultFrog[i].acceptedConceptName == null) {
                        idName = encodeURI(defaultFrog[i].scientificName);
                    } else {
                        idName = encodeURI(defaultFrog[i].acceptedConceptName);
                    }

                    eolUrl = "https://eol.org/api/search/1.0.json?q=" + idName + "&page=1&key=";
                    console.log(eolUrl);

                    $.getJSON(eolUrl, function(eolData){
                        // console.log(eolData);
                        
                        let eolDataId = eolData.results[0].id;
                        console.log(eolDataId);
            
                        let summaryUrl = "https://eol.org/api/pages/"+ eolDataId +"/brief_summary.json";
            
                        $.getJSON(summaryUrl, function(summaryData){
                            console.log(summaryData);
                            
                            let summaryInfo = summaryData.brief_summary;
        
                                // Checks if there is an audio File in the code
                                let someVariable = "";
                                let linkId = data.searchResults.results[i].linkIdentifier;

                                if (linkId !== null) {
                                    console.log("Yes Has an link Identifier to use for an audio file");
                                    let audioSource = "https://amphibiaweb.org/sounds/" + linkId + ".wav"; 

                                    modal.setContent('<div class ="row"> <div class="col-6"> <img src="' + defaultFrog[i].smallImageUrl + '"> </div> ' +
                                    ' <div class="col-6 text-col"> <h1>You found a ' + defaultFrog[i].name + '</h1> <p>'+ summaryInfo +'</p> </div> </div> ' +
                                    '<div class="row"><audio controls src="' + audioSource + '"></audio><div>');
                                    
                                } else {
                                    console.log("Does not have an linkIdentifier so no audio can be found");

                                    modal.setContent('<div class ="row"> <div class="col-6"> <img src="' + defaultFrog[i].smallImageUrl + '"> </div> ' +
                                    ' <div class="col-6 text-col"> <h1>You found a ' + defaultFrog[i].name + '</h1> <p>'+ summaryInfo +'</p> </div> </div>');
                                }
                                                            
                            
                            // Set content
                            // modal.setContent('<div class ="row"> <div class="col-6"> <img src="' + defaultFrog[i].smallImageUrl + '"> </div> ' +
                            // ' <div class="col-6"> <h1>You found a ' + defaultFrog[i].name + '</h1> <p>'+ summaryInfo +'</p> </div> </div>');
                            
                            // Open the modal modal
                            modal.open();
                        });
                            
                    });
                } else {
                    
            }
        }
    } 

        // Modal function ends here 
    

    });
});


    

// OLD API Script

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
