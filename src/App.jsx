import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { CitiesProvider } from "./contexts/CitiesContext";
import { AuthProvider } from "./contexts/FakeAuthContext";
import ProtectedRoute from "./pages/ProtectedRoute";

import CityList from "./components/CityList";
import CountryList from "./components/CountryList";
import City from "./components/City";
import Form from "./components/Form";

import SpinnerFullPage from "./components/SpinnerFullPage";

// import Product from "./pages/Product";
// import Pricing from "./pages/Pricing";
// import Homepage from "./pages/Homepage";
// import PageNotFound from "./pages/PageNotFound";
// import AppLayout from "./pages/AppLayout";
// import Login from "./pages/Login";

// So this lazy function here is actually a feature
// that is built into React.
// And then Vite or Webpack, they will automatically split
// the bundle when they see this lazy function.
const Homepage = lazy(() => import("./pages/Homepage"));
const Product = lazy(() => import("./pages/Product"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Login = lazy(() => import("./pages/Login"));
const AppLayout = lazy(() => import("./pages/AppLayout"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

// dist/assets/index-1fa5c498.css   29.87 kB │ gzip:  5.05 kB
// dist/assets/index-1a515fc0.js   511.89 kB │ gzip: 147.26 kB

// So let's just very shortly recap here
// before we actually try this out.
// So here with this lazy loading, we will now load
// each of these components here as we need them,
// which will basically automatically split
// our bundle into separate chunks.
// And it is Vite, in our case here,
// that's gonna take care of that.
// And so then, of course, there will be a time
// while we navigate from one page to the other
// where that chunk has not been downloaded yet.
// So for example, if we go to Login,
// then that page has not been downloaded.
// And so then this entire thing,
// so this lazy functionality is powered by the Suspense API.
// And so that will make the component basically suspended
// in the meantime which will then display
// this loading spinner.
// And then once that has arrived,
// it will no longer be suspended.
// And then the content here, so the children of the Suspense,
// is gonna be displayed, so it's gonna be rendered.

// So let's see if that works.
// And let's actually do some throttling here
// like a Slow 3G so that we can actually see this happening.
// So let's click on Pricing.
// Let's even clear our network requests.
// And it is working, so it's now loading that chunk.
// And so now that arrived, and so now the page has loaded.
// And you see that some additional kilobytes
// were transferred in the meantime.
// And the same thing is gonna happen with the Product page
// and with all the other pages.
// But of course, if I go back now,
// then that chunk has already been loaded before,
// and so it's not gonna be loaded again.
// So it will nicely be integrated into the application
// that we already have.
// All right, so let's load up our next page,
// and it looks already slow,
// but that's just because we have
// this throttling here activated.
// So loading now the next thing,
// a store app layout, which is the main part of the app,
// and so that's why that takes a bit longer.

function App() {
  return (
    <AuthProvider>
      <CitiesProvider>
        <BrowserRouter>
          <Suspense fallback={<SpinnerFullPage />}>
            <Routes>
              <Route index element={<Homepage />} />
              <Route path="product" element={<Product />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="login" element={<Login />} />

              <Route
                path="app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate replace to="cities" />} />
                <Route path="cities" element={<CityList />} />
                <Route path="cities/:id" element={<City />} />
                <Route path="countries" element={<CountryList />} />
                <Route path="form" element={<Form />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CitiesProvider>
    </AuthProvider>
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

//MAP API
//https://react-leaflet.js.org/
// npm i react-leaflet leaflet

//Date Picker
//https://www.npmjs.com/package/react-datepicker
//npm i react-datepicker
