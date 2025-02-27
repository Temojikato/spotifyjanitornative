import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '../../components/Header';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { useMediaQuery } from '@mui/material';

jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn()
  };
});

const mockedNavigate = jest.fn();
const mockedLocation = { pathname: '/not-excluded' };

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => mockedLocation,
  };
});

describe('Header', () => {
  const mockedUseMediaQuery = useMediaQuery as jest.Mock;

  beforeEach(() => {
    localStorage.clear();
    mockedUseMediaQuery.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo, title, and profile avatar', () => {
    localStorage.setItem('profile_pic', 'http://example.com/avatar.png');
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByAltText('Spotify Logo')).toBeInTheDocument();
    expect(screen.getByText('Janitor')).toBeInTheDocument();
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'http://example.com/avatar.png');
  });

  test('falls back to default avatar when profile_pic is missing', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', '/default-avatar.png');
  });

  test('clicking on logo and title navigates to "/"', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByAltText('Spotify Logo'));
    expect(mockedNavigate).toHaveBeenCalledWith('/');
    fireEvent.click(screen.getByText('Janitor'));
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  test('opens menu on clicking profile avatar and handles logout', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByAltText('Profile'));
    const profileMenuItem = await screen.findByText('Profile');
    const logoutMenuItem = await screen.findByText('Logout');
    expect(profileMenuItem).toBeInTheDocument();
    expect(logoutMenuItem).toBeInTheDocument();
    fireEvent.click(logoutMenuItem);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('code_verifier')).toBeNull();
    expect(localStorage.getItem('profile_pic')).toBeNull();
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  test('renders back arrow on mobile and clicking it calls navigate(-1)', () => {
    mockedUseMediaQuery.mockReturnValue(true);
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton);
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
    
  });
});
