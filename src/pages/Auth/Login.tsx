import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/FormControls';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onLogin: () => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const { brand } = useTheme();

  const [email, setEmail] = useState('admin@invoiceflow.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }
    onLogin();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: brand.surface }}
    >
      {/* Background Decor with dynamic theme colors */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] animate-pulse"
          style={{ background: `${brand.primary}12` }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] animate-pulse delay-1000"
          style={{ background: `${brand.accent || brand.primary}12` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="bg-white/80 backdrop-blur-2xl border p-10 rounded-[2.5rem] shadow-2xl transition-all duration-300"
          style={{
            borderColor: brand.primary + '15',
            boxShadow: `0 20px 40px -15px ${brand.primary}15`
          }}
        >

          {/* Logo / Brand Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent || brand.primary})`,
                boxShadow: `0 10px 20px ${brand.primary}30`
              }}
            >
              <span className="text-white font-bold text-3xl">I</span>
            </div>
            <h1
              className="text-3xl font-extrabold tracking-tight mb-2 transition-colors duration-300"
              style={{ color: brand.dark }}
            >
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Log in to manage your professional invoices
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Address field */}
            <Input
              label="Email Address *"
              icon={Mail}
              type="email"
              required
              placeholder="admin@invoiceflow.com"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password field */}
            <Input
              label={
                <div className="flex justify-between items-center w-full">
                  <span>Password *</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('Password reset link sent (Simulation).'); }}
                    className="text-[10px] font-bold hover:underline transition-colors ml-auto"
                    style={{ color: brand.primary }}
                  >
                    Forgot?
                  </a>
                </div>
              }
              icon={Lock}
              type="password"
              required
              placeholder="••••••••"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Action button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              iconPosition="right"
              style={{ backgroundColor: brand.primary, boxShadow: `0 8px 24px -5px ${brand.primary}40` }}
              className="py-3.5 rounded-2xl mt-4 hover:opacity-95 transition-opacity"
            >
              Sign In to Flow
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
