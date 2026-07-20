import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' },
    secondary: { main: '#22d3ee' },
    background: { default: '#0f0f14', paper: '#16161d' },
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
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.18)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(34, 211, 238, 0.6)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#22d3ee',
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
            color: '#22d3ee',
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
  },
});

export default theme;
