import { useState, useEffect, useRef } from 'react';

export function usePolling(apiFunction, interval = 5000, enabled = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      console.error('Polling error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      // Fetch immediately
      fetchData();
      
      // Then start polling
      intervalRef.current = setInterval(fetchData, interval);
    } else {
      // Clear interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
}

