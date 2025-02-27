// auth.ts
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Remove expo-crypto import since we're not using Expo:
import { sha256 as rnSha256 } from 'react-native-sha256';
import { Buffer } from 'buffer';
// Optionally, if using react-native-config:
import Config from 'react-native-config';

/**
 * Generates a random alphanumeric string of the given length.
 * Assumes that react-native-get-random-values is initialized in your entry file.
 */
export const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  // Use the global crypto polyfill provided by react-native-get-random-values:
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(val => possible[val % possible.length])
    .join('');
};

/**
 * Computes the SHA-256 hash of the input string using react-native-sha256.
 * Returns a hexadecimal string.
 */
export const sha256Hash = async (plain: string): Promise<string> => {

  return await rnSha256(plain);
};

/**
 * Converts a hexadecimal string to a URL-safe Base64-encoded string.
 */
const hexToBase64 = (hex: string): string => {
  const raw = hex.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '';
  return Buffer.from(raw, 'binary')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Generates a code challenge from the given code verifier.
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const hashedHex = await sha256Hash(codeVerifier);
  return hexToBase64(hashedHex);
};

/**
 * Redirects the user to Spotify's authorization page.
 */
export const redirectToSpotifyAuth = async (): Promise<void> => {
  const clientId = Config.SPOTIFY_CLIENT_ID || ''; // Ensure your env variable is set correctly
  const redirectUri =
    (Config.SPOTIFY_REDIRECT_URI && Config.SPOTIFY_REDIRECT_URI.trim()) ||
    'spotifyjanitor://callback'; // Use your custom URL scheme

  const scope = 'user-read-private user-read-email user-library-read user-library-modify';
  const codeVerifier = generateRandomString(64);
  await AsyncStorage.setItem('code_verifier', codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Build query parameters as a string
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }).toString();

  // Construct the URL with the parameters included
  const authUrl = `https://accounts.spotify.com/authorize?${params}`;
  await Linking.openURL(authUrl);
};


/**
 * Exchanges an authorization code for tokens from Spotify.
 */
export const getToken = async (code: string): Promise<any> => {
  const codeVerifier = await AsyncStorage.getItem('code_verifier');
  const clientId = Config.SPOTIFY_CLIENT_ID;
  const redirectUri =
    (Config.SPOTIFY_REDIRECT_URI && Config.SPOTIFY_REDIRECT_URI.trim());
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier || '',
  });
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access_token);
  if (data.expires_in) {
    const expiry = Date.now() + data.expires_in * 1000;
    await AsyncStorage.setItem('token_expiry', expiry.toString());
  }
  if (data.refresh_token) {
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
  }
  return data;
};

/**
 * Refreshes the Spotify access token using the refresh token.
 */
export const refreshAccessToken = async (): Promise<any> => {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');
  const clientId = Config.SPOTIFY_CLIENT_ID || '';
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!response.ok) {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('token_expiry');
    throw new Error('Refresh token revoked or invalid');
  }
  const data = await response.json();
  await AsyncStorage.setItem('access_token', data.access_token);
  if (data.expires_in) {
    const expiry = Date.now() + data.expires_in * 1000;
    await AsyncStorage.setItem('token_expiry', expiry.toString());
  }
  return data;
};
