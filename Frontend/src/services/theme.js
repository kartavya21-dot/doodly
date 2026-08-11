import { api } from "./index";

export const getThemes = async (roomId = null) => {
  const url = roomId ? `/themes?room_id=${roomId}` : "/themes";
  const response = await api.get(url);
  return response.data;
};

export const getThemeById = async (themeId) => {
  const response = await api.get(`/themes/${themeId}`);
  return response.data;
};

export const createCustomTheme = async (roomId, themeData) => {
  const response = await api.post(`/themes/room/${roomId}`, themeData);
  return response.data;
};

export const addWordToTheme = async (themeId, word) => {
  const response = await api.post(`/themes/${themeId}/words`, { word });
  return response.data;
};

export const deleteWordFromTheme = async (themeId, wordId) => {
  const response = await api.delete(`/themes/${themeId}/words/${wordId}`);
  return response.data;
};

export const deleteCustomTheme = async (themeId) => {
  const response = await api.delete(`/themes/${themeId}`);
  return response.data;
};
