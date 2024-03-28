import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App.jsx";
import Register from "./Pages/Register.jsx";
import Login from "./Pages/Login.jsx";
import AboutUs from "./Pages/AboutUs.jsx";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
const router = createBrowserRouter([
    {
      path: "/",
      element: <App />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/about",
      element: <AboutUs />
    }
  ]);
  

ReactDOM.render(<RouterProvider router={router} />, document.getElementById("root"));
 
  
  