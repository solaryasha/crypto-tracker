import { Asset, AssetResponse, AssetsResponse } from '@/types/coincap';
import { ErrorHandler, AppError } from './errorHandling'; // Import AppError

const BASE_URL = 'https://rest.coincap.io/v3';

// Helper to check if an error is an AppError
function isAppError(error: unknown): error is AppError { // Changed type from any to unknown
  return (
    typeof error === 'object' &&
    error !== null &&
    'userMessage' in error &&
    typeof (error as AppError).userMessage === 'string' &&
    'category' in error &&
    typeof (error as AppError).category === 'string'
  );
}

export const coincapApi = {
  async getTopAssets(limit: number = 20): Promise<Asset[]> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_COIN_CAP_API_KEY;
      if (!apiKey) {
        throw ErrorHandler.createError('CoinCap API key is not configured', 'api', 'major');
      }
      const response = await fetch(`${BASE_URL}/assets?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      console.log('Response:', response); // Debugging line
      if (!response.ok) {
        throw ErrorHandler.createError(
          `HTTP error! status: ${response.status}`,
          'api',
          response.status === 429 ? 'minor' : 'major',
          response.status // Pass status code
        );
      }
      const data: AssetsResponse = await response.json();
      return data.data;
    } catch (error) {
      if (isAppError(error)) {
        throw error; // Already an AppError
      }
      throw ErrorHandler.createError(
        error instanceof Error ? error.message : 'Failed to fetch assets',
        'api',
        'major'
      );
    }
  },

  async getAssetById(id: string): Promise<Asset> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_COIN_CAP_API_KEY;
      if (!apiKey) {
        throw ErrorHandler.createError('CoinCap API key is not configured', 'api', 'major');
      }
      const response = await fetch(`${BASE_URL}/assets/${id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      console.log('Response GET BY ID:', response); // Debugging line
      if (!response.ok) {
        throw ErrorHandler.createError(
          `HTTP error! status: ${response.status}`,
          'api',
          response.status === 404 ? 'minor' : 'major', // Severity based on 404
          response.status // Pass status code
        );
      }
      const data: AssetResponse = await response.json();
      return data.data;
    } catch (error) {
      if (isAppError(error)) {
        console.error('AppError:', error); // Log the AppError
        throw error; // Already an AppError
      }
      console.error('Error:', error); // Log the error
      throw ErrorHandler.createError(
        error instanceof Error ? error.message : `Failed to fetch asset by ID: ${id}`,
        'api',
        'major'
      );
    }
  },

  async getAssetPriceUpdates(ids: string[]): Promise<Asset[]> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_COIN_CAP_API_KEY;
      if (!apiKey) {
        throw ErrorHandler.createError('CoinCap API key is not configured', 'api', 'major');
      }
      const idsParam = ids.join(',');
      const response = await fetch(`${BASE_URL}/assets?ids=${idsParam}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) {
        throw ErrorHandler.createError(
          `HTTP error! status: ${response.status}`,
          'api',
          response.status === 429 ? 'minor' : 'major',
          response.status // Pass status code
        );
      }
      const data: AssetsResponse = await response.json();
      return data.data;
    } catch (error) {
      if (isAppError(error)) {
        throw error; // Already an AppError
      }
      throw ErrorHandler.createError(
        error instanceof Error ? error.message : 'Failed to fetch price updates',
        'api',
        'minor' // Original severity was minor
      );
    }
  }
};