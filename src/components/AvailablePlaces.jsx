import { useState, useEffect } from 'react';
import Places from './Places.jsx';
import Error from './Error.jsx';
import {sortPlacesByDistance} from '../loc.js';

// data from localstorage isa available sync (imediately)
// const places = localStorage.getItem('places');

export default function AvailablePlaces({ onSelectPlace }) {
  // when fetching data is commonly to have these three pieces of data working together
  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
   
    // IFFE se jedino koristi za async/awaint, ne koristi se za var da bude scoped ili za module pattern
    async function fetchPlaces() {
      setIsFetching(true);

      try {
      // newtowrk error, server crashed
      const response = await fetch('http://localhost:3000/places');
      const resData =  await response.json();
 
      // 494, on to ne priajvljuje kao gresku pa ti to moras
      if (!response.ok)
         throw new Error('Failed to fetch places');
      
      // async code, with cb function handle that behaviour - ne vraca promise i zato ne mogu .then() ili await
      navigator.geolocation.getCurrentPosition((position) => {
        const sortedPlaces = sortPlacesByDistance(
          resData.places, 
          position.coords.latitude, 
          position.coords.longitude
          );
        setAvailablePlaces(sortedPlaces);
        setIsFetching(false);
      });

     
        
      } catch(error) {
        // update UI and show error message to user
        setError({message: error.message || 'Could not fetch places, please try again later'});
        setIsFetching(false);
      }

      

    }
    fetchPlaces();
   
  }, []);

  if (error) {
    return <Error title="An error occured" message={error.message}/>
  }
  

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
