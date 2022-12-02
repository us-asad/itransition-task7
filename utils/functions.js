import axios from "axios"
import { toast } from "react-toastify";

export const setAuthHeader = token => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
})

export const fetchGames = async token => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/get-games`, setAuthHeader(token));
    return Array.isArray(res.data) ? res.data : [];
  } catch (ex) {
    console.error(ex);
    toast.error("Server error, could not get new games, please check your internet network or try again later.");
    return [];
  }
}

export const fetchGame = async (id, token) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/get-game/${id}`, setAuthHeader(token));
    return res.data;
  } catch (ex) {
    console.error(ex);
    toast.error("Server error, could not get new games, please check your internet network or try again later.");
    return {};
  }
}

export const updateGame = async (id, token, data) => {
  try {
    const res = await axios.put(`${process.env.NEXT_PUBLIC_URL}/api/update-game/${id}`, data, setAuthHeader(token));
    return res.data;
  } catch (ex) {
    console.error(ex);
    toast.error("Server error, could not get new games, please check your internet network or try again later.");
    return {};
  }
}

