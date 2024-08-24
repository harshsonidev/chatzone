import axios from "axios";
import { serverURL } from "./utils/utils";

export const Api = {
  send: async (type = "GET", url = "", body = {}, auth = true) => {
    let headers = {};
    const token = localStorage.getItem("token");

    if (auth && token) {
      headers.authorization = `Bearer ${token}`;
    }

    if (type === "GET") {
      return axios.get(serverURL + url, { headers });
    } else if (type === "POST") {
      return axios.post(serverURL + url, body, { headers });
    }
  }
};
