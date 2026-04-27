import { useState, useCallback } from 'react';
import api from '../utils/api';

const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setData(response.data.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, request, setData };
};

export default useApi;