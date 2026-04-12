import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentsSettings from '../page';

vi.mock('@/components/layouts/base-layout', () => ({
  BaseLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('../hooks', () => ({
  useStripeStatus: vi.fn(),
  useStripeConnect: () => ({ mutate: mockConnect, isPending: false }),
  useStripeDisconnect: () => ({ mutate: mockDisconnect, isPending: false }),
}));

const { useStripeStatus } = await import('../hooks');

describe('PaymentsSettings', () => {
  it('shows not-connected state with Connect button', () => {
    vi.mocked(useStripeStatus).mockReturnValue({
      data: { connected: false, verified: false, stripeAccountId: null },
      isLoading: false,
    } as any);
    render(<PaymentsSettings />);
    expect(screen.getByRole('button', { name: /connect.*stripe|свържи.*stripe/i })).toBeTruthy();
    expect(screen.getByText(/how it works|как работи/i)).toBeTruthy();
  });

  it('shows pending-verification state', () => {
    vi.mocked(useStripeStatus).mockReturnValue({
      data: { connected: true, verified: false, stripeAccountId: 'acct_abc123' },
      isLoading: false,
    } as any);
    render(<PaymentsSettings />);
    expect(screen.getByText('acct_abc123')).toBeTruthy();
    expect(screen.getAllByText(/verification|верификация/i).length).toBeGreaterThan(0);
  });

  it('shows active state with Disconnect button', () => {
    vi.mocked(useStripeStatus).mockReturnValue({
      data: { connected: true, verified: true, stripeAccountId: 'acct_abc123' },
      isLoading: false,
    } as any);
    render(<PaymentsSettings />);
    expect(screen.getByRole('button', { name: /disconnect|прекъсни/i })).toBeTruthy();
    expect(screen.getByText(/manage on stripe|управление в stripe/i)).toBeTruthy();
  });

  it('shows disconnect confirmation dialog then calls mutate', async () => {
    vi.mocked(useStripeStatus).mockReturnValue({
      data: { connected: true, verified: true, stripeAccountId: 'acct_abc123' },
      isLoading: false,
    } as any);
    render(<PaymentsSettings />);
    fireEvent.click(screen.getByRole('button', { name: /disconnect|прекъсни/i }));
    const confirmBtn = screen.getByRole('button', { name: /да.*прекъсни|yes.*disconnect/i });
    fireEvent.click(confirmBtn);
    await waitFor(() => expect(mockDisconnect).toHaveBeenCalled());
  });

  it('shows loading skeleton when data is loading', () => {
    vi.mocked(useStripeStatus).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    const { container } = render(<PaymentsSettings />);
    expect(container.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
  });
});
