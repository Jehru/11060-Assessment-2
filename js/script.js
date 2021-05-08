// By Jehru Harris 9/05/2021

// When document Dom is ready
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
        // This function matches the card that was matched to one of the frogs in the API to get more information 
        function showModal() {

            // For each frog in the API
            for(let i = 0; i < defaultFrog.length; i++) {
                // console.log(defaultFrog[i].image);

                let defaultFrogId = defaultFrog[i].id; 
                let cardDataId = firstCard.dataset.framework;

                // Check which frog ID card that is clicked matches one of the frogs from the API
                // This will return true nearly all of the time but, it matches the card to the frog
                if (cardDataId === defaultFrogId) {

                    let idName = "";

                    // Check if Scientific name exists otherwise use the Accepted Concept Name  
                    // Encodes the name so it can be queried by the EOL API 
                    if (defaultFrog[i].acceptedConceptName == null) {
                        idName = encodeURI(defaultFrog[i].scientificName);
                    } else {
                        idName = encodeURI(defaultFrog[i].acceptedConceptName);
                    }

                    eolUrl = "https://eol.org/api/search/1.0.json?q=" + idName + "&page=1&key=";

                    // Query the EOL API
                    $.getJSON(eolUrl, function(eolData){
                        
                        // Get the EOL ID result from the frog 
                        let eolDataId = eolData.results[0].id;
                        
                        // Create a new url to query the summary response from the EOL API
                        let summaryUrl = "https://eol.org/api/pages/"+ eolDataId +"/brief_summary.json";
            
                        $.getJSON(summaryUrl, function(summaryData){
                            
                            let summaryInfo = summaryData.brief_summary;
        
                                // The link id will enable us to return the audio file from amphibiaweb if it exists
                                let someVariable = "";
                                let linkId = data.searchResults.results[i].linkIdentifier;

                                // Check if there is an audio file then sets the modal content 
                                if (linkId !== null) {
                                    // If yes then create a link to the amphibiaweb audio files and add the audio controls to the bottom of the modal
                                    // I found the audio control method to work the best as it allows user control over what is playing
                                    let audioSource = "https://amphibiaweb.org/sounds/" + linkId + ".wav"; 

                                    modal.setContent('<div class ="row"> <div class="col-6"> <img src="' + defaultFrog[i].smallImageUrl + '"> </div> ' +
                                    ' <div class="col-6 text-col"> <h1>You found a ' + defaultFrog[i].name + '</h1> <p>'+ summaryInfo +'</p> </div> </div> ' +
                                    '<div class="row"><audio controls src="' + audioSource + '"></audio><div>');
                                    
                                } else {
                                    // Otherwise there is no link id so the the frog doesnt include the audio control options
                                    modal.setContent('<div class ="row"> <div class="col-6"> <img src="' + defaultFrog[i].smallImageUrl + '"> </div> ' +
                                    ' <div class="col-6 text-col"> <h1>You found a ' + defaultFrog[i].name + '</h1> <p>'+ summaryInfo +'</p> </div> </div>');
                                }
                                                            
                            // Open the opens the modal
                            modal.open();
                        });
                            
                    });
                } else {  
                    // Otherwise nothing happens   
                }
            }
        } 

        // Modal function ends here 

    });

    // End main API call

});
// Ends the document Dom ready