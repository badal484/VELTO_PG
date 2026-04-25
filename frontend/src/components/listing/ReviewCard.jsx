import React from 'react';
import { formatDate } from '../../utils/formatters';
import StarRating from '../common/StarRating';

export default function ReviewCard({ review }) {
  const { user, rating, title, comment, ratings, ownerReply, ownerRepliedAt, createdAt } = review;

  return (
    <div className="py-6 border-b border-gray-100 last:border-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user?.name || 'Anonymous'}</p>
            <p className="text-xs text-gray-400">{formatDate(createdAt)}</p>
          </div>
        </div>
        <StarRating value={rating} size="sm" />
      </div>

      <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{comment}</p>

      {/* Sub-ratings */}
      {ratings && Object.keys(ratings).some(k => ratings[k]) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
          {Object.entries(ratings).map(([k, v]) => v ? (
            <div key={k} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 capitalize">{k}</span>
              <span className="text-xs font-bold text-gray-700">{v}/5</span>
            </div>
          ) : null)}
        </div>
      )}

      {/* Owner reply */}
      {ownerReply && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-100">
          <p className="text-xs font-bold text-gray-700 mb-1">
            Owner replied · {formatDate(ownerRepliedAt)}
          </p>
          <p className="text-sm text-gray-600">{ownerReply}</p>
        </div>
      )}
    </div>
  );
}
