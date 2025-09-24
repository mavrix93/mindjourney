import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import EmojiPicker from '../EmojiPicker';

describe('EmojiPicker', () => {
  it('renders with default emoji', () => {
    const mockOnEmojiSelect = jest.fn();
    render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);
    
    expect(screen.getByText('🙂')).toBeInTheDocument();
  });

  it('renders with custom selected emoji', () => {
    const mockOnEmojiSelect = jest.fn();
    render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} selectedEmoji="😀" />);
    
    expect(screen.getByText('😀')).toBeInTheDocument();
  });

  it('opens picker when clicked', () => {
    const mockOnEmojiSelect = jest.fn();
    render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);
    
    const button = screen.getByText('🙂');
    fireEvent.click(button);
    
    expect(screen.getByText('Faces')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
  });

  it('calls onEmojiSelect when emoji is clicked', () => {
    const mockOnEmojiSelect = jest.fn();
    render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);
    
    const button = screen.getByText('🙂');
    fireEvent.click(button);
    
    const emojiButton = screen.getByText('😀');
    fireEvent.click(emojiButton);
    
    expect(mockOnEmojiSelect).toHaveBeenCalledWith('😀');
  });

  it('switches categories when tab is clicked', () => {
    const mockOnEmojiSelect = jest.fn();
    render(<EmojiPicker onEmojiSelect={mockOnEmojiSelect} />);
    
    const button = screen.getByText('🙂');
    fireEvent.click(button);
    
    const peopleTab = screen.getByText('People');
    fireEvent.click(peopleTab);
    
    // Check if people emojis are visible (like baby emoji)
    expect(screen.getByText('👶')).toBeInTheDocument();
  });
});
