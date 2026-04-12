import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OwnerOccupancy, computeOccupancy } from '../components/owner-occupancy';
import type { Booking } from '@/app/bookings/types';
import type { PropertyListItem } from '@/app/properties/types';

const today = new Date();
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

const makeBooking = (startOffset: number, endOffset: number, status: Booking['status'] = 'confirmed'): Booking => ({
  id: `b-${startOffset}`,
  property_id: 'p1',
  property_owner_id: 'u1',
  user_id: 'u2',
  start_date: addDays(today, startOffset).toISOString(),
  end_date: addDays(today, endOffset).toISOString(),
  status,
  price_per_night: '100.00',
  total_price: `${(endOffset - startOffset) * 100}.00`,
  currency: 'EUR',
  special_requests: null,
  updated_at: today.toISOString(),
  property_name: 'Villa',
  customer_username: 'guest',
  customer_full_name: null,
  guest_name: 'Guest',
  guest_email: 'g@e.com',
  guest_phone: '+1',
  owner_username: null,
  owner_full_name: null,
});

const makeProperty = (id = 'p1', name = 'Villa'): PropertyListItem => ({
  id,
  owner_id: 'u1',
  property_type: 'villa',
  status: 'active',
  city: 'Sofia',
  name,
  description: '',
  price_per_night: '100.00',
  currency: 'EUR',
  max_guests: 4,
  bedrooms: 2,
  rooms: [],
  rating: '0.00',
  total_reviews: 0,
  thumbnail: null,
});

describe('computeOccupancy', () => {
  it('returns 0 when no bookings', () => {
    expect(computeOccupancy([], 'p1')).toBe(0);
  });

  it('counts confirmed bookings covering 5 days as ~17%', () => {
    const b = makeBooking(0, 5, 'confirmed');
    expect(computeOccupancy([b], 'p1')).toBe(17); // 5/30 ≈ 16.7 → 17
  });

  it('ignores pending bookings', () => {
    const b = makeBooking(0, 30, 'pending');
    expect(computeOccupancy([b], 'p1')).toBe(0);
  });

  it('ignores bookings for other properties', () => {
    const b = makeBooking(0, 30, 'confirmed');
    expect(computeOccupancy([b], 'p2')).toBe(0);
  });

  it('caps at 100% for fully booked property', () => {
    const b = makeBooking(0, 30, 'confirmed');
    expect(computeOccupancy([b], 'p1')).toBe(100);
  });
});

describe('OwnerOccupancy', () => {
  it('renders a progress bar per property', () => {
    const properties = [makeProperty('p1', 'Villa'), makeProperty('p2', 'Cabin')];
    const bookings = [makeBooking(0, 10, 'confirmed')];
    render(<OwnerOccupancy properties={properties} bookings={bookings} loading={false} />);
    expect(screen.getByText('Villa')).toBeTruthy();
    expect(screen.getByText('Cabin')).toBeTruthy();
  });

  it('shows 33% for 10-day booking out of 30', () => {
    const properties = [makeProperty('p1', 'Villa')];
    const bookings = [makeBooking(0, 10, 'confirmed')];
    render(<OwnerOccupancy properties={properties} bookings={bookings} loading={false} />);
    expect(screen.getByText('33%')).toBeTruthy();
  });
});
