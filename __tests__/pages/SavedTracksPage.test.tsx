import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SavedTracksPage from '../../pages/SavedTracksPage';
import { MemoryRouter } from 'react-router-dom';
import { getUserSavedTracks } from '../../services/spotifyApi';
import { toast } from 'react-toastify';

jest.mock('../../services/spotifyApi');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

const fakeTracksData = {
  items: [
    {
      track: {
        id: '1',
        name: 'Song One',
        artists: [{ name: 'Artist One' }],
        album: {
          name: 'Album One',
          images: [{ url: 'http://example.com/album1.png' }]
        },
        duration_ms: 210000,
        added_at: '2022-01-01T00:00:00Z'
      }
    },
    {
      track: {
        id: '2',
        name: 'Song Two',
        artists: [{ name: 'Artist Two' }],
        album: {
          name: 'Album Two',
          images: [{ url: 'http://example.com/album2.png' }]
        },
        duration_ms: 180000,
        added_at: '2022-01-02T00:00:00Z'
      }
    }
  ]
};

describe('SavedTracksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and renders saved tracks on mount', async () => {
    (getUserSavedTracks as jest.Mock).mockResolvedValue(fakeTracksData);
    render(
      <MemoryRouter>
        <SavedTracksPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });
  });

  test('filters tracks based on search query', async () => {
    (getUserSavedTracks as jest.Mock).mockResolvedValue(fakeTracksData);
    render(
      <MemoryRouter>
        <SavedTracksPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.getByText('Song Two')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('Search by title or artist') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'One' } });
    await waitFor(() => {
      expect(screen.getByText('Song One')).toBeInTheDocument();
      expect(screen.queryByText('Song Two')).not.toBeInTheDocument();
    });
  });

  test('opens AddSongModal when FAB is clicked', async () => {
    (getUserSavedTracks as jest.Mock).mockResolvedValue(fakeTracksData);
    render(
      <MemoryRouter>
        <SavedTracksPage />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Song One')).toBeInTheDocument());
    const fab = screen.getByLabelText('add');
    fireEvent.click(fab);
    await waitFor(() => {
      expect(screen.getByText('Add a Song')).toBeInTheDocument();
    });
  });

  test('displays toast error when fetching tracks fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (getUserSavedTracks as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    render(
      <MemoryRouter>
        <SavedTracksPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load saved tracks');
    });
  });
});
