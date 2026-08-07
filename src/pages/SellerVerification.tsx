import { useState, useEffect } from 'react';
import { 
  RiCheckLine, 
  RiCloseLine, 
  RiEyeLine, 
  RiTimeLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiStore3Line,
  RiCheckboxCircleLine,
} from 'react-icons/ri';
import { useToast } from '../context/ToastContext';
import { sellerService } from '../services/sellerService';
import { LoadingButton } from '../components/LoadingButton/LoadingButton';
import styles from './SellerVerification.module.css';

interface PendingSeller {
  id: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  selfieUrl: string;
  verificationNote: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  listings: {
    id: string;
    cropType: string;
    status: string;
  }[];
}

export default function SellerVerification() {
  const { addToast } = useToast();
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<PendingSeller | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // ── Load pending sellers ──────────────────────────────────────────
  const loadPendingSellers = async () => {
    setLoading(true);
    try {
      const sellers = await sellerService.getPendingSellers();
      setPendingSellers(sellers);
    } catch (error) {
      console.error('Error loading pending sellers:', error);
      addToast('Failed to load pending sellers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingSellers();
  }, []);

  // ── Handle Approve ───────────────────────────────────────────────
  const handleApprove = async (sellerId: string) => {
    setProcessingId(sellerId);
    try {
      const result = await sellerService.approveSeller(sellerId);
      if (result.success) {
        setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
        setSelectedSeller(null);
        addToast('Seller approved successfully!', 'success');
      } else {
        addToast(result.error || 'Failed to approve seller', 'error');
      }
    } catch (error) {
      addToast('An error occurred. Please try again.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Handle Reject ────────────────────────────────────────────────
  const handleReject = async (sellerId: string, reason: string) => {
    setProcessingId(sellerId);
    try {
      const result = await sellerService.rejectSeller(sellerId, reason);
      if (result.success) {
        setPendingSellers(prev => prev.filter(s => s.id !== sellerId));
        addToast('Seller rejected', 'info');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedSeller(null);
      } else {
        addToast(result.error || 'Failed to reject seller', 'error');
      }
    } catch (error) {
      addToast('An error occurred. Please try again.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // ── View Seller Details ──────────────────────────────────────────
  const viewSellerDetails = (seller: PendingSeller) => {
    setSelectedSeller(seller);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading pending verifications...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Seller Verification</h1>
        <p className={styles.subtitle}>
          {pendingSellers.length} seller{pendingSellers.length !== 1 ? 's' : ''} pending verification
        </p>
      </div>

      {pendingSellers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <RiCheckboxCircleLine size={48} />
          </div>
          <h3>No pending verifications</h3>
          <p>All sellers are verified. Check back later.</p>
        </div>
      ) : (
        <div className={styles.sellerList}>
          {pendingSellers.map((seller) => (
            <div key={seller.id} className={styles.sellerCard}>
              <div className={styles.sellerHeader}>
                <div className={styles.sellerInfo}>
                  <div className={styles.sellerAvatar}>
                    {seller.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.sellerName}>{seller.user.name}</h3>
                    <span className={styles.pendingBadge}>
                      <RiTimeLine size={14} /> Pending
                    </span>
                  </div>
                </div>
                <div className={styles.sellerActions}>
                  <button 
                    className={styles.viewBtn}
                    onClick={() => viewSellerDetails(seller)}
                  >
                    <RiEyeLine size={18} /> View
                  </button>
                </div>
              </div>

              <div className={styles.sellerDetails}>
                <div className={styles.detailItem}>
                  <RiMailLine size={14} />
                  <span>{seller.user.email}</span>
                </div>
                {seller.user.phone && (
                  <div className={styles.detailItem}>
                    <RiPhoneLine size={14} />
                    <span>{seller.user.phone}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <RiMapPinLine size={14} />
                  <span>{seller.user.location || 'Not specified'}</span>
                </div>
                <div className={styles.detailItem}>
                  <RiStore3Line size={14} />
                  <span>{(seller.listings?.length || 0)} listing{(seller.listings?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <LoadingButton
                  loading={processingId === seller.id}
                  className={styles.approveBtn}
                  onClick={() => handleApprove(seller.id)}
                >
                  <RiCheckLine size={18} /> Approve
                </LoadingButton>
                <button 
                  className={styles.rejectBtn}
                  onClick={() => {
                    setSelectedSeller(seller);
                    setShowRejectModal(true);
                  }}
                  disabled={processingId === seller.id}
                >
                  <RiCloseLine size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Details Modal ────────────────────────────────────── */}
      {selectedSeller && !showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setSelectedSeller(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedSeller(null)}>
              ✕
            </button>
            
            <div className={styles.modalHeader}>
              <h2>Verification Details</h2>
              <span className={styles.pendingBadge}>
                <RiTimeLine size={14} /> Pending
              </span>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <h4>Seller Information</h4>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalLabel}>Name:</span>
                  <span>{selectedSeller.user.name}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalLabel}>Email:</span>
                  <span>{selectedSeller.user.email}</span>
                </div>
                {selectedSeller.user.phone && (
                  <div className={styles.modalInfoRow}>
                    <span className={styles.modalLabel}>Phone:</span>
                    <span>{selectedSeller.user.phone}</span>
                  </div>
                )}
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalLabel}>Location:</span>
                  <span>{selectedSeller.user.location || 'Not specified'}</span>
                </div>
                <div className={styles.modalInfoRow}>
                  <span className={styles.modalLabel}>Listings:</span>
                  <span>{selectedSeller.listings?.length || 0}</span>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4>Verification Note</h4>
                <div className={styles.modalNote}>
                  {selectedSeller.verificationNote || 'No additional information provided.'}
                </div>
              </div>

              {selectedSeller.selfieUrl && (
                <div className={styles.modalSection}>
                  <h4>Selfie Photo</h4>
                  <div className={styles.selfieContainer}>
                    <img 
                      src={selectedSeller.selfieUrl} 
                      alt="Seller selfie" 
                      className={styles.selfieImage}
                    />
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <LoadingButton
                  loading={processingId === selectedSeller.id}
                  className={styles.approveBtn}
                  onClick={() => handleApprove(selectedSeller.id)}
                >
                  <RiCheckLine size={18} /> Approve
                </LoadingButton>
                <button 
                  className={styles.rejectBtn}
                  onClick={() => setShowRejectModal(true)}
                  disabled={processingId === selectedSeller.id}
                >
                  <RiCloseLine size={18} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Modal ────────────────────────────────────────── */}
      {showRejectModal && selectedSeller && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <button className={styles.closeBtn} onClick={() => setShowRejectModal(false)}>
              ✕
            </button>
            
            <h2 className={styles.rejectTitle}>Reject Verification</h2>
            <p className={styles.rejectSubtitle}>
              Please provide a reason for rejecting {selectedSeller.user.name}'s verification.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rejection Reason *</label>
              <textarea
                className={styles.textarea}
                placeholder="e.g., Selfie is not clear. Please upload a clearer photo..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <LoadingButton
                loading={processingId === selectedSeller.id}
                className={styles.rejectBtn}
                onClick={() => handleReject(selectedSeller.id, rejectionReason)}
                disabled={!rejectionReason.trim()}
              >
                <RiCloseLine size={18} /> Confirm Reject
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}