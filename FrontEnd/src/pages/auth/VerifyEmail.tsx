import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

const VerifyEmail: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="w-full max-w-sm text-center">
      <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-7 w-7 text-success" />
      </div>
      <h1 className="text-heading-2 text-text-primary mb-2">Email Verified</h1>
      <p className="text-body text-text-secondary mb-6">
        Your email has been successfully verified. You can now access all features.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">Go to Dashboard</Button>
      </Link>
    </div>
  </div>
);

export default VerifyEmail;
