import React, { useEffect, useState } from "react";
import UsersList from "../components/home/UserList";
import Chat from "../components/home/Chat";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { Screen, hasKeys } from "../utils/utils";
import PropTypes from "prop-types";
import Welcome from "../components/home/Welcome";

const Home = ({ socket }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [reciever, setReciever] = useState({});
  const userReducer = useSelector(state => state.userReducer);

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

  useEffect(() => {
    const currentUserId = userReducer?.user?._id;
    if (currentUserId) {
      socket.emit("add-new-user", currentUserId);
    }
  }, [socket, userReducer?.user?._id]);

  useEffect(() => {
    if (hasKeys(reciever)) {
      navigate(`/chat?id=${reciever?._id}`);
    }
  }, [reciever]);

  useEffect(() => {
    const handleRefresh = () => {
      // Your logic to handle refresh
      // For example, navigate to the home page
      history.push("/");
    };

    window.addEventListener("beforeunload", handleRefresh);

    return () => {
      window.removeEventListener("beforeunload", handleRefresh);
    };
  }, [history]);

  return (
    <div className="home">
      <UsersList />

      {hasKeys(reciever) ? (
        <Chat reciever={reciever} setReciever={setReciever} socket={socket} />
      ) : (
        <div className={`${Screen.isMobileView ? "chat d-none" : "chat"}`}>
          <Welcome />
        </div>
      )}
    </div>
  );
};

Home.propTypes = {
  socket: PropTypes.object
};

export default Home;
