import { createContext, useContext, useEffect, useReducer } from "react";

const BASE_URL = "http://localhost:9000";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    //     it's a bit
    // of a naming convention to use a slash like this
    // at least in the Redux community
    // which is actually similar to what we are implementing here.
    // So I like to use this slash here
    // because it makes it really easy to understand
    // that this is related to the cities
    // and then that they have been loaded in this case.

    //     we should model our event names more like this.
    // So really as events and not just setters.
    case "loading":
      return { ...state, isLoading: true };
    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };
    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };
    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };
    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    dispatch({ type: "loading" });

    try {
      async function fetchCities() {
        const res = await fetch(`${BASE_URL}/cities`);

        const data = await res.json();

        dispatch({ type: "cities/loaded", payload: data });
      }

      fetchCities();
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error loading cities...",
      });
    }
  }, []);

  async function getCity(id) {
    //     While the ID that we have right here is a string.
    // And the reason for that is that we are actually
    // reading this ID somewhere in that component from the URL.
    // And so everything that's coming
    // from the URL will automatically be a string.
    // And so if you want to do any comparisons like this
    // then you always need to convert this to a number.

    //     So in order to load the city
    // it of course needs to load from the API,
    // but if we then click the same again, it doesn't do that.
    if (currentCity.id === Number(id)) return;

    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();

      dispatch({ type: "city/loaded", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error loading city...",
      });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "content-Type": "application/json",
        },
      });

      const data = await res.json();

      dispatch({ type: "city/created", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating city...",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        error,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);

  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");

  return context;
}

export { CitiesProvider, useCities };

// if we were not dealing with asynchronous data
// then it would be better to just pass the dispatch function
// and then create the actions right inside the components.
