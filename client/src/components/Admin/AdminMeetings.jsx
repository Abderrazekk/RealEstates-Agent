import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const AdminMeetings = () => {
  const { isAdmin } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchMeetings();
      fetchMeetingStats();
    }
  }, [filters]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        page: filters.page,
        limit: filters.limit,
      }).toString();

      const response = await api.get(`/api/meetings/admin/all?${params}`);
      setMeetings(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      if (error.userMessage) {
        toast.error(error.userMessage);
      } else {
        toast.error("Failed to fetch meetings");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetingStats = async () => {
    try {
      const response = await api.get("/api/meetings/admin/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching meeting stats:", error);
      if (error.userMessage) {
        toast.error(error.userMessage);
      }
    }
  };

  const handleStatusUpdate = async (meetingId, status) => {
    try {
      const response = await api.patch(`/api/meetings/${meetingId}/status`, {
        status,
        adminResponse: responseText,
      });

      toast.success(response.data.message);

      // Update local state
      setMeetings(
        meetings.map((meeting) =>
          meeting._id === meetingId
            ? {
                ...meeting,
                status,
                adminResponse: responseText,
                respondedAt: new Date().toISOString(),
              }
            : meeting
        )
      );

      // Update stats
      fetchMeetingStats();

      // Close modal
      setSelectedMeeting(null);
      setResponseText("");

      // Show email status
      if (response.data.emailSent) {
        toast.info(`Email sent to ${selectedMeeting?.userEmail}`);
      } else {
        toast.warning("Email could not be sent");
      }
    } catch (error) {
      console.error("Error updating meeting status:", error);
      if (error.userMessage) {
        toast.error(error.userMessage);
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update meeting status"
        );
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && !meetings.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage property viewing appointments
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <p className="text-gray-500 text-sm font-medium">
                Total Requests
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.total}
              </h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.pending}
              </h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <p className="text-gray-500 text-sm font-medium">Accepted</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.accepted}
              </h3>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <p className="text-gray-500 text-sm font-medium">Upcoming</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats.upcoming}
              </h3>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value, page: 1 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Meetings</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or property..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({ status: "all", search: "", page: 1, limit: 10 })
                }
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Meetings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {meeting.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {meeting.userEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          {meeting.userPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {meeting.propertyTitle}
                      </p>
                      {meeting.property && (
                        <p className="text-sm text-gray-500">
                          {meeting.property.location}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {formatDate(meeting.meetingDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Requested: {formatDate(meeting.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          meeting.status
                        )}`}
                      >
                        {meeting.status.charAt(0).toUpperCase() +
                          meeting.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {meeting.status === "pending" && (
                          <>
                            <button
                              onClick={() => setSelectedMeeting(meeting)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            >
                              Respond
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setResponseText(meeting.adminResponse || "");
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meetings.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">No meeting requests found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page - 1 })
                    }
                    disabled={filters.page === 1}
                    className={`px-4 py-2 rounded-lg border ${
                      filters.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page + 1 })
                    }
                    disabled={filters.page === pagination.pages}
                    className={`px-4 py-2 rounded-lg border ${
                      filters.page === pagination.pages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Meeting Details
                </h3>
                <button
                  onClick={() => {
                    setSelectedMeeting(null);
                    setResponseText("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <p className="text-gray-900">{selectedMeeting.userName}</p>
                  <p className="text-sm text-gray-600">
                    {selectedMeeting.userEmail}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedMeeting.userPhone}
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                      📧 Email will be sent to:{" "}
                      <strong>{selectedMeeting.userEmail}</strong>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property
                  </label>
                  <p className="text-gray-900">
                    {selectedMeeting.propertyTitle}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Time
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedMeeting.meetingDate)}
                  </p>
                </div>

                {selectedMeeting.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Notes
                    </label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedMeeting.notes}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Response (optional)
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Add a personal note for the client..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {selectedMeeting.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedMeeting._id, "accepted")
                      }
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Accept Meeting
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedMeeting._id, "rejected")
                      }
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      Decline Meeting
                    </button>
                  </>
                )}
                {selectedMeeting.status !== "pending" && (
                  <button
                    onClick={() => {
                      setSelectedMeeting(null);
                      setResponseText("");
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMeetings;