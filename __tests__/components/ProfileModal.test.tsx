import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileModal from '../../components/ProfileModal';

describe('ProfileModal', () => {
  const fakeProfile = {
    display_name: 'Test User',
    images: [{ url: 'http://example.com/profile.png' }],
    product: 'premium',
    country: 'US',
    email: 'test@example.com',
    id: 'user123',
    followers: { total: 123 },
    external_urls: { spotify: 'http://spotify.com/user123' }
  };

  afterEach(() => {
    localStorage.clear();
  });

  test('renders profile information when profile data is available', () => {
    localStorage.setItem('user_profile', JSON.stringify(fakeProfile));
    render(<ProfileModal open={true} onClose={() => {}} />);
    expect(screen.getByText(fakeProfile.display_name)).toBeInTheDocument();
    expect(screen.getByText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByText(fakeProfile.email)).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText(fakeProfile.product)).toBeInTheDocument();
    expect(screen.getByText(/Country:/i)).toBeInTheDocument();
    expect(screen.getByText(fakeProfile.country)).toBeInTheDocument();
    expect(screen.getByText(/Followers:/i)).toBeInTheDocument();
    expect(screen.getByText(String(fakeProfile.followers.total))).toBeInTheDocument();
    const viewLink = screen.getByRole('link', { name: /view on spotify/i });
    expect(viewLink).toHaveAttribute('href', fakeProfile.external_urls.spotify);
    const profileImg = screen.getByAltText(fakeProfile.display_name);
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute('src', fakeProfile.images[0].url);
  });

  test('renders error message when no profile data is found', () => {
    localStorage.removeItem('user_profile');
    render(<ProfileModal open={true} onClose={() => {}} />);
    expect(screen.getByText(/No profile data found\. Please log in again\./i)).toBeInTheDocument();
  });
});
