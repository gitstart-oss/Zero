import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import type { ThemeProperties } from '@zero/db/theme_properties';
import { toast } from 'sonner';

export function useThemes() {
  const utils = trpc.useContext();
  const { data: themes, isLoading } = trpc.themes.list.useQuery();
  
  const createMutation = trpc.themes.create.useMutation({
    onSuccess: () => {
      utils.themes.list.invalidate();
      toast.success('Theme created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create theme: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.themes.update.useMutation({
    onSuccess: () => {
      utils.themes.list.invalidate();
      toast.success('Theme updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update theme: ${error.message}`);
    },
  });
  
  const deleteMutation = trpc.themes.delete.useMutation({
    onSuccess: () => {
      utils.themes.list.invalidate();
      toast.success('Theme deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete theme: ${error.message}`);
    },
  });
  
  const togglePublicMutation = trpc.themes.update.useMutation({
    onSuccess: () => {
      utils.themes.list.invalidate();
      utils.themes.listPublic.invalidate();
    },
  });
  
  const createTheme = async (
    name: string,
    properties: ThemeProperties,
    description?: string,
    isPublic?: boolean,
  ) => {
    return createMutation.mutateAsync({
      name,
      properties,
      description,
      isPublic,
    });
  };
  
  const updateTheme = async (
    id: string,
    data: {
      name?: string;
      properties?: ThemeProperties;
      description?: string;
      isPublic?: boolean;
    },
  ) => {
    return updateMutation.mutateAsync({
      id,
      ...data,
    });
  };
  
  const deleteTheme = async (id: string) => {
    return deleteMutation.mutateAsync({ id });
  };
  
  const togglePublic = async (id: string, isPublic: boolean) => {
    return togglePublicMutation.mutateAsync({
      id,
      isPublic,
    });
  };
  
  return {
    themes,
    isLoading,
    createTheme,
    updateTheme,
    deleteTheme,
    togglePublic,
  };
}

export function usePublicThemes() {
  const utils = trpc.useContext();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [limit] = useState(20);
  
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = trpc.themes.listPublic.useInfiniteQuery(
    { limit, cursor },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  
  const copyMutation = trpc.themes.copy.useMutation({
    onSuccess: () => {
      utils.themes.list.invalidate();
      toast.success('Theme copied to your collection');
    },
    onError: (error) => {
      toast.error(`Failed to copy theme: ${error.message}`);
    },
  });
  
  const copyTheme = async (id: string) => {
    return copyMutation.mutateAsync({ id });
  };
  
  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };
  
  const publicThemes = data?.pages.flatMap((page) => page.themes) || [];
  
  return {
    publicThemes,
    isLoading,
    hasMore: hasNextPage,
    loadMore,
    copyTheme,
  };
}