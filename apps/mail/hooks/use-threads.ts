import { backgroundQueueAtom, isThreadInBackgroundQueueAtom } from '@/store/backgroundQueue';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchValue } from '@/hooks/use-search-value';
import { useTRPC } from '@/providers/query-provider';
import { useSession } from '@/lib/auth-client';
import { useSettings } from '@/hooks/use-settings';
import { useAtom, useAtomValue } from 'jotai';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';

export const useThreads = () => {
  const { folder } = useParams<{ folder: string }>();
  const [searchValue] = useSearchValue();
  const { data: session } = useSession();
  const { data: settings } = useSettings();
  const [backgroundQueue] = useAtom(backgroundQueueAtom);
  const isInQueue = useAtomValue(isThreadInBackgroundQueueAtom);
  const trpc = useTRPC();

  const threadsQuery = useInfiniteQuery(
    trpc.mail.listThreads.infiniteQueryOptions(
      {
        q: searchValue.value,
        folder,
      },
      {
        initialCursor: '',
        getNextPageParam: (lastPage) => lastPage?.nextPageToken ?? null,
        staleTime: 3000 * 60, // 3 minute
        refetchOnMount: true,
        refetchIntervalInBackground: true,
      },
    ),
  );

  // Flatten threads from all pages and sort by account order and then by receivedOn date
  const threads = useMemo(
    () => {
      if (!threadsQuery.data) return [];
      
      const allThreads = threadsQuery.data.pages
        .flatMap((e) => e.threads)
        .filter(Boolean)
        .filter((e) => !isInQueue(`thread:${e.id}`));
      
      // If no account order is specified, just sort by date (newest first)
      if (!settings?.accountOrder?.length) {
        return allThreads;
      }
      
      // Sort threads by account order and then by date
      return [...allThreads].sort((a, b) => {
        // Get the connection IDs for the threads
        const aConnectionId = a.latest?.connectionId;
        const bConnectionId = b.latest?.connectionId;
        
        // If either thread doesn't have a connection ID, sort by date
        if (!aConnectionId || !bConnectionId) {
          return new Date(b.latest?.receivedOn || 0).getTime() - 
                 new Date(a.latest?.receivedOn || 0).getTime();
        }
        
        // Get the indices of the connection IDs in the account order
        const aIndex = settings.accountOrder.indexOf(aConnectionId);
        const bIndex = settings.accountOrder.indexOf(bConnectionId);
        
        // If both connection IDs are in the account order, sort by order
        if (aIndex !== -1 && bIndex !== -1) {
          if (aIndex !== bIndex) {
            return aIndex - bIndex;
          }
        } 
        // If only one connection ID is in the account order, prioritize it
        else if (aIndex !== -1) {
          return -1;
        } 
        else if (bIndex !== -1) {
          return 1;
        }
        
        // If neither connection ID is in the account order or they have the same order,
        // sort by date (newest first)
        return new Date(b.latest?.receivedOn || 0).getTime() - 
               new Date(a.latest?.receivedOn || 0).getTime();
      });
    },
    [threadsQuery.data, session, backgroundQueue, isInQueue, settings?.accountOrder],
  );

  const isEmpty = useMemo(() => threads.length === 0, [threads]);
  const isReachingEnd =
    isEmpty ||
    (threadsQuery.data &&
      !threadsQuery.data.pages[threadsQuery.data.pages.length - 1]?.nextPageToken);

  const loadMore = async () => {
    if (threadsQuery.isLoading || threadsQuery.isFetching) return;
    await threadsQuery.fetchNextPage();
  };

  return [threadsQuery, threads, isReachingEnd, loadMore] as const;
};

export const useThread = (threadId: string | null) => {
  const { data: session } = useSession();
  const [_threadId] = useQueryState('threadId');
  const id = threadId ? threadId : _threadId;
  const trpc = useTRPC();

  const threadQuery = useQuery(
    trpc.mail.get.queryOptions(
      {
        id: id!,
      },
      {
        enabled: !!id && !!session?.user.id,
        staleTime: 1000 * 60 * 60, // 60 minutes
      },
    ),
  );

  const isGroupThread = useMemo(() => {
    if (!threadQuery.data?.latest?.id) return false;
    const totalRecipients = [
      ...(threadQuery.data.latest.to || []),
      ...(threadQuery.data.latest.cc || []),
      ...(threadQuery.data.latest.bcc || []),
    ].length;
    return totalRecipients > 1;
  }, [threadQuery.data]);

  return { ...threadQuery, isGroupThread };
};
