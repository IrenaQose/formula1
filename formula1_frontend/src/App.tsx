import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Container, ThemeProvider, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { RaceTable } from './components/RaceTable';
import { SeasonResults } from './components/SeasonResults';
import { theme } from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Formula 1 Results
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Champions
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Routes>
              <Route path="/" element={<SeasonResults />} />
              <Route path="/races/:year" element={<RaceTable />} />
            </Routes>
          </Box>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
