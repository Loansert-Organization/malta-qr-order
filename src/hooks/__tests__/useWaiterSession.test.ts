import { renderHook, act } from '@testing-library/react-hooks';
import { useWaiterSession } from '../useWaiterSession';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
    auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: [{ id: 'new-session-id' }], error: null }),
      select: jest.fn().mockResolvedValue({ data: [{ id: 'new-session-id' }], error: null }),
    })),
  },
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('useWaiterSession', () => {
  beforeEach(() => {
    // Clear mock history before each test
    (mockedSupabase.functions.invoke as jest.Mock).mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWaiterSession('test-bar-id'));
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.typing).toBe(false);
    expect(result.current.sessionId).not.toBeNull();
  });

  it('should send a message and receive a reply', async () => {
    const mockReply = { reply: 'Hello from the AI!', session_id: 'test-session-id' };
    (mockedSupabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: mockReply,
      error: null,
    });

    const { result, waitForNextUpdate } = renderHook(() => useWaiterSession('test-bar-id'));
    
    await act(async () => {
      result.current.sendMessage('Hello');
      await waitForNextUpdate(); // Wait for the state update after sending
      await waitForNextUpdate(); // Wait for the state update after receiving
    });

    expect(mockedSupabase.functions.invoke).toHaveBeenCalledWith('ai_waiter_chat', {
      body: {
        bar_id: 'test-bar-id',
        message: 'Hello',
        session_id: result.current.sessionId,
      },
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Hello' });
    expect(result.current.messages[1]).toEqual({ role: 'assistant', content: mockReply.reply });
    expect(result.current.loading).toBe(false);
    expect(result.current.typing).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    (mockedSupabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('API Error'),
    });

    const { result, waitForNextUpdate } = renderHook(() => useWaiterSession('test-bar-id'));
    
    await act(async () => {
      result.current.sendMessage('test');
      await waitForNextUpdate(); // For the initial send
    });
    
    // No new message from assistant should be added
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.typing).toBe(false);
  });
}); 