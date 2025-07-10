import React, { useState, useEffect } from 'react';

// Helper om iconen weer te geven (voor zoekbalk, niet voor kledingstukken)
// De className zorgt ervoor dat de grootte van het SVG-icoon correct wordt ingesteld door Tailwind CSS.
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// Definieer de URL's voor de kledingicoontjes met Imgur links.
const clothingIcons = {
    // Baby-specifieke icoontjes
    'Baby Broek': 'https://i.imgur.com/UGbSw9W.jpg',
    'Baby Rompertje': 'https://i.imgur.com/0ZqsAjL.jpg',
    'Baby T-shirt': 'https://i.imgur.com/1szjBNH.jpg',
    'Baby Trui': 'https://i.imgur.com/6fv2Sy9.jpg',
    'Baby Jas': 'https://i.imgur.com/41IllD6.jpg',
    'Baby Legging': 'https://i.imgur.com/fGfhkrR.jpg',
    'Baby Muts': 'https://i.imgur.com/HNIbZkN.jpg',
    'Baby Schoenen': 'https://i.imgur.com/PmK3gu1.jpg',
    'Baby Sokken': 'https://i.imgur.com/6vd520H.jpg',

    // Nieuwe baby nachtkleding icoontjes
    'Slaapzak TOG .5': 'https://i.imgur.com/b3djOh9.jpg',
    'Slaapzak TOG 1': 'https://i.imgur.com/6idreoE.jpg',
    'Slaapzak TOG 2': 'https://i.imgur.com/p2yvXDl.jpg',
    'Slaapzak TOG 2.5': 'https://i.imgur.com/TTwbBZC.jpg',
    'Baby-pyama': 'https://i.imgur.com/F1Nnq8I.jpg',

    // Algemene icoontjes (voor volwassene en kind)
    'Korte broek': 'https://i.imgur.com/cSzKetg.jpg',
    'Lange broek': 'https://i.imgur.com/2xvnWx5.jpg',
    'T-shirt': 'https://i.imgur.com/tJEgAWH.jpg',
    'Winterse Trui': 'https://i.imgur.com/W2iyeph.jpg',
    'Zomerse trui': 'https://i.imgur.com/fw4IfSe.jpg',
    'Regenkleding': 'https://i.imgur.com/IOMxl4k.png',
};

