import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OwnerStatusBanner } from '../components/owner-status-banner';

// Mock react-router-dom Link
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const OWNER_SCOPES = ['properties:me', 'properties:write'];

beforeEach(() => {
  localStorage.clear();
});

describe('OwnerStatusBanner', () => {
  it('renders newly_escalated state when owner_welcomed not set', () => {
    render(<OwnerStatusBanner scopes={OWNER_SCOPES} stripeConnected={false} />);
    expect(screen.getByText(/активиран като собственик/i)).toBeTruthy();
  });

  it('shows no_stripe state after owner_welcomed is set', () => {
    localStorage.setItem('owner_welcomed', '1');
    render(<OwnerStatusBanner scopes={OWNER_SCOPES} stripeConnected={false} />);
    expect(screen.getByText(/stripe/i)).toBeTruthy();
  });

  it('renders nothing when stripe connected and owner_welcomed set', () => {
    localStorage.setItem('owner_welcomed', '1');
    const { container } = render(
      <OwnerStatusBanner scopes={OWNER_SCOPES} stripeConnected={true} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('sets owner_welcomed on dismiss of newly_escalated banner', () => {
    render(<OwnerStatusBanner scopes={OWNER_SCOPES} stripeConnected={false} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss|затвори|close/i }));
    expect(localStorage.getItem('owner_welcomed')).toBe('1');
  });

  it('renders nothing for admin scopes', () => {
    const { container } = render(
      <OwnerStatusBanner scopes={['admin:users', 'admin:properties']} stripeConnected={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pending state when no owner scopes', () => {
    render(<OwnerStatusBanner scopes={[]} stripeConnected={false} />);
    expect(screen.getByText(/преглежда|reviewed/i)).toBeTruthy();
  });
});
