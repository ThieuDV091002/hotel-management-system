import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';

interface Service {
  id: number;
  serviceName: string;
  serviceDescription: string;
  servicePrice: number;
  serviceType: string;
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

const Input: React.FC<{
  type: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  name?: string;
}> = ({ type, value, onChange, name }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      name={name}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
    />
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
      {children}
    </label>
  );
};

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access service details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid service ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/services/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const service: Service = await response.json();
          setFormData(service);
        } else if (response.status === 404) {
          setError('Service not found');
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch service:', response.status, response.statusText, errorText);
          setError(`Failed to fetch service: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setError('An error occurred while fetching service data.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, accessToken, navigate]);

  const handleSave = async () => {
    if (!formData) {
      toast.error('No data to save.');
      return;
    }

    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update service.');
      navigate('/login');
      return;
    }

    if (!formData.serviceName.trim()) {
      toast.error('Service name cannot be empty.');
      return;
    }

    if (!formData.serviceDescription.trim()) {
      toast.error('Service description cannot be empty.');
      return;
    }

    if (isNaN(formData.servicePrice) || formData.servicePrice < 0) {
      toast.error('Valid service price is required.');
      return;
    }

    if (!formData.serviceType.trim()) {
      toast.error('Service type cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName: formData.serviceName,
          serviceDescription: formData.serviceDescription,
          servicePrice: formData.servicePrice,
          serviceType: formData.serviceType,
        }),
      });

      if (response.ok) {
        const updatedService: Service = await response.json();
        setFormData(updatedService);
        closeModal();
        toast.success('Service updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update service:', response.status, response.statusText, errorText);
        toast.error(`Failed to update service: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('An error occurred while updating the service.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: name === 'servicePrice' ? parseFloat(value) || '' : value,
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!formData) {
    return <div>No service data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Service Details
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
                Service Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.serviceName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.serviceDescription}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Price
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.servicePrice.toFixed(2)} VND
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Service Type
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.serviceType}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/services")}>Back</Button>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Service Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update service details to keep the profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Service Name</Label>
                  <Input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Service Description</Label>
                  <Input
                    type="text"
                    name="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Service Price</Label>
                  <Input
                    type="text"
                    name="servicePrice"
                    value={formData.servicePrice.toString()}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetails;