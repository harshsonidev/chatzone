import { useState } from "react";
import { Api } from "../Api";
import toast from "react-hot-toast";
import { hasKeys } from "../utils/utils";

const useRequest = args => {
  const defaultParams = {
    requestType: "POST",
    url: "",
    auth: true,
    alert: true
  };
  const { requestType, url, auth, alert, callback } = Object.assign(
    defaultParams,
    args
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = "/api/v1";

  const sendRequest = async (body = {}, otherOptions = {}) => {
    let updatedURL = baseUrl + url;
    if (hasKeys(otherOptions)) {
      if (otherOptions.appendURL) {
        updatedURL += otherOptions.appendURL;
      }
    }
    setLoading(true);

    Api.send(requestType, updatedURL, body, auth)
      .then(response => {
        if (response?.data) {
          callback && callback(response.data);
          setData(response.data);
        }
      })
      .catch(err => {
        if (alert && err?.response?.data?.message) {
          toast.error(err?.response?.data?.message);
        }
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { sendRequest, data, loading, error };
};

export default useRequest;
