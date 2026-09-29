import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl artem-gradient flex items-center justify-center">
              <span className="text-white font-bold text-body-lg">A</span>
            </div>
            <span className="text-heading-1 font-bold artem-gradient-text">Artem</span>
          </div>
          <h1 className="text-heading-2 text-text-primary">Welcome back</h1>
          <p className="text-body text-text-secondary mt-1">Sign in to continue your preparation</p>
        </div>

        {/* Form */}
        <form className="card-base p-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 text-error text-body-sm font-medium">
                {error}
              </div>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-body-sm text-primary hover:text-primary-hover font-medium">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>

        <p className="text-center text-body-sm text-text-secondary mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-hover font-medium">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
