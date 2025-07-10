import React, { useState, useEffect } from 'react';

// Helper om iconen weer te geven (voor zoekbalk, niet voor kledingstukken)
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// Definieer de paden voor de kledingicoontjes, die zich in de 'public' map bevinden.
// Zorg ervoor dat de bestandsnamen overeenkomen met de namen in je 'public' map.
const clothingIcons = {
    // Algemene icoontjes (voor volwassene en kind)
    'Lange broek': '/Lange broek.jpg', // Zorg dat dit bestand in je public map staat
    'T-shirt': '/T-shirt.jpg',         // Zorg dat dit bestand in je public map staat
    'Winterse Trui': '/Winterse trui.jpg', // Zorg dat dit bestand in je public map staat
    'Zomerse trui': '/Zomerse trui.jpg',   // Zorg dat dit bestand in je public map staat
    'Korte broek': '/Korte broek.jpg',     // Zorg dat dit bestand in je public map staat
    
    // Baby-specifieke icoontjes
    'Baby Rompertje': '/Baby rompertje.jpg', // Zorg dat dit bestand in je public map staat
    'Baby T-shirt': '/baby t-shirt.jpg',     // Zorg dat dit bestand in je public map staat
    'Baby Broek': '/baby broek.jpg',         // Zorg dat dit bestand in je public map staat
    'Baby Trui': '/baby trui.jpg',           // Zorg dat dit bestand in je public map staat
    'Baby Jas': '/Baby-jas.jpg',             // Zorg dat dit bestand in je public map staat
    'Baby Sokken': '/baby-sokken.jpg',       // Zorg dat dit bestand in je public map staat
    'Baby Schoenen': '/baby-schoenen.jpg',   // Zorg dat dit bestand in je public map staat
    'Baby Muts': '/baby-muts.jpg',           // Zorg dat dit bestand in je public map staat
    'Baby Legging': '/Baby-legging.jpg',     // Zorg dat dit bestand in je public map staat
};

// Kledingadvies logica
const getClothingAdvice = (temp, personType) => {
    const advice = [];
    if (personType === 'volwassene' || personType === 'kind') {
        if (temp < 10) advice.push('Lange broek', 'T-shirt', 'Winterse Trui');
        else if (temp >= 10 && temp < 18) advice.push('Lange broek', 'T-shirt', 'Zomerse trui');
        else if (temp >= 18 && temp < 23) advice.push('Lange broek', 'T-shirt');
        else if (temp >= 23) advice.push('Korte broek', 'T-shirt');
    } else if (personType === 'baby') {
        if (temp < 10) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Broek', 'Baby Trui', 'Baby Jas', 'Baby Sokken', 'Baby Schoenen', 'Baby Muts');
        else if (temp >= 10 && temp < 15) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Broek', 'Baby Trui', 'Baby Sokken', 'Baby Schoenen');
        else if (temp >= 15 && temp < 20) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Legging', 'Baby Trui', 'Baby Sokken');
        else if (temp >= 20 && temp < 25) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Legging', 'Baby Sokken');
        else if (temp >= 25) advice.push('Baby Rompertje', 'Baby Broek');
    }
    return advice;
};

