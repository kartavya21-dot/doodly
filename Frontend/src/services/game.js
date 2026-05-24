import { api } from "./index";

export const getRoomGames = async (roomId) => {
  const response = await api.get(`/room/${roomId}/games`);
  return response.data;
};

export const createGame = async (roomId, gameData) => {
  const response = await api.post(`/game/${roomId}`, gameData);
  return response.data;
};

export const getGame = async (gameId) => {
  const response = await api.get(`/game/${gameId}`);
  return response.data;
};

export const getGamePlayers = async (gameId) => {
  const response = await api.get(`/game/${gameId}/players`);
  return response.data;
};

export const deleteGame = async (gameId) => {
  const response = await api.delete(`/game/${gameId}/delete`);
  return response.data;
}