import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-success" />
          </div>
          <h1 className="text-heading-2 text-text-primary mb-2">Check your email</h1>
          <p className="text-body text-text-secondary mb-6">
            We sent a password reset link to <strong className="text-text-primary">{email}</strong>
          </p>
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium text-body-sm flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-heading-2 text-text-primary">Reset your password</h1>
          <p className="text-body text-text-secondary mt-1">Enter your email and we'll send you a reset link</p>
        </div>
        <div className="card-base p-6">
          <div className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<Mail className="h-4 w-4" />} />
            <Button variant="primary" size="lg" className="w-full" onClick={() => setSent(true)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Send Reset Link
            </Button>
          </div>
        </div>
        <p className="text-center mt-5">
          <Link to="/login" className="text-body-sm text-primary hover:text-primary-hover font-medium flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
