
import React from "react";
import './App.css';
import WeatherMap from "./weatherMap";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img  width="64" height="64" src="https://img.icons8.com/dusk/64/cloud.png" alt="cloud" className="App-logo"  />
        <WeatherMap />
      </header>
    </div>
  );
}

export default App;
