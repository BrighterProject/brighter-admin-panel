import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AmenitySearchInput } from '../components/amenity-search-input';

describe('AmenitySearchInput', () => {
  it('renders selected amenities as tags', () => {
    render(<AmenitySearchInput value={['wifi', 'pool']} onChange={vi.fn()} />);
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.getByText('Басейн')).toBeInTheDocument();
  });

  it('filters options by search query', async () => {
    const user = userEvent.setup();
    render(<AmenitySearchInput value={[]} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText(/търси удобство/i);
    await user.type(input, 'wifi');
    expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    expect(screen.queryByText('Басейн')).not.toBeInTheDocument();
  });

  it('calls onChange with new amenity when option clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AmenitySearchInput value={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText(/търси удобство/i);
    await user.click(input);
    const wifiOption = await screen.findByRole('option', { name: /Wi-Fi/i });
    await user.click(wifiOption);
    expect(onChange).toHaveBeenCalledWith(['wifi']);
  });

  it('removes amenity when tag X button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AmenitySearchInput value={['wifi']} onChange={onChange} />);
    const removeBtn = screen.getByRole('button', { name: /remove wi-fi/i });
    await user.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('does not show already-selected amenities in the dropdown', async () => {
    const user = userEvent.setup();
    render(<AmenitySearchInput value={['wifi']} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText(/търси удобство/i);
    await user.click(input);
    const options = screen.queryAllByRole('option', { name: /Wi-Fi/i });
    expect(options).toHaveLength(0);
  });
});
