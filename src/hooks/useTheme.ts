/**
 * useTheme — central dark/light mode hook
 * Returns a theme object based on the system color scheme.
 * Use this in any component that needs theme-aware colors.
 */
import { useColorScheme } from 'react-native';

export function useTheme() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return {
    dark,

    // ── Backgrounds ──────────────────────────────────────────────────────────
    screenBg:       dark ? '#0D1117' : '#F8FAFC',
    cardBg:         dark ? '#161B22' : '#FFFFFF',
    cardBg2:        dark ? '#1C2128' : '#F1F5F9',
    inputBg:        dark ? '#0D1117' : '#F8FAFC',
    headerBg:       dark ? '#161B22' : '#FFFFFF',
    modalBg:        dark ? '#161B22' : '#FFFFFF',
    overlayBg:      'rgba(0,0,0,0.65)',
    sheetBg:        dark ? '#161B22' : '#FFFFFF',

    // ── Text ─────────────────────────────────────────────────────────────────
    textPrimary:    dark ? '#F0F6FC' : '#0F172A',
    textSecondary:  dark ? '#8B949E' : '#64748B',
    textMuted:      dark ? '#6E7681' : '#94A3B8',
    textLabel:      dark ? '#8B949E' : '#374151',
    textSmall:      dark ? '#6E7681' : '#94A3B8',

    // ── Borders ───────────────────────────────────────────────────────────────
    border:         dark ? '#21262D' : '#E2E8F0',
    borderFocus:    '#6C63FF',
    borderLight:    dark ? '#30363D' : '#F1F5F9',

    // ── Accent ───────────────────────────────────────────────────────────────
    accent:         '#6C63FF',
    accentLight:    dark ? '#A09AFF' : '#6C63FF',
    accentBg:       dark ? '#1E1B4B' : '#EEF2FF',

    // ── Handle / divider ─────────────────────────────────────────────────────
    handle:         dark ? '#30363D' : '#E2E8F0',

    // ── Shadows ───────────────────────────────────────────────────────────────
    shadowColor:    dark ? '#000000' : '#000000',

    // ── Status colors (same in both modes) ───────────────────────────────────
    success:        '#10B981',
    successBg:      dark ? '#064E3B' : '#D1FAE5',
    warning:        '#F59E0B',
    warningBg:      dark ? '#78350F' : '#FEF3C7',
    error:          '#EF4444',
    errorBg:        dark ? '#450A0A' : '#FEE2E2',
    info:           '#3B82F6',
    infoBg:         dark ? '#1E3A5F' : '#DBEAFE',
  };
}

export type Theme = ReturnType<typeof useTheme>;
