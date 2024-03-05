import { useParams } from "react-router-dom";
import styles from "./City.module.css";

import { useCities } from "../contexts/CitiesContext";
import { useEffect } from "react";
import Spinner from "./Spinner";
import BackButton from "./BackButton";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));

function City() {
  const { id } = useParams();
  const { getCity, currentCity, isLoading } = useCities();

  ////////////////////
  //   Now, let's just remember that there was some issue earlier.
  // And so we are now actually ready to fix that.
  // So if we come back here to our city,
  // remember that in the use effect,
  // we left out the getCity function.
  // So here we see that issue where eslint is telling us
  // to add the getCity, but remember that this created
  // an infinite loop of HTTP requests to our API.

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
  useEffect(
    function () {
      getCity(id);
    },

    [id, getCity]
  );

  /////////////////////////
  const { cityName, emoji, date, notes } = currentCity;

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City name</h6>
        <h3>
          <span>{emoji}</span> {cityName}
        </h3>
      </div>

      <div className={styles.row}>
        <h6>You went to {cityName} on</h6>
        <p>{formatDate(date || null)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${cityName}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <BackButton />
      </div>
    </div>
  );
}

export default City;
