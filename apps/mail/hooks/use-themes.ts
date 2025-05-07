'use client';

import { Theme, ThemeProperties } from '@/types';
import { useSession } from '@/lib/auth-client';
import { useConnections } from './use-connections';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useThemes() {
  return useSWR<Theme[]>('/api/themes', fetcher);
}

export function usePublicThemes() {
  return useSWR<Theme[]>('/api/themes/public', fetcher);
}

export function useTheme(id: string | null) {
  return useSWR<Theme>(id ? `/api/themes/${id}` : null, fetcher);
}

export function useActiveTheme() {
  const { data: session } = useSession();
  const { data: connections } = useConnections();
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  
  const activeConnection = connections?.find(
    (connection) => connection.id === session?.user?.connectionId
  );
  
  const { data: theme } = useTheme(activeConnection?.themeId || null);
  
  useEffect(() => {
    if (theme) {
      setActiveTheme(theme);
    } else {
      setActiveTheme(null);
    }
  }, [theme]);
  
  return { activeTheme };
}

export function useFonts() {
  return useSWR<{ family: string }[]>('/api/fonts', fetcher);
}

export async function createTheme(theme: {
  name: string;
  isPublic: boolean;
  properties: ThemeProperties;
}) {
  const response = await fetch('/api/themes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(theme),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create theme');
  }
  
  return response.json();
}

export async function updateTheme(
  id: string,
  theme: Partial<{
    name: string;
    isPublic: boolean;
    properties: ThemeProperties;
  }>
) {
  const response = await fetch(`/api/themes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(theme),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update theme');
  }
  
  return response.json();
}

export async function deleteTheme(id: string) {
  const response = await fetch(`/api/themes/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete theme');
  }
  
  return response.json();
}

export async function copyTheme(id: string) {
  const response = await fetch(`/api/themes/${id}/copy`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to copy theme');
  }
  
  return response.json();
}