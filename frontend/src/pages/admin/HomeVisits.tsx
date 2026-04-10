import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/styles.css";
import apiClient from "../../api/apiClient";

interface HomeVisitation {
  visitationId: number;
  residentId: number;
  visitDate: string;
  socialWorker: string;
  visitType: string;
  locationVisited: string;
  familyMembersPresent: string;
  purpose: string;
  observations: string;
  familyCooperationLevel: string;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes: string;
  visitOutcome: string;
}

export default function HomeVisits() {
  const DEFAULT_PAGE_SIZE = 25;
  const DEFAULT_UPCOMING_PAGE_SIZE = 10;
  const parsePageSize = (value: string, total: number) =>
    value === "all" ? Math.max(total, 1) : Number(value);
  const [visits, setVisits] = useState<HomeVisitation[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [jumpPage, setJumpPage] = useState("1");
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingPageSize, setUpcomingPageSize] = useState(
    DEFAULT_UPCOMING_PAGE_SIZE,
  );
  const [upcomingJumpPage, setUpcomingJumpPage] = useState("1");
  const [upcomingResidentSearch, setUpcomingResidentSearch] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");
  const [visitTypeFilter, setVisitTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof HomeVisitation;
    dir: "asc" | "desc";
  }>({ key: "visitDate", dir: "desc" });
  const sortedVisits = [...visits].sort((a, b) => {
    const dir = sortConfig.dir === "asc" ? 1 : -1;
    return (
      String(a[sortConfig.key] ?? "").localeCompare(
        String(b[sortConfig.key] ?? ""),
      ) * dir
    );
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingConferences = sortedVisits.filter(
    (v) => new Date(v.visitDate) > today,
  );
  const filteredUpcomingConferences = upcomingConferences.filter((v) => {
    const term = upcomingResidentSearch.trim();
    if (!term) {
      return true;
    }
    return String(v.residentId).includes(term);
  });
  const homeVisitRows = sortedVisits.filter((v) => new Date(v.visitDate) <= today);
  const homeVisitTotalPages = Math.max(
    1,
    Math.ceil(homeVisitRows.length / pageSize),
  );
  const pagedHomeVisitRows = homeVisitRows.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const upcomingTotalPages = Math.max(
    1,
    Math.ceil(filteredUpcomingConferences.length / upcomingPageSize),
  );
  const pagedUpcomingConferences = filteredUpcomingConferences.slice(
    (upcomingPage - 1) * upcomingPageSize,
    upcomingPage * upcomingPageSize,
  );
  const toggleSort = (key: keyof HomeVisitation) =>
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editVisit, setEditVisit] = useState<HomeVisitation | null>(null);
  const [formData, setFormData] = useState<Partial<HomeVisitation>>({});
  const [saving, setSaving] = useState(false);

  const fetchVisits = () => {
    setLoading(true);
    const params: any = { skip: 0, take: 100000 };
    if (selectedResidentId) {
      params.residentId = parseInt(selectedResidentId);
    }
    if (visitTypeFilter && visitTypeFilter !== "all") {
      params.visitType = visitTypeFilter;
    }
    apiClient
      .get<HomeVisitation[]>("/HomeVisitations", { params })
      .then((res) => {
        setVisits(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load home visitations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    setUpcomingPage(1);
    fetchVisits();
  }, [selectedResidentId, visitTypeFilter]);

  useEffect(() => {
    setUpcomingPage(1);
    setUpcomingJumpPage("1");
  }, [upcomingResidentSearch]);

  const openModal = (visit: HomeVisitation | null) => {
    setEditVisit(visit);
    setFormData(visit ? { ...visit } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditVisit(null);
    setFormData({});
  };

  const saveVisit = async () => {
    setSaving(true);
    try {
      if (editVisit?.visitationId) {
        await apiClient.put(
          `/HomeVisitations/${editVisit.visitationId}`,
          formData,
        );
      } else {
        await apiClient.post("/HomeVisitations", formData);
      }
      setPage(1);
      setUpcomingPage(1);
      fetchVisits();
      closeModal();
    } catch (err) {
      alert("Failed to save visit.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVisit = async (id: number) => {
    if (window.confirm("Delete this visit?")) {
      try {
        await apiClient.delete(`/HomeVisitations/${id}`);
        setUpcomingPage(1);
        fetchVisits();
      } catch (err) {
        alert("Failed to delete visit.");
      }
    }
  };
  const pageSizeSelectValue =
    homeVisitRows.length > 0 && pageSize >= homeVisitRows.length
      ? "all"
      : String(pageSize);
  const upcomingPageSizeSelectValue =
    filteredUpcomingConferences.length > 0 &&
    upcomingPageSize >= filteredUpcomingConferences.length
      ? "all"
      : String(upcomingPageSize);

  return (
    <AdminLayout title="Home Visitation & Case Conferences">
      <div className="page-header">
        <div>
          <h2>Home Visitation & Case Conferences</h2>
          <p>Log field visits and track case conference history</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>
          + Log Visit
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Resident ID"
          className="filter-input"
          aria-label="Filter by resident ID"
          value={selectedResidentId}
          onChange={(e) => setSelectedResidentId(e.target.value)}
        />
        <select
          className="filter-select"
          aria-label="Filter by visit type"
          value={visitTypeFilter}
          onChange={(e) => setVisitTypeFilter(e.target.value)}
        >
          <option value="all">All Visit Types</option>
          <option value="Initial Assessment">Initial Assessment</option>
          <option value="Routine Follow-up">Routine Follow-up</option>
          <option value="Reintegration Assessment">Reintegration Assessment</option>
          <option value="Post-placement Monitoring">Post-placement Monitoring</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>

      <div className="admin-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Home Visits</h3>
          <small className="refresh-chip">
            Showing {pagedHomeVisitRows.length} of {homeVisitRows.length} records
          </small>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th
                className="clickable-th"
                onClick={() => toggleSort("visitDate")}
              >
                Date{" "}
                {sortConfig.key === "visitDate"
                  ? sortConfig.dir === "asc"
                    ? "▲"
                    : "▼"
                  : "↕"}
              </th>
              <th
                className="clickable-th"
                onClick={() => toggleSort("residentId")}
              >
                Resident ID{" "}
                {sortConfig.key === "residentId"
                  ? sortConfig.dir === "asc"
                    ? "▲"
                    : "▼"
                  : "↕"}
              </th>
              <th
                className="clickable-th"
                onClick={() => toggleSort("visitType")}
              >
                Visit Type{" "}
                {sortConfig.key === "visitType"
                  ? sortConfig.dir === "asc"
                    ? "▲"
                    : "▼"
                  : "↕"}
              </th>
              <th
                className="clickable-th"
                onClick={() => toggleSort("socialWorker")}
              >
                Social Worker{" "}
                {sortConfig.key === "socialWorker"
                  ? sortConfig.dir === "asc"
                    ? "▲"
                    : "▼"
                  : "↕"}
              </th>
              <th>Observations</th>
              <th>Safety Concerns</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={7} className="placeholder-row">
                  {error}
                </td>
              </tr>
            )}
            {pagedHomeVisitRows.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="placeholder-row">
                  No completed or current home visits in this filtered set.
                </td>
              </tr>
            )}
            {pagedHomeVisitRows.map((v) => (
              <tr key={v.visitationId}>
                <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                <td>{v.residentId}</td>
                <td>{v.visitType}</td>
                <td>{v.socialWorker}</td>
                <td>{v.observations}</td>
                <td>{v.safetyConcernsNoted ? "Yes" : "No"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openModal(v)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteVisit(v.visitationId!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === 1 || loading}
            onClick={() => {
              const p = page - 1;
              setPage(p);
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {homeVisitTotalPages}
          </span>
          <input
            className="pagination-jump-input"
            type="number"
            aria-label="Jump to page"
            min={1}
            max={homeVisitTotalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const max = homeVisitTotalPages;
              const p = Math.min(max, Math.max(1, Number(jumpPage) || 1));
              setPage(p);
            }}
          >
            Go
          </button>
          <select
            className="filter-select"
            style={{ marginLeft: "auto" }}
            aria-label="Items per page"
            value={pageSizeSelectValue}
            onChange={(e) => {
              const size = parsePageSize(e.target.value, homeVisitRows.length);
              setPageSize(size);
              setPage(1);
            }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
            <option value="all">All records</option>
          </select>
          <button
            className="btn btn-secondary btn-sm"
            disabled={page >= homeVisitTotalPages || loading}
            onClick={() => {
              const p = page + 1;
              setPage(p);
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Upcoming Case Conferences</h3>
          <small className="refresh-chip">
            Showing {pagedUpcomingConferences.length} of {filteredUpcomingConferences.length} upcoming
          </small>
        </div>
        <div className="filter-bar" style={{ marginBottom: "0.75rem" }}>
          <input
            type="text"
            placeholder="Search upcoming by Resident ID"
            className="filter-input"
            aria-label="Search upcoming conferences by resident ID"
            value={upcomingResidentSearch}
            onChange={(e) => setUpcomingResidentSearch(e.target.value)}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Resident ID</th>
              <th>Visit Type</th>
              <th>Social Worker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedUpcomingConferences.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="placeholder-row">
                  No upcoming conferences in this filtered set.
                </td>
              </tr>
            )}
            {pagedUpcomingConferences.map((v) => (
              <tr key={v.visitationId}>
                <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                <td>{v.residentId}</td>
                <td>{v.visitType}</td>
                <td>{v.socialWorker}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openModal(v)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteVisit(v.visitationId!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button
            className="btn btn-secondary btn-sm"
            disabled={upcomingPage === 1 || loading}
            onClick={() => {
              const p = upcomingPage - 1;
              setUpcomingPage(p);
            }}
          >
            Previous
          </button>
          <span>
            Page {upcomingPage} of {upcomingTotalPages}
          </span>
          <input
            className="pagination-jump-input"
            type="number"
            aria-label="Jump to upcoming page"
            min={1}
            max={upcomingTotalPages}
            value={upcomingJumpPage}
            onChange={(e) => setUpcomingJumpPage(e.target.value)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const max = upcomingTotalPages;
              const p = Math.min(max, Math.max(1, Number(upcomingJumpPage) || 1));
              setUpcomingPage(p);
            }}
          >
            Go
          </button>
          <select
            className="filter-select"
            style={{ marginLeft: "auto" }}
            aria-label="Upcoming items per page"
            value={upcomingPageSizeSelectValue}
            onChange={(e) => {
              const size = parsePageSize(
                e.target.value,
                filteredUpcomingConferences.length,
              );
              setUpcomingPageSize(size);
              setUpcomingPage(1);
            }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value="all">All records</option>
          </select>
          <button
            className="btn btn-secondary btn-sm"
            disabled={upcomingPage >= upcomingTotalPages || loading}
            onClick={() => {
              const p = upcomingPage + 1;
              setUpcomingPage(p);
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Home Visit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editVisit ? "Edit Visit" : "Log Visit"}</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="homevisit-resident-id">Resident ID</label>
                <input
                  id="homevisit-resident-id"
                  type="number"
                  value={formData.residentId ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      residentId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-date">Visit Date</label>
                <input
                  id="homevisit-date"
                  type="date"
                  value={formData.visitDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, visitDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-social-worker">Social Worker</label>
                <input
                  id="homevisit-social-worker"
                  type="text"
                  value={formData.socialWorker ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, socialWorker: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-type">Visit Type</label>
                <input
                  id="homevisit-type"
                  type="text"
                  value={formData.visitType ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, visitType: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-location">Location Visited</label>
                <input
                  id="homevisit-location"
                  type="text"
                  value={formData.locationVisited ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationVisited: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-family-members">
                  Family Members Present
                </label>
                <input
                  id="homevisit-family-members"
                  type="text"
                  value={formData.familyMembersPresent ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      familyMembersPresent: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-purpose">Purpose</label>
                <textarea
                  id="homevisit-purpose"
                  value={formData.purpose ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-observations">Observations</label>
                <textarea
                  id="homevisit-observations"
                  value={formData.observations ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, observations: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-cooperation-level">
                  Family Cooperation Level
                </label>
                <input
                  id="homevisit-cooperation-level"
                  type="text"
                  value={formData.familyCooperationLevel ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      familyCooperationLevel: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.safetyConcernsNoted ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        safetyConcernsNoted: e.target.checked,
                      })
                    }
                  />{" "}
                  Safety Concerns Noted
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.followUpNeeded ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followUpNeeded: e.target.checked,
                      })
                    }
                  />{" "}
                  Follow-up Needed
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-follow-up-notes">
                  Follow-up Notes
                </label>
                <textarea
                  id="homevisit-follow-up-notes"
                  value={formData.followUpNotes ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, followUpNotes: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="homevisit-outcome">Visit Outcome</label>
                <input
                  id="homevisit-outcome"
                  type="text"
                  value={formData.visitOutcome ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, visitOutcome: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveVisit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
