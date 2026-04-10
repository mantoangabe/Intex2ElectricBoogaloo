import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/styles.css";
import apiClient from "../../api/apiClient";

interface ProcessRecording {
  recordingId: number;
  residentId: number;
  sessionDate: string;
  socialWorker: string;
  sessionType: string;
  sessionDurationMinutes: number;
  emotionalStateObserved: string;
  emotionalStateEnd: string;
  sessionNarrative: string;
  interventionsApplied: string;
  followUpActions: string;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
}

export default function ProcessRecording() {
  const DEFAULT_PAGE_SIZE = 25;
  const parsePageSize = (value: string, total: number) =>
    value === "all" ? Math.max(total, 1) : Number(value);
  const [recordings, setRecordings] = useState<ProcessRecording[]>([]);
  const [residentIdInput, setResidentIdInput] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [jumpPage, setJumpPage] = useState("1");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProcessRecording;
    dir: "asc" | "desc";
  }>({ key: "sessionDate", dir: "asc" });
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const filteredRecordings = recordings
    .filter(
      (r) => followUpFilter === "all" || r.followUpActions === followUpFilter,
    );
  const sortedRecordings = filteredRecordings
    .sort((a, b) => {
      const dir = sortConfig.dir === "asc" ? 1 : -1;
      if (sortConfig.key === "sessionDate") {
        return (
          (new Date(a.sessionDate).getTime() -
            new Date(b.sessionDate).getTime()) *
          dir
        );
      }
      return (
        String(a[sortConfig.key] ?? "").localeCompare(
          String(b[sortConfig.key] ?? ""),
        ) * dir
      );
    });
  const totalCount = sortedRecordings.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedRecordings = sortedRecordings.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const followUpOptions = Array.from(
    new Set(recordings.map((r) => r.followUpActions).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  const toggleSort = (key: keyof ProcessRecording) =>
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editRecording, setEditRecording] = useState<ProcessRecording | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<ProcessRecording>>({});
  const [saving, setSaving] = useState(false);

  const fetchRecordings = (residentId: number) => {
    setLoading(true);
    apiClient
      .get<ProcessRecording[]>("/ProcessRecordings", {
        params: { skip: 0, take: 100000, residentId },
      })
      .then((res) => {
        setRecordings(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load process recordings."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedResidentId == null) {
      setRecordings([]);
      setError(null);
      return;
    }
    fetchRecordings(selectedResidentId);
  }, [selectedResidentId]);

  const openModal = (recording: ProcessRecording | null) => {
    setEditRecording(recording);
    setFormData(recording ? { ...recording } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditRecording(null);
    setFormData({});
  };

  const saveRecording = async () => {
    setSaving(true);
    try {
      if (editRecording?.recordingId) {
        await apiClient.put(
          `/ProcessRecordings/${editRecording.recordingId}`,
          formData,
        );
      } else {
        await apiClient.post("/ProcessRecordings", formData);
      }
      if (selectedResidentId != null) {
        fetchRecordings(selectedResidentId);
      }
      closeModal();
    } catch (err) {
      alert("Failed to save recording.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecording = async (id: number) => {
    if (window.confirm("Delete this recording?")) {
      try {
        await apiClient.delete(`/ProcessRecordings/${id}`);
        if (selectedResidentId != null) {
          fetchRecordings(selectedResidentId);
        }
      } catch (err) {
        alert("Failed to delete recording.");
      }
    }
  };
  useEffect(() => {
    setPage(1);
  }, [selectedResidentId, followUpFilter]);

  const pageSizeSelectValue =
    totalCount > 0 && pageSize >= totalCount ? "all" : String(pageSize);

  return (
    <AdminLayout title="Process Recording">
      <div className="page-header">
        <div>
          <h2>Process Recording</h2>
          <p>
            Document counseling sessions and emotional support interventions
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>
          + New Session Note
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="number"
          placeholder="Resident ID"
          className="filter-input"
          aria-label="Resident ID"
          value={residentIdInput}
          onChange={(e) => setResidentIdInput(e.target.value)}
        />
        <button
          className="btn btn-secondary"
          onClick={() => {
            const parsed = Number(residentIdInput);
            if (Number.isInteger(parsed) && parsed > 0) {
              setSelectedResidentId(parsed);
              setPage(1);
              setJumpPage("1");
              return;
            }
            setSelectedResidentId(null);
            setRecordings([]);
          }}
        >
          Load Resident Records
        </button>
        <select
          className="filter-select"
          aria-label="Filter by follow-up type"
          value={followUpFilter}
          onChange={(e) => setFollowUpFilter(e.target.value)}
        >
          <option value="all">All Follow-up Types</option>
          {followUpOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
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
          <h3>Session Records</h3>
          <small className="refresh-chip">
            Showing {pagedRecordings.length} of {totalCount} records
          </small>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th
                className="clickable-th"
                onClick={() => toggleSort("sessionDate")}
              >
                Date{" "}
                {sortConfig.key === "sessionDate"
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
                onClick={() => toggleSort("socialWorker")}
              >
                Social Worker{" "}
                {sortConfig.key === "socialWorker"
                  ? sortConfig.dir === "asc"
                    ? "▲"
                    : "▼"
                  : "↕"}
              </th>
              <th
                className="clickable-th"
                onClick={() => toggleSort("sessionType")}
              >
                Session Type{" "}
                {sortConfig.key === "sessionType"
                  ? sortConfig.dir === "asc"
                    ? "▲"
                    : "▼"
                  : "↕"}
              </th>
              <th>Emotional State</th>
              <th>Follow-up</th>
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
            {selectedResidentId == null && !error && (
              <tr>
                <td colSpan={7} className="placeholder-row">
                  Enter a Resident ID and click Load Resident Records to view sessions.
                </td>
              </tr>
            )}
            {selectedResidentId != null && pagedRecordings.length === 0 && !error && (
              <tr>
                <td colSpan={7} className="placeholder-row">
                  No session records found.
                </td>
              </tr>
            )}
            {pagedRecordings.map((r) => (
              <tr key={r.recordingId}>
                <td>{new Date(r.sessionDate).toLocaleDateString()}</td>
                <td>{r.residentId}</td>
                <td>{r.socialWorker}</td>
                <td>{r.sessionType}</td>
                <td>{r.emotionalStateObserved}</td>
                <td>{r.followUpActions}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openModal(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteRecording(r.recordingId!)}
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
            Page {page} of {totalPages}
          </span>
          <input
            className="pagination-jump-input"
            type="number"
            aria-label="Jump to page"
            min={1}
            max={totalPages}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const max = totalPages;
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
              const size = parsePageSize(e.target.value, totalCount);
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
            disabled={page >= totalPages || loading}
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
        <h3>About This Page</h3>
        <p
          style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}
        >
          Maintain a chronological record of each resident's healing journey.
          Each session captures: date, social worker, session type
          (individual/group), emotional state observed, narrative summary,
          interventions, and follow-up actions.
        </p>
      </div>

      {/* Process Recording Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editRecording ? "Edit Session Note" : "New Session Note"}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="process-recording-resident-id">
                  Resident ID
                </label>
                <input
                  id="process-recording-resident-id"
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
                <label htmlFor="process-recording-session-date">
                  Session Date
                </label>
                <input
                  id="process-recording-session-date"
                  type="date"
                  value={formData.sessionDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-social-worker">
                  Social Worker
                </label>
                <input
                  id="process-recording-social-worker"
                  type="text"
                  value={formData.socialWorker ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, socialWorker: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-session-type">
                  Session Type
                </label>
                <input
                  id="process-recording-session-type"
                  type="text"
                  value={formData.sessionType ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionType: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-session-duration">
                  Session Duration (minutes)
                </label>
                <input
                  id="process-recording-session-duration"
                  type="number"
                  value={formData.sessionDurationMinutes ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionDurationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-emotional-state-observed">
                  Emotional State Observed
                </label>
                <input
                  id="process-recording-emotional-state-observed"
                  type="text"
                  value={formData.emotionalStateObserved ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emotionalStateObserved: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-emotional-state-end">
                  Emotional State (End)
                </label>
                <input
                  id="process-recording-emotional-state-end"
                  type="text"
                  value={formData.emotionalStateEnd ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emotionalStateEnd: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-session-narrative">
                  Session Narrative
                </label>
                <textarea
                  id="process-recording-session-narrative"
                  value={formData.sessionNarrative ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionNarrative: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-interventions-applied">
                  Interventions Applied
                </label>
                <textarea
                  id="process-recording-interventions-applied"
                  value={formData.interventionsApplied ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interventionsApplied: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="process-recording-follow-up-actions">
                  Follow-up Actions
                </label>
                <select
                  id="process-recording-follow-up-actions"
                  value={formData.followUpActions ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      followUpActions: e.target.value,
                    })
                  }
                >
                  <option value="">Select follow-up action...</option>
                  {followUpOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.progressNoted ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progressNoted: e.target.checked,
                      })
                    }
                  />{" "}
                  Progress Noted
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.concernsFlagged ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        concernsFlagged: e.target.checked,
                      })
                    }
                  />{" "}
                  Concerns Flagged
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.referralMade ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        referralMade: e.target.checked,
                      })
                    }
                  />{" "}
                  Referral Made
                </label>
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
                onClick={saveRecording}
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
