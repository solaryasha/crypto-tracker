import { Asset, AssetResponse, AssetsResponse } from '@/types/coincap';

const BASE_URL = 'https://rest.coincap.io/v3';

export class CoinCapApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CoinCapApiError';
  }
}

export const coincapApi = {
  async getTopAssets(limit: number = 20): Promise<Asset[]> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_COIN_CAP_API_KEY;
      if (!apiKey) {
        throw new CoinCapApiError('CoinCap API key is not configured');
      }
      const response = await fetch(`${BASE_URL}/assets?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) {
        throw new CoinCapApiError(`HTTP error! status: ${response.status}`);
      }
      const data: AssetsResponse = await response.json();
      return data.data;
    } catch (error) {
      throw new CoinCapApiError(error instanceof Error ? error.message : 'Failed to fetch assets');
    }
  },

  async getAssetById(id: string): Promise<Asset> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_COIN_CAP_API_KEY;
      if (!apiKey) {
        throw new CoinCapApiError('CoinCap API key is not configured');
      }
      const response = await fetch(`${BASE_URL}/assets/${id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) {
        throw new CoinCapApiError(`HTTP error! status: ${response.status}`);
      }
      const data: AssetResponse = await response.json();
      return data.data;
    } catch (error) {
      throw new CoinCapApiError(error instanceof Error ? error.message : 'Failed to fetch asset');
    }
  },

  async getAssetPriceUpdates(ids: string[]): Promise<Asset[]> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_COIN_CAP_API_KEY;
      if (!apiKey) {
        throw new CoinCapApiError('CoinCap API key is not configured');
      }
      const idsParam = ids.join(',');
      const response = await fetch(`${BASE_URL}/assets?ids=${idsParam}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      if (!response.ok) {
        throw new CoinCapApiError(`HTTP error! status: ${response.status}`);
      }
      const data: AssetsResponse = await response.json();
      return data.data;
    } catch (error) {
      throw new CoinCapApiError(error instanceof Error ? error.message : 'Failed to fetch price updates');
    }
  }
};