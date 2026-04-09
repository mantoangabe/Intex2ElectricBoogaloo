import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import apiClient from '../../api/apiClient';

type AdminUser = {
  id: string;
  email: string;
  roleId: number;
  role: string;
};

export default function UserRoles() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<AdminUser[]>('/Auth/admin/users');
      setUsers(response.data);
    } catch {
      setError('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const updateRole = async (user: AdminUser) => {
    const targetRole = user.roleId === 1 ? 'Admin' : 'Donor';
    const action = user.roleId === 1 ? 'promote' : 'demote';

    const confirmed = window.confirm(`${action === 'promote' ? 'Promote' : 'Demote'} ${user.email} to ${targetRole}?`);
    if (!confirmed) {
      return;
    }

    setSavingUserId(user.id);

    try {
      await apiClient.put(`/Auth/admin/users/${user.id}/${action}`);
      await loadUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = (err.response?.data as { message?: string; errors?: string } | undefined)?.message;
        const backendErrors = (err.response?.data as { message?: string; errors?: string } | undefined)?.errors;
        setError(backendMessage ?? backendErrors ?? `Failed to ${action} user role.`);
      } else {
        setError(`Failed to ${action} user role.`);
      }
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <AdminLayout title="User Role Management">
      <div className="page-header">
        <div>
          <h2>User Role Management</h2>
          <p>Promote donor accounts to admin accounts.</p>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Accounts</h3>
          <small className="refresh-chip">{users.length} total</small>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="placeholder-row">Loading users...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={3} className="placeholder-row">{error}</td>
              </tr>
            )}
            {!loading && !error && users.length === 0 && (
              <tr>
                <td colSpan={3} className="placeholder-row">No users found.</td>
              </tr>
            )}
            {!loading && !error && users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {user.roleId === 1 ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => updateRole(user)}
                      disabled={savingUserId === user.id}
                    >
                      {savingUserId === user.id ? 'Updating...' : 'Make Admin'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => updateRole(user)}
                      disabled={savingUserId === user.id}
                    >
                      {savingUserId === user.id ? 'Updating...' : 'Make Donor'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
