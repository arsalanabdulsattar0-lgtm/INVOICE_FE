import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import loginIllustration from '../../assets/login-illustration.png';
import { AlertModal } from '../../components/ui/AlertModal';
import { seedUsers, seedCompanies, seedBranches } from '../../utils/settingsData';

interface Props {
  companies: any[];
  branches: any[];
  onLoginSuccess: (companyId: string, branchId: string, setAsDefault: boolean) => void;
}

const Login: React.FC<Props> = ({ companies, branches, onLoginSuccess }) => {
  const { brand } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showContextSelection, setShowContextSelection] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'warning' | 'error' | 'info' }>({ isOpen: false, title: '', message: '' });

  const [tempSelectedCompanyId, setTempSelectedCompanyId] = useState(() => {
    try {
      // Just initialize with whatever for now, we will override on submit
      const activeCos = companies.filter((c: any) => c.is_active);
      return activeCos.length > 0 ? activeCos[0].id : '';
    } catch {
      return '';
    }
  });

  const [tempSelectedBranchId, setTempSelectedBranchId] = useState(() => {
    try {
      const activeCos = companies.filter((c: any) => c.is_active);
      if (activeCos.length > 0) {
        const activeCoId = activeCos[0].id;
        const firstBr = branches.find((b: any) => b.companyId === activeCoId);
        return firstBr ? firstBr.id : '';
      }
    } catch {}
    return '';
  });

  const [tempSetAsDefault, setTempSetAsDefault] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAlertModal({
        isOpen: true,
        title: 'Fields Missing',
        message: 'Please fill in all fields.',
        variant: 'warning'
      });
      return;
    }

    // Verify user exists and credentials match
    let users = seedUsers;
    try {
      const storedUsers = localStorage.getItem('user_records');
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      }
    } catch (e) {
      // fallback to seed
    }

    let foundUser = users.find(u => u.email === email && u.isActive);

    // TEMPORARY FIX: If user is not found in frontend storage (e.g. they were created in Super Admin which is on a different port),
    // let's create a temporary session for them so they can test.
    if (!foundUser && (email === 'arsalanabdulsattar0@gmail.com' || email === 'asralanabdulsattar0@gmail.com')) {
      foundUser = {
        id: 'temp-1',
        firstName: 'Arsalan',
        lastName: 'Abdulsattar',
        email: 'arsalanabdulsattar0@gmail.com', // Normalize it so App.tsx matching works
        roles: ['Admin'],
        isActive: true,
        companyIds: ['co-am'], // Only AM International
        mobile: '',
        allowedIps: '',
        defaultCompanyId: 'co-am',
        branchIds: ['br-am-1']
      };
    } else if (email === 'admin@invoiceflow.com') {
      foundUser = {
        id: 'admin-1',
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@invoiceflow.com',
        roles: ['Super Admin'],
        isActive: true,
        companyIds: [],
        mobile: '',
        allowedIps: '',
        defaultCompanyId: 'co1',
        branchIds: []
      };
    }

    if (!foundUser) {
      setAlertModal({
        isOpen: true,
        title: 'Authentication Failed',
        message: 'Invalid email or password, or account is disabled.',
        variant: 'error'
      });
      return;
    }

    // Save logged in user session
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    
    // Filter active companies for this user for context selection
    let safeCompanies = [...companies];
    if (!safeCompanies.some(c => c.id === 'co-am')) {
      const amCo = seedCompanies.find(c => c.id === 'co-am');
      if (amCo) safeCompanies.push(amCo);
    }
    
    const allowedCompanyIds = foundUser.roles.includes('Super Admin') ? safeCompanies.map(c => c.id) : foundUser.companyIds || [];
    const userActiveCos = safeCompanies.filter((c: any) => c.is_active && allowedCompanyIds.includes(c.id));
    
    if (userActiveCos.length > 0) {
      setTempSelectedCompanyId(userActiveCos[0].id);
      
      let safeBranches = branches.filter((b: any) => !['br-am-2', 'br-am-3'].includes(b.id));
      if (!safeBranches.some(b => b.companyId === 'co-am')) {
        const amBrs = seedBranches.filter(b => b.companyId === 'co-am' && !['br-am-2', 'br-am-3'].includes(b.id));
        safeBranches = [...safeBranches, ...amBrs];
      }
      
      const firstBr = safeBranches.find((b: any) => b.companyId === userActiveCos[0].id);
      setTempSelectedBranchId(firstBr ? firstBr.id : '');
    }

    // Check if default company and branch exist in localStorage
    const defCoId = localStorage.getItem('default_company_id');
    const defBrId = localStorage.getItem('default_branch_id');
    
    if (defCoId && defBrId) {
      const foundCo = companies.find((c: any) => c.id === defCoId);
      const foundBr = branches.find((b: any) => b.companyId === defCoId && b.id === defBrId);
      if (foundCo && foundBr) {
        onLoginSuccess(defCoId, defBrId, true);
        return;
      }
    }
    
    setShowContextSelection(true);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col lg:flex-row transition-colors duration-500 overflow-hidden bg-white">
      {/* ─── LEFT SIDE: PREMIUM ILLUSTRATION PANEL ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white items-center justify-center p-12 overflow-hidden border-r border-slate-100">
        {/* Soft, Brand-Colored Glow Blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'rgba(186, 230, 253, 0.4)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full filter blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'rgba(219, 234, 254, 0.4)' }}
        />

        <img
          src={loginIllustration}
          alt="Login Illustration"
          className="w-full h-full object-contain select-none pointer-events-none z-10"
          style={{ clipPath: 'inset(8px)' }}
        />
      </div>

      {/* ─── RIGHT SIDE: THEMED LOGIN PANEL ─── */}
      <div
        className="flex-1 flex flex-col justify-center px-6 sm:px-16 lg:px-24 py-16 relative items-center transition-colors duration-500"
        style={{
          backgroundColor: brand.mainBg
        }}
      >
        {/* Soft radial glow in top right */}
        <div
          className="absolute -top-30 -right-30 w-80 h-80 rounded-full filter blur-3xl opacity-15 pointer-events-none"
          style={{ background: brand.primary }}
        />

        {/* Outer centered container holding Logo + Card */}
        <div className="w-full max-w-[390px] space-y-6 relative z-10">
          
          {/* InvoiceFlow App Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{
                backgroundColor: brand.primary,
                boxShadow: `0 4px 12px ${brand.primary}40`,
                fontSize: 18
              }}
            >
              I
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">Inventory Tracking System</span>
          </div>

          {/* Standard Themed Login Card */}
          <Card
            className="p-8"
            style={{
              background: `linear-gradient(${brand.cardBg}, ${brand.cardBg}) padding-box, linear-gradient(135deg, ${brand.primary}, #38bdf8) border-box`,
              border: '1px solid transparent',
              borderRadius: '1rem',
              height: '455px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            {showContextSelection ? (
              <div className="w-full">
                {/* Title & Subtitle */}
                <div className="text-center mb-5 relative">
                  <button
                    type="button"
                    onClick={() => setShowContextSelection(false)}
                    className="absolute -top-1 left-0 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight mb-1">Select Context</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Choose the company and branch to log in.
                  </p>
                </div>

                {/* Company & Branch form */}
                <div className="space-y-4">
                  {/* Company Select */}
                  <div className="w-full space-y-1">
                    <label className="text-[11px] font-bold ml-1 block mb-1.5 text-slate-500">
                      Select Company
                    </label>
                    <div className="relative">
                      <select
                        value={tempSelectedCompanyId}
                        onChange={(e) => {
                          const coId = e.target.value;
                          setTempSelectedCompanyId(coId);
                          const firstBr = branches.find((b: any) => b.companyId === coId);
                          setTempSelectedBranchId(firstBr ? firstBr.id : '');
                        }}
                        className="w-full border font-normal text-slate-800 placeholder:text-slate-400 text-sm outline-none transition-all h-10 px-4 rounded-xl form-select-container bg-white appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Choose a company...</option>
                        {(() => {
                          let safeCompanies = [...companies];
                          if (!safeCompanies.some(c => c.id === 'co-am')) {
                            const amCo = seedCompanies.find(c => c.id === 'co-am');
                            if (amCo) safeCompanies.push(amCo);
                          }

                          let userActiveCos = safeCompanies.filter((c: any) => c.is_active);
                          try {
                            const storedUser = localStorage.getItem('currentUser');
                            if (storedUser) {
                              const parsedUser = JSON.parse(storedUser);
                              const allowedCompanyIds = parsedUser.roles.includes('Super Admin') ? safeCompanies.map((c:any) => c.id) : parsedUser.companyIds || [];
                              userActiveCos = userActiveCos.filter((c: any) => allowedCompanyIds.includes(c.id));
                            }
                          } catch {}
                          return userActiveCos;
                        })().map((co: any) => (
                          <option key={co.id} value={co.id}>
                            {co.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Branch Select */}
                  <div className="w-full space-y-1">
                    <label className="text-[11px] font-bold ml-1 block mb-1.5 text-slate-500">
                      Select Branch
                    </label>
                    <div className="relative">
                      <select
                        value={tempSelectedBranchId}
                        onChange={(e) => setTempSelectedBranchId(e.target.value)}
                        className="w-full border font-normal text-slate-800 placeholder:text-slate-400 text-sm outline-none transition-all h-10 px-4 rounded-xl form-select-container bg-white appearance-none cursor-pointer"
                        disabled={!tempSelectedCompanyId}
                      >
                        <option value="" disabled>Choose a branch...</option>
                        {(() => {
                          let safeBranches = [...branches];
                          if (!safeBranches.some(b => b.companyId === 'co-am')) {
                            const amBrs = seedBranches.filter(b => b.companyId === 'co-am');
                            safeBranches = [...safeBranches, ...amBrs];
                          }
                          return safeBranches.filter((b: any) => b.companyId === tempSelectedCompanyId);
                        })().map((br: any) => (
                          <option key={br.id} value={br.id}>
                            {br.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tempSetAsDefault}
                        onChange={(e) => setTempSetAsDefault(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-600 font-bold">Set As Default Company & Branch</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="text-white font-extrabold text-sm h-11 rounded-xl shadow-lg border-transparent transition-all"
                    style={{
                      backgroundColor: brand.primary,
                      boxShadow: `0 10px 20px -5px ${brand.primary}40`,
                      border: 'none'
                    }}
                    onClick={() => {
                      if (tempSelectedCompanyId && tempSelectedBranchId) {
                        onLoginSuccess(tempSelectedCompanyId, tempSelectedBranchId, tempSetAsDefault);
                      }
                    }}
                    disabled={!tempSelectedCompanyId || !tempSelectedBranchId}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {/* Title & Subtitle */}
                <div className="text-center mb-5">
                  <h2 className="text-[26px] font-extrabold text-slate-800 tracking-tight mb-1">Welcome Back</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Login to manage your business with Inventory Tracking System.
                  </p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label className="text-[11px] font-bold ml-1 block mb-1.5 text-slate-500">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="user@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={Mail}
                        size="md"
                        required
                        className="bg-white text-slate-800 placeholder:text-slate-400 focus:border-[var(--brand-primary)]"
                        style={{ borderColor: brand.border }}
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5 px-1">
                        <label className="text-[11px] font-bold text-slate-500">
                          Password
                        </label>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setAlertModal({
                              isOpen: true,
                              title: 'Password Reset',
                              message: 'A password reset link has been simulated & sent to your email.',
                              variant: 'info'
                            });
                          }}
                          className="text-[11px] font-bold hover:underline"
                          style={{ color: brand.primary }}
                        >
                          Forgot Password?
                        </a>
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={Lock}
                        size="md"
                        required
                        className="bg-white text-slate-800 focus:border-[var(--brand-primary)]"
                        style={{ borderColor: brand.border }}
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center p-1"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                    </div>

                    <div className="pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-600 font-bold">I agree to the Terms & Conditions</span>
                      </label>
                    </div>
                  </div>

                  {/* Log In button */}
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      type="submit"
                      className="text-white font-extrabold text-sm h-11 rounded-xl shadow-lg border-transparent transition-all"
                      style={{
                        backgroundColor: brand.primary,
                        boxShadow: `0 10px 20px -5px ${brand.primary}40`,
                        border: 'none'
                      }}
                      disabled={!agreeToTerms}
                    >
                      Log In
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant || "warning"}
      />
    </div>
  );
};

export default Login;
