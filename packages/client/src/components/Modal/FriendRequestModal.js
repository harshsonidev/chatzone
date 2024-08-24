import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { User } from "../home/UserList";
import useRequest from "../../hooks/useRequest";
import { useDispatch, useSelector } from "react-redux";
import { setFriendRequests } from "../../redux/slices/userSlice";

const FriendRequestModal = ({ handleClose = () => {} }) => {
  const dispatch = useDispatch();
  dispatch;
  const friendRequests = useSelector(
    state => state?.userReducer
  )?.friendRequests;
  const { sendRequest: getAllFriendRequests, data } = useRequest({
    requestType: "GET",
    url: `/friends/getAllFriendRequests`
  });

  useEffect(() => {
    getAllFriendRequests();
  }, []);

  useEffect(() => {
    if (data?.data?.length) {
      dispatch(setFriendRequests(data?.data));
    }
  }, [data]);

  return (
    <>
      <Modal show style={{ marginTop: "50px" }} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Your Friend Requests</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-5">
          {friendRequests.length == 0 && (
            <>
              <div className="no-user-found">
                <div className="message">No Friend Requests</div>
              </div>
            </>
          )}
          {friendRequests.length > 0 && (
            <div>
              {friendRequests.map((user, index) => (
                <User
                  key={index}
                  user={user}
                  friendRequestsMode
                  enableActions
                ></User>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

FriendRequestModal.propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func
};

export default FriendRequestModal;
