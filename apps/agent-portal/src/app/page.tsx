'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toaster';
import { checkInAPI } from '@/lib/api';
import { isValidPNR } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'pnr' | 'name' | 'ffn'>('pnr');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params: any = {};

      if (searchType === 'pnr') {
        if (!isValidPNR(searchValue)) {
          toast('Invalid PNR format. Must be 6 alphanumeric characters.', 'error');
          setLoading(false);
          return;
        }
        params.pnrLocator = searchValue.toUpperCase();
      } else if (searchType === 'name') {
        params.lastName = searchValue;
      } else if (searchType === 'ffn') {
        params.frequentFlyerNumber = searchValue;
      }

      const response = await checkInAPI.searchPassengers(params);

      if (response.data.success && response.data.data.length > 0) {
        const passenger = response.data.data[0];
        router.push(`/check-in/${passenger.transaction.id}`);
      } else {
        toast('No passengers found', 'info');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast('Search failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Agent Portal - DCS</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Passenger Check-In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={searchType === 'pnr' ? 'default' : 'outline'}
                    onClick={() => setSearchType('pnr')}
                    size="sm"
                  >
                    PNR
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === 'name' ? 'default' : 'outline'}
                    onClick={() => setSearchType('name')}
                    size="sm"
                  >
                    Name
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === 'ffn' ? 'default' : 'outline'}
                    onClick={() => setSearchType('ffn')}
                    size="sm"
                  >
                    Frequent Flyer
                  </Button>
                </div>

                <div>
                  <label htmlFor="search" className="block text-sm font-medium mb-2">
                    {searchType === 'pnr'
                      ? 'Enter PNR'
                      : searchType === 'name'
                      ? 'Enter Last Name'
                      : 'Enter Frequent Flyer Number'}
                  </label>
                  <Input
                    id="search"
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={
                      searchType === 'pnr'
                        ? 'ABC123'
                        : searchType === 'name'
                        ? 'Smith'
                        : 'FF1234567'
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Searching...' : 'Search Passenger'}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => router.push('/flight-load')}>
                    Flight Load
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/standby')}>
                    Standby List
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/baggage-tracking')}>
                    Baggage Tracking
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/reports')}>
                    Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <div className="text-sm text-muted-foreground mt-1">Checked In</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-muted-foreground mt-1">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">0</div>
                  <div className="text-sm text-muted-foreground mt-1">Standby</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
