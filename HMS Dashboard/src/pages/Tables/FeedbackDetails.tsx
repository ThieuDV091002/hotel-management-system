import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface FeedbackDTO {
  id: number;
  customerId: number;
  customerName: string;
  bookingId: number;
  rating: number;
  comment: string;
  dateTime: string;
}

const Button: React.FC<{
  size?: 'sm';
  variant?: 'outline' | 'filled';
  onClick: () => void;
  children: React.ReactNode;
}> = ({ size = 'sm', variant = 'filled', onClick, children }) => {
  const baseStyles = 'px-4 py-2 rounded-md text-sm font-medium';
  const sizeStyles = size === 'sm' ? 'text-sm' : '';
  const variantStyles =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
      : 'bg-blue-500 text-white hover:bg-blue-600';
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles}`}
    >
      {children}
    </button>
  );
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => index < rating);
  return (
    <div className="flex items-center">
      {stars.map((filled, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const FeedbackDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FeedbackDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!accessToken) {
        console.error('No access token found');
        alert('Please log in to access feedback details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid feedback ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/feedback/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const feedback: FeedbackDTO = await response.json();
          setFormData(feedback);
        } else if (response.status === 404) {
          setError('Feedback not found');
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch feedback:', response.status, response.statusText, errorText);
          setError(`Failed to fetch feedback: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('An error occurred while fetching feedback data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, accessToken, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!formData) {
    return <div>No feedback data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Feedback Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.id}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Customer Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.customerName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Customer ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.customerId}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Booking ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.bookingId}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Rating
              </p>
              <div className="flex items-center gap-2">
                <StarRating rating={formData.rating} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date Time
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(formData.dateTime).toLocaleString()}
              </p>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Comment
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.comment || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/feedback")}>Back</Button>
      </div>
    </div>
  );
};

export default FeedbackDetails;