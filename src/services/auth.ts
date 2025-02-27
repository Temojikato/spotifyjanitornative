import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 as rnSha256 } from 'react-native-sha256';
import { Buffer } from 'buffer';
import Config from 'react-native-config';

export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(val => possible[val % possible.length])
    .join('');
};

export const sha256Hash = async (plain: string): Promise<string> => {
  return await rnSha256(plain);
};

const hexToBase64 = (hex: string): string => {
  const raw = hex
    .match(/.{1,2}/g)
    ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
    .join('') || '';
  return Buffer.from(raw, 'binary')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const hashedHex = await sha256Hash(codeVerifier);
  const codeChallenge = hexToBase64(hashedHex);
  console.log('[Auth] generateCodeChallenge:', {
    codeVerifier,
    hashedHex,
    codeChallenge,
  });
  return codeChallenge;
};

export const redirectToSpotifyAuth = async (): Promise<void> => {
  const clientId = Config.SPOTIFY_CLIENT_ID || '';
  const redirectUri =
    (Config.SPOTIFY_REDIRECT_URI && Config.SPOTIFY_REDIRECT_URI.trim()) ||
    'spotifyjanitor://callback';
  const scope = 'user-read-private user-read-email user-library-read user-library-modify';

  const codeVerifier = generateRandomString(64);
  await AsyncStorage.setItem('code_verifier', codeVerifier);
  console.log('[Auth] Stored code_verifier:', codeVerifier);

  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }).toString();

  const authUrl = `https://accounts.spotify.com/authorize?${params}`;
  console.log('[Auth] Opening auth URL:', authUrl);
  await Linking.openURL(authUrl);
};

export const getToken = async (code: string): Promise<any> => {
  console.log('[Auth] getToken called with code:', code);
  const codeVerifier = await AsyncStorage.getItem('code_verifier');
  console.log('[Auth] Retrieved code_verifier from storage:', codeVerifier);

  const clientId = Config.SPOTIFY_CLIENT_ID || '';
  const redirectUri =
    (Config.SPOTIFY_REDIRECT_URI && Config.SPOTIFY_REDIRECT_URI.trim()) ||
    'spotifyjanitor://callback';

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier || '',
  });

  console.log('[Auth] getToken -> Request body:', body.toString());

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await response.json();
  console.log('[Auth] getToken -> Response data:', data);

  await AsyncStorage.setItem('access_token', data.access_token || '');
  console.log('[Auth] Stored access_token:', data.access_token);

  if (data.expires_in) {
    const expiry = Date.now() + data.expires_in * 1000;
    await AsyncStorage.setItem('token_expiry', expiry.toString());
    console.log('[Auth] Stored token_expiry (ms):', expiry);
  }

  if (data.refresh_token) {
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    console.log('[Auth] Stored refresh_token:', data.refresh_token);
  }

  const storedAccess = await AsyncStorage.getItem('access_token');
  const storedExpiry = await AsyncStorage.getItem('token_expiry');
  const storedRefresh = await AsyncStorage.getItem('refresh_token');
  console.log('[Auth] Post-storage check:', {
    storedAccess,
    storedExpiry,
    storedRefresh,
  });

  return data;
};

export const refreshAccessToken = async (): Promise<any> => {
  console.log('[Auth] refreshAccessToken called');
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  console.log('[Auth] Current refresh_token:', refreshToken);

  if (!refreshToken) {
    console.log('[Auth] No refresh token available -> throw error');
    throw new Error('No refresh token available');
  }

  const clientId = Config.SPOTIFY_CLIENT_ID || '';
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  console.log('[Auth] refreshAccessToken -> Request body:', body.toString());

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  console.log('[Auth] refreshAccessToken -> response.ok?', response.ok);

  if (!response.ok) {
    console.log('[Auth] refresh token revoke/invalid, removing from storage.');
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('token_expiry');
    throw new Error('Refresh token revoked or invalid');
  }

  const data = await response.json();
  console.log('[Auth] refreshAccessToken -> data:', data);

  await AsyncStorage.setItem('access_token', data.access_token || '');
  console.log('[Auth] refreshAccessToken stored new access_token:', data.access_token);

  if (data.expires_in) {
    const expiry = Date.now() + data.expires_in * 1000;
    await AsyncStorage.setItem('token_expiry', expiry.toString());
    console.log('[Auth] refreshAccessToken stored new token_expiry:', expiry);
  }

  const storedAccess = await AsyncStorage.getItem('access_token');
  const storedExpiry = await AsyncStorage.getItem('token_expiry');
  const storedRefresh = await AsyncStorage.getItem('refresh_token');
  console.log('[Auth] Post-refresh check:', {
    storedAccess,
    storedExpiry,
    storedRefresh,
  });

  return data;
};

export const logout = async () => {
  console.log('[Auth] Logging out...');
  try {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('token_expiry');
  } catch (e) {
    console.error('Error clearing tokens on logout:', e);
  }
};

