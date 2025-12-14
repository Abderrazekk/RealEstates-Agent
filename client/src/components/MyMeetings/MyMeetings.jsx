import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyMeetings();
  }, []);

  const fetchMyMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings/my-meetings');
      setMeetings(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch your meetings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Meetings</h1>
          <p className="text-gray-600 mt-2">View and manage your property viewing appointments</p>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-600 mb-6">You haven't scheduled any property viewings yet.</p>
            <Link
              to="/properties"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {meeting.property?.images?.[0] && (
                        <img
                          src={meeting.property.images[0].url}
                          alt={meeting.propertyTitle}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {meeting.propertyTitle}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {meeting.property?.location}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(meeting.meetingDate)}
                          </span>
                        </div>
                        {meeting.adminResponse && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Agent's Note: </span>
                              {meeting.adminResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/property/${meeting.property?._id || ''}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      View Property
                    </Link>
                    {meeting.status === 'pending' && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to cancel this meeting?')) {
                            try {
                              await axios.delete(`/api/meetings/${meeting._id}`);
                              toast.success('Meeting cancelled successfully');
                              fetchMyMeetings();
                            } catch (error) {
                              toast.error('Failed to cancel meeting');
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMeetings;