import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import SavedTracksPage from '../../src/screens/SavedTracksPage';
import { getUserSavedTracks, removeUserSavedTrack, saveUserTrack } from '../../src/services/spotifyApi';
import Toast from 'react-native-toast-message';

jest.mock('../../src/services/spotifyApi', () => ({
  getUserSavedTracks: jest.fn(),
  removeUserSavedTrack: jest.fn(),
  saveUserTrack: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('../../src/components/Layout', () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

jest.mock('../../src/components/MobileTrackItem', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');
  return ({ id, title, onRemove }: any) => (
    <View testID={`mobile-track-${id}`}>
      <Text>{title}</Text>
      <TouchableOpacity onPress={() => onRemove(id)}>
        <Text>Remove</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock('../../src/components/AddSongModal', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return ({ open }: any) => (open ? <View><Text>AddSongModal</Text></View> : null);
});

describe('SavedTracksPage', () => {
  const sampleData = {
    items: [
      {
        added_at: '2021-01-01T00:00:00Z',
        track: {
          id: '1',
          name: 'Song One',
          artists: [{ name: 'Artist One' }],
          album: {
            name: 'Album One',
            images: [{ url: 'http://example.com/art1.jpg' }],
          },
          duration_ms: 180000,
        },
      },
      {
        added_at: '2021-01-02T00:00:00Z',
        track: {
          id: '2',
          name: 'Song Two',
          artists: [{ name: 'Artist Two' }],
          album: {
            name: 'Album Two',
            images: [{ url: 'http://example.com/art2.jpg' }],
          },
          duration_ms: 200000,
        },
      },
    ],
  };

  beforeEach(() => {
    (getUserSavedTracks as jest.Mock).mockResolvedValue(sampleData);
    (removeUserSavedTrack as jest.Mock).mockResolvedValue(undefined);
    (saveUserTrack as jest.Mock).mockResolvedValue(undefined);
    (Toast.show as jest.Mock).mockClear();
  });

  it('fetches and displays saved tracks', async () => {
    const { getByText } = render(<SavedTracksPage />);
    await waitFor(() => {
      expect(getUserSavedTracks).toHaveBeenCalledWith(true);
      expect(getByText('Saved Tracks')).toBeTruthy();
      expect(getByText('Song One')).toBeTruthy();
      expect(getByText('Song Two')).toBeTruthy();
    });
  });

  it('filters tracks based on search query', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<SavedTracksPage />);
    await waitFor(() => {
      expect(getUserSavedTracks).toHaveBeenCalled();
    });
    const searchInput = getByPlaceholderText('Search by title or artist');
    fireEvent.changeText(searchInput, 'One');
    await waitFor(() => {
      expect(getByText('Song One')).toBeTruthy();
      expect(queryByText('Song Two')).toBeNull();
    });
  });

  it('removes a track and shows undo toast', async () => {
    const { getByTestId } = render(<SavedTracksPage />);
    await waitFor(() => {
      expect(getUserSavedTracks).toHaveBeenCalled();
    });
    const trackItem = getByTestId('mobile-track-1');
    const { getByText } = within(trackItem);
    const removeButton = getByText('Remove');
    fireEvent.press(removeButton);
    await waitFor(() => {
      expect(removeUserSavedTrack).toHaveBeenCalledWith('1');
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'undo',
          props: expect.objectContaining({
            trackTitle: 'Song One',
          }),
        })
      );
    });
  });

  it('opens AddSongModal when FAB is pressed', async () => {
    const { getByText, queryByText } = render(<SavedTracksPage />);
    await waitFor(() => {
      expect(getUserSavedTracks).toHaveBeenCalled();
    });
    expect(queryByText('AddSongModal')).toBeNull();
    const fab = getByText('+');
    fireEvent.press(fab);
    await waitFor(() => {
      expect(getByText('AddSongModal')).toBeTruthy();
    });
  });
});
