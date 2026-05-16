import { useState } from 'react';
import CreateFormCard from '../../Components/Cards/Create-form-card';
import SGDropdown from '../../Components/commen/SGDropdown';
import Input from '../../Components/commen/Input';
import { FiUser } from 'react-icons/fi';

import { addData } from '../../utils/db';

export default function CreateNewAdmin() {
  const [formData, setFormData] = useState({ fullName: '', role: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const adminSteps = [
    { id: 1, label: 'Personal Info' },
    { id: 2, label: 'Role & Dept' },
  ];

  const handleValidateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};
    if (step === 1 && !formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (step === 2 && !formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- સબમિટ હેન્ડલર હવે એકદમ નાનો થઈ ગયો ---
  const handleFormSubmit = async () => {
    // ફક્ત એક જ લાઈનમાં 'admins' ટેબલમાં ડેટા સ્ટોર થશે
    const isSaved = await addData('admins', formData);

    if (isSaved) {
      alert('ડેટા સફળતાપૂર્વક હેલ્પર ફાઇલ દ્વારા સ્ટોર થઈ ગયો! 🎉');
      setFormData({ fullName: '', role: '' }); // ફોર્મ રીસેટ
    } else {
      alert('ડેટા સેવ કરવામાં કંઈક પ્રોબ્લેમ થયો.');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-6 bg-gray-50/50">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Admin</h1>
      
      <CreateFormCard steps={adminSteps} onValidateStep={handleValidateStep} onSubmit={handleFormSubmit}>
        {(currentStep: number) => (
          <>
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter administrator full name"
                  value={formData.fullName}
                  icon={<FiUser />}
                  onChange={(e) => {
                    setFormData({...formData, fullName: e.target.value});
                    if (errors.fullName) setErrors({...errors, fullName: ''});
                  }}
                  className={errors.fullName ? 'border-red-500 ring-2 ring-red-50' : ''}
                />
                {errors.fullName && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.fullName}</p>}
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <SGDropdown 
                  label="Select Role"
                  name="role"
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({...formData, role: e.target.value});
                    if (errors.role) setErrors({...errors, role: ''});
                  }}
                  options={[
                    { value: 'super_admin', label: 'Super Admin' },
                    { value: 'admin', label: 'Admin User' }
                  ]}
                  error={errors.role}
                />
              </div>
            )}
          </>
        )}
      </CreateFormCard>
    </div>
  );
}