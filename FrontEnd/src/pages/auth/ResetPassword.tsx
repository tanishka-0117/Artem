import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, ArrowRight } from 'lucide-react';

const ResetPassword: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-heading-2 text-text-primary">Set new password</h1>
        <p className="text-body text-text-secondary mt-1">Enter your new password below</p>
      </div>
      <div className="card-base p-6">
        <div className="space-y-4">
          <Input label="New Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} hint="At least 8 characters" />
          <Input label="Confirm Password" type="password" placeholder="••••••••" leftIcon={<Lock className="h-4 w-4" />} />
          <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default ResetPassword;
