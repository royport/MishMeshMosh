'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DemoDataSeeder() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function seedData(type: string) {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed data');
      }

      setMessage(data.message);
      router.refresh();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Demo Data Seeder</h2>
      <p className="text-sm text-slate-600 mb-4">
        Quickly populate the platform with sample data for testing and demonstrations.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => seedData('campaigns')}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Seeding...' : 'Seed Campaigns'}
        </button>
        <button
          onClick={() => seedData('groups')}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Seeding...' : 'Seed Groups'}
        </button>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.startsWith('Error')
            ? 'bg-red-50 text-red-700'
            : 'bg-green-50 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
