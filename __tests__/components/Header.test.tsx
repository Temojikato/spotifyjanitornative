import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Header from '../../src/components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: mockNavigate,
      canGoBack: mockCanGoBack,
    }),
    useRoute: jest.fn(),
  };
});

jest.mock('../../src/components/ProfileModal', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ open }: { open: boolean }) => (open ? <Text>Profile Modal Open</Text> : null);
});

describe('Header', () => {
  beforeEach(() => {
    (useRoute as jest.Mock).mockReturnValue({ name: 'Home' });
    (AsyncStorage.getItem as jest.Mock).mockReset();
    mockGoBack.mockReset();
    mockNavigate.mockReset();
    mockCanGoBack.mockReset();
  });

  it('renders without avatar when not logged in', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    (useRoute as jest.Mock).mockReturnValue({ name: 'Home' });
    mockCanGoBack.mockReturnValue(false);
    const { getByText } = render(<Header />);
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    const janitorText = getByText('Janitor');
    expect(janitorText).toBeTruthy();
  });
  it('renders avatar when logged in and opens modal on avatar press', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('dummy_token')
      .mockResolvedValueOnce('http://example.com/profile.jpg');
    (useRoute as jest.Mock).mockReturnValue({ name: 'Home' });
    mockCanGoBack.mockReturnValue(false);
    const { UNSAFE_getAllByType, queryByText } = render(<Header />);
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    const images = UNSAFE_getAllByType(Image);
    expect(images.length).toBeGreaterThan(1);
    expect(queryByText('Profile Modal Open')).toBeNull();
    fireEvent.press(images[1]);
    await waitFor(() => expect(queryByText('Profile Modal Open')).toBeTruthy());
  });

  it('shows back arrow when route is not excluded and can go back', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    (useRoute as jest.Mock).mockReturnValue({ name: 'Details' });
    mockCanGoBack.mockReturnValue(true);
    const { getByText } = render(<Header />);
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    const backArrow = getByText('<');
    expect(backArrow).toBeTruthy();
    fireEvent.press(backArrow);
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('navigates to Home when title container is pressed', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    (useRoute as jest.Mock).mockReturnValue({ name: 'Details' });
    mockCanGoBack.mockReturnValue(false);
    const { getByText } = render(<Header />);
    await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalled());
    const titleText = getByText('Janitor');
    fireEvent.press(titleText);
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });
});
