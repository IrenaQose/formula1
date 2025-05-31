import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { SeasonResult } from '../types/season';
import { fetchSeasonResults } from '../services/seasonService';

export const SeasonResults = () => {
  const [data, setData] = useState<SeasonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSeasonResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchSeasonResults();
        setData(response.seasons);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch season results');
      } finally {
        setLoading(false);
      }
    };

    loadSeasonResults();
  }, []);

  const handleRowClick = (season: SeasonResult) => {
    navigate(`/races/${season.year}`, {
      state: {
        champion: {
          driver: season.champion.driver
        }
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Formula 1 World Champions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Season</TableCell>
              <TableCell>Champion</TableCell>
              <TableCell>Nationality</TableCell>
              <TableCell>Constructor</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Wins</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.filter(season => season.champion).map((season) => (
              <TableRow
                key={season.year}
                onClick={() => handleRowClick(season)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <TableCell>{season.year}</TableCell>
                <TableCell>
                  {season.champion.driver.first_name} {season.champion.driver.last_name}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={season.champion.driver.nationality} 
                    size="small"
                    sx={{ 
                      backgroundColor: '#E10600',
                      color: 'white',
                    }}
                  />
                </TableCell>
                <TableCell>{season.champion.constructorTeam.name}</TableCell>
                <TableCell>{season.champion.points}</TableCell>
                <TableCell>{season.champion.wins}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 