
import type { Season, SeasonResultsResponse } from '../types/season';

const API_BASE_URL = 'http://localhost:3000';

export const fetchSeasons = async (): Promise<Season[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/seasons`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching seasons:', error);
    throw error;
  }
};

export const fetchSeasonResults = async (): Promise<SeasonResultsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/seasons/results`);
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