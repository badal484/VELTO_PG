import React from 'react';
import { formatDate } from '../../utils/formatters';

const STATUS_CONFIG = {
  submitted:            { label: 'Submitted', color: 'badge-warning', desc: 'Your application has been received and is in the queue for review.' },
  under_review:         { label: 'Under Review', color: 'badge-warning', desc: 'Our team is currently reviewing your application.' },
  inspection_scheduled: { label: 'Inspection Scheduled', color: 'badge-primary', desc: 'A physical inspection of your property has been scheduled.' },
  approved:             { label: 'Approved', color: 'badge-success', desc: 'Congratulations! Your application has been approved.' },
  rejected:             { label: 'Not Approved', color: 'badge-error', desc: 'We were unable to approve your application at this time.' },
};

export default function ApplicationStatus({ application }) {
  if (!application) return null;
  const cfg = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-1">{application.pgName}</h3>
          <p className="text-sm text-gray-400">Submitted {formatDate(application.createdAt)}</p>
        </div>
        <span className={cfg.color}>{cfg.label}</span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{cfg.desc}</p>

      {application.status === 'inspection_scheduled' && application.inspection?.scheduledDate && (
        <div className="bg-primary-50 rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-primary-700">Inspection Date</p>
          <p className="text-primary-600">{formatDate(application.inspection.scheduledDate)}</p>
          {application.inspection.notes && <p className="text-gray-500 mt-1">{application.inspection.notes}</p>}
        </div>
      )}

      {application.status === 'rejected' && application.rejectReason && (
        <div className="bg-red-50 rounded-xl px-4 py-3 text-sm">
          <p className="font-semibold text-red-700">Reason</p>
          <p className="text-red-600">{application.rejectReason}</p>
          <p className="text-gray-400 mt-2">You may reapply after 30 days.</p>
        </div>
      )}

      {application.status === 'approved' && application.createdPG && (
        <a href={`/pg/${application.createdPG}`} className="btn-primary inline-block mt-2">
          View Your Listing
        </a>
      )}
    </div>
  );
}
