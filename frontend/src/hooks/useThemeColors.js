import { useTheme } from '@mui/material/styles';

export const useThemeColors = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return {
    isDark,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    bgDefault: theme.palette.background.default,
    bgPaper: theme.palette.background.paper,
    
    // Gradient backgrounds that adapt to theme
    gradientBlue: isDark 
      ? 'linear-gradient(135deg, #1a2332 0%, #0f1729 100%)'
      : 'linear-gradient(135deg, #e0e7ff 0%, #f5f7ff 100%)',
    
    gradientOrange: isDark
      ? 'linear-gradient(135deg, #2d1f1a 0%, #1f1410 100%)'
      : 'linear-gradient(135deg, #fdf2e9 0%, #ffe7d4 100%)',
    
    gradientGreen: isDark
      ? 'linear-gradient(135deg, #1a2d1f 0%, #0f1f14 100%)'
      : 'linear-gradient(135deg, #ecfdf3 0%, #dcfce7 100%)',
    
    gradientPurple: isDark
      ? 'linear-gradient(135deg, #221a2d 0%, #150f1f 100%)'
      : 'linear-gradient(135deg, #e9defa 0%, #fbfcdb 100%)',
    
    gradientYellow: isDark
      ? 'linear-gradient(135deg, #2d2a1a 0%, #1f1d10 100%)'
      : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    
    // Surface backgrounds
    surfaceBg: isDark
      ? 'rgba(26, 31, 46, 0.8)'
      : 'linear-gradient(135deg, #f7f9ff 0%, #eef2ff 100%)',
  };
};
