import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../context/ThemeContext';

interface ProfileModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ brand }) => {
  const [name, setName] = useState('Arsalan Abdul Sattar');
  const [email, setEmail] = useState('arsalan@lgtm.com');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [role] = useState('Administrator');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
        {/* Card header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Profile details</h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 text-xl font-bold select-none"
              style={{ borderColor: brand.primary, color: brand.primary }}
            >
              AS
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Profile picture</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">PNG or JPG up to 5MB.</p>
              <div className="flex gap-2 mt-2">
                <Button variant="white" size="xs">Change photo</Button>
                <Button variant="ghost" size="xs" className="text-red-500">Remove</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full name *" variant="compact" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email address *" variant="compact" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Phone number" variant="compact" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Role" variant="compact" value={role} disabled />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {saved ? 'Changes saved ✓' : 'Save profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