function App() {
    const [location, setLocation] = useState('Arnhem');
    const [timeFrame, setTimeFrame] = useState('today');
    const [personType, setPersonType] = useState('baby'); // Standaard op baby
    const [weatherData, setWeatherData] = useState(null);
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTemp, setCurrentTemp] = useState(null);

    const API_KEY = 'aabeb680e2a44646bdb82153250207';

    // Effect om weergegevens op te halen wanneer locatie verandert (met debounce)
    useEffect(() => {
        const fetchWeather = async () => {
            if (!location) {
                setError('Voer een locatie in.');
                setWeatherData(null);
                return;
            }
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no&alerts=no&lang=nl`);
                if (!response.ok) {
                    throw new Error('Locatie niet gevonden of API-fout.');
                }
                const data = await response.json();
                setWeatherData(data);
            } catch (err) {
                setError(err.message);
                setWeatherData(null);
            } finally {
                setLoading(false);
            }
        };

        const handler = setTimeout(() => {
            fetchWeather();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [location]);

    // Effect om advies te berekenen wanneer gegevens of opties veranderen
    useEffect(() => {
        if (!weatherData) {
            setAdvice([]);
            setCurrentTemp(null);
            return;
        };

        let tempToUse;
        const forecastHours = weatherData.forecast.forecastday[0].hour;
        const currentHour = new Date().getHours();

        if (timeFrame === 'today') {
            tempToUse = weatherData.forecast.forecastday[0].day.avgtemp_c;
        } else if (timeFrame === '2hours') {
            const relevantHours = forecastHours.slice(currentHour, Math.min(currentHour + 2, 24));
            tempToUse = relevantHours.length > 0 ? relevantHours.reduce((sum, hour) => sum + hour.temp_c, 0) / relevantHours.length : weatherData.current.temp_c;
        } else if (timeFrame === '5hours') {
            const relevantHours = forecastHours.slice(currentHour, Math.min(currentHour + 5, 24));
            tempToUse = relevantHours.length > 0 ? relevantHours.reduce((sum, hour) => sum + hour.temp_c, 0) / relevantHours.length : weatherData.current.temp_c;
        }
        
        setCurrentTemp(Math.round(tempToUse));
        const clothingAdvice = getClothingAdvice(tempToUse, personType);
        setAdvice(clothingAdvice);

    }, [weatherData, personType, timeFrame]);

    // Functie om de juiste afbeelding te krijgen uit de clothingIcons map
    const getClothingImage = (itemName) => {
        // Gebruik de URL uit de map, of een algemene placeholder als niet gevonden
        // process.env.PUBLIC_URL is verwijderd omdat het niet beschikbaar is in deze omgeving.
        // Afbeeldingen in de public map zijn direct toegankelijk via hun pad.
        return clothingIcons[itemName] || `https://placehold.co/100x100/cccccc/333333?text=${itemName.replace(/\s+/g, '+')}`;
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-600">Kleding Advies App</h1>
                    <p className="text-gray-600 mt-2">Wat trek je je kind (of jezelf) aan vandaag?</p>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Locatie</label>
                        <div className="relative">
                            <Icon path="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="bv. Amsterdam"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Voor wie?</label>
                            <div className="flex bg-gray-200 p-1 rounded-lg">
                                {['volwassene', 'kind', 'baby'].map(type => (
                                    <button type="button" key={type} onClick={() => setPersonType(type)} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${personType === type ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Wanneer?</label>
                             <div className="flex bg-gray-200 p-1 rounded-lg">
                                <button type="button" onClick={() => setTimeFrame('today')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === 'today' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Vandaag</button>
                                <button type="button" onClick={() => setTimeFrame('2hours')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === '2hours' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Nu</button>
                                <button type="button" onClick={() => setTimeFrame('5hours')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === '5hours' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Komende 5u</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {loading && <div className="text-center p-8"><p>Weergegevens worden opgehaald...</p></div>}
                    
                    {error && !loading && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">{error}</div>}
                    
                    {weatherData && !loading && !error && (
                         <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Advies voor <span className="text-blue-600">{personType}</span> in <span className="text-blue-600">{weatherData.location.name}</span></h2>
                                    <p className="text-gray-500">Gebaseerd op een temperatuur van circa {currentTemp}°C</p>
                                </div>
                                <div className="flex items-center mt-4 md:mt-0">
                                    <img src={weatherData.current.condition.icon} alt={weatherData.current.condition.text} className="w-16 h-16"/>
                                    <div className="text-right ml-4">
                                        <p className="text-4xl font-bold">{Math.round(weatherData.current.temp_c)}°C</p>
                                        <p className="text-gray-600">{weatherData.current.condition.text}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {advice.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {advice.map((item, index) => (
                                        <div key={index} className="text-center group">
                                            <div className="bg-gray-100 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center transition-transform group-hover:scale-105 p-2">
                                                <img 
                                                    src={getClothingImage(item)} 
                                                    alt={`Icoon voor ${item}`} 
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/ff0000/ffffff?text=Fout"; }} // Rode placeholder bij fout
                                                />
                                            </div>
                                            <p className="font-semibold text-gray-700">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 py-8">Geen specifiek advies voor deze omstandigheden.</p>
                            )}
                        </div>
                    )}
                </div>
                 <footer className="text-center mt-8 text-sm text-gray-500">
                    <p>Powered by <a href="https://www.weatherapi.com/" title="Free Weather API" className="text-blue-500 hover:underline">WeatherAPI.com</a></p>
                </footer>
            </div>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default App;
