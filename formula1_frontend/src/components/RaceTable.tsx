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
} from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { Race } from '../types/race';
import { fetchRaces } from '../services/raceService';
import { TableRow as MuiTableRow } from '@mui/material';
import { EmptyTable } from './EmptyTable';
import { useParams } from 'react-router-dom';
import type { DriverStandings } from '../types/driver-standings';

const columnHelper = createColumnHelper<Race>();

const columns = [
  columnHelper.accessor((row => row.name.replace('Grand Prix', '')), {
    header: 'Grand Prix',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.champion ? `${row.champion.first_name} ${row.champion.last_name}` : 'N/A', {
    header: 'Winner',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('constructor', {
    header: 'Car',
    cell: (info) => info.getValue() || 'N/A',
  }),
  columnHelper.accessor('laps', {
    header: 'Laps',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('time', {
    header: 'Time',
    cell: (info) => info.getValue(),
  }),
];

export const RaceTable = () => {
  const { year } = useParams();
  const yearNumber = parseInt(year || '');
  const [data, setData] = useState<Race[]>([]);
  const [seasonChampion, setSeasonChampion] = useState<DriverStandings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRaces = async () => {
      if (!yearNumber) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetchRaces(yearNumber);
        setData(response.data.races);
        setSeasonChampion(response.data.champion);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch races');
      } finally {
        setLoading(false);
      }
    };

    loadRaces();
  }, [yearNumber]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!yearNumber) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Invalid year</Alert>
      </Box>
    );
  }

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
        {yearNumber} Race Results
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <EmptyTable table={table} year={yearNumber} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <MuiTableRow 
                  key={row.id}
                  sx={{
                    backgroundColor: row.original.champion?.id && row.original.champion?.id === seasonChampion?.driver.id ? '#1E1E1E' : 'inherit',
                    '& .MuiTableCell-root': {
                      color: row.original.champion?.id === seasonChampion?.driver.id ? 'white' : 'inherit',
                    },
                    '&:hover': {
                      backgroundColor: row.original.champion?.id === seasonChampion?.driver.id ? '#1e1e1ef2' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </MuiTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 