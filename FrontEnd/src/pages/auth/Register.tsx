import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      useAuthStore.setState({ error: 'Passwords do not match' });
      return;
    }
    if (password.length < 8) {
      useAuthStore.setState({ error: 'Password must be at least 8 characters' });
      return;
    }
    const success = await register({ name, email, password });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl artem-gradient flex items-center justify-center">
              <span className="text-white font-bold text-body-lg">A</span>
            </div>
            <span className="text-heading-1 font-bold artem-gradient-text">Artem</span>
          </div>
          <h1 className="text-heading-2 text-text-primary">Create your account</h1>
          <p className="text-body text-text-secondary mt-1">Start your interview preparation journey</p>
        </div>

        <form className="card-base p-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm font-medium">
                {error}
              </div>
            )}
            <Input label="Full Name" placeholder="Alex Morgan" value={name} onChange={(e) => { setName(e.target.value); clearError(); }} leftIcon={<User className="h-4 w-4" />} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} leftIcon={<Mail className="h-4 w-4" />} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} leftIcon={<Lock className="h-4 w-4" />} hint="At least 8 characters" required />
            <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }} leftIcon={<Lock className="h-4 w-4" />} required />
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              disabled={isLoading || !name || !email || !password || !confirmPassword}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        <p className="text-center text-body-sm text-text-secondary mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
