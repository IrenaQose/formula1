
import type { SeasonResultsResponse } from '../types/season';

export const fetchSeasonResults = async (): Promise<SeasonResultsResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/seasons/results`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching season results:', error);
    throw error;
  }
}; 