import { createTheme } from '@mui/material/styles';

const GOLD = '#e8cb85';
const GOLD_STRONG = '#f4dda2';
const GOLD_BORDER = 'rgba(232, 203, 133, 0.55)';
const BLUE = '#5b7cfa';
const FIELD_BG = '#161233';
const FIELD_BORDER = 'rgba(91, 124, 250, 0.5)';
const MODAL_BG = 'linear-gradient(165deg, #2b2447 0%, #1c1830 100%)';
const DARK_TEXT = '#1c1830';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: GOLD, contrastText: DARK_TEXT },
    secondary: { main: BLUE },
    background: { default: '#0a0913', paper: '#100e1c' },
    text: { primary: '#f1f1f4', secondary: '#b4b4c0' },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['Inter', 'system-ui', '-apple-system', 'sans-serif'].join(','),
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: FIELD_BG,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: FIELD_BORDER,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: BLUE,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BLUE,
            borderWidth: 1,
          },
        },
        input: {
          color: '#f1f1f4',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#b4b4c0',
          '&.Mui-focused': {
            color: BLUE,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 4,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          letterSpacing: '0.5px',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: `linear-gradient(90deg, ${GOLD} 0%, ${BLUE} 100%)`,
            color: DARK_TEXT,
            '&:hover': {
              filter: 'brightness(1.08)',
            },
          },
        },
        {
          props: { variant: 'text' },
          style: {
            border: `1px solid ${BLUE}`,
            color: BLUE,
            background: 'rgba(91, 124, 250, 0.06)',
            '&:hover': {
              background: 'rgba(91, 124, 250, 0.14)',
            },
          },
        },
      ],
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: MODAL_BG,
          border: `1px solid ${GOLD_BORDER}`,
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif",
          color: GOLD_STRONG,
          fontSize: '1.15rem',
          fontWeight: 700,
          borderBottom: `1px solid ${GOLD_BORDER}`,
          paddingBottom: 16,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: GOLD,
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#b4b4c0',
          fontWeight: 600,
          '&.Mui-selected': {
            color: GOLD_STRONG,
          },
        },
      },
    },
  },
});

export default theme;
