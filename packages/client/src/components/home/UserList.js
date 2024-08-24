import React, { useEffect, useRef, useState } from "react";
import defaultAvatar from "../../assets/img/default-user.png";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllUsers,
  setUser,
  setSelectedUser,
  setFriendRequests
} from "../../redux/slices/userSlice";
import Lottie from "lottie-react";
import sad from "../../assets/lottie/sad.json";
import { AiOutlineMore } from "react-icons/ai";
import Loader from "../common/Loader";
import useRequest from "../../hooks/useRequest";
import PropTypes from "prop-types";
import { hasKeys } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown } from "react-bootstrap";
import Modals from "../Modal";
import CustomDropdownToggle from "../common/CustomDropdownToggle";
import CustomDropdownItem from "../common/CustomDropdownItem";
import { IoMdCheckmark, IoMdPersonAdd } from "react-icons/io";
import _ from "lodash";

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentModel, setCurrentModel] = useState({
    name: null,
    props: null
  });

  const userReducer = useSelector(state => state.userReducer);

  const {
    data,
    loading,
    sendRequest: getAllFriends
  } = useRequest({
    requestType: "GET",
    url: `/friends`
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (userReducer?.user?._id) getAllFriends();
  }, [userReducer?.user?._id]);

  useEffect(() => {
    if (data?.data?.friends) {
      setUsers(data.data.friends);
      dispatch(setAllUsers(data.data.friends));
    }
  }, [data]);

  useEffect(() => {
    dispatch(setAllUsers(users));
  }, []);

  const handleShowModel = (model = null, modelProps = null) => {
    setCurrentModel({
      name: Modals[model] ? model : null,
      props: modelProps
    });
  };

  const onAddFriends = () => {
    handleShowModel("AddFriendModal", {
      handleClose: () => setCurrentModel({})
    });
  };

  const onLogOut = () => {
    setAllUsers([]);
    localStorage.clear();
    dispatch(setAllUsers([]));
    dispatch(setUser({}));
    navigate("/auth/login");
  };

  const friendRequestsHandler = () => {
    handleShowModel("FriendRequestModal", {
      handleClose: () => setCurrentModel({})
    });
  };

  const Modal = Modals[currentModel.name];

  return (
    <div className="user-list">
      <div className="top-bar">
        <div className="user-details">
          <img
            className="avatar"
            src={userReducer?.user?.photo || defaultAvatar}
            alt=""
          ></img>
          <div className="name">{userReducer?.user?.name}</div>
        </div>
        <Dropdown>
          <Dropdown.Toggle as={CustomDropdownToggle}>
            <div className="more-icon-box">
              <AiOutlineMore className="more-icon" />
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu variant="dark" className="more-items-menu">
            <Dropdown.Item as={CustomDropdownItem} onClick={onLogOut}>
              Profile
            </Dropdown.Item>
            <Dropdown.Item as={CustomDropdownItem} onClick={onAddFriends}>
              Add New Friends
            </Dropdown.Item>
            <Dropdown.Item
              as={CustomDropdownItem}
              onClick={friendRequestsHandler}
            >
              Friend Requests
            </Dropdown.Item>
            <Dropdown.Item as={CustomDropdownItem} onClick={onLogOut}>
              Log Out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {!loading ? (
        <>
          {userReducer?.users?.length ? (
            userReducer?.users?.map((user, i) => (
              <User key={i} user={user} navigateMode></User>
            ))
          ) : (
            <div className="no-friends">
              <Lottie animationData={sad} loop></Lottie>
              <p className="text">No Friends Yet!</p>
              <Button className="w-50" onClick={onAddFriends}>
                Add Friends
              </Button>
            </div>
          )}
        </>
      ) : (
        <Loader />
      )}
      {currentModel.name && <Modal {...currentModel.props} />}
    </div>
  );
};

export const User = ({
  user = {},
  searchMode = false,
  friendRequestsMode = false,
  enableActions = false,
  navigateMode = false
}) => {
  const [active, setActive] = useState(false);
  const userRef = useRef(null);
  const dispatch = useDispatch();
  const userReducer = useSelector(state => state?.userReducer);
  const reciever = userReducer?.selectedUser;
  const navigate = useNavigate();

  const {
    data,
    loading,
    sendRequest: sendFriendRequest
  } = useRequest({
    url: `/friends/sendRequest`
  });

  const { sendRequest: acceptFriendRequest } = useRequest({
    url: `/friends/acceptRequest`,
    callback: ({ data: user }) => {
      const prevUsers = _.cloneDeep(userReducer?.users) || [];
      const prevFriendRequests = _.cloneDeep(userReducer?.friendRequests) || [];

      prevUsers.push(user);

      const friendRequestIndex = prevFriendRequests.find(
        el => el?._id === user._id
      );

      prevFriendRequests.splice(friendRequestIndex, 1);

      dispatch(setAllUsers(prevUsers));
      dispatch(setFriendRequests(prevFriendRequests));
    }
  });

  const { sendRequest: rejectFriendRequest } = useRequest({
    url: `/friends/rejectRequest`
  });

  useEffect(() => {
    if (!searchMode || !friendRequestsMode) {
      if (hasKeys(reciever) && hasKeys(user)) {
        setActive(user && user._id === reciever._id);
      }
    }
  }, [searchMode, user, reciever]);

  const onSelectUser = () => {
    if (navigateMode) {
      navigate(`/chat?id=${user?._id}`);
    } else {
      dispatch(setSelectedUser(user));
    }
  };

  return (
    <div
      className={`user ${active ? "active" : ""}`}
      ref={userRef}
      onClick={onSelectUser}
    >
      <img className="avatar" src={user?.photo || defaultAvatar} alt="" />
      <div className="details">
        <div className="name-box">
          <div className="name">{user?.name}</div>
          {!searchMode && (
            <div className="last-message-time">{user?.lastMessageTime}</div>
          )}
        </div>
        {(searchMode || friendRequestsMode) && (
          <div className="usename">@{user?.username}</div>
        )}
        <div className="last-message-box">
          <div className="last-message">{user?.lastMessage?.message}</div>
        </div>
      </div>

      {enableActions && (
        <div className="actions">
          {searchMode && (
            <button
              className="request-button"
              onClick={() =>
                sendFriendRequest({}, { appendURL: `/${user?._id}` })
              }
              disabled={(data && data?.data) || user?.requestAlreadySent}
            >
              {loading ? (
                <IoMdPersonAdd className="send-icon" />
              ) : (data && data?.data) || user?.requestAlreadySent ? (
                <IoMdCheckmark style={{ fontWeight: "bold" }} />
              ) : (
                <IoMdPersonAdd className="send-icon" />
              )}
            </button>
          )}
          {friendRequestsMode && (
            <>
              <button
                className="request-button bg-primary me-3 small-font"
                onClick={() =>
                  acceptFriendRequest({}, { appendURL: `/${user?._id}` })
                }
              >
                Accept
              </button>
              <button
                className="request-button bg-secondary small-font"
                onClick={() =>
                  rejectFriendRequest({}, { appendURL: `/${user?._id}` })
                }
              >
                Reject
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

UsersList.propTypes = {};

User.propTypes = {
  user: PropTypes.object,
  searchMode: PropTypes.bool,
  friendRequestsMode: PropTypes.bool,
  enableActions: PropTypes.bool,
  navigateMode: PropTypes.bool
};

export default UsersList;
