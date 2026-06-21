import React, { useState } from 'react';
import Client from '../../api/client';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      await Client.sendFeedback(message.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setMessage('');
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to send feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1E1E2E',
        border: '1px solid #2A2A3E',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '420px',
        width: '90%',
        boxSizing: 'border-box'
      }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <h3 style={{ color: '#2ECC71', fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Thanks, got it!
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ color: '#F0F0F8', marginBottom: '12px', fontSize: '20px', fontWeight: '600', marginTop: 0 }}>
              Send feedback
            </h2>
            <p style={{ color: '#A0A0B8', marginBottom: '20px', fontSize: '13px', lineHeight: '1.5' }}>
              We'd love to hear your thoughts, suggestions, or issues.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <strong>Error:</strong> {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <textarea
                rows={5}
                placeholder="Type your feedback here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%', padding: '12px',
                  backgroundColor: '#0A0A0F',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  color: '#F0F0F8', fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'none',
                  outline: 'none'
                }}
                disabled={submitting}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setMessage('');
                  setErrorMsg('');
                  onClose();
                }}
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#A0A0B8',
                  border: '1px solid #2A2A3E',
                  borderRadius: '8px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: '#6C63FF',
                  color: 'white', border: 'none',
                  borderRadius: '8px',
                  cursor: (submitting || !message.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                  opacity: (submitting || !message.trim()) ? 0.5 : 1
                }}
              >
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
