'use client';

import { SettingsCard } from '@/components/settings/settings-card';
import { usePublicThemes } from '@/hooks/use-themes';
import { MarketplaceThemeCard } from '@/components/theme/marketplace-theme-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function MarketplacePage() {
  const { publicThemes, isLoading, hasMore, loadMore, copyTheme } = usePublicThemes();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter themes based on search query
  const filteredThemes = searchQuery
    ? publicThemes.filter(
        (theme) =>
          theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : publicThemes;
  
  return (
    <div className="grid gap-6">
      <SettingsCard
        title="Theme Marketplace"
        description="Discover and use themes created by other users. Find a theme you like and copy it to your collection."
      >
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search themes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Theme grid */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[350px] animate-pulse rounded-lg border bg-muted" />
              ))}
            </div>
          ) : filteredThemes.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredThemes.map((theme) => (
                  <MarketplaceThemeCard
                    key={theme.id}
                    theme={theme}
                    onCopy={copyTheme}
                  />
                ))}
              </div>
              
              {hasMore && !searchQuery && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={loadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <ShoppingBag className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-medium">No themes found</h3>
              <p className="text-muted-foreground mb-4 mt-2 text-sm">
                {searchQuery
                  ? "No themes match your search. Try a different query."
                  : "There are no public themes available yet. Check back later or create your own!"}
              </p>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
}