import React, { useEffect, useState } from "react";
import axios from "axios";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import './WeatherMap.css'; 

countries.registerLocale(en);

const cities = [
    { name: "Киев", lat: 50.4501, lon: 30.5234 },
    { name: "Москва", lat: 55.7558, lon: 37.6173 },
    { name: "Лондон", lat: 51.5074, lon: -0.1278 },
    { name: "Нью-Йорк", lat: 40.7128, lon: -74.0060 },
    { name: "Токио", lat: 35.682839, lon: 139.759455 },
];

const WeatherApp = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState(cities[0]);
    const [country, setCountry] = useState(null);

    const fetchWeather = async (lat, lon) => {
        const apiKey = 'b393c2fbb569f4c3813183eabf2f991c'; 
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        setLoading(true);
        setError(null);

        try {

            const weatherResponse = await axios.get(currentWeatherUrl);
            setWeatherData(weatherResponse.data);

            const countryCode = weatherResponse.data.sys.country;
            const countryName = countries.getName(countryCode, "en");
            setCountry(countryName || "Unknown country");

            const forecastResponse = await axios.get(forecastUrl);
            setForecastData(forecastResponse.data.list); 

        } catch (error) {
            setError(error.response ? error.response.data : { message: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(selectedCity.lat, selectedCity.lon);
    }, [selectedCity]);

    const handleGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(latitude, longitude);
                },
                (error) => {
                    setError(error);
                    console.error("Geolocation error:", error);
                }
            );
        } else {
            setError(new Error("Geolocation is not supported by this browser."));
        }
    };


    const getDailyForecasts = (forecastData) => {
        const dailyForecasts = {};
        forecastData.forEach(item => {
            const date = new Date(item.dt_txt).toLocaleDateString("en-GB"); 
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = item; 
            }
        });
        return Object.values(dailyForecasts); 
    };

    return (
        <div>
            <h1>Текущая погода</h1>

            {loading && <p>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>Ошибка: {error.message}</p>}
            
            <label htmlFor="city-select">Выберите город:</label>
            <select
                id="city-select"
                value={selectedCity.name}
                onChange={(e) => {
                    const city = cities.find(city => city.name === e.target.value);
                    setSelectedCity(city);
                }}
            >
                {cities.map(city => (
                    <option key={city.name} value={city.name}>
                        {city.name}
                    </option>
                ))}
            </select>
            
            <button onClick={handleGeolocation}>Использовать геолокацию</button>
            
            {weatherData && (
                <div>
                    <h2>Текущая погода в  {country}</h2>
                    <p>Температура: {weatherData.main.temp}°C</p>
                    <p>Состояние: {weatherData.weather[0].description}</p>
                    <p>Влажность: {weatherData.main.humidity}%</p>
                    <p>Скорость ветра: {weatherData.wind.speed} м/с</p>
                </div>
            )}

            {forecastData && (
                <div>
                    <h2>Прогноз на 5 дней вперед</h2>
                    <div className="forecast-container">
                        {getDailyForecasts(forecastData).slice(0, 5).map((forecast, index) => (
                            <div key={index} className="forecast-column">
                                <p><strong>{new Date(forecast.dt_txt).toLocaleDateString()}</strong></p>
                                <p>Температура: {forecast.main.temp}°C</p>
                                <p>Погода: {forecast.weather[0].description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherApp;
