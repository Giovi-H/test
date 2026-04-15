import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { API_URL } from 'utils/baseUrl';

export default function BackendHealth() {
  const [serviceHealthResponse, setServiceHealthResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      const startTime = Date.now();
      try {
        console.log('=== Health Check Start ===');
        console.log('Fetching from:', `${API_URL}/health/all`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${API_URL}/health/all`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;
        console.log(`Request took ${duration}ms`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        setServiceHealthResponse(data);
        setError(null);
      } catch (err: any) {
        const duration = Date.now() - startTime;
        console.error('=== Health Check Error ===');
        console.error('Error after', duration, 'ms');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Full error:', err);

        if (err.name === 'AbortError') {
          setError(`Timeout after ${duration}ms - Cannot reach ${API_URL}`);
        } else {
          setError(err.message || 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) {
    return (
      <View className="absolute left-4 top-16 z-50 rounded-md border border-gray-300 bg-white p-2 shadow-md">
        <ActivityIndicator size="small" />
        <Text className="mt-2 text-xs">Connecting to {API_URL}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="absolute left-4 top-16 z-50 rounded-md border border-red-300 bg-red-100 p-2 shadow-md">
        <Text className="font-bold text-red-700">Backend Error</Text>
        <Text className="mt-1 text-xs text-red-600">{error}</Text>
        <Text className="mt-2 text-xs text-gray-600">URL: {API_URL}</Text>
      </View>
    );
  }

  return (
    <View className="absolute left-4 top-16 z-50 rounded-md border border-gray-300 bg-white p-2 shadow-md">
      <Text className="mb-1 font-bold">Backend Health</Text>
      <Text className="mb-2 text-xs text-gray-500">{API_URL}</Text>
      <Text>PostgreSQL: {serviceHealthResponse?.services?.postgresql?.status || 'N/A'}</Text>
      <Text>MongoDB: {serviceHealthResponse?.services?.mongodb?.status || 'N/A'}</Text>
      <Text>Redis: {serviceHealthResponse?.services?.redis?.status || 'N/A'}</Text>
      <Text>S3: {serviceHealthResponse?.services?.s3?.status || 'N/A'}</Text>
    </View>
  );
}
