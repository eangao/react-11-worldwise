import { BrowserRouter, Route, Routes } from "react-router-dom";
import Product from "./pages/Product";
import Pricing from "./pages/Pricing";
import Homepage from "./pages/Homepage";
import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./pages/AppLayout";
import Login from "./pages/Login";
import CityList from "./components/CityList";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:9000";

function App() {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(function () {
    try {
      setIsLoading(true);

      async function fetchCities() {
        const res = await fetch(`${BASE_URL}/cities`);

        const data = await res.json();

        setCities(data);
      }

      fetchCities();
    } catch (err) {
      throw new Error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Homepage />} />
        <Route path="product" element={<Product />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="login" element={<Login />} />
        <Route path="app" element={<AppLayout />}>
          <Route
            index
            element={<CityList cities={cities} isLoading={isLoading} />}
          />
          <Route
            path="cities"
            element={<CityList cities={cities} isLoading={isLoading} />}
          />
          <Route path="countries" element={<p>List of countries</p>} />
          <Route path="form" element={<p>Form</p>} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

///////////////////////////////////////////////
// npm install eslint vite-plugin-eslint eslint-config-react-app --save-dev

// npm install react-router-dom@6

///////////////////////////////////////////////
//Install Fake API
//npm i json-server

// add in package.json scripts
// "server": "json-server --watch data/cities.json --port 9000"

//run
//npm run server
