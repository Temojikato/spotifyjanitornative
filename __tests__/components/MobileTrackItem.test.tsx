import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import MobileTrackItem from '../../components/MobileTrackItem';

describe('MobileTrackItem', () => {
  const props = {
    id: '1',
    title: 'Test Song',
    artist: 'Test Artist',
    albumArt: 'http://example.com/album.png',
    onRemove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with title, artist, and album art', () => {
    const { getByAltText, getByText } = render(<MobileTrackItem {...props} />);
    expect(getByAltText('Test Song')).toBeInTheDocument();
    expect(getByText('Test Song')).toBeInTheDocument();
    expect(getByText('Test Artist')).toBeInTheDocument();
  });

  test('calls onRemove when swiped right beyond threshold', async () => {
    const { getByTestId, getByAltText } = render(<MobileTrackItem {...props} />);
    
    const containerDiv = getByTestId('container-div');
    expect(containerDiv).toBeTruthy();

    Object.defineProperty(containerDiv, 'offsetWidth', { configurable: true, value: 300 });

    const img = getByAltText(props.title);
    const motionDiv = img.closest('div');
    expect(motionDiv).toBeTruthy();

    fireEvent.touchStart(motionDiv!, { touches: [{ clientX: 0, clientY: 0 }] });
    fireEvent.touchMove(motionDiv!, { touches: [{ clientX: 200, clientY: 0 }] });
    fireEvent.touchEnd(motionDiv!, { changedTouches: [{ clientX: 200, clientY: 0 }] });

    await waitFor(() => {
      expect(props.onRemove).toHaveBeenCalledWith(props.id);
    });
  });

  test('does not call onRemove when swiped right below threshold', async () => {
    const { getByTestId, getByAltText } = render(<MobileTrackItem {...props} />);
    
    const containerDiv = getByTestId('container-div');
    expect(containerDiv).toBeTruthy();
    Object.defineProperty(containerDiv, 'offsetWidth', { configurable: true, value: 300 });

    const img = getByAltText(props.title);
    const motionDiv = img.closest('div');
    expect(motionDiv).toBeTruthy();

    fireEvent.touchStart(motionDiv!, { touches: [{ clientX: 0, clientY: 0 }] });
    fireEvent.touchMove(motionDiv!, { touches: [{ clientX: 1, clientY: 0 }] });
    fireEvent.touchEnd(motionDiv!, { changedTouches: [{ clientX: 1, clientY: 0 }] });

    await waitFor(() => {
      expect(props.onRemove).not.toHaveBeenCalled();
    });
  });
});
