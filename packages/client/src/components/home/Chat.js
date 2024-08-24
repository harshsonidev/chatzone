import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdSend } from "react-icons/io";
import defaultAvatar from "../../assets/img/default-user.png";
import useRequest from "../../hooks/useRequest";
import PropTypes from "prop-types";
import Loader from "../common/Loader";
import { useLocation } from "react-router-dom";
import { setSelectedUser } from "../../redux/slices/userSlice";
import UsersList from "./UserList";
import { Screen } from "../../utils/utils";

const Chat = ({ socket }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const messageRef = useRef(null);
  const allMessagesRef = useRef(null);
  const userReducer = useSelector(state => state.userReducer);
  const reciever = userReducer?.selectedUser;
  const userId = new URLSearchParams(location.search)?.get("id");

  const {
    data,
    loading,
    sendRequest: getAllMessages
  } = useRequest({
    requestType: "GET",
    url: `/messages/${reciever?._id}`
  });
  const { sendRequest: sendMessageInDB } = useRequest({
    requestType: "POST",
    url: `/messages/sendMessage/${reciever?._id}`
  });
  const { sendRequest: getUserById } = useRequest({
    requestType: "GET",
    url: `/users/user`,
    callback: data => {
      dispatch(setSelectedUser(data.data));
    }
  });
  const [allMessages, setAllMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isTypingMessage, setIsTypingMessage] = useState(false);

  const scrollToBottom = () => {
    allMessagesRef.current?.scrollTo({
      top: allMessagesRef.current?.scrollHeight
      // behavior: "smooth"
    });
  };

  useEffect(() => {
    if (allMessagesRef?.current?.scrollHeight) {
      scrollToBottom();
    }
  }, [allMessagesRef?.current?.scrollHeight]);

  useEffect(() => {
    if (userReducer?.user?._id && userReducer?.selectedUser?._id) {
      if (message.length > 0) {
        socket.emit("typing-msg", {
          from: userReducer?.user?._id,
          to: userReducer?.selectedUser?._id
        });
      } else {
        socket.emit("typing-stopped", {
          from: userReducer?.user?._id,
          to: userReducer?.selectedUser?._id
        });
      }
    }
  }, [message, userReducer?.user?._id, userReducer?.selectedUser?._id]);

  useEffect(() => {
    if ((socket && userReducer?.user?._id, userReducer?.selectedUser?._id)) {
      socket.on("typing-msg", data => {
        typingMessageHandler({
          ...data,
          currentUserId: userReducer?.user?._id,
          selectedUserId: userReducer?.selectedUser?._id
        });
      });
      socket.on("typing-stopped", () => {
        typingMessageHandler({
          ...data,
          currentUserId: userReducer?.user?._id,
          selectedUserId: userReducer?.selectedUser?._id
        });
      });
    }
  }, [socket, userReducer?.user?._id, userReducer?.selectedUser?._id]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      sendMessageInDB({ type: "text", message: message.trim() });
      socket.emit("send-msg", {
        from: userReducer?.user?._id,
        to: userReducer?.selectedUser?._id,
        message: message.trim()
      });
      setMessage("");
      scrollToBottom();

      const content = {
        sender: userReducer?.user?._id,
        reciever: userReducer?.selectedUser?._id,
        message,
        currentUserId: userReducer?.user?._id,
        selectedUserId: userReducer?.selectedUser?._id
      };

      messageHandler(content);
    }
  };

  useEffect(() => {
    if ((socket, userReducer?.user?._id, userReducer?.selectedUser?._id)) {
      socket.on("msg-recieved", data => {
        const content = {
          ...data,
          currentUserId: userReducer?.user?._id,
          selectedUserId: userReducer?.selectedUser?._id
        };
        messageHandler(content);
      });
    }
  }, [socket, userReducer?.user?._id, userReducer?.selectedUser?._id]);

  useEffect(() => {
    if (reciever?._id) {
      getAllMessages();
      setAllMessages([]);
      setMessage("");
      setIsTypingMessage(false);
    }
  }, [reciever?._id]);

  useEffect(() => {
    const chats = data?.data;
    if (
      chats?.length &&
      userReducer?.user?._id &&
      userReducer?.selectedUser?._id
    ) {
      chats.forEach(message => {
        const content = {
          sender: message.sender,
          reciever: message.reciever,
          message: message.message.content,
          currentUserId: userReducer?.user?._id,
          selectedUserId: userReducer?.selectedUser?._id
        };
        messageHandler(content);
      });
    } else {
      setAllMessages([]);
    }
  }, [data, userReducer?.user?._id, userReducer?.selectedUser?._id]);

  const onMessage = (type, data) => {
    setAllMessages(p => [
      ...p,
      <div key={p.length + 1} className="message">
        <div className={type}>{data?.message}</div>
      </div>
    ]);
    scrollToBottom();
  };

  const messageHandler = (data = {}) => {
    if (
      data?.sender === data?.currentUserId &&
      data?.reciever === data?.selectedUserId
    ) {
      onMessage("sent", data);
    }

    if (
      data?.sender === data?.selectedUserId &&
      data?.reciever === data?.currentUserId
    ) {
      onMessage("recieved", data);
    }
  };

  const typingMessageHandler = (data = {}) => {
    if (
      (data?.sender === data?.currentUserId &&
        data?.reciever === data?.selectedUserId) ||
      (data?.sender === data?.selectedUserId &&
        data?.reciever === data?.currentUserId)
    ) {
      setIsTypingMessage(true);
    } else {
      setIsTypingMessage(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getUserById({}, { appendURL: `/${userId}` });
    }
  }, [userId]);

  // useEffect(() => {
  //   if(location.pathname){

  //   }
  // },[location.pathname])
  const isChatPage =
    location.pathname.includes("/chat") && location.search.includes("?id=");

  return (
    <div className={`${isChatPage ? "home" : ""}`}>
      {isChatPage && !Screen.isMobileView && <UsersList />}
      <div className={`chat`}>
        {!loading ? (
          <>
            <div className="top-bar">
              <div className="user-details">
                <img
                  className="avatar"
                  src={reciever?.photo || defaultAvatar}
                  alt=""
                />
                <div className="name">{reciever?.name}</div>
              </div>
              {isTypingMessage && (
                <div className="typing-info">
                  <p>typing...</p>
                </div>
              )}
            </div>
            <div className="messages" ref={allMessagesRef}>
              {allMessages}
            </div>
            <div className="message-send-box">
              <input
                ref={messageRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Message"
                onKeyUp={e => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <br />
              <div onClick={() => sendMessage()}>
                <IoMdSend className="send-icon" />
              </div>
            </div>
          </>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

Chat.propTypes = {
  reciever: PropTypes.object,
  socket: PropTypes.object
};

export default Chat;
