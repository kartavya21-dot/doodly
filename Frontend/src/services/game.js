import { api } from "./index";

export const getRoomGames = async (roomId) => {
  const response = await api.get(`/game/${roomId}`);
  return response.data;
};

export const createGame = async (roomId, gameData) => {
  const response = await api.post(`/game/${roomId}`, gameData);
  return response.data;
};