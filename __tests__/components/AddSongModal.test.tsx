import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddSongModal from '../../src/components/AddSongModal';
import { searchTracks, saveUserTrack } from '../../src/services/spotifyApi';
import Toast from 'react-native-toast-message';

jest.mock('../../src/services/spotifyApi');
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('AddSongModal', () => {
  const onCloseMock = jest.fn();
  const onSongAddedMock = jest.fn();
  const existingTrackIds = ['123'];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open is true', () => {
    const { getByText } = render(
      <AddSongModal
        open={true}
        onClose={onCloseMock}
        onSongAdded={onSongAddedMock}
        existingTrackIds={existingTrackIds}
      />
    );
    expect(getByText('Add a Song')).toBeTruthy();
  });

  it('calls onClose when the Close button is pressed', () => {
    const { getByText } = render(
      <AddSongModal
        open={true}
        onClose={onCloseMock}
        onSongAdded={onSongAddedMock}
        existingTrackIds={existingTrackIds}
      />
    );
    const closeButton = getByText('Close');
    fireEvent.press(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('searches tracks and displays results', async () => {
    const mockResponse = {
      tracks: {
        items: [
          {
            id: '1',
            name: 'Song One',
            artists: [{ name: 'Artist One' }],
            album: {
              images: [{ url: 'http://example.com/art1.jpg' }],
              name: 'Album One',
            },
          },
          {
            id: '2',
            name: 'Song Two',
            artists: [{ name: 'Artist Two' }],
            album: {
              images: [{ url: 'http://example.com/art2.jpg' }],
              name: 'Album Two',
            },
          },
        ],
      },
    };

    (searchTracks as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByPlaceholderText, getByText } = render(
      <AddSongModal
        open={true}
        onClose={onCloseMock}
        onSongAdded={onSongAddedMock}
        existingTrackIds={existingTrackIds}
      />
    );

    const input = getByPlaceholderText('Search for a song');
    fireEvent.changeText(input, 'Song');
    fireEvent(input, 'submitEditing');

    await waitFor(() => expect(searchTracks).toHaveBeenCalledWith('Song'));
    expect(getByText('Song One')).toBeTruthy();
    expect(getByText('Artist One')).toBeTruthy();
    expect(getByText('Song Two')).toBeTruthy();
    expect(getByText('Artist Two')).toBeTruthy();
  });

  it('adds a track successfully', async () => {
    const mockResponse = {
      tracks: {
        items: [
          {
            id: '3',
            name: 'Song Three',
            artists: [{ name: 'Artist Three' }],
            album: {
              images: [{ url: 'http://example.com/art3.jpg' }],
              name: 'Album Three',
            },
          },
        ],
      },
    };

    (searchTracks as jest.Mock).mockResolvedValueOnce(mockResponse);
    (saveUserTrack as jest.Mock).mockResolvedValueOnce({});

    const { getByPlaceholderText, getByText } = render(
      <AddSongModal
        open={true}
        onClose={onCloseMock}
        onSongAdded={onSongAddedMock}
        existingTrackIds={[]}
      />
    );

    const input = getByPlaceholderText('Search for a song');
    fireEvent.changeText(input, 'Song');
    fireEvent.press(getByText('Search'));

    await waitFor(() => expect(searchTracks).toHaveBeenCalledWith('Song'));

    const addButton = getByText('Add');
    fireEvent.press(addButton);

    await waitFor(() => expect(saveUserTrack).toHaveBeenCalledWith('3'));

    expect(onSongAddedMock).toHaveBeenCalledWith({
      id: '3',
      title: 'Song Three',
      artist: 'Artist Three',
      albumArt: 'http://example.com/art3.jpg',
      album: 'Album Three',
      addedAt: '',
      duration: '',
    });

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Added "Song Three"',
    });
  });

  it('disables the Add button if track is already saved', async () => {
    const mockResponse = {
      tracks: {
        items: [
          {
            id: '123',
            name: 'Saved Song',
            artists: [{ name: 'Saved Artist' }],
            album: {
              images: [{ url: 'http://example.com/saved.jpg' }],
              name: 'Saved Album',
            },
          },
        ],
      },
    };

    (searchTracks as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { getByPlaceholderText, getByText } = render(
      <AddSongModal
        open={true}
        onClose={onCloseMock}
        onSongAdded={onSongAddedMock}
        existingTrackIds={['123']}
      />
    );

    const input = getByPlaceholderText('Search for a song');
    fireEvent.changeText(input, 'Saved');
    fireEvent.press(getByText('Search'));

    await waitFor(() => expect(searchTracks).toHaveBeenCalledWith('Saved'));

    const disabledButton = getByText('Saved');
    expect(disabledButton).toBeTruthy();
  });
});
