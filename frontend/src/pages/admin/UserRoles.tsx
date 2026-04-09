import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import apiClient from "../../api/apiClient";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const trimmedSearch = searchTerm.trim();
      const userParams: Record<string, string | number> = {
        skip: (page - 1) * pageSize,
        take: pageSize,
      };

      if (trimmedSearch) {
        userParams.search = trimmedSearch;
      }

      const countParams: Record<string, string> = {};
      if (trimmedSearch) {
        countParams.search = trimmedSearch;
      }

      const [usersResponse, countResponse] = await Promise.all([
        apiClient.get<AdminUser[]>("/Auth/admin/users", { params: userParams }),
        apiClient.get<number>("/Auth/admin/users/count", {
          params: countParams,
        }),
      ]);

      setTotalCount(countResponse.data);
      setUsers(usersResponse.data);
    } catch {
      setError("Failed to load user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [page, pageSize, searchTerm]);

  const updateRole = async (user: AdminUser) => {
    const targetRole = user.roleId === 1 ? "Admin" : "Donor";
    const action = user.roleId === 1 ? "promote" : "demote";

    const confirmed = window.confirm(
      `${action === "promote" ? "Promote" : "Demote"} ${user.email} to ${targetRole}?`,
    );
    if (!confirmed) {
      return;
    }

    setSavingUserId(user.id);

    try {
      await apiClient.put(`/Auth/admin/users/${user.id}/${action}`);
      await loadUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMessage = (
          err.response?.data as
            | { message?: string; errors?: string }
            | undefined
        )?.message;
        const backendErrors = (
          err.response?.data as
            | { message?: string; errors?: string }
            | undefined
        )?.errors;
        setError(
          backendMessage ?? backendErrors ?? `Failed to ${action} user role.`,
        );
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
        <div className="filter-bar" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by email..."
            aria-label="Search by email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Accounts</h3>
          <small className="refresh-chip">
            Showing {users.length} of {totalCount} records
          </small>
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
                <td colSpan={3} className="placeholder-row">
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={3} className="placeholder-row">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && users.length === 0 && (
              <tr>
                <td colSpan={3} className="placeholder-row">
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              users.map((user) => (
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
                        {savingUserId === user.id
                          ? "Updating..."
                          : "Make Admin"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateRole(user)}
                        disabled={savingUserId === user.id}
                      >
                        {savingUserId === user.id
                          ? "Updating..."
                          : "Make Donor"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="pagination-row">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={
              page >= Math.max(1, Math.ceil(totalCount / pageSize)) || loading
            }
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
          <select
            className="filter-select"
            style={{ marginLeft: "auto" }}
            aria-label="Items per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </AdminLayout>
  );
}
