import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ApiService } from '@/api/apiService';
import { User } from '@/types/user';

// Define types
export interface LobbyInvitation {
  sessionId: number;
  inviterId?: number;
  inviterName?: string;
}

interface InvitationResponse {
  success: boolean;
  message: string;
}

export function useLobbyInvitations() {
  const [invitations, setInvitations] = useState<LobbyInvitation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  
  // Create API service instance, memoized to prevent re-creation on re-renders
  const apiService = useMemo(() => new ApiService(), []);
  
  // Get the current user from localStorage
  const getCurrentUser = (): { id: string | null; username: string | null } | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return { 
        id: user.id ? String(user.id) : null,
        username: user.username || null
      };
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  };

  // Fetch all users to map IDs to names
  const fetchUserDetails = useCallback(async (sessionIds: number[]): Promise<LobbyInvitation[]> => {
    if (!sessionIds.length) return [];

    try {
      // In a real implementation, you'd want to fetch additional details about the invitations
      // like who sent them, when they were sent, etc.
      // For now, we'll just return the session IDs
      return sessionIds.map(sessionId => ({
        sessionId,
        // The backend isn't returning this data yet, but we're structuring it for future use
        inviterId: undefined,
        inviterName: undefined
      }));
    } catch (err) {
      console.error('Failed to fetch invitation details:', err);
      return sessionIds.map(sessionId => ({ sessionId }));
    }
  }, []);

  // Fetch all invitations data
  const fetchInvitationsData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      setInvitations([]);
      // No setLoading(true) here as it's a quick exit, error/loading state handled by caller or defaults
      return;
    }
    
    isFetchingRef.current = true;
    setError(null);

    // Timer to delay showing the loader, preventing flicker for fast responses
    const loaderTimer = setTimeout(() => {
      setLoading(true);
    }, 200); // Only show loader if fetching takes more than 200ms

    try {
      // Fetch open invitations - using the correct endpoint format
      // Wrap in a timeout to handle potential errors gracefully
      const fetchPromise = new Promise<number[]>((resolve) => {
        // Add a timeout to prevent hanging if the API doesn't respond
        const timeoutId = setTimeout(() => {
          console.warn('API request timed out for openInvitations');
          resolve([]);
        }, 5000);
        
        // Attempt to fetch data
        apiService.get<number[]>(`/users/openInvitations?userId=${currentUser.id}`)
          .then(data => {
            clearTimeout(timeoutId);
            resolve(data || []);
          })
          .catch(err => {
            console.error('API error fetching openInvitations:', err);
            clearTimeout(timeoutId);
            resolve([]); // Resolve with empty on error to allow flow to continue
          });
      });
      
      // Wait for the promise to resolve
      const openInvitations = await fetchPromise;
      
      // Get additional details about the invitations (in future implementation)
      const invitationsWithDetails = await fetchUserDetails(openInvitations);
      
      setInvitations(invitationsWithDetails);
    } catch (err) {
      console.error('Failed to fetch invitations data:', err);
      setInvitations([]); // Set to empty on error
      // setError('Failed to load invitations.'); // Optionally set a user-facing error
    } finally {
      clearTimeout(loaderTimer); // Important: clear the timer regardless of outcome
      setLoading(false); // Always set loading to false when operation finishes
      
      // Reset fetching flag immediately so subsequent calls aren't blocked unnecessarily
      isFetchingRef.current = false;
    }
  }, [apiService, fetchUserDetails]);

  // Refresh invitations data with debouncing to prevent rapid consecutive calls
  const refreshInvitationsData = useCallback(() => {
    // Only refresh if we're not already fetching
    if (!isFetchingRef.current) {
      fetchInvitationsData();
    }
  }, [fetchInvitationsData]);

  // Accept invitation function
  const acceptInvitation = async (sessionId: number): Promise<InvitationResponse> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, message: 'You must be logged in to accept invitations' };
    }

    try {
      await apiService.post(`/game/acceptInvitation`, {
        sessionId: sessionId,
        userId: Number(currentUser.id)
      });
      
      await fetchInvitationsData();
      return { success: true, message: 'Invitation accepted!' };
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to accept invitation'
      };
    }
  };

  // Decline invitation function
  const declineInvitation = async (sessionId: number): Promise<InvitationResponse> => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return { success: false, message: 'You must be logged in to decline invitations' };
    }

    try {
      await apiService.post(`/game/declineInvitation`, {
        sessionId: sessionId,
        userId: Number(currentUser.id)
      });
      
      await fetchInvitationsData();
      return { success: true, message: 'Invitation declined' };
    } catch (err: any) {
      console.error('Failed to decline invitation:', err);
      return { 
        success: false, 
        message: err.message || 'Failed to decline invitation'
      };
    }
  };

  // Load invitations data on component mount with a slight delay
  useEffect(() => {
    // Add a slight delay to prevent race conditions with other initialization
    const timerId = setTimeout(() => {
      // Try to fetch, but don't crash if it fails
      fetchInvitationsData().catch(error => {
        console.error('Error in initial invitations fetch:', error);
        setLoading(false);
        setInvitations([]);
      });
    }, 500);
    
    // Cleanup function to cancel the timer if the component unmounts before the timeout
    return () => clearTimeout(timerId);
  }, [fetchInvitationsData]);

  return {
    invitations,
    loading,
    error,
    acceptInvitation,
    declineInvitation,
    refreshInvitationsData
  };
}
