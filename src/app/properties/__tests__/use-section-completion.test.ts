import { describe, it, expect } from 'vitest';
import { computeSectionStates } from '../use-section-completion';
import { PROPERTY_FORM_DEFAULTS } from '../property-form.schema';

describe('computeSectionStates', () => {
  it('returns all untouched for empty defaults', () => {
    const states = computeSectionStates(PROPERTY_FORM_DEFAULTS, {});
    expect(states.basicInfo).toBe('untouched');
    expect(states.location).toBe('untouched');
    expect(states.photos).toBe('untouched');
  });

  it('returns complete for basicInfo when required fields are filled', () => {
    const values = {
      ...PROPERTY_FORM_DEFAULTS,
      property_type: 'apartment' as const,
      translations: {
        ...PROPERTY_FORM_DEFAULTS.translations,
        bg: { name: 'Test', description: 'Description here', address: '' },
      },
    };
    const states = computeSectionStates(values, {});
    expect(states.basicInfo).toBe('complete');
  });

  it('returns incomplete for basicInfo when only some required fields are filled', () => {
    const values = {
      ...PROPERTY_FORM_DEFAULTS,
      translations: {
        ...PROPERTY_FORM_DEFAULTS.translations,
        bg: { name: 'Test', description: '', address: '' },
      },
    };
    const states = computeSectionStates(values, { 'translations.bg.description': { message: 'Required' } });
    expect(states.basicInfo).toBe('incomplete');
  });

  it('returns complete for translations when any optional locale has content', () => {
    const values = {
      ...PROPERTY_FORM_DEFAULTS,
      translations: {
        ...PROPERTY_FORM_DEFAULTS.translations,
        en: { name: 'Test', description: '', address: '' },
      },
    };
    const states = computeSectionStates(values, {});
    expect(states.translations).toBe('complete');
  });

  it('returns untouched for translations when no optional locales are filled', () => {
    const states = computeSectionStates(PROPERTY_FORM_DEFAULTS, {});
    expect(states.translations).toBe('untouched');
  });

  it('returns complete for photos when at least one image has is_thumbnail true', () => {
    const values = {
      ...PROPERTY_FORM_DEFAULTS,
      images: [{ url: 'https://example.com/img.jpg', is_thumbnail: true, order: 0 }],
    };
    const states = computeSectionStates(values, {});
    expect(states.photos).toBe('complete');
  });
});
