import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

interface LoyaltyLevel {
  id: number;
  levelName: string;
  pointsRequired: number;
  benefits: string;
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
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

const ActionMenu: React.FC<{ loyaltyLevelId: number }> = ({ loyaltyLevelId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/loyalty/${loyaltyLevelId}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ...
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => handleAction('View')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
};

const LoyaltyLevelTable: React.FC = () => {
  const { isOpen, openModal, closeModal } = useModal();
  const [loyaltyLevels, setLoyaltyLevels] = useState<LoyaltyLevel[]>([]);
  const [newLoyaltyLevel, setNewLoyaltyLevel] = useState<{
    levelName: string;
    pointsRequired: string;
    benefits: string;
  }>({
    levelName: '',
    pointsRequired: '',
    benefits: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoyaltyLevels = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access loyalty levels.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/loyalty-levels', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: LoyaltyLevel[] = await response.json();
          setLoyaltyLevels(data);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch loyalty levels:', response.status, response.statusText, errorText);
          setError(`Failed to fetch loyalty levels: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching loyalty levels:', error);
        setError('An error occurred while fetching loyalty levels.');
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyLevels();
  }, [accessToken, navigate]);

  const handleAddLoyaltyLevel = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLoyaltyLevel({ ...newLoyaltyLevel, [name]: value });
  };

  const handleSave = async () => {
    const parsedPoints = parseFloat(newLoyaltyLevel.pointsRequired);
    if (isNaN(parsedPoints)) {
      toast.warning('Invalid input: Points Required must be a number.');
      return;
    }

    if (!newLoyaltyLevel.levelName.trim()) {
      toast.warning('Invalid input: Level Name cannot be empty.');
      return;
    }

    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add a loyalty level.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/loyalty-levels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          levelName: newLoyaltyLevel.levelName.toUpperCase(),
          pointsRequired: parsedPoints,
          benefits: newLoyaltyLevel.benefits,
        }),
      });

      if (response.ok) {
        const newLevel: LoyaltyLevel = await response.json();
        setLoyaltyLevels([...loyaltyLevels, newLevel]);
        setNewLoyaltyLevel({
          levelName: '',
          pointsRequired: '',
          benefits: '',
        });
        closeModal();
      } else {
        const errorText = await response.text();
        console.error('Failed to create loyalty level:', response.status, response.statusText, errorText);
        toast.error(`Failed to create loyalty level: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating loyalty level:', error);
      toast.error('An error occurred while creating the loyalty level.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="Loyalty Level Tables Dashboard" description="Manage loyalty levels with add and view functionality" />
      <PageBreadcrumb pageTitle="Loyalty Level Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button onClick={handleAddLoyaltyLevel}>Add Loyalty Level</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Level Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Points Required</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Benefits</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loyaltyLevels.map((level) => (
                <tr key={level.id}>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-500 dark:text-gray-400">{level.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{level.levelName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{level.pointsRequired}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{level.benefits}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu loyaltyLevelId={level.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New Loyalty Level
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new loyalty level.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Level Name</Label>
                  <Input
                    type="text"
                    name="levelName"
                    value={newLoyaltyLevel.levelName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Points Required</Label>
                  <Input
                    type="number"
                    name="pointsRequired"
                    value={newLoyaltyLevel.pointsRequired}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Benefits</Label>
                  <Input
                    type="text"
                    name="benefits"
                    value={newLoyaltyLevel.benefits}
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
                Save Loyalty Level
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default LoyaltyLevelTable;