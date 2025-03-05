import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Heading from '../components/Heading';

// Types and Interfaces
interface UserProfile {
  firstname: string;
  email: string;
  userId: string;
}

interface CollaborationRequest {
  userProfile: UserProfile;
  requestStatus: RequestStatus;
  projectId: string;
  projectTitle: string;
}

type RequestStatus = 'pending' | 'accepted' | 'rejected';
type ActionType = 'accept' | 'decline';

interface ApiResponse {
  message: string;
}

const CollaborationRequests: React.FC = () => {
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Session expired. Please log in again.');
          setLoading(false);
          return;
        }

        setLoading(true);

        const response = await axios.get<{ success: boolean; message: string; data: CollaborationRequest[] }>(
          'http://localhost:3000/api/v1/project/collaboration-requests',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRequests(response.data.data || []);
      } catch (err) {
        console.error('Error fetching collaboration requests:', err);
        setError('Failed to load requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    void fetchRequests();
  }, []);

  const handleAction = async (
    projectId: string,
    userId: string,
    action: ActionType
  ): Promise<void> => {
    const loadingKey = `${action}-${projectId}-${userId}`;
    setActionLoading(loadingKey);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired. Please log in again.');
        return;
      }

      const response = action === 'decline' ? 'reject' : action;

      const { data } = await axios.put<ApiResponse>(
        `http://localhost:3000/api/v1/project/${projectId}/collaboration-requests`,
        {
          response,
          requestingUserId: userId
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests((prev) =>
        prev.map((req) =>
          req.projectId === projectId && req.userProfile.userId === userId
            ? { ...req, requestStatus: action === 'accept' ? 'accepted' : 'rejected' }
            : req
        )
      );

      console.log(data.message);
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update request. Please try again later.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(`Error performing ${action} action:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const ActionButton: React.FC<{
    action: ActionType;
    projectId: string;
    userId: string;
  }> = ({ action, projectId, userId }) => {
    const loadingKey = `${action}-${projectId}-${userId}`;
    const isLoading = actionLoading === loadingKey;
    
    const buttonConfig = {
      accept: {
        bgColor: 'bg-green-500',
        hoverColor: 'hover:bg-green-700',
        icon: <FaCheck className="text-xl" />
      },
      decline: {
        bgColor: 'bg-red-500',
        hoverColor: 'hover:bg-red-700',
        icon: <FaTimes className="text-xl" />
      }
    };

    const config = buttonConfig[action];

    return (
      <button
        onClick={() => void handleAction(projectId, userId, action)}
        disabled={isLoading}
        className={`w-10 h-10 rounded-full ${config.bgColor} text-white flex justify-center items-center ${config.hoverColor} transition-all disabled:opacity-50`}
        aria-label={`${action} collaboration request`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          config.icon
        )}
      </button>
    );
  };

  return (
    <div className="flex bg-slate-300 justify-center min-h-screen">
      <Navbar />
      <div className="flex bg-slate-300 w-full ml-16 mr-8 md:ml-72">
      <div className="flex flex-col w-full max-w-7xl mx-auto">
      <div className="mb-6 px-4">
        <Heading label="Collaboration Requests" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-center text-gray-600">Loading projects...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-gray-600">No collaboration requests found.</p>
        ) : (
          requests.map((request) => (
            <div key={request.projectId} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-semibold">{request.projectTitle}</h2>
              <p className="text-gray-700">{request.userProfile.firstname} ({request.userProfile.email})</p>
              <p className="text-sm font-semibold text-gray-500">Status: {request.requestStatus}</p>
              {request.requestStatus === 'pending' && (
                <div className="flex space-x-4 mt-4">
                  <ActionButton action="accept" projectId={request.projectId} userId={request.userProfile.userId} />
                  <ActionButton action="decline" projectId={request.projectId} userId={request.userProfile.userId} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </div>
    </div>   
  );
};

export default CollaborationRequests;
