import type { RaceResponse } from '../types/race';

export const fetchRaces = async (year: number): Promise<RaceResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/races/${year}?limit=100`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    //Todo: handle error cases
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}; 
