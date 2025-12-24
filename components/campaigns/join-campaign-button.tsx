'use client';

import { useState } from 'react';
import JoinCampaignModal from './join-campaign-modal';

export default function JoinCampaignButton({
  campaignId,
  items,
}: {
  campaignId: string;
  items: any[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        Join Campaign
      </button>

      {isModalOpen && (
        <JoinCampaignModal
          campaignId={campaignId}
          items={items}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
