import React, { useEffect } from "react";
// import NavbarTop from "../components/navbar/top/NavbarTop";
import { Outlet, useNavigate } from "react-router-dom";
import { hasKeys } from "../utils/utils";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const navigationTo = async () => {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (!hasKeys(user)) {
        navigate("/auth/login");
      } else {
        dispatch(setUser(user));
      }
    };
    navigationTo();
  }, [dispatch, navigate]);

  return (
    <>
      {/* <NavbarTop /> */}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
