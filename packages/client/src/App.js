import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./layouts/Layout";
import "./assets/scss/style.scss";
import { io } from "socket.io-client";
import { serverURL } from "./utils/utils";
import { Toaster } from "react-hot-toast";

const App = () => {
  const socket = io(serverURL);

  return (
    <>
      <Router>
        <Layout socket={socket} />
      </Router>

      <div>
        <Toaster position="bottom-right" />
      </div>
    </>
  );
};

export default App;
