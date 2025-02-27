declare global {
  var redirectUri: string;
}
global.redirectUri = 'dummy_redirect_uri';

import { generateRandomString, sha256Hash, generateCodeChallenge, redirectToSpotifyAuth, getToken, refreshAccessToken } from '../../src/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';

jest.mock('react-native-sha256', () => ({
  sha256: jest.fn((plain: string) => Promise.resolve('dummyhash')),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-config', () => ({
  SPOTIFY_CLIENT_ID: 'dummy_client_id',
  SPOTIFY_REDIRECT_URI: 'dummy_redirect_uri',
}));

global.fetch = jest.fn();

jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generateRandomString returns a string of given length', () => {
    const length = 16;
    const str = generateRandomString(length);
    expect(str).toHaveLength(length);
  });

  it('sha256Hash returns the hash from rnSha256', async () => {
    const hash = await sha256Hash('test');
    expect(hash).toBe('dummyhash');
  });

  it('generateCodeChallenge returns a base64 URL-safe string', async () => {
    const challenge = await generateCodeChallenge('testverifier');
    expect(typeof challenge).toBe('string');
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('redirectToSpotifyAuth sets code_verifier and opens URL', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    await redirectToSpotifyAuth();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('code_verifier', expect.any(String));
    expect(Linking.openURL).toHaveBeenCalled();
    const url = (Linking.openURL as jest.Mock).mock.calls[0][0];
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=dummy_client_id');
    expect(url).toContain('redirect_uri=dummy_redirect_uri');
  });

  it('getToken fetches token and stores tokens in AsyncStorage', async () => {
    const fakeResponse = {
      access_token: 'access123',
      expires_in: 3600,
      refresh_token: 'refresh123',
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dummy_token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeResponse),
    });
    const data = await getToken('sample_code');
    expect(global.fetch).toHaveBeenCalledWith('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: expect.any(String),
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('access_token', 'access123');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token_expiry', expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh123');
    expect(data).toEqual(fakeResponse);
  });

  it('refreshAccessToken fetches new token and stores it', async () => {
    const fakeResponse = {
      access_token: 'new_access',
      expires_in: 3600,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('old_refresh');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(fakeResponse),
    });
    const data = await refreshAccessToken();
    expect(global.fetch).toHaveBeenCalledWith('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: expect.any(String),
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('access_token', 'new_access');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token_expiry', expect.any(String));
    expect(data).toEqual(fakeResponse);
  });
});
