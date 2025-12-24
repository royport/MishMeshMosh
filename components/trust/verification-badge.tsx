'use client';

interface VerificationBadgeProps {
  level: 'unverified' | 'email' | 'phone' | 'identity' | 'business';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerificationBadge({
  level,
  size = 'md',
  showLabel = false,
}: VerificationBadgeProps) {
  const config = {
    unverified: {
      icon: '○',
      label: 'Unverified',
      color: 'bg-slate-100 text-slate-500 border-slate-200',
      description: 'Account not yet verified',
    },
    email: {
      icon: '✉',
      label: 'Email Verified',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      description: 'Email address verified',
    },
    phone: {
      icon: '📱',
      label: 'Phone Verified',
      color: 'bg-green-50 text-green-600 border-green-200',
      description: 'Phone number verified',
    },
    identity: {
      icon: '✓',
      label: 'ID Verified',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      description: 'Government ID verified',
    },
    business: {
      icon: '★',
      label: 'Business Verified',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      description: 'Registered business entity',
    },
  };

  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const { icon, label, color, description } = config[level];

  return (
    <div className="inline-flex items-center gap-1.5" title={description}>
      <span
        className={`inline-flex items-center justify-center rounded-full border ${color} ${sizeClasses[size]}`}
      >
        {icon}
      </span>
      {showLabel && (
        <span className={`text-${size === 'sm' ? 'xs' : 'sm'} font-medium text-slate-600`}>
          {label}
        </span>
      )}
    </div>
  );
}

interface VerificationBadgesProps {
  verifications: Array<{
    method: string;
    status: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadges({ verifications, size = 'md' }: VerificationBadgesProps) {
  const verifiedMethods = verifications
    .filter((v) => v.status === 'verified')
    .map((v) => v.method);

  if (verifiedMethods.length === 0) {
    return <VerificationBadge level="unverified" size={size} />;
  }

  // Determine highest verification level
  let highestLevel: VerificationBadgeProps['level'] = 'email';
  if (verifiedMethods.includes('business')) highestLevel = 'business';
  else if (verifiedMethods.includes('identity') || verifiedMethods.includes('kyc'))
    highestLevel = 'identity';
  else if (verifiedMethods.includes('phone')) highestLevel = 'phone';

  return (
    <div className="flex items-center gap-1">
      <VerificationBadge level={highestLevel} size={size} />
      {verifiedMethods.length > 1 && (
        <span className="text-xs text-slate-500">+{verifiedMethods.length - 1}</span>
      )}
    </div>
  );
}
