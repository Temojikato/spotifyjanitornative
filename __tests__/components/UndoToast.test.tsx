import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UndoToast from '../../components/UndoToast';

describe('UndoToast', () => {
  test('renders the correct text with track title', () => {
    render(<UndoToast trackTitle="Test Song" onUndo={() => {}} />);
    expect(screen.getByText('Removed "Test Song"')).toBeInTheDocument();
  });

  test('calls onUndo and closeToast when button is clicked (both provided)', () => {
    const onUndoMock = jest.fn();
    const closeToastMock = jest.fn();
    render(
      <UndoToast
        trackTitle="Test Song"
        onUndo={onUndoMock}
        closeToast={closeToastMock}
      />
    );
    const button = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(button);
    expect(onUndoMock).toHaveBeenCalledTimes(1);
    expect(closeToastMock).toHaveBeenCalledTimes(1);
  });

  test('calls only onUndo when closeToast is not provided', () => {
    const onUndoMock = jest.fn();
    render(<UndoToast trackTitle="Test Song" onUndo={onUndoMock} />);
    const button = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(button);
    expect(onUndoMock).toHaveBeenCalledTimes(1);
  });
});
