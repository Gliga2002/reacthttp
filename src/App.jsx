import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import Error from './components/Error.jsx';
import { fetchUserPlaces } from './http.js';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const [errorUpdatingPlaces, seteErorUpdatingPlaces] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    // IFFE
    async function fetchPlace() {
      setIsFetching(true);
      try {
      const places = await fetchUserPlaces();
      setUserPlaces(places);
      } catch(error) {
        setError({message: error.message || 'Failed to fetch user places.'});
      }
      setIsFetching(false);
    }
    fetchPlace();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  
    // mozes ovo u http.js file da export u neku async function
    async function updateUserPlaces(places) {
      const response = await fetch('http://localhost:3000/user-places', {
      method: 'PUT',
      body: JSON.stringify({places}),
      headers: {
        'Content-Type':'application/json'
      }
    });

    const resData = await response.json();

    if (!response.ok) {
      throw new Error("Failed to update user data");
    }

     return resData.message
    }

  async function handleSelectPlace(selectedPlace) {
    // Optimistic updating. Better UI than showing spinner. USE WHEN PERFORMING UPDATING

    // da si updateUserPlaces stavio pre ovoga, morao bi loading spinner, jer bi prvo cekao da se update pa tek onda change state
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });


    try {
      await updateUserPlaces([selectedPlace,...userPlaces]);
    } catch(error) {
      // back, bez new place (rollback change)
      setUserPlaces(userPlaces);
      seteErorUpdatingPlaces({message: error.message || 'Failed to updated places'});
    }

    
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    // optimistic updating - first updating the state and then sending an http request
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      await updateUserPlaces(userPlaces.filter(place => place.id !== selectedPlace.current.id));
    } catch(error) {
      setUserPlaces(userPlaces);
      seteErorUpdatingPlaces({message: error.message || 'Filed to delete places'})
    }


    setModalIsOpen(false);
  }, [userPlaces]);


  function handleError() {
    seteErorUpdatingPlaces(null);
  }

  return (
    <>
     <Modal open={errorUpdatingPlaces} onClose={handleError}>
       {errorUpdatingPlaces && <Error 
          title="An error occured" 
          message={errorUpdatingPlaces.message}
          onConfirm={handleError}
        />
       }
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occured" message={error.message} />}
        {!error &&<Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          isLoading = {isFetching}
          loadingText = "Fetching your places..."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        }

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
