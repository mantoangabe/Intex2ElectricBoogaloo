import { useEffect, useState, type FormEvent } from "react";
import Navbar from "../../components/Navbar";
import "../../styles/styles.css";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../auth/AuthContext";

interface DonorDonationHistoryItem {
  donationId: number;
  date: string;
  amount: number | null;
  type: string;
  programArea: string | null;
  note: string | null;
}

export default function DonorDashboard() {
  const { isAdmin } = useAuth();
  const [donationAmount, setDonationAmount] = useState("");
  const [note, setNote] = useState("");
  const [history, setHistory] = useState<DonorDonationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDonationHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await apiClient.get<DonorDonationHistoryItem[]>("/Donations/mine");
      setHistory(response.data);
      setHistoryError(null);
    } catch {
      setHistoryError("Unable to load your donation history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setIsLoadingHistory(false);
      setHistory([]);
      setHistoryError(null);
      return;
    }

    void fetchDonationHistory();
  }, [isAdmin]);

  const handleDonate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsedAmount = Number(donationAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Enter a valid donation amount greater than zero.");
      return;
    }

    try {
      if (isAdmin) {
        setSubmitError("Admin accounts cannot submit donor donations from this page.");
        return;
      }
      setIsSubmitting(true);
      setSubmitError(null);
      await apiClient.post("/Donations/mine", {
        amount: parsedAmount,
        note,
      });
      await fetchDonationHistory();
    } catch {
      setSubmitError("Unable to submit donation right now. Please try again.");
      return;
    } finally {
      setIsSubmitting(false);
    }

    setDonationAmount("");
    setNote("");
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />

      <main className="public-page-main" style={{ maxWidth: "1000px" }}>
        <div className="page-header">
          <div>
            <h2 style={{ color: "var(--text)", margin: 0 }}>
              My Donor Dashboard
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                margin: "0.25rem 0 0",
              }}
            >
              Manage your contributions and view your impact
            </p>
          </div>
        </div>

        {/* Make a Donation Form */}
        <div className="admin-card">
          <h3>Make a Donation</h3>
          <form onSubmit={handleDonate}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label htmlFor="donor-donation-amount">Amount</label>
                <input
                  id="donor-donation-amount"
                  type="number"
                  step="0.01"
                  placeholder="$50.00"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="donor-note">Note (Optional)</label>
                <textarea
                  id="donor-note"
                  placeholder="Special instructions or comments..."
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    fontFamily: "var(--sans)",
                    padding: "0.7rem 0.9rem",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              {isSubmitting ? "Submitting..." : "Donate Now"}
            </button>
            {isAdmin && (
              <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", marginBottom: 0 }}>
                Signed in as admin: donation submissions are disabled on this donor-only form.
              </p>
            )}
            {submitError && (
              <p style={{ color: "#c62828", marginTop: "0.75rem", marginBottom: 0 }}>
                {submitError}
              </p>
            )}
          </form>
        </div>

        {/* Donation History */}
        <div className="admin-card">
          <h3>Donation History</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingHistory && (
                <tr>
                  <td colSpan={3} className="placeholder-row">
                    Loading donation history...
                  </td>
                </tr>
              )}
              {!isLoadingHistory && historyError && (
                <tr>
                  <td colSpan={3} className="placeholder-row">
                    {historyError}
                  </td>
                </tr>
              )}
              {!isLoadingHistory && isAdmin && (
                <tr>
                  <td colSpan={3} className="placeholder-row">
                    Admin account: donor-specific history is only available for donor users.
                  </td>
                </tr>
              )}
              {!isLoadingHistory &&
                !historyError &&
                !isAdmin &&
                history.length === 0 && (
                  <tr>
                    <td colSpan={3} className="placeholder-row">
                      No donations found for your account yet.
                    </td>
                  </tr>
                )}
              {!isLoadingHistory &&
                !historyError &&
                !isAdmin &&
                history.map((donation) => (
                  <tr key={donation.donationId}>
                    <td>{new Date(donation.date).toLocaleDateString()}</td>
                    <td>
                      {donation.amount == null
                        ? "-"
                        : donation.amount.toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                          })}
                    </td>
                    <td>{donation.note || "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} River of Life. All rights reserved.
          | <a href="/privacy">Privacy Policy</a> |{" "}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
