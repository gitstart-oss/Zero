import { useTRPC } from '@/providers/query-provider';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useConnections = () => {
  const trpc = useTRPC();
  const connectionsQuery = useQuery(trpc.connections.list.queryOptions(void 0));
  
  const updateThemeMutation = trpc.connections.updateTheme.useMutation({
    onSuccess: () => {
      connectionsQuery.refetch();
      toast.success('Connection theme updated');
    },
    onError: (error) => {
      toast.error(`Failed to update connection theme: ${error.message}`);
    },
  });
  
  const updateConnectionTheme = async (connectionId: string, themeId: string | null) => {
    await updateThemeMutation.mutateAsync({ connectionId, themeId });
  };
  
  return {
    ...connectionsQuery,
    updateConnectionTheme,
  };
};
