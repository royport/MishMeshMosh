import Link from 'next/link';

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: 'primary' | 'success' | 'warning' | 'error';
  daysLeft: number;
  progress: number;
  backerCount: number;
  imageGradient?: string;
}

export function CampaignCard({
  id,
  title,
  description,
  category,
  categoryColor,
  daysLeft,
  progress,
  backerCount,
  imageGradient = 'from-primary-100 to-primary-200',
}: CampaignCardProps) {
  const categoryColorClasses = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
  };

  const progressColorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-48 bg-gradient-to-br ${imageGradient}`}></div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${categoryColorClasses[categoryColor]}`}
          >
            {category}
          </span>
          <span className="text-xs text-neutral-500">{daysLeft} days left</span>
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600 mb-4 line-clamp-2">{description}</p>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-600">Progress</span>
            <span className="font-medium text-neutral-900">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${progressColorClasses[categoryColor]}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-semibold text-neutral-900">{backerCount}</span>
            <span className="text-neutral-600"> backers</span>
          </div>
          <Link
            href={`/campaign/${id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
