import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UndoToast from '../../src/components/UndoToast';

describe('UndoToast', () => {
  it('renders correctly with given trackTitle', () => {
    const onUndo = jest.fn();
    const { getByText } = render(<UndoToast trackTitle="Test Song" onUndo={onUndo} />);
    expect(getByText('Removed "Test Song"')).toBeTruthy();
    expect(getByText('Undo')).toBeTruthy();
  });

  it('calls onUndo and closeToast when button is pressed', () => {
    const onUndo = jest.fn();
    const closeToast = jest.fn();
    const { getByText } = render(
      <UndoToast trackTitle="Test Song" onUndo={onUndo} closeToast={closeToast} />
    );
    fireEvent.press(getByText('Undo'));
    expect(onUndo).toHaveBeenCalled();
    expect(closeToast).toHaveBeenCalled();
  });

  it('calls only onUndo when closeToast is not provided', () => {
    const onUndo = jest.fn();
    const { getByText } = render(<UndoToast trackTitle="Test Song" onUndo={onUndo} />);
    fireEvent.press(getByText('Undo'));
    expect(onUndo).toHaveBeenCalled();
  });
});
