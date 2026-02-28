export const designTokens = {
  colors: {
    primary: '#2C7BE5',
    accent: '#00E5FF',
    success: '#00C853',
    warning: '#FFB300',
    danger: '#D32F2F',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
  },
  gradients: {
    statCard: 'linear-gradient(135deg, rgba(44, 123, 229, 0.14) 0%, rgba(0, 229, 255, 0.12) 100%)',
    sidebarActive: 'linear-gradient(120deg, rgba(44, 123, 229, 0.18) 0%, rgba(0, 229, 255, 0.1) 100%)',
  },
  shadows: {
    sm: '0 2px 10px rgba(15, 23, 42, 0.06)',
    md: '0 10px 24px rgba(15, 23, 42, 0.08)',
    lg: '0 18px 40px rgba(15, 23, 42, 0.12)',
  },
  radius: {
    small: 8,
    medium: 14,
    large: 20,
  },
  spacing: [4, 8, 12, 16, 24, 32, 48, 64],
  typography: {
    h1: { size: 32, weight: 700 },
    h2: { size: 24, weight: 600 },
    h3: { size: 20, weight: 600 },
    body: { size: 16, weight: 400 },
    caption: { size: 14, weight: 400 },
  },
  motion: {
    duration: '150ms-250ms',
    easing: 'ease-out',
    pressScale: 0.98,
  },
};

export const hierarchyRules = {
  headingUse: 'Use H1 once per page, H2 for main sections, and H3 for section internals.',
  bodyUse: 'Keep body text at 16px and supporting text at 14px.',
  spacingUse: 'Use only the approved spacing scale: 4, 8, 12, 16, 24, 32, 48, 64.',
};
