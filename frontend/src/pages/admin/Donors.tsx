import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/styles.css";
import apiClient from "../../api/apiClient";
import PredictionBadge from "../../components/PredictionBadge";
import LastRefreshChip from "../../components/LastRefreshChip";
import { ENABLE_ML_PREDICTIONS } from "../../config/features";
import { usePredictionMeta } from "../../hooks/usePredictionMeta";

interface Supporter {
  supporterId: number;
  displayName: string;
  supporterType: string;
  status: string;
  relationshipType: string;
  region: string;
  country: string;
  email: string;
  phone: string;
  acquisitionChannel: string;
  lapseRiskProbability?: number | null;
  lapseReachedOut?: boolean;
}

interface Donation {
  donationId: number;
  supporterId: number;
  donationType: string;
  donationDate: string;
  amount: number | null;
  estimatedValue: number | null;
  currencyCode: string | null;
}

export default function Donors() {
  const DEFAULT_PAGE_SIZE = 25;
  const parsePageSize = (value: string, total: number) =>
    value === "all" ? Math.max(total, 1) : Number(value);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [reachOutFilter, setReachOutFilter] = useState<"all" | "yes" | "no">(
    "all",
  );
  const [supporterSort, setSupporterSort] = useState<{
    key: string;
    dir: "asc" | "desc";
  }>({ key: "displayName", dir: "asc" });
  const [donationSort, setDonationSort] = useState<{
    key: string;
    dir: "asc" | "desc";
  }>({ key: "donationDate", dir: "desc" });
  const [supporterPage, setSupporterPage] = useState(1);
  const [supporterPageSize, setSupporterPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [supporterTotalCount, setSupporterTotalCount] = useState(0);
  const [supporterJumpPage, setSupporterJumpPage] = useState("1");
  const [donationPage, setDonationPage] = useState(1);
  const [donationPageSize, setDonationPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [donationTotalCount, setDonationTotalCount] = useState(0);
  const [donationJumpPage, setDonationJumpPage] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supporterHasMore, setSupporterHasMore] = useState(false);
  const [donationHasMore, setDonationHasMore] = useState(false);
  const [activeSection, setActiveSection] = useState<"donors" | "donations">(
    "donors",
  );
  const predictionMeta = usePredictionMeta(
    "/DonorRetentionPredictions/meta/latest",
    ENABLE_ML_PREDICTIONS,
  );

  // Supporter modal state
  const [showSupporterModal, setShowSupporterModal] = useState(false);
  const [editSupporter, setEditSupporter] = useState<Supporter | null>(null);
  const [supporterFormData, setSupporterFormData] = useState<
    Partial<Supporter>
  >({});
  const [savingSupporter, setSavingSupporter] = useState(false);

  // Donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [donationFormData, setDonationFormData] = useState<Partial<Donation>>(
    {},
  );
  const [savingDonation, setSavingDonation] = useState(false);
  const [donationTypeFilter, setDonationTypeFilter] = useState("all");
  const [donorStatusFilter, setDonorStatusFilter] = useState("all");
  const [donorSearchTerm, setDonorSearchTerm] = useState("");

  const fetchSupporters = (page: number, pageSize: number) => {
    setLoading(true);
    apiClient
      .get<Supporter[]>("/Supporters", {
        params: { skip: (page - 1) * pageSize, take: pageSize },
      })
      .then((res) => {
        setSupporterHasMore(res.data.length === pageSize);
        setSupporters(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load donors."))
      .finally(() => setLoading(false));
  };

  const fetchDonations = (page: number, pageSize: number) => {
    setLoading(true);
    apiClient
      .get<Donation[]>("/Donations", {
        params: { skip: (page - 1) * pageSize, take: pageSize },
      })
      .then((res) => {
        setDonationHasMore(res.data.length === pageSize);
        setDonations(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load donations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSupporters(1, supporterPageSize);
    fetchDonations(1, donationPageSize);
    apiClient
      .get<Supporter[]>("/Supporters", { params: { skip: 0, take: 100000 } })
      .then((r) => setSupporterTotalCount(r.data.length))
      .catch(() => {});
    apiClient
      .get<Donation[]>("/Donations", { params: { skip: 0, take: 100000 } })
      .then((r) => setDonationTotalCount(r.data.length))
      .catch(() => {});
    if (ENABLE_ML_PREDICTIONS) {
      // Metadata chip still uses prediction endpoint; displayed values are DB-backed.
    }
  }, []);

  const fmtUsd = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const openSupporterModal = (supporter: Supporter | null) => {
    setEditSupporter(supporter);
    setSupporterFormData(supporter ? { ...supporter } : {});
    setShowSupporterModal(true);
  };

  const closeSupporterModal = () => {
    setShowSupporterModal(false);
    setEditSupporter(null);
    setSupporterFormData({});
  };

  const saveSupporter = async () => {
    setSavingSupporter(true);
    try {
      if (editSupporter?.supporterId) {
        await apiClient.put(
          `/Supporters/${editSupporter.supporterId}`,
          supporterFormData,
        );
      } else {
        await apiClient.post("/Supporters", supporterFormData);
      }
      fetchSupporters(1, supporterPageSize);
      closeSupporterModal();
    } catch (err) {
      alert("Failed to save supporter.");
    } finally {
      setSavingSupporter(false);
    }
  };

  const deleteSupporter = async (id: number) => {
    if (window.confirm("Delete this supporter?")) {
      try {
        await apiClient.delete(`/Supporters/${id}`);
        fetchSupporters(supporterPage, supporterPageSize);
      } catch (err) {
        alert("Failed to delete supporter.");
      }
    }
  };

  const openDonationModal = (donation: Donation | null) => {
    setEditDonation(donation);
    setDonationFormData(donation ? { ...donation } : {});
    setShowDonationModal(true);
  };

  const closeDonationModal = () => {
    setShowDonationModal(false);
    setEditDonation(null);
    setDonationFormData({});
  };

  const saveDonation = async () => {
    setSavingDonation(true);
    try {
      if (editDonation?.donationId) {
        await apiClient.put(
          `/Donations/${editDonation.donationId}`,
          donationFormData,
        );
      } else {
        await apiClient.post("/Donations", donationFormData);
      }
      fetchDonations(1, donationPageSize);
      closeDonationModal();
    } catch (err) {
      alert("Failed to save donation.");
    } finally {
      setSavingDonation(false);
    }
  };

  const deleteDonation = async (id: number) => {
    if (window.confirm("Delete this donation?")) {
      try {
        await apiClient.delete(`/Donations/${id}`);
        fetchDonations(donationPage, donationPageSize);
      } catch (err) {
        alert("Failed to delete donation.");
      }
    }
  };

  const totalBySupporterId = donations.reduce<Record<number, number>>(
    (acc, d) => {
      const val = d.amount ?? d.estimatedValue ?? 0;
      acc[d.supporterId] = (acc[d.supporterId] ?? 0) + val;
      return acc;
    },
    {},
  );
  const supporterTotalPages = Math.max(
    1,
    Math.ceil(supporterTotalCount / supporterPageSize),
  );
  const donationTotalPages = Math.max(
    1,
    Math.ceil(donationTotalCount / donationPageSize),
  );
  const donorRows = supporters
    .filter((s) => {
      if (donorStatusFilter !== "all" && s.status !== donorStatusFilter) {
        return false;
      }

      if (donationTypeFilter !== "all") {
        const hasDonationOfType = donations.some(
          (d) => d.supporterId === s.supporterId && d.donationType === donationTypeFilter,
        );
        if (!hasDonationOfType) {
          return false;
        }
      }

      const trimmedSearch = donorSearchTerm.trim().toLowerCase();
      if (trimmedSearch) {
        const searchableText = [
          s.supporterId,
          s.displayName,
          s.email,
          s.phone,
        ]
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(trimmedSearch)) {
          return false;
        }
      }

      if (!ENABLE_ML_PREDICTIONS || reachOutFilter === "all") return true;
      return reachOutFilter === "yes"
        ? !!s.lapseReachedOut
        : !s.lapseReachedOut;
    })
    .sort((a, b) => {
      const dir = supporterSort.dir === "asc" ? 1 : -1;
      if (supporterSort.key === "lapseRiskProbability") {
        const av = a.lapseRiskProbability ?? -1;
        const bv = b.lapseRiskProbability ?? -1;
        return (av - bv) * dir;
      }
      const av = String((a as any)[supporterSort.key] ?? "");
      const bv = String((b as any)[supporterSort.key] ?? "");
      return av.localeCompare(bv) * dir;
    });
  const supporterPageSizeSelectValue =
    supporterTotalCount > 0 && supporterPageSize >= supporterTotalCount
      ? "all"
      : String(supporterPageSize);
  const donationPageSizeSelectValue =
    donationTotalCount > 0 && donationPageSize >= donationTotalCount
      ? "all"
      : String(donationPageSize);
  const toggleSupporterSort = (key: string) =>
    setSupporterSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  const toggleDonationSort = (key: string) =>
    setDonationSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  const donationRows = donations
    .filter(
      (d) =>
        donationTypeFilter === "all" || d.donationType === donationTypeFilter,
    )
    .sort((a, b) => {
      const dir = donationSort.dir === "asc" ? 1 : -1;
      if (donationSort.key === "amount") {
        const av = a.amount ?? a.estimatedValue ?? 0;
        const bv = b.amount ?? b.estimatedValue ?? 0;
        return (av - bv) * dir;
      }
      if (donationSort.key === "donationDate") {
        return (
          (new Date(a.donationDate).getTime() -
            new Date(b.donationDate).getTime()) *
          dir
        );
      }
      return (
        String((a as any)[donationSort.key] ?? "").localeCompare(
          String((b as any)[donationSort.key] ?? ""),
        ) * dir
      );
    });

  const updateSupporterLapseReachOut = async (
    supporterId: number,
    lapseReachedOut: boolean,
  ) => {
    setSupporters((prev) =>
      prev.map((s) =>
        s.supporterId === supporterId ? { ...s, lapseReachedOut } : s,
      ),
    );

    try {
      await apiClient.patch(`/Supporters/${supporterId}/lapse-reach-out`, {
        lapseReachedOut,
      });
    } catch {
      fetchSupporters(supporterPage, supporterPageSize);
      alert("Failed to update lapse reach out status.");
    }
  };

  return (
    <AdminLayout title="Donors & Contributions">
      <div className="page-header">
        <div>
          <h2>Donors & Contributions</h2>
          <p>Manage supporter profiles and track donations</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openSupporterModal(null)}
        >
          + Add Donor
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search donors..."
          className="filter-input"
          aria-label="Search donors"
          value={donorSearchTerm}
          onChange={(e) => setDonorSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          aria-label="Filter by donation type"
          value={donationTypeFilter}
          onChange={(e) => setDonationTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="Monetary">Monetary</option>
          <option value="In-Kind">In-Kind</option>
          <option value="Time/Skills">Time/Skills</option>
        </select>
        <select
          className="filter-select"
          aria-label="Filter by donor status"
          value={donorStatusFilter}
          onChange={(e) => setDonorStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {ENABLE_ML_PREDICTIONS && (
          <select
            className="filter-select"
            aria-label="Filter by reach out status"
            value={reachOutFilter}
            onChange={(e) => setReachOutFilter(e.target.value as any)}
          >
            <option value="all">Reach Out: All</option>
            <option value="yes">Reach Out: Yes</option>
            <option value="no">Reach Out: No</option>
          </select>
        )}
      </div>

      <div className="toggle-group">
        <button
          className={`btn btn-sm ${activeSection === "donors" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSection("donors")}
        >
          Donor List
        </button>
        <button
          className={`btn btn-sm ${activeSection === "donations" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSection("donations")}
        >
          Donation Allocation
        </button>
      </div>

      {activeSection === "donors" && (
        <div className="admin-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Donor List</h3>
            <small className="refresh-chip">
              Showing {donorRows.length} of {supporterTotalCount} records
            </small>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th
                  className="clickable-th"
                  onClick={() => toggleSupporterSort("displayName")}
                >
                  Name{" "}
                  {supporterSort.key === "displayName"
                    ? supporterSort.dir === "asc"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </th>
                <th
                  className="clickable-th"
                  onClick={() => toggleSupporterSort("supporterType")}
                >
                  Type{" "}
                  {supporterSort.key === "supporterType"
                    ? supporterSort.dir === "asc"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </th>
                <th
                  className="clickable-th"
                  onClick={() => toggleSupporterSort("status")}
                >
                  Status{" "}
                  {supporterSort.key === "status"
                    ? supporterSort.dir === "asc"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </th>
                {ENABLE_ML_PREDICTIONS && (
                  <th
                    className="table-center clickable-th"
                    onClick={() => toggleSupporterSort("lapseRiskProbability")}
                  >
                    Lapse Risk{" "}
                    {supporterSort.key === "lapseRiskProbability"
                      ? supporterSort.dir === "asc"
                        ? "▲"
                        : "▼"
                      : "↕"}
                  </th>
                )}
                {ENABLE_ML_PREDICTIONS && (
                  <th
                    className="clickable-th"
                    onClick={() => toggleSupporterSort("lapseRiskProbability")}
                  >
                    Lapse Probability{" "}
                    {supporterSort.key === "lapseRiskProbability"
                      ? supporterSort.dir === "asc"
                        ? "▲"
                        : "▼"
                      : "↕"}
                  </th>
                )}
                {ENABLE_ML_PREDICTIONS && (
                  <th
                    className="clickable-th"
                    onClick={() => toggleSupporterSort("lapseRiskProbability")}
                  >
                    Reach Out{" "}
                    {supporterSort.key === "lapseRiskProbability"
                      ? supporterSort.dir === "asc"
                        ? "▲"
                        : "▼"
                      : "↕"}
                  </th>
                )}
                <th>Total Contributed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {error && (
                <tr>
                  <td
                    colSpan={ENABLE_ML_PREDICTIONS ? 8 : 5}
                    className="placeholder-row"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {donorRows.length === 0 && !error && (
                <tr>
                  <td
                    colSpan={ENABLE_ML_PREDICTIONS ? 8 : 5}
                    className="placeholder-row"
                  >
                    No donors found.
                  </td>
                </tr>
              )}
              {donorRows.map((s) => (
                <tr key={s.supporterId}>
                  <td>{s.displayName}</td>
                  <td>{s.supporterType}</td>
                  <td>{s.status}</td>
                  {ENABLE_ML_PREDICTIONS && (
                    <td className="table-center">
                      {s.lapseRiskProbability != null ? (
                        <PredictionBadge
                          probability={s.lapseRiskProbability}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  {ENABLE_ML_PREDICTIONS && (
                    <td>
                      {s.lapseRiskProbability != null
                        ? `${(s.lapseRiskProbability * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                  )}
                  {ENABLE_ML_PREDICTIONS && (
                    <td>
                      {s.lapseRiskProbability != null ? (
                        <input
                          type="checkbox"
                          checked={!!s.lapseReachedOut}
                          disabled={s.lapseRiskProbability < 0.5}
                          onChange={(e) =>
                            updateSupporterLapseReachOut(
                              s.supporterId,
                              e.target.checked,
                            )
                          }
                          aria-label={`Reach out recommended for ${s.displayName}`}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  <td>
                    {totalBySupporterId[s.supporterId]
                      ? `$${totalBySupporterId[s.supporterId].toFixed(2)}`
                      : "—"}
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openSupporterModal(s)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteSupporter(s.supporterId!)}
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
              disabled={supporterPage === 1 || loading}
              onClick={() => {
                const p = supporterPage - 1;
                setSupporterPage(p);
                fetchSupporters(p, supporterPageSize);
              }}
            >
              Previous
            </button>
            <span>
              Page {supporterPage} of {supporterTotalPages}
            </span>
            <input
              className="pagination-jump-input"
              type="number"
              aria-label="Jump to page"
              min={1}
              max={supporterTotalPages}
              value={supporterJumpPage}
              onChange={(e) => setSupporterJumpPage(e.target.value)}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const p = Math.min(
                  supporterTotalPages,
                  Math.max(1, Number(supporterJumpPage) || 1),
                );
                setSupporterPage(p);
                fetchSupporters(p, supporterPageSize);
              }}
            >
              Go
            </button>
            <select
              className="filter-select"
              style={{ marginLeft: "auto" }}
              aria-label="Items per page"
              value={supporterPageSizeSelectValue}
              onChange={(e) => {
                const size = parsePageSize(e.target.value, supporterTotalCount);
                setSupporterPageSize(size);
                setSupporterPage(1);
                fetchSupporters(1, size);
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
              disabled={!supporterHasMore || loading}
              onClick={() => {
                const p = supporterPage + 1;
                setSupporterPage(p);
                fetchSupporters(p, supporterPageSize);
              }}
            >
              Next
            </button>
          </div>
          {ENABLE_ML_PREDICTIONS && (
            <div style={{ marginTop: "0.75rem" }}>
              <LastRefreshChip
                meta={predictionMeta}
                label="Donor lapse model"
              />
            </div>
          )}
        </div>
      )}

      {activeSection === "donations" && (
        <div className="admin-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Donation Allocation</h3>
              <small className="refresh-chip">
                Showing {donationRows.length} of {donationTotalCount} records
              </small>
            </div>
            <select
              className="filter-select"
              aria-label="Filter by donation type"
              value={donationTypeFilter}
              onChange={(e) => setDonationTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {[
                ...new Set(
                  donations.map((d) => d.donationType).filter(Boolean),
                ),
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => openDonationModal(null)}
            >
              + Add Donation
            </button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Supporter ID</th>
                <th
                  className="clickable-th"
                  onClick={() => toggleDonationSort("donationType")}
                >
                  Type{" "}
                  {donationSort.key === "donationType"
                    ? donationSort.dir === "asc"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </th>
                <th
                  className="clickable-th"
                  onClick={() => toggleDonationSort("donationDate")}
                >
                  Date{" "}
                  {donationSort.key === "donationDate"
                    ? donationSort.dir === "asc"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </th>
                <th
                  className="clickable-th"
                  onClick={() => toggleDonationSort("amount")}
                >
                  Amount{" "}
                  {donationSort.key === "amount"
                    ? donationSort.dir === "asc"
                      ? "▲"
                      : "▼"
                    : "↕"}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donationRows.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="placeholder-row">
                    No donations recorded.
                  </td>
                </tr>
              )}
              {donationRows.map((d) => (
                <tr key={d.donationId}>
                  <td>{d.donationId}</td>
                  <td>{d.supporterId}</td>
                  <td>{d.donationType}</td>
                  <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                  <td>
                    {d.amount != null
                      ? fmtUsd(d.amount)
                      : d.estimatedValue != null
                        ? `~${fmtUsd(d.estimatedValue)}`
                        : "—"}
                  </td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openDonationModal(d)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteDonation(d.donationId!)}
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
              disabled={donationPage === 1 || loading}
              onClick={() => {
                const p = donationPage - 1;
                setDonationPage(p);
                fetchDonations(p, donationPageSize);
              }}
            >
              Previous
            </button>
            <span>
              Page {donationPage} of {donationTotalPages}
            </span>
            <input
              className="pagination-jump-input"
              type="number"
              aria-label="Jump to page"
              min={1}
              max={donationTotalPages}
              value={donationJumpPage}
              onChange={(e) => setDonationJumpPage(e.target.value)}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const p = Math.min(
                  donationTotalPages,
                  Math.max(1, Number(donationJumpPage) || 1),
                );
                setDonationPage(p);
                fetchDonations(p, donationPageSize);
              }}
            >
              Go
            </button>
            <select
              className="filter-select"
              style={{ marginLeft: "auto" }}
              aria-label="Items per page"
              value={donationPageSizeSelectValue}
              onChange={(e) => {
                const size = parsePageSize(e.target.value, donationTotalCount);
                setDonationPageSize(size);
                setDonationPage(1);
                fetchDonations(1, size);
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
              disabled={!donationHasMore || loading}
              onClick={() => {
                const p = donationPage + 1;
                setDonationPage(p);
                fetchDonations(p, donationPageSize);
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Supporter Modal */}
      {showSupporterModal && (
        <div className="modal-overlay" onClick={closeSupporterModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editSupporter ? "Edit Donor" : "Add Donor"}</h3>
              <button className="modal-close" onClick={closeSupporterModal}>
                ×
              </button>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="supporter-display-name">Display Name</label>
                <input
                  id="supporter-display-name"
                  type="text"
                  value={supporterFormData.displayName ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      displayName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-type">Supporter Type</label>
                <input
                  id="supporter-type"
                  type="text"
                  value={supporterFormData.supporterType ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      supporterType: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-status">Status</label>
                <select
                  id="supporter-status"
                  value={supporterFormData.status ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="">Select status...</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="supporter-relationship-type">
                  Relationship Type
                </label>
                <input
                  id="supporter-relationship-type"
                  type="text"
                  value={supporterFormData.relationshipType ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      relationshipType: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-region">Region</label>
                <input
                  id="supporter-region"
                  type="text"
                  value={supporterFormData.region ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      region: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-country">Country</label>
                <input
                  id="supporter-country"
                  type="text"
                  value={supporterFormData.country ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      country: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-email">Email</label>
                <input
                  id="supporter-email"
                  type="email"
                  value={supporterFormData.email ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-phone">Phone</label>
                <input
                  id="supporter-phone"
                  type="text"
                  value={supporterFormData.phone ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="supporter-acquisition-channel">
                  Acquisition Channel
                </label>
                <input
                  id="supporter-acquisition-channel"
                  type="text"
                  value={supporterFormData.acquisitionChannel ?? ""}
                  onChange={(e) =>
                    setSupporterFormData({
                      ...supporterFormData,
                      acquisitionChannel: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeSupporterModal}
                disabled={savingSupporter}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveSupporter}
                disabled={savingSupporter}
              >
                {savingSupporter ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="modal-overlay" onClick={closeDonationModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editDonation ? "Edit Donation" : "Add Donation"}</h3>
              <button className="modal-close" onClick={closeDonationModal}>
                ×
              </button>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="donation-supporter-id">Supporter ID</label>
                <input
                  id="donation-supporter-id"
                  type="number"
                  value={donationFormData.supporterId ?? ""}
                  onChange={(e) =>
                    setDonationFormData({
                      ...donationFormData,
                      supporterId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="donation-type">Donation Type</label>
                <input
                  id="donation-type"
                  type="text"
                  value={donationFormData.donationType ?? ""}
                  onChange={(e) =>
                    setDonationFormData({
                      ...donationFormData,
                      donationType: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="donation-date">Donation Date</label>
                <input
                  id="donation-date"
                  type="date"
                  value={donationFormData.donationDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setDonationFormData({
                      ...donationFormData,
                      donationDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="donation-amount">Amount</label>
                <input
                  id="donation-amount"
                  type="number"
                  step="0.01"
                  value={donationFormData.amount ?? ""}
                  onChange={(e) =>
                    setDonationFormData({
                      ...donationFormData,
                      amount: parseFloat(e.target.value) || null,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="donation-estimated-value">
                  Estimated Value
                </label>
                <input
                  id="donation-estimated-value"
                  type="number"
                  step="0.01"
                  value={donationFormData.estimatedValue ?? ""}
                  onChange={(e) =>
                    setDonationFormData({
                      ...donationFormData,
                      estimatedValue: parseFloat(e.target.value) || null,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="donation-currency-code">Currency Code</label>
                <input
                  id="donation-currency-code"
                  type="text"
                  value={donationFormData.currencyCode ?? ""}
                  onChange={(e) =>
                    setDonationFormData({
                      ...donationFormData,
                      currencyCode: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeDonationModal}
                disabled={savingDonation}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveDonation}
                disabled={savingDonation}
              >
                {savingDonation ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
