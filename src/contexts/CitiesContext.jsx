import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";

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

  ////////////////
  //   But first of all, of course, we need to understand
  // what is actually happening.
  // So now that we have this getCity function
  // in our dependency array, the effect will rerun
  // each time that it get city function gets updated,
  // or in other words, that it gets recreated.
  // Now, when does this function get recreated?
  // Well, since it lives in the context, so let's open that.
  // So this file, getCity, lives here,
  // so it is created in this city's provider.
  // But the problem is that this getCity function
  // will update the state each time that it is executed,
  // which will then end up in an infinite loop.
  // So here we call the getCity function, right?
  // And so that function will then update the state
  // in this component.
  // Then this component will re-render,
  // which will then recreate this function.
  // And as the function gets recreated,
  // since it is here in the dependency array,
  // then getCity will get called again,
  // which then again will update a state, which will re-render,
  // which will cause the effect to run over,
  // and over, and over again.
  // So that's the infinite loop that we have right here,
  // and probably we should come back here
  // and now take our application out of this misery.
  // So it's been fetching for a few minutes now,
  // so that's a bit too much.
  // But anyway, how do you think we can fix this?

  ////////
  // So the solution is not to remove this
  // from the dependency array,
  // because that is not allowed in React.
  // Instead, what we need to do is to make this function stable.
  // So we need it to not be recreated on each re-render.
  // And the way we do that, as you hopefully know,
  // is by using the useCallback hook.

  const getCity = useCallback(
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
    },
    [currentCity.id]
    //     just having this kind of warning here
    // is reason enough to really always install eslint
    // in your projects.
    // So without it, you'll create so many bugs,
    // it's not gonna be funny, really.
    // But anyway, this now shows you a real world use case
    // of this hook, so of this useCallback hook right here.
    // So this is one of these real world situations
    // in which you will really need to reach for this tool.
    // So that's why it's really important
    // that you paid good attention throughout this section.
    // And actually remember that when I first introduced
    // these hooks, this was exactly one of the three use cases
    // that I talked about.
    // So memorizing values that are used in the dependency array
    // of another hook in order to prevent infinite loops.

    ///////////////////So let's give it a reload here,

    // and then let's just try it again.
    // And if we come here to our network tab,
    // then we see that there is no problem anymore.
    // And also here we are not seeing
    // these infinite requests coming in.
    // All right, and this is actually
    // all that I wanted to show you in this lecture.
    // And I can understand that it probably
    // seems pretty intimidating,
    // for example, to find out by yourself
    // that this would've been the solution here.
    // But trust me, that with practice and with study,
    // you will be able to really understand
    // and to master all these tools.
  );

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
      /////////////////////////////////////
      // But yeah, so again, there's not a lot
      // to optimize here in this context.
      // So that's because we don't have any performance issues,
      // and also because the way that we set up our context value.
      // So remember how earlier we decided that we want to pass in
      // all of these functions into the context value,
      // and so therefore it wouldn't be practical
      // to create one separate context for each of them, right?
      // So that's one of the strategies that I mentioned earlier,
      // but that's not really practical and also not necessary here.
      // Also, there's not really a need to memorize
      // this value right here, because we don't have any component
      // above this provider in the component tree
      // that might re-render this one.
      // And so there's no point in doing that,
      // and so I think that there's actually nothing to do here,
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
