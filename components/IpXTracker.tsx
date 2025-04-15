'use client';

import { updateIpAddress } from '@/app/(chat)/actions';
import { useEffect } from 'react';

interface IpTrackerProps {
  id: string | undefined
}

const MAXIMUM_COUNT_BEFORE_UPDATE = 25;

/*
  This component is used to update the user's IP address.
  It stores the number of time this component was loaded in the local storage.
  After a certain number of times, it will update the user's IP address.
  This is to ensure that the IP address is updated every once in a while.
  How often this update will occur is determined by the MAXIMUM_COUNT_BEFORE_UPDATE constant.
*/
export default function IpTracker({ id }: IpTrackerProps) {
  useEffect(() => {
    const handler = async () => {
      let currentCount = Number.parseInt(localStorage.getItem('ip-update-count') || '0');
      if (currentCount > MAXIMUM_COUNT_BEFORE_UPDATE) {
        // Ensure that the count doesn't get too high
        currentCount = 0;
      }

      if (currentCount % MAXIMUM_COUNT_BEFORE_UPDATE === 0) {
        try {
          if (!id) return;
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          const ipAddress = data.ip;
          if (!id) return;
          await updateIpAddress(id, ipAddress);
          currentCount = 0; // Wraping the count to 0, so it doesn't get too high

        } catch (error) {
          console.error('Error updating IP address:', error);
        }
      }

      console.log("Current count:", currentCount);
      localStorage.setItem('ip-update-count', (currentCount + 1).toString());
    };

    handler();
  }, [id]); // Add id to dependency array

  return <></>;
}