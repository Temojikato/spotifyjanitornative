import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ProtectedRoute from '../../src/components/ProtectedRoute';

jest.mock('../../src/services/auth', () => ({
  ...jest.requireActual('../../src/services/auth'),
  refreshAccessToken: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
  };
});

describe('ProtectedRoute', () => {
  let appStateCallback: ((state: AppStateStatus) => void) | undefined;
  const mockNavigationReplace = jest.fn();

  const TestChild = () => <></>;

  beforeAll(() => {
    jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'change') {
        appStateCallback = listener;
      }
      return { remove: jest.fn() };
    });
  });

  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => 1_000_000);

    (useNavigation as jest.Mock).mockReturnValue({
      replace: mockNavigationReplace,
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('re-checks auth when AppState changes to active', async () => {
    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockNavigationReplace).toHaveBeenCalledWith('Login');
    });

    mockNavigationReplace.mockClear();

    await AsyncStorage.setItem('access_token', 'VALID_LATE_TOKEN');
    await AsyncStorage.setItem('token_expiry', `${1_000_000 + 2000}`);

    act(() => {
      appStateCallback?.('active');
    });

    await waitFor(() => {
      expect(mockNavigationReplace).not.toHaveBeenCalled();
    });
  });
});
