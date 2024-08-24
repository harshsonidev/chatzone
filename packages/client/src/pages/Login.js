import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import useRequest from "../hooks/useRequest";
import { hasKeys } from "../utils/utils";
import logo from "../assets/img/logo.png";

const Login = () => {
  const userReducer = useSelector(state => state.userReducer);
  const {
    data,
    loading,
    sendRequest: login
  } = useRequest({
    requestType: "POST",
    url: "/users/login",
    auth: false
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    username: "",
    password: ""
  });

  const onInputChange = e => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (data?.data?.user && data?.token) {
      dispatch(setUser(data.data.user));
      localStorage.setItem("token", data?.token);
    }
  }, [data, dispatch]);

  useEffect(() => {
    const user = userReducer?.user;
    const localStorageUser = JSON.parse(localStorage.getItem("user"));
    if (hasKeys(localStorageUser)) {
      navigate("/");
    }
    if (hasKeys(user)) {
      localStorage.setItem("user", JSON.stringify(userReducer?.user));
      navigate("/");
    }
  }, [navigate, userReducer?.user]);

  return (
    <div className="login">
      <div className="content">
        <div className="logo-details">
          <img className="logo" src={logo} alt="logo"></img>
          <div className="title">
            Login into <span className="appName">ChatZone</span>
          </div>
        </div>
        <div className="inputs-fields">
          <div className="input-container">
            <div className="label">Username</div>
            <input
              className="input username"
              type="text"
              name="username"
              value={userData.email}
              onChange={onInputChange}
              disabled={loading}
            />
          </div>
          <div className="input-container">
            <div className="label">Password</div>
            <input
              className="input password"
              type="password"
              name="password"
              value={userData.password}
              onChange={onInputChange}
              disabled={loading}
            />
          </div>
        </div>

        <Button
          className="button login-btn"
          variant="outline-dark"
          onClick={() => login(userData)}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
      <div className="lines">
        <p className="line">
          Not Registered?{" "}
          <a className="link" onClick={() => navigate("/auth/register")}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
