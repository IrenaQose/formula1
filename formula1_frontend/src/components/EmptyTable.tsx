import { TableCell, TableRow } from "@mui/material";
import type { Race } from "../types/race";
import type { Table } from "@tanstack/react-table";

interface EmptyTableProps {
  table: Table<Race>;
  year: number;
}

export const EmptyTable = ({ table, year }: EmptyTableProps) => {
  return (
    <TableRow>
      <TableCell colSpan={table.getAllColumns().length} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
        No race data available for {year}
      </TableCell>
    </TableRow>
  );
};