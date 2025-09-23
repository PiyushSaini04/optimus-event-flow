import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrganizationRegistration from '@/components/organization/OrganizationRegistration';

const OrganizationRegister = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Organization Registration</h1>
            <p className="text-muted-foreground">
              Create or join an organization to get started
            </p>
          </div>
        </div>

        <OrganizationRegistration />
      </div>
    </div>
  );
};

export default OrganizationRegister;