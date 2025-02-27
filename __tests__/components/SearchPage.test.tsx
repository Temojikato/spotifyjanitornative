import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchPage from '../../components/SearchModal';
import { searchTracks, saveUserTrack } from '../../services/spotifyApi';
import '@testing-library/jest-dom';

jest.mock('../../services/spotifyApi');

const fakeSearchResult = {
  tracks: {
    items: [
      {
        id: '1',
        name: 'Song One',
        artists: [{ name: 'Artist One' }],
        album: {
          images: [{ url: 'http://example.com/album1.png' }]
        }
      },
      {
        id: '2',
        name: 'Song Two',
        artists: [{ name: 'Artist Two' }],
        album: {
          images: [{ url: 'http://example.com/album2.png' }]
        }
      }
    ]
  }
};

describe('SearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header, input and search button', () => {
    render(<SearchPage />);
    expect(screen.getByText(/search spotify library/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search by title or artist/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  test('updates input value when typed into', () => {
    render(<SearchPage />);
    const input = screen.getByPlaceholderText(/search by title or artist/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test Query' } });
    expect(input.value).toBe('Test Query');
  });

  test('calls searchTracks and displays results on search button click', async () => {
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    render(<SearchPage />);
    const input = screen.getByPlaceholderText(/search by title or artist/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });
    expect(await screen.findByText('Song One')).toBeInTheDocument();
    expect(await screen.findByText('Artist One')).toBeInTheDocument();
    expect(await screen.findByText('Song Two')).toBeInTheDocument();
  });

  test('displays error message when searchTracks fails', async () => {
    (searchTracks as jest.Mock).mockRejectedValue(new Error('Search error'));
    render(<SearchPage />);
    const input = screen.getByPlaceholderText(/search by title or artist/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getByText(/search failed, please try again\./i)).toBeInTheDocument();
    });
  });

  test('calls saveUserTrack and displays success message when Favorite button is clicked', async () => {
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    (saveUserTrack as jest.Mock).mockResolvedValue(undefined);
    render(<SearchPage />);
    const input = screen.getByPlaceholderText(/search by title or artist/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });

    const favoriteButtons = await screen.findAllByRole('button', { name: /favorite/i });
    expect(favoriteButtons.length).toBeGreaterThan(0);
    fireEvent.click(favoriteButtons[0]);
    await waitFor(() => {
      expect(saveUserTrack).toHaveBeenCalledWith('1');
      expect(screen.getByText(/track saved to your favorites!/i)).toBeInTheDocument();
    });
  });

  test('displays error message when saveUserTrack fails on favorite', async () => {
    (searchTracks as jest.Mock).mockResolvedValue(fakeSearchResult);
    (saveUserTrack as jest.Mock).mockRejectedValue(new Error('Save error'));
    render(<SearchPage />);
    const input = screen.getByPlaceholderText(/search by title or artist/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(searchTracks).toHaveBeenCalledWith('Test');
    });
    const favoriteButtons = await screen.findAllByRole('button', { name: /favorite/i });
    expect(favoriteButtons.length).toBeGreaterThan(0);
    fireEvent.click(favoriteButtons[0]);
    await waitFor(() => {
      expect(screen.getByText(/failed to save track\./i)).toBeInTheDocument();
    });
  });
});
