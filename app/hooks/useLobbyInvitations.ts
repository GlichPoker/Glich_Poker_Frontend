import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Create API service instance
  const apiService = new ApiService();
  
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
    // Prevent multiple simultaneous fetch requests
    if (isFetchingRef.current) {
      return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      setLoading(false);
      setInvitations([]);
      // Don't set error for missing user to avoid UI disruption
      return;
    }
    
    // Set fetching flag to prevent duplicate requests
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Fetch open invitations - using the correct endpoint format
      // Wrap in a timeout to handle potential errors gracefully
      const fetchPromise = new Promise<number[]>((resolve) => {
        // Add a timeout to prevent hanging if the API doesn't respond
        const timeoutId = setTimeout(() => {
          console.warn('API request timed out');
          resolve([]);
        }, 5000);
        
        // Attempt to fetch data
        apiService.get<number[]>(`/users/openInvitations?userId=${currentUser.id}`)
          .then(data => {
            clearTimeout(timeoutId);
            resolve(data || []);
          })
          .catch(err => {
            console.error('API error:', err);
            clearTimeout(timeoutId);
            resolve([]);
          });
      });
      
      // Wait for the promise to resolve
      const openInvitations = await fetchPromise;
      
      // Get additional details about the invitations (in future implementation)
      const invitationsWithDetails = await fetchUserDetails(openInvitations);
      
      setInvitations(invitationsWithDetails);
    } catch (err) {
      console.error('Failed to fetch invitations data:', err);
      // Don't set error state for now, just use empty array to prevent UI crash
      setInvitations([]);
    } finally {
      setLoading(false);
      // Reset fetching flag after a short delay to prevent rapid consecutive calls
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 500);
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
