import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { RoomsBuilder } from '../components/rooms-builder';
import type { RoomEntry } from '../types';

const emptyRooms: RoomEntry[] = [];
const oneRoom: RoomEntry[] = [
  { room_type: 'bedroom', count: 1, beds: [{ bed_type: 'double', count: 1 }] },
];

describe('RoomsBuilder', () => {
  it('renders "Add Room" button when empty', () => {
    render(<RoomsBuilder value={emptyRooms} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add room/i })).toBeInTheDocument();
  });

  it('calls onChange with a new bedroom when Add Room is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RoomsBuilder value={emptyRooms} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /add room/i }));
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ room_type: 'bedroom', count: 1, beds: [] }),
    ]);
  });

  it('renders existing rooms', () => {
    render(<RoomsBuilder value={oneRoom} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('bedroom')).toBeInTheDocument();
  });

  it('calls onChange without the room when remove is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RoomsBuilder value={oneRoom} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /remove room/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
