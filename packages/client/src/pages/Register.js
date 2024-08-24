import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import useRequest from "../hooks/useRequest";
import { hasKeys } from "../utils/utils";
import logo from "../assets/img/logo.png";

const Register = () => {
  const userReducer = useSelector(state => state.userReducer);
  const {
    data,
    loading,
    sendRequest: register
  } = useRequest({
    requestType: "POST",
    url: "/users/signup",
    auth: false
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    password: "",
    passwordConfirm: ""
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
    <div className="register">
      <div className="content">
        <div className="logo-details">
          <img className="logo" src={logo} alt="logo"></img>
          <div className="title">
            Register into <span className="appName">ChatZone</span>
          </div>
        </div>
        <div className="inputs-fields">
          <div className="input-container">
            <div className="label">Name</div>
            <input
              className="input username"
              type="text"
              name="name"
              value={userData.name}
              onChange={onInputChange}
            />
          </div>

          <div className="input-container">
            <div className="label">Email (or Username)</div>
            <input
              className="input username"
              type="text"
              name="username"
              value={userData.username}
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

          <div className="input-container">
            <div className="label">Confirm Password</div>
            <input
              className="input password"
              type="password"
              name="passwordConfirm"
              value={userData.passwordConfirm}
              onChange={onInputChange}
              disabled={loading}
            />
          </div>
        </div>

        <Button
          className="button register-btn"
          variant="outline-dark"
          onClick={() => register(userData)}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </div>
      <div className="lines">
        <p className="line">
          Already Registered?{" "}
          <a className="link" onClick={() => navigate("/auth/login")}>
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
