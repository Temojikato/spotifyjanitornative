// src/_tests_/services/spotifyApi.test.tsx
import axios from 'axios';
import localforage from 'localforage';
import { 
  getUserSavedTracks, 
  removeUserSavedTrack, 
  saveUserTrack, 
  searchTracks 
} from '../../services/spotifyApi';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

jest.mock('localforage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

describe('spotifyApi service', () => {
  const token = 'fake_token';
  const API_BASE = 'https://api.spotify.com/v1';

  beforeEach(() => {
    localStorage.setItem('access_token', token);
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getUserSavedTracks', () => {
    it('returns cached tracks if available', async () => {
      const cachedData = { items: 'cached' };
      (localforage.getItem as jest.Mock).mockResolvedValue(cachedData);
      const result = await getUserSavedTracks();
      expect(result).toEqual(cachedData);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('throws an error if token is not available', async () => {
      localStorage.removeItem('access_token');
      (localforage.getItem as jest.Mock).mockResolvedValue(null);
      await expect(getUserSavedTracks()).rejects.toThrow('No access token available');
    });

    it('fetches tracks if not cached and stores them', async () => {
      (localforage.getItem as jest.Mock).mockResolvedValue(null);
      const responseData = { items: 'data' };
      (axios.get as jest.Mock).mockResolvedValue({ data: responseData });
      const result = await getUserSavedTracks();
      expect(result).toEqual(responseData);
      expect(axios.get).toHaveBeenCalledWith(`${API_BASE}/me/tracks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(localforage.setItem).toHaveBeenCalledWith('savedTracks', responseData);
    });
  });

  describe('removeUserSavedTrack', () => {
    it('throws an error if token is not available', async () => {
      localStorage.removeItem('access_token');
      await expect(removeUserSavedTrack('123')).rejects.toThrow('No access token available');
    });

    it('calls axios.delete and removes cache', async () => {
      await removeUserSavedTrack('123');
      expect(axios.delete).toHaveBeenCalledWith(`${API_BASE}/me/tracks`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: ['123'] }
      });
      expect(localforage.removeItem).toHaveBeenCalledWith('savedTracks');
    });
  });

  describe('saveUserTrack', () => {
    it('throws an error if token is not available', async () => {
      localStorage.removeItem('access_token');
      await expect(saveUserTrack('123')).rejects.toThrow('No access token available');
    });

    it('calls axios.put and removes cache', async () => {
      await saveUserTrack('123');
      expect(axios.put).toHaveBeenCalledWith(`${API_BASE}/me/tracks`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: '123' }
      });
      expect(localforage.removeItem).toHaveBeenCalledWith('savedTracks');
    });
  });

  describe('searchTracks', () => {
    it('throws an error if token is not available', async () => {
      localStorage.removeItem('access_token');
      await expect(searchTracks('in')).rejects.toThrow('No access token available');
    });

    it('calls axios.get and returns response data', async () => {
      const responseData = { tracks: { items: ['track1', 'track2'] } };
      (axios.get as jest.Mock).mockResolvedValue({ data: responseData });
      const result = await searchTracks('in');
      expect(axios.get).toHaveBeenCalledWith(`${API_BASE}/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: 'in', type: 'track', limit: 20 }
      });
      expect(result).toEqual(responseData);
    });
  });
});