// Kledingadvies logica
const getClothingAdvice = (temp, personType, timeFrame) => {
    const advice = [];
    if (personType === 'volwassene' || personType === 'kind') {
        if (temp < 10) advice.push('Lange broek', 'T-shirt', 'Winterse Trui');
        else if (temp >= 10 && temp < 18) advice.push('Lange broek', 'T-shirt', 'Zomerse trui');
        else if (temp >= 18 && temp < 23) advice.push('Lange broek', 'T-shirt');
        else if (temp >= 23) advice.push('Korte broek', 'T-shirt');
    } else if (personType === 'baby') {
        if (timeFrame === 'night') { // Specifiek advies voor de nacht voor baby's
            if (temp <= 16) advice.push('Baby Rompertje', 'Baby-pyama', 'Slaapzak TOG 2.5');
            else if (temp > 16 && temp <= 18) advice.push('Baby Rompertje', 'Baby-pyama', 'Slaapzak TOG 2');
            else if (temp > 18 && temp <= 20) advice.push('Baby Rompertje', 'Baby-pyama', 'Slaapzak TOG 1');
            else if (temp > 20 && temp <= 22) advice.push('Baby Rompertje', 'Slaapzak TOG 1');
            else if (temp > 22 && temp <= 24) advice.push('Baby Rompertje', 'Slaapzak TOG .5');
            else if (temp > 24) advice.push('Baby Rompertje', 'Slaapzak TOG .5');
        } else { // Bestaand dagadvies voor baby's
            if (temp < 10) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Broek', 'Baby Trui', 'Baby Jas', 'Baby Sokken', 'Baby Schoenen', 'Baby Muts');
            else if (temp >= 10 && temp < 15) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Broek', 'Baby Trui', 'Baby Sokken', 'Baby Schoenen');
            else if (temp >= 15 && temp < 20) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Legging', 'Baby Trui', 'Baby Sokken');
            else if (temp >= 20 && temp < 25) advice.push('Baby Rompertje', 'Baby T-shirt', 'Baby Legging', 'Baby Sokken');
            else if (temp >= 25) advice.push('Baby Rompertje', 'Baby Broek');
        }
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
    const [displayWeatherIcon, setDisplayWeatherIcon] = useState(null);
    const [displayWeatherText, setDisplayWeatherText] = useState(null);

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
                // Verander days=1 naar days=2 om de voorspelling voor morgen te krijgen
                const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=2&aqi=no&alerts=no&lang=nl`);
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

    // Effect om advies en weerweergave te berekenen wanneer gegevens of opties veranderen
    useEffect(() => {
        if (!weatherData) {
            setAdvice([]);
            setCurrentTemp(null);
            setDisplayWeatherIcon(null);
            setDisplayWeatherText(null);
            return;
        };

        let tempToUse;
        const forecastHoursToday = weatherData.forecast.forecastday[0].hour;
        const forecastHoursTomorrow = weatherData.forecast.forecastday[1]?.hour || [];
        const currentHour = new Date().getHours();
        let relevantHours = []; // Voor het controleren op regen
        let iconToDisplay = weatherData.current.condition.icon; // Standaard: huidige weer
        let textToDisplay = weatherData.current.condition.text; // Standaard: huidige weer

        if (timeFrame === 'today') {
            tempToUse = weatherData.forecast.forecastday[0].day.avgtemp_c;
            relevantHours = forecastHoursToday;
            iconToDisplay = weatherData.forecast.forecastday[0].day.condition.icon;
            textToDisplay = weatherData.forecast.forecastday[0].day.condition.text;
        } else if (timeFrame === '2hours') { // Dit is nu 'Nu'
            relevantHours = forecastHoursToday.slice(currentHour, Math.min(currentHour + 2, 24));
            tempToUse = relevantHours.length > 0 ? relevantHours.reduce((sum, hour) => sum + hour.temp_c, 0) / relevantHours.length : weatherData.current.temp_c;
            if (relevantHours.length > 0) {
                iconToDisplay = relevantHours[0].condition.icon;
                textToDisplay = relevantHours[0].condition.text;
            } else {
                tempToUse = weatherData.current.temp_c;
                iconToDisplay = weatherData.current.condition.icon;
                textToDisplay = weatherData.current.condition.text;
            }
        } else if (timeFrame === 'tomorrow') {
            if (weatherData.forecast.forecastday[1]) {
                tempToUse = weatherData.forecast.forecastday[1].day.avgtemp_c;
                relevantHours = forecastHoursTomorrow;
                iconToDisplay = weatherData.forecast.forecastday[1].day.condition.icon;
                textToDisplay = weatherData.forecast.forecastday[1].day.condition.text;
            } else {
                tempToUse = weatherData.current.temp_c;
                iconToDisplay = weatherData.current.condition.icon;
                textToDisplay = weatherData.current.condition.text;
                console.warn("Morgen's weersvoorspelling niet beschikbaar.");
            }
        } else if (timeFrame === 'night') { // Nieuw tijdsframe 'Vannacht'
            const nightHoursToday = forecastHoursToday.filter(hour => parseInt(hour.time.split(' ')[1].split(':')[0]) >= 22);
            const nightHoursTomorrow = forecastHoursTomorrow.filter(hour => parseInt(hour.time.split(' ')[1].split(':')[0]) < 7); // Tot 07:00 de volgende ochtend
            relevantHours = [...nightHoursToday, ...nightHoursTomorrow];

            if (relevantHours.length > 0) {
                tempToUse = relevantHours.reduce((sum, hour) => sum + hour.temp_c, 0) / relevantHours.length;
                // Voor icoon en tekst, neem de conditie van de eerste beschikbare nachtuur
                iconToDisplay = relevantHours[0].condition.icon;
                textToDisplay = relevantHours[0].condition.text;
            } else {
                tempToUse = weatherData.current.temp_c; // Fallback
                iconToDisplay = weatherData.current.condition.icon;
                textToDisplay = weatherData.current.condition.text;
                console.warn("Nachtweersvoorspelling niet beschikbaar of relevant.");
            }
        }
        
        setCurrentTemp(Math.round(tempToUse));
        setDisplayWeatherIcon(iconToDisplay);
        setDisplayWeatherText(textToDisplay);

        // Geef timeFrame door aan getClothingAdvice voor nachtadvies
        const clothingAdvice = getClothingAdvice(tempToUse, personType, timeFrame);
        
        // Controleer op regen in het geselecteerde tijdsbestek
        const willRain = relevantHours.some(hour => hour.will_it_rain === 1);
        if (willRain) {
            clothingAdvice.push('Regenkleding');
        }

        setAdvice(clothingAdvice);

    }, [weatherData, personType, timeFrame]);

    // Functie om de juiste afbeelding te krijgen uit de clothingIcons map
    const getClothingImage = (itemName) => {
        return clothingIcons[itemName] || `https://placehold.co/100x100/cccccc/333333?text=${itemName.replace(/\s+/g, '+')}`;
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-blue-600">Wat doe je aan bij welk weer?</h1>
                    <p className="text-gray-600 mt-2">Wat trek je je kind (of jezelf) aan vandaag?</p>
                </header>

                <div className="mt-8">
                    {loading && <div className="text-center p-8"><p>Weergegevens worden opgehaald...</p></div>}
                    
                    {error && !loading && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">{error}</div>}
                    
                    {weatherData && !loading && !error && (
                         <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Advies voor <span className="text-blue-600">{personType}</span> in <span className="text-blue-600">{weatherData.location.name}</span></h2>
                                </div>
                                <div className="flex items-center mt-4 md:mt-0">
                                    <img src={displayWeatherIcon} alt={displayWeatherText} className="w-16 h-16"/>
                                    <div className="text-right ml-4">
                                        <p className="text-4xl font-bold">{currentTemp}°C</p>
                                        <p className="text-gray-600">{displayWeatherText}</p>
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
                                                />
                                            </div>
                                            {/* Verwijder "Baby " uit de tekst als het een baby-item is, en "Baby-" voor pyama */}
                                            <p className="font-semibold text-gray-700">
                                                {item.startsWith('Baby-') ? item.substring(5) : (item.startsWith('Baby ') ? item.substring(5) : item)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 py-8">Geen specifiek advies voor deze omstandigheden.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigatieknoppen zijn nu onder het advies geplaatst */}
                <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 mt-8">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Wanneer?</label>
                             <div className="flex bg-gray-200 p-1 rounded-lg">
                                <button type="button" onClick={() => setTimeFrame('today')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === 'today' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Vandaag</button>
                                <button type="button" onClick={() => setTimeFrame('2hours')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === '2hours' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Nu</button>
                                <button type="button" onClick={() => setTimeFrame('tomorrow')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === 'tomorrow' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Morgen</button>
                                {personType === 'baby' && ( // Toon 'Vannacht' alleen voor baby
                                    <button type="button" onClick={() => setTimeFrame('night')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${timeFrame === 'night' ? 'bg-white text-blue-600 shadow' : 'bg-transparent text-gray-600 hover:bg-gray-300'}`}>Vannacht</button>
                                )}
                            </div>
                        </div>
                    </div>
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
