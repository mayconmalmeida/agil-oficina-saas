import React from 'react';
import { useAdminContext } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDebugInfo: React.FC = () => {
  const { user, isLoading, error } = useAdminContext();

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Debug: AdminContext State</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <strong>isLoading:</strong> {isLoading ? 'true' : 'false'}
          </div>
          <div>
            <strong>error:</strong> {error || 'null'}
          </div>
          <div>
            <strong>user:</strong> {user ? 'exists' : 'null'}
          </div>
          {user && (
            <div className="ml-4 space-y-1">
              <div><strong>id:</strong> {user.id}</div>
              <div><strong>email:</strong> {user.email}</div>
              <div><strong>role:</strong> {user.role}</div>
              <div><strong>isAdmin:</strong> {user.isAdmin ? 'true' : 'false'}</div>
              <div><strong>canAccessFeatures:</strong> {user.canAccessFeatures ? 'true' : 'false'}</div>
            </div>
          )}
          <div>
            <strong>localStorage admin_session:</strong> {
              localStorage.getItem('admin_session') ? 'exists' : 'null'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDebugInfo;