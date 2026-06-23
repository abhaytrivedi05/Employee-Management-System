import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useThemeColors = () => {
  const { mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  return {
    isDark,
    gradientBlue: isDark ? 'linear-gradient(135deg, #1a2332 0%, #0f1729 100%)' : 'linear-gradient(135deg, #e0e7ff 0%, #f5f7ff 100%)',
    gradientOrange: isDark ? 'linear-gradient(135deg, #2d1f1a 0%, #1f1410 100%)' : 'linear-gradient(135deg, #fdf2e9 0%, #ffe7d4 100%)',
    gradientGreen: isDark ? 'linear-gradient(135deg, #1a2d1f 0%, #0f1f14 100%)' : 'linear-gradient(135deg, #ecfdf3 0%, #dcfce7 100%)',
    gradientPurple: isDark ? 'linear-gradient(135deg, #221a2d 0%, #150f1f 100%)' : 'linear-gradient(135deg, #e9defa 0%, #fbfcdb 100%)',
  };
};
