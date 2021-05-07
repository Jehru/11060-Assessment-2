// When document dom is ready
$(document).ready(function() {

    // Checks if the session storage API works
    if(typeof(Storage)!=="undefined"){

        // Retrieves the previous moves, minute and second variables using sessions storage
        // Store them as variables to append to the page
        var lastMoves = sessionStorage.getItem("lastmoves");
        var lastMin = sessionStorage.getItem("lastmin");
        var lastSec = sessionStorage.getItem("lastsec");

        // Appends the move and time counts to the page
        $('.moveCount').append('<p> Your Last Moves: ' + lastMoves + '<p>')
        $('.timeCount').append('<p> Your Last Time: ' + lastMin + ':' + lastSec + '<p>')

    } else {
        // Otherwise log an error
        console.log("Local storage not supported.");
    }

});