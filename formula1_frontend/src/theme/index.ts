import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E10600', // F1 Red
    },
    secondary: {
      main: '#1E1E1E', // Dark gray for secondary elements
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      color: '#1E1E1E',
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F5F5F5',
        },
      },
    },
  },
}); 