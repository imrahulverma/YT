function secondsToMMSS(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = (seconds % 60).toFixed(0);

    var formattedTime = '';

    if (hours > 0) {
        formattedTime += hours + ':';
    }

    if (minutes < 10  && hours < 0) {
        formattedTime += '0' + minutes;
    } else {
        formattedTime += minutes;
    }

    formattedTime += ':'; // Add separator

    if (remainingSeconds < 10) {
        formattedTime += '0' + remainingSeconds;
    } else {
        formattedTime += remainingSeconds;
    }

    return formattedTime;
}

export  {secondsToMMSS}