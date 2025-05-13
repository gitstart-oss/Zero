'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SettingsCard } from '@/components/settings/settings-card';
import { AddConnectionDialog } from '@/components/connection/add';
import { useSession, authClient } from '@/lib/auth-client';
import { useConnections } from '@/hooks/use-connections';
import { useSettings } from '@/hooks/use-settings';
import { useTRPC } from '@/providers/query-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useMutation } from '@tanstack/react-query';
import { Trash, Plus, Unplug, GripVertical } from 'lucide-react';
import { useThreads } from '@/hooks/use-threads';
import { emailProviders } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

function SortableConnectionItem({ connection, disconnectedIds, onDisconnect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: connection.id });
  const t = useTranslations();
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-popover flex items-center justify-between rounded-lg border p-4 ${
        isDragging ? 'border-primary' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:text-primary"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        
        {connection.picture ? (
          <Image
            src={connection.picture}
            alt=""
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
            width={48}
            height={48}
          />
        ) : (
          <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
            <svg viewBox="0 0 24 24" className="text-primary h-6 w-6">
              <path fill="currentColor" d={emailProviders[0]!.icon} />
            </svg>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-medium">{connection.name}</span>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Tooltip
              delayDuration={0}
              open={openTooltip === connection.id}
              onOpenChange={(open) => {
                if (window.innerWidth <= 768) {
                  setOpenTooltip(open ? connection.id : null);
                }
              }}
            >
              <TooltipTrigger asChild>
                <span
                  className="max-w-[180px] cursor-default truncate sm:max-w-[240px] md:max-w-[300px]"
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      setOpenTooltip(
                        openTooltip === connection.id ? null : connection.id,
                      );
                    }
                  }}
                >
                  {connection.email}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="select-all">
                <div className="font-mono">{connection.email}</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {disconnectedIds?.includes(connection.id) ? (
          <>
            <div>
              <Badge variant="destructive">
                {t('pages.settings.connections.disconnected')}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await authClient.linkSocial({
                  provider: connection.providerId,
                  callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/settings/connections`,
                });
              }}
            >
              <Unplug className="size-4" />
              {t('pages.settings.connections.reconnect')}
            </Button>
          </>
        ) : null}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary ml-4 shrink-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('pages.settings.connections.disconnectTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('pages.settings.connections.disconnectDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4">
              <DialogClose asChild>
                <Button variant="outline">
                  {t('pages.settings.connections.cancel')}
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => onDisconnect(connection.id)}>
                  {t('pages.settings.connections.remove')}
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const { data, isLoading, refetch: refetchConnections } = useConnections();
  const { data: settings, refetch: refetchSettings } = useSettings();
  const { refetch } = useSession();
  const t = useTranslations();
  const trpc = useTRPC();
  const { mutateAsync: deleteConnection } = useMutation(trpc.connections.delete.mutationOptions());
  const { mutateAsync: saveSettings } = useMutation(trpc.settings.save.mutationOptions());
  const [{ refetch: refetchThreads }] = useThreads();
  const [connections, setConnections] = useState<any[]>([]);

  // Initialize connections state when data is loaded
  useEffect(() => {
    if (data?.connections) {
      // If accountOrder exists in settings, sort connections accordingly
      if (settings?.accountOrder?.length) {
        const orderedConnections = [...data.connections].sort((a, b) => {
          const aIndex = settings.accountOrder.indexOf(a.id);
          const bIndex = settings.accountOrder.indexOf(b.id);
          
          // If an ID is not in the order array, put it at the end
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          
          return aIndex - bIndex;
        });
        setConnections(orderedConnections);
      } else {
        setConnections(data.connections);
      }
    }
  }, [data?.connections, settings?.accountOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const disconnectAccount = async (connectionId: string) => {
    await deleteConnection(
      { connectionId },
      {
        onError: (error) => {
          console.error('Error disconnecting account:', error);
          toast.error(t('pages.settings.connections.disconnectError'));
        },
      },
    );
    toast.success(t('pages.settings.connections.disconnectSuccess'));
    void refetchConnections();
    refetch();
    void refetchThreads();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setConnections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Save the new order to user settings
        const newOrder = newItems.map((item) => item.id);
        saveSettings({ accountOrder: newOrder })
          .then(() => {
            refetchSettings();
            toast.success(t('pages.settings.connections.orderSaved'));
            void refetchThreads(); // Refresh threads to apply new ordering
          })
          .catch((error) => {
            console.error('Error saving account order:', error);
            toast.error(t('pages.settings.connections.orderSaveError'));
          });
        
        return newItems;
      });
    }
  };

  return (
    <div className="grid gap-6">
      <SettingsCard
        title={t('pages.settings.connections.title')}
        description={
          <>
            {t('pages.settings.connections.description')}
            <p className="mt-2 text-sm text-muted-foreground">
              {t('pages.settings.connections.orderDescription')}
            </p>
          </>
        }
      >
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-popover flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-full lg:w-32" />
                      <Skeleton className="h-3 w-full lg:w-48" />
                    </div>
                  </div>
                  <Skeleton className="ml-4 h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : connections?.length ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={connections.map((connection) => connection.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="lg: grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                  {connections.map((connection) => (
                    <SortableConnectionItem
                      key={connection.id}
                      connection={connection}
                      disconnectedIds={data.disconnectedIds}
                      onDisconnect={disconnectAccount}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : null}

          <div className="flex items-center justify-start">
            <AddConnectionDialog>
              <Button
                variant="outline"
                className="group relative w-9 overflow-hidden transition-all duration-200 hover:w-full sm:hover:w-[32.5%]"
              >
                <Plus className="absolute left-2 h-4 w-4" />
                <span className="whitespace-nowrap pl-7 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {t('pages.settings.connections.addEmail')}
                </span>
              </Button>
            </AddConnectionDialog>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
