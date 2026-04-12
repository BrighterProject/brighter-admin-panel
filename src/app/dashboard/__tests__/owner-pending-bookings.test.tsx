import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OwnerPendingBookings } from '../components/owner-pending-bookings';
import type { Booking } from '@/app/bookings/types';

const mockMutate = vi.fn();

vi.mock('@/app/bookings/hooks', () => ({
  useUpdateBookingStatus: () => ({ mutate: mockMutate, isPending: false }),
}));

const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'b1',
  property_id: 'p1',
  property_owner_id: 'u1',
  user_id: 'u2',
  start_date: '2026-05-01T14:00:00',
  end_date: '2026-05-05T11:00:00',
  status: 'pending',
  price_per_night: '120.00',
  total_price: '480.00',
  currency: 'EUR',
  special_requests: null,
  updated_at: '2026-04-01T00:00:00',
  property_name: 'Планинска вила',
  customer_username: 'ivan',
  customer_full_name: 'Иван Иванов',
  guest_name: 'Иван Иванов',
  guest_email: 'ivan@example.com',
  guest_phone: '+359888000000',
  owner_username: 'owner',
  owner_full_name: null,
  ...overrides,
});

describe('OwnerPendingBookings', () => {
  it('shows empty state when no pending bookings', () => {
    render(<OwnerPendingBookings bookings={[]} loading={false} />);
    expect(screen.getByText(/няма чакащи|no pending/i)).toBeTruthy();
  });

  it('renders a card for each pending booking', () => {
    const bookings = [makeBooking({ id: 'b1' }), makeBooking({ id: 'b2', property_name: 'Морска стая' })];
    render(<OwnerPendingBookings bookings={bookings} loading={false} />);
    expect(screen.getByText('Планинска вила')).toBeTruthy();
    expect(screen.getByText('Морска стая')).toBeTruthy();
  });

  it('calls updateStatus with confirmed on Confirm click', async () => {
    render(<OwnerPendingBookings bookings={[makeBooking()]} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /потвърди|confirm/i }));
    await waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith(
        { id: 'b1', status: 'confirmed' },
        expect.anything(),
      ),
    );
  });

  it('calls updateStatus with cancelled on Decline click', async () => {
    render(<OwnerPendingBookings bookings={[makeBooking()]} loading={false} />);
    fireEvent.click(screen.getByRole('button', { name: /откажи|decline/i }));
    await waitFor(() =>
      expect(mockMutate).toHaveBeenCalledWith(
        { id: 'b1', status: 'cancelled' },
        expect.anything(),
      ),
    );
  });

  it('shows loading skeletons when loading', () => {
    const { container } = render(<OwnerPendingBookings bookings={[]} loading={true} />);
    expect(container.querySelectorAll('[data-testid="skeleton"]').length).toBeGreaterThan(0);
  });
});
