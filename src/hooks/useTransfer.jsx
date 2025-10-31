import { useState } from 'react';

export const useTransfer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const createTransferCode = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/transfer/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create transfer code');
      }
      
      const data = await response.json();
      return data; // { code, expiresAt }
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const redeemTransferCode = async (code) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/transfer/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to redeem code');
      }
      
      const data = await response.json();
      return data.profileData;
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    createTransferCode,
    redeemTransferCode,
    loading,
    error
  };
};