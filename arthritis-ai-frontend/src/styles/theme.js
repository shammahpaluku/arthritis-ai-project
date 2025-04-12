import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    primary: { main: '#1976d2' }, // Clinical blue
    secondary: { main: '#4caf50' }, // Medical green
    background: { default: '#f5f5f5' }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 500, color: '#2e7d32' }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' }
      }
    }
  }
});