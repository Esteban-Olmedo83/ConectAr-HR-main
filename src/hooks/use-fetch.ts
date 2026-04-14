/**
 * Hook para peticiones HTTP
 * Proporciona un hook genérico para manejar peticiones
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/services/api-client';
import { RequestOptions } from '../lib/types/api';
import { handleApiError, AppError } from '../lib/utils/error-handler';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

export function useFetch<T>(
  endpoint: string,
  options?: RequestOptions,
  immediate: boolean = true
) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiClient.get<T>(endpoint, options);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const appError = handleApiError(error);
      setState({ data: null, loading: false, error: appError });
      throw appError;
    }
  }, [endpoint, options]);

  useEffect(() => {
    if (immediate) {
      fetch().catch(console.error);
    }
  }, [fetch, immediate]);

  const refetch = useCallback(() => {
    return fetch();
  }, [fetch]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
}

export function usePost<T>(endpoint: string) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (payload: unknown, options?: RequestOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiClient.post<T>(endpoint, payload, options);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const appError = handleApiError(error);
        setState({ data: null, loading: false, error: appError });
        throw appError;
      }
    },
    [endpoint]
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
  };
}

export function usePut<T>(endpoint: string) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (payload: unknown, options?: RequestOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiClient.put<T>(endpoint, payload, options);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const appError = handleApiError(error);
        setState({ data: null, loading: false, error: appError });
        throw appError;
      }
    },
    [endpoint]
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
  };
}

export function useDelete<T = void>(endpoint: string) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (options?: RequestOptions) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await apiClient.delete<T>(endpoint, options);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const appError = handleApiError(error);
        setState({ data: null, loading: false, error: appError });
        throw appError;
      }
    },
    [endpoint]
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
  };
}
