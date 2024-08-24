import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PropTypes from "prop-types";

// Auth Routes
import AuthLayout from "./AuthLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Main Routes
import MainLayout from "./MainLayout";
import Home from "../pages/Home";

// Error Routes
// import Error404 from "../components/errors/Error404";
import Chat from "../components/home/Chat";

const Layout = ({ socket }) => {
  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="" element={<Navigate to="login" replace />} />
        </Route>

        {/* Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/chat" element={<Chat socket={socket} />} />
        </Route>

        {/* Error Routes */}
        {/* <Route path="/404" element={<Error404 />} />
        <Route path="*" element={<Navigate to="/404" replace />} /> */}
      </Routes>
    </>
  );
};

Layout.propTypes = {
  socket: PropTypes.object
};

export default Layout;
