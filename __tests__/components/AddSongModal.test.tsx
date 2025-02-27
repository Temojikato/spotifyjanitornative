import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddSongModal from '../../components/AddSongModal';
import { searchTracks, saveUserTrack } from '../../services/spotifyApi';
import { toast } from 'react-toastify';

jest.mock('../../services/spotifyApi');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const fakeSearchResult = {
  tracks: {
    items: [
      {
        id: '1',
        name: 'Test Song',
        artists: [{ name: 'Test Artist' }],
        album: {
          name: 'Test Album',
          images: [{ url: 'http://example.com/album.png' }]
        }
      }
    ]
  }
};

const formattedFakeTrack = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  albumArt: 'http://example.com/album.png',
  album: 'Test Album',
  addedAt: '',
  duration: ''
};

describe('AddSongModal', () => {
  const onClose = jest.fn();
  const onSongAdded = jest.fn();
  const existingTrackIds: string[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal with correct title and search input/button', () => {
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={existingTrackIds}
      />
    );
    expect(screen.getByRole('heading', { name: /add a song/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search for a song/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  test('updates input value when typed into', () => {
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={existingTrackIds}
      />
    );
    const input = screen.getByLabelText(/search for a song/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(input.value).toBe('Test');
  });

  test('calls searchTracks and displays results on Enter key press', async () => {
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={existingTrackIds}
      />
    );
    const input = screen.getByLabelText(/search for a song/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });
    expect(await screen.findByText(formattedFakeTrack.title)).toBeInTheDocument();
    expect(await screen.findByText(formattedFakeTrack.artist)).toBeInTheDocument();
  });

  test('calls searchTracks when search button is clicked', async () => {
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={existingTrackIds}
      />
    );
    const input = screen.getByLabelText(/search for a song/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });
    expect(await screen.findByText(formattedFakeTrack.title)).toBeInTheDocument();
  });

  test('calls saveUserTrack and onSongAdded when Add button is clicked for a new track', async () => {
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    (saveUserTrack as jest.Mock).mockResolvedValue(undefined);
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={[]}
      />
    );
    const input = screen.getByLabelText(/search for a song/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });

    const addButton = await screen.findByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(saveUserTrack).toHaveBeenCalledWith(formattedFakeTrack.id);
      expect(onSongAdded).toHaveBeenCalledWith(formattedFakeTrack);
    });
  });

  test('disables the Add button and shows "Saved" for already saved tracks', async () => {
    const existingIds = [formattedFakeTrack.id];
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={existingIds}
      />
    );
    const input = screen.getByLabelText(/search for a song/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });

    const savedButton = await screen.findByRole('button', { name: /saved/i });
    expect(savedButton).toBeDisabled();
  });

  test('calls onClose when Close button is clicked', () => {
    render(
      <AddSongModal
        open={true}
        onClose={onClose}
        onSongAdded={onSongAdded}
        existingTrackIds={[]}
      />
    );
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
