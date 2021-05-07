$(document).ready(function() {

    // Checks if the session storage API works
    if(typeof(Storage)!=="undefined"){

        // Save the previous session values as a variable
        var lastMoves = sessionStorage.getItem("lastmoves");
        var lastMin = sessionStorage.getItem("lastmin");
        var lastSec = sessionStorage.getItem("lastsec");

        // Append the move and time counts to the page
        $('.moveCount').append('<p> Your Last Moves: ' + lastMoves + '<p>')
        $('.timeCount').append('<p> Your Last Time: ' + lastMin + ':' + lastSec + '<p>')

    } else {
        // Otherwise log an error
        console.log("Local storage not supported.");
    }

});