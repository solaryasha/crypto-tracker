import { Asset, AssetResponse, AssetsResponse } from '@/types/coincap';
import { ErrorHandler } from './errorHandling';

const BASE_URL = 'https://rest.coincap.io/v3';

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
      if (!response.ok) {
        throw ErrorHandler.createError(`HTTP error! status: ${response.status}`, 'api',
          response.status === 429 ? 'minor' : 'major');
      }
      const data: AssetsResponse = await response.json();
      return data.data;
    } catch (error) {
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
      if (!response.ok) {
        throw ErrorHandler.createError(
          `HTTP error! status: ${response.status}`,
          'api',
          response.status === 404 ? 'minor' : 'major'
        );
      }
      const data: AssetResponse = await response.json();
      return data.data;
    } catch (error) {
      throw ErrorHandler.createError(
        error instanceof Error ? error.message : 'Failed to fetch asset',
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
          response.status === 429 ? 'minor' : 'major'
        );
      }
      const data: AssetsResponse = await response.json();
      return data.data;
    } catch (error) {
      throw ErrorHandler.createError(
        error instanceof Error ? error.message : 'Failed to fetch price updates',
        'api',
        'minor'
      );
    }
  }
};