import { generateRandomString, base64encode, generateCodeChallenge, sha256 } from '../../services/auth';

test('generateRandomString returns string of requested length', () => {
  const length = 64;
  const str = generateRandomString(length);
  expect(typeof str).toBe('string');
  expect(str.length).toBe(length);
});

test('base64encode produces expected output for known input', async () => {
  const input = new Uint8Array([104, 101, 108, 108, 111]).buffer;
  const encoded = base64encode(input);
  expect(encoded).toBe('aGVsbG8');
});

test('generateCodeChallenge produces a non-empty string', async () => {
  const verifier = 'teststring';
  const challenge = await generateCodeChallenge(verifier);
  expect(typeof challenge).toBe('string');
  expect(challenge.length).toBeGreaterThan(0);
});
