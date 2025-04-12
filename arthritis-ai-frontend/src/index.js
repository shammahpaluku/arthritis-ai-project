import React from 'react';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';

const history = createBrowserHistory({
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

const theme = createTheme({
  palette: {
    primary: { main: '#0d47a1' },
    secondary: { main: '#ff6f00' },
    background: { default: '#e0f7fa' },
  },
  typography: {
    fontFamily: '\'Roboto\', sans-serif',
    h3: {
      fontWeight: 300,
    },
    h4: {
      fontWeight: 400,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HistoryRouter history={history}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </HistoryRouter>
);