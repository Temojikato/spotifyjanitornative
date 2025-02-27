import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.spotify.com/v1';

const getAccessToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('access_token');
};

export const getUserSavedTracks = async (force?: boolean): Promise<any> => {
  if (!force) {
    const cachedTracks = await AsyncStorage.getItem('savedTracks');
    if (cachedTracks) return JSON.parse(cachedTracks);
  }
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');
  const response = await axios.get(`${API_BASE}/me/tracks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await AsyncStorage.setItem('savedTracks', JSON.stringify(response.data));
  return response.data;
};

export const removeUserSavedTrack = async (trackId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');
  await axios.delete(`${API_BASE}/me/tracks`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { ids: [trackId] },
  });
  await AsyncStorage.removeItem('savedTracks');
};

export const saveUserTrack = async (trackId: string): Promise<void> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');
  await axios.put(`${API_BASE}/me/tracks`, null, {
    headers: { Authorization: `Bearer ${token}` },
    params: { ids: trackId },
  });
  await AsyncStorage.removeItem('savedTracks');
};

export const searchTracks = async (query: string): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('No access token available');
  const response = await axios.get(`${API_BASE}/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query, type: 'track', limit: 20 },
  });
  return response.data;
};
