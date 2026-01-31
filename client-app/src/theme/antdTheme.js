/**
 * Ant Design theme tokens aligned with index.css (Tailwind) theme colors.
 * Used in ConfigProvider so antd components match the project palette.
 */

// Same values as in src/index.css @theme – single source for hex/numbers here
const colors = {
  primary: '#2563eb',
  primaryForeground: '#ffffff',
  primaryHover: '#1d4ed8',
  primaryMuted: '#dbeafe',

  secondary: '#64748b',
  secondaryMuted: '#f1f5f9',

  accent: '#0ea5e9',
  accentMuted: '#e0f2fe',

  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#f8fafc',
  mutedForeground: '#64748b',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#2563eb',

  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  destructiveMuted: '#fef2f2',
  success: '#16a34a',
  successMuted: '#f0fdf4',
  warning: '#d97706',
  warningMuted: '#fffbeb',

  card: '#ffffff',
  cardForeground: '#0f172a',
};

const radius = {
  sm: 4,   // 0.25rem
  md: 6,   // 0.375rem
  lg: 8,   // 0.5rem
  xl: 12,  // 0.75rem
  xxl: 16, // 1rem
};

/** Ant Design theme config for ConfigProvider */
export const antdTheme = {
  token: {
    // Seed / brand
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.destructive,
    colorInfo: colors.accent,

    // Backgrounds
    colorBgContainer: colors.background,
    colorBgLayout: colors.muted,
    colorBgElevated: colors.card,
    colorBgSpotlight: colors.muted,

    // Text
    colorText: colors.foreground,
    colorTextSecondary: colors.mutedForeground,
    colorTextTertiary: colors.mutedForeground,

    // Border & fill
    colorBorder: colors.border,
    colorBorderSecondary: colors.input,
    colorFillSecondary: colors.muted,
    colorFillTertiary: colors.secondaryMuted,

    // Link & hover
    colorLink: colors.primary,
    colorLinkHover: colors.primaryHover,
    colorLinkActive: colors.primaryHover,

    // Radius
    borderRadius: radius.md,
    borderRadiusLG: radius.lg,
    borderRadiusSM: radius.sm,
    borderRadiusXS: radius.sm,

    // Control (inputs, buttons)
    controlOutline: colors.ring,
  },
  components: {
    Button: {
      primaryShadow: `0 2px 0 ${colors.primaryHover}`,
      defaultBorderColor: colors.border,
      defaultColor: colors.foreground,
    },
    Input: {
      activeBorderColor: colors.ring,
      hoverBorderColor: colors.primary,
    },
    Select: {
      optionSelectedBg: colors.primaryMuted,
    },
    Table: {
      headerBg: colors.muted,
    },
    Card: {
      headerBg: colors.card,
    },
    Message: {
      contentBg: colors.card,
    },
    Notification: {
      contentBg: colors.card,
    },
  },
};

export default antdTheme;
