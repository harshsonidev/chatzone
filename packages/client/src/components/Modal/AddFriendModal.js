import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import _ from "lodash";
import { User } from "../home/UserList";
import useRequest from "../../hooks/useRequest";

const AddFriendModal = ({ handleClose = () => {} }) => {
  const [searchText, setSearchText] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const { sendRequest: searchFriends, data } = useRequest({
    requestType: "POST",
    url: `/friends/searchFriends`
  });

  const handleSearch = _.debounce((value = "") => {
    setSearchText(value);
    if (!value) {
      setSearchData([]);
    }
  }, 500);

  useEffect(() => {
    searchText && searchText.length > 0 && searchFriends({ searchText });
  }, [searchText]);

  useEffect(() => {
    if (data) {
      setSearchData(data.data);
    }
  }, [data]);

  return (
    <>
      <Modal show style={{ marginTop: "50px" }} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Your Friends</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="friends-search-input"
            placeholder="Search your friends by username"
            onChange={e => {
              handleSearch(e.target.value);
            }}
          />
          {searchData.length == 0 && searchText.length > 0 && (
            <>
              <div className="friend-search-menu-container">
                <div className="no-user-found">
                  <div className="message">No User Found</div>
                </div>
              </div>
            </>
          )}
          {searchData.length > 0 && (
            <div className="friend-search-menu-container">
              <div className="friend-search-menu">
                {searchData.map((user, index) => (
                  <User
                    key={index}
                    user={user}
                    searchMode
                    enableActions
                    // reciever={reciever}
                    // setReciever={setReciever}
                  ></User>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

AddFriendModal.propTypes = {
  show: PropTypes.bool,
  handleClose: PropTypes.func
};

export default AddFriendModal;
