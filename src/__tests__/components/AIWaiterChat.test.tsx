// ✨ Refactored by Cursor – Audit Phase 4: Comprehensive Test Suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AIWaiterChat from '@/components/AIWaiterChat';
import { useMaltaAIChat } from '@/hooks/useMaltaAIChat';
import type { MenuItem } from '@/types/api';

// Mock the hook
vi.mock('@/hooks/useMaltaAIChat');

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('AIWaiterChat', () => {
  const mockUseMaltaAIChat = useMaltaAIChat as vi.MockedFunction<typeof useMaltaAIChat>;
  
  const defaultProps = {
    vendorId: 'vendor-123',
    vendorName: 'Test Restaurant',
    guestSessionId: 'session-456',
    onAddToCart: vi.fn(),
    onClose: vi.fn()
  };

  const mockChatReturn = {
    messages: [],
    isLoading: false,
    isConnected: true,
    error: null,
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
    reconnect: vi.fn(),
    refreshHistory: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMaltaAIChat.mockReturnValue(mockChatReturn);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the chat interface correctly', () => {
      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText('AI Waiter - Test Restaurant')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/ask about our menu/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('shows loading state when chat is loading', () => {
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        isLoading: true
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows error state when there is an error', () => {
      const errorMessage = 'Connection failed';
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        error: errorMessage
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('shows disconnected state when not connected', () => {
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        isConnected: false
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('displays chat messages correctly', () => {
      const messages = [
        {
          id: '1',
          content: 'Hello! How can I help you today?',
          type: 'ai' as const,
          timestamp: '2024-01-01T10:00:00Z'
        },
        {
          id: '2', 
          content: 'What are your specials?',
          type: 'user' as const,
          timestamp: '2024-01-01T10:01:00Z'
        }
      ];

      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        messages
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
      expect(screen.getByText('What are your specials?')).toBeInTheDocument();
    });

    it('displays AI suggestions when available', () => {
      const messages = [
        {
          id: '1',
          content: 'I recommend our pasta dishes!',
          type: 'ai' as const,
          timestamp: '2024-01-01T10:00:00Z',
          suggestions: [
            {
              type: 'menu_item',
              item_id: 'item-1',
              title: 'Carbonara',
              description: 'Classic Roman pasta',
              price: 15.99
            }
          ]
        }
      ];

      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        messages
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText('Carbonara')).toBeInTheDocument();
      expect(screen.getByText('Classic Roman pasta')).toBeInTheDocument();
      expect(screen.getByText('€15.99')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('sends message when form is submitted', async () => {
      const sendMessage = vi.fn();
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        sendMessage
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/ask about our menu/i);
      const submitButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: 'What are your specials?' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(sendMessage).toHaveBeenCalledWith('What are your specials?');
      });
    });

    it('prevents sending empty messages', async () => {
      const sendMessage = vi.fn();
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        sendMessage
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/ask about our menu/i);
      const submitButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('handles keyboard submit (Enter key)', async () => {
      const sendMessage = vi.fn();
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        sendMessage
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/ask about our menu/i);

      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(sendMessage).toHaveBeenCalledWith('Hello');
      });
    });

    it('does not submit on Shift+Enter', async () => {
      const sendMessage = vi.fn();
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        sendMessage
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/ask about our menu/i);

      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('calls onAddToCart when suggestion is clicked', async () => {
      const onAddToCart = vi.fn();
      const messages = [
        {
          id: '1',
          content: 'I recommend our pasta dishes!',
          type: 'ai' as const,
          timestamp: '2024-01-01T10:00:00Z',
          suggestions: [
            {
              type: 'menu_item',
              item_id: 'item-1',
              title: 'Carbonara',
              description: 'Classic Roman pasta',
              price: 15.99
            }
          ]
        }
      ];

      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        messages
      });

      render(<AIWaiterChat {...defaultProps} onAddToCart={onAddToCart} />);
      
      const addButton = screen.getByRole('button', { name: /add carbonara/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({
          id: 'item-1',
          name: 'Carbonara',
          price: 15.99
        }));
      });
    });

    it('clears chat when clear button is clicked', async () => {
      const clearChat = vi.fn();
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        clearChat,
        messages: [
          {
            id: '1',
            content: 'Hello!',
            type: 'ai' as const,
            timestamp: '2024-01-01T10:00:00Z'
          }
        ]
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const clearButton = screen.getByRole('button', { name: /clear chat/i });
      fireEvent.click(clearButton);

      expect(clearChat).toHaveBeenCalled();
    });

    it('reconnects when reconnect button is clicked', async () => {
      const reconnect = vi.fn();
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        reconnect,
        error: 'Connection failed'
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const reconnectButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(reconnectButton);

      expect(reconnect).toHaveBeenCalled();
    });

    it('closes chat when close button is clicked', () => {
      const onClose = vi.fn();

      render(<AIWaiterChat {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const sendMessage = vi.fn().mockRejectedValue(new Error('Network error'));
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        sendMessage,
        error: 'Network error'
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('shows appropriate loading states during message sending', async () => {
      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        isLoading: true
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/ask about our menu/i);
      const submitButton = screen.getByRole('button', { name: /send/i });

      expect(input).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByLabelText(/chat messages/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message input/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<AIWaiterChat {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/ask about our menu/i);
      const submitButton = screen.getByRole('button', { name: /send/i });

      // Tab navigation should work
      input.focus();
      expect(document.activeElement).toBe(input);

      fireEvent.keyDown(input, { key: 'Tab' });
      expect(document.activeElement).toBe(submitButton);
    });

    it('announces new messages to screen readers', async () => {
      const messages = [
        {
          id: '1',
          content: 'New AI response',
          type: 'ai' as const,
          timestamp: '2024-01-01T10:00:00Z'
        }
      ];

      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        messages
      });

      render(<AIWaiterChat {...defaultProps} />);
      
      const liveRegion = screen.getByLabelText(/new message/i);
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Integration Tests', () => {
    it('integrates with menu item suggestions correctly', async () => {
      const onAddToCart = vi.fn();
      const mockMenuItem: MenuItem = {
        id: 'item-1',
        menu_id: 'menu-1',
        name: 'Carbonara',
        description: 'Classic Roman pasta with eggs and cheese',
        price: 15.99,
        available: true,
        popular: true,
        featured: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const messages = [
        {
          id: '1',
          content: 'I recommend our Carbonara!',
          type: 'ai' as const,
          timestamp: '2024-01-01T10:00:00Z',
          suggestions: [
            {
              type: 'menu_item',
              item_id: mockMenuItem.id,
              title: mockMenuItem.name,
              description: mockMenuItem.description || '',
              price: mockMenuItem.price
            }
          ]
        }
      ];

      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        messages
      });

      render(<AIWaiterChat {...defaultProps} onAddToCart={onAddToCart} />);
      
      const addButton = screen.getByRole('button', { name: /add carbonara/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(onAddToCart).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockMenuItem.id,
            name: mockMenuItem.name,
            price: mockMenuItem.price
          })
        );
      });
    });

    it('maintains chat state across re-renders', () => {
      const messages = [
        {
          id: '1',
          content: 'Hello!',
          type: 'ai' as const,
          timestamp: '2024-01-01T10:00:00Z'
        }
      ];

      mockUseMaltaAIChat.mockReturnValue({
        ...mockChatReturn,
        messages
      });

      const { rerender } = render(<AIWaiterChat {...defaultProps} />);
      
      expect(screen.getByText('Hello!')).toBeInTheDocument();

      // Re-render with updated props
      rerender(<AIWaiterChat {...defaultProps} vendorName="Updated Restaurant" />);
      
      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('AI Waiter - Updated Restaurant')).toBeInTheDocument();
    });
  });
}); 