import { api } from "./index";

export const createRoom = async (roomData) => {
  const response = await api.post("/room", roomData);
  return response.data;
};

export const getRooms = async () => {
  const response = await api.get("/room");
  return response.data;
};

export const getMyRooms = async () => {
  const response = await api.get("/room/my");
  return response.data;
};

export const joinRoom = async (roomData) => {
  const response = await api.patch("/room/join-room", roomData);
  return response.data;
};

export const getRoomUsers = async (roomId) => {
  const response = await api.get(`/room/${roomId}/users`);
  return response.data;
};
