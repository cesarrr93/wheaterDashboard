// If there is nothing in 'localStorage', sets the 'list' to an empty array
var searchListArray = JSON.parse(localStorage.getItem('searchlist')) || [];

renderSearch(searchListArray);

// redering search History 
function renderSearch(searchListArray) {

    var searchHistory = $('#search-history');
    $('#search-history').empty();

    //Creating a UL element 
    var searchHistoryUL = document.createElement('ul');
    searchHistoryUL.setAttribute('class', 'list-group');        //Bootstrap Styling

    for (var i = 0; i < searchListArray.length; i++) {
        var searchHistoryLI = document.createElement('li');
        searchHistoryLI.setAttribute('class', 'list-group-item search-list');    //Bootstrap Styling
        searchHistoryLI.append(searchListArray[i]);                 // making a list of cities searches
        searchHistoryUL.appendChild(searchHistoryLI);
        if (i >= 10) {
            searchListArray.shift()
        }
    };
    searchHistory.append(searchHistoryUL);
}

// Main function when button is clicked
function myFunction() {
    var citySearch = document.querySelector('#citySearch').value;
    renderweather(citySearch);
}

function renderweather(citySearch) {
    fetch(
        'https://api.openweathermap.org/data/2.5/weather?q=' + citySearch + '&units=imperial&appid=39b0a25dae6521c5e83d59fd95abf165'
    ).then(
        function (weatherResponse) {
            return weatherResponse.json();
        })
        .then(
            function (weatherResponse) {
                // variable to store the weather data that we obtain from the fetch call
                var cityName = weatherResponse.name;
                var countryName = weatherResponse.sys.country;

                // populate the the search history div
                if ((cityName == undefined || cityName == null || cityName == "") || (countryName == undefined || countryName == null || countryName == "")) {
                    $('#err-message').empty();
                    var errMessage = $('#err-message')
                    var displayError = document.createElement('p');
                    displayError.setAttribute('style', 'color:red');
                    displayError.innerHTML = "Your entry is not valid. There might be one or more cities. Please try again (i.e city, state or country)";
                    errMessage.append(displayError);
                } else {
                    var fullCityName = cityName + "," + countryName;
                    searchListArray.push(fullCityName);
                    searchListArray = [...new Set(searchListArray)];
                    localStorage.setItem('searchlist', JSON.stringify(searchListArray));
                    $('#err-message').empty();
                }
                // Setting all the variable from weather response
                var currentTemp = weatherResponse.main.temp;
                var currrentWeatherIconId = weatherResponse.weather[0].icon;
                var currentHumidity = weatherResponse.main.humidity;
                var currentWindSpeed = weatherResponse.wind.speed;
                // Variable to get the current date
                var unixtime = weatherResponse.dt
                var date = new Date(unixtime * 1000);
                var dateNow = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var todaysDate = " (" + month + "/" + dateNow + "/" + year + ") "
                // getting cordinate for the UV information
                var currentLon = weatherResponse.coord.lon;
                var currentLat = weatherResponse.coord.lat;
                // Displaying forecast title
                var todaysForecast = document.querySelector('#forecast-today');
                todaysForecast.innerHTML = ""
                var cityTitle = document.createElement('h2');
                var currentWeatherIcon = document.createElement('img');
                currentWeatherIcon.setAttribute('src', 'https://openweathermap.org/img/wn/' + currrentWeatherIconId + '.png');
                cityTitle.innerHTML = cityName + todaysDate;
                todaysForecast.appendChild(cityTitle);
                todaysForecast.appendChild(currentWeatherIcon);

                // Display temperature
                var displayTemp = document.createElement('p');
                displayTemp.innerHTML = 'Temperature: ' + currentTemp + ' °F';
                todaysForecast.appendChild(displayTemp);

                // Display Humidity
                var displayHumidity = document.createElement('p');
                displayHumidity.innerHTML = 'Humidity: ' + currentHumidity + '%';
                todaysForecast.appendChild(displayHumidity);

                //Current Wind Speed
                var displayWindSpeed = document.createElement('p');
                displayWindSpeed.innerHTML = 'Wind Speed: ' + currentWindSpeed + ' MPH';
                todaysForecast.appendChild(displayWindSpeed);

                // Current UV
                return fetch(
                    'https://api.openweathermap.org/data/2.5/uvi?lat=' + currentLat + '&lon=' + currentLon + '&appid=39b0a25dae6521c5e83d59fd95abf165'
                )

            })
        .then(function (UvResponse) {
            return UvResponse.json();
        })
        .then(function (UvResponse) {
            var todaysForecast = document.querySelector('#forecast-today');
            var currentUvIndex = UvResponse.value;
            var displayUvIndex = document.createElement('p');
            var uvIndexSpan = document.createElement('span')
            uvIndexSpan.innerHTML = currentUvIndex;
            // adjusting the background of the current UV index
            if (parseInt(currentUvIndex) <= 3) {
                uvIndexSpan.setAttribute('class', 'low');
            } else if (parseInt(currentUvIndex) > 3 && currentUvIndex <= 6) {
                uvIndexSpan.setAttribute('class', 'moderate');
            } else if (parseInt(currentUvIndex) > 6 && currentUvIndex <= 8) {
                uvIndexSpan.setAttribute('class', 'high');
            } else if (parseInt(currentUvIndex) > 8 && currentUvIndex <= 10) {
                uvIndexSpan.setAttribute('class', 'veryHigh')
            } else {
                uvIndexSpan.setAttribute('class', 'extreme');
            }

            displayUvIndex.innerHTML = 'UV Index: ';
            displayUvIndex.append(uvIndexSpan);
            todaysForecast.appendChild(displayUvIndex);
            var currentLon = UvResponse.lon;
            var currentLat = UvResponse.lat;

            // 5 Day Forecast
            return fetch('https://api.openweathermap.org/data/2.5/forecast?lat=' + currentLat + '&lon=' + currentLon + '&units=imperial&appid=39b0a25dae6521c5e83d59fd95abf165'
            )
                .then(function (forecastResponse) {
                    return forecastResponse.json();
                })
                .then(function (forecastResponse) {
                    var futureForecast = document.querySelector('#future-cast');
                    futureForecast.innerHTML = "";
                    var futureTitle = document.createElement('h2');
                    futureTitle.innerHTML = "5 Day Forecast";
                    futureForecast.appendChild(futureTitle);
                    var forecastCardContainer = document.createElement('div');
                    forecastCardContainer.setAttribute('class', 'card container');
                    var forecastCardrow = document.createElement('div');
                    forecastCardrow.setAttribute('class', 'row justify-content-center');
                    for (var i = 0; i < 5; i++) {
                        var forecastCard = document.createElement('div');
                        forecastCard.setAttribute('class', 'card-body col-sm-2.5')
                        var cardTitle = document.createElement('h5');
                        cardTitle.setAttribute('class', 'card-title');

                        // Forecast Dates 
                        var unixtime = forecastResponse.list[8 * i].dt;
                        var date = new Date(unixtime * 1000);
                        var datefuture = date.getDate();
                        var month = date.getMonth() + 1;
                        var year = date.getFullYear();
                        var futureDate = month + "/" + datefuture + "/" + year;

                        cardTitle.append(futureDate);

                        // Forecast weather icon
                        var forecastWeatherIcon = document.createElement('img');
                        forecastWeatherIcon.setAttribute('src', 'https://openweathermap.org/img/wn/' + forecastResponse.list[8 * i].weather[0].icon + '.png')
                        var iconParagraph = document.createElement('p');
                        iconParagraph.append(forecastWeatherIcon)

                        // Forecast Temperature
                        var forecastTemp = forecastResponse.list[8 * i].main.temp;
                        var tempParagraph = document.createElement('p');
                        tempParagraph.setAttribute('class', 'card-text');
                        tempParagraph.innerHTML = 'Temp: ' + forecastTemp + ' °F';

                        // Forecast Humidity
                        var forecastHumidity = forecastResponse.list[8 * i].main.humidity;
                        var humidityParagraph = document.createElement('p');
                        humidityParagraph.setAttribute('class', 'card-text');
                        humidityParagraph.innerHTML = 'Humidity: ' + forecastHumidity + '%';
                        forecastCard.append(cardTitle, iconParagraph, tempParagraph, humidityParagraph);
                        // Add Forecast card to diplay on page by adding it to future Forecast div
                        forecastCardrow.append(forecastCard)
                        forecastCardContainer.append(forecastCardrow)
                        futureForecast.appendChild(forecastCardContainer);
                    };
                });

        });
}

//event listener for clicking on search list

$(document).on('click', '.search-list', function () {
    // This is to get the city text
    var city = $(this).text();
    console.log(city);
    renderweather(city);
});

$(document)
