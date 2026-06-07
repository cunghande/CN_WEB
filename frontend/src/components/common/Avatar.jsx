import React, { useMemo, useState } from 'react';
import { UserRound } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl.js';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl'
};

const Avatar = ({ src, name = 'User', size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const initial = useMemo(() => String(name || 'U').trim().charAt(0).toUpperCase() || 'U', [name]);
  const imageSrc = !failed && src ? getImageUrl(src) : '';

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-500 font-black text-slate-950 ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initial ? (
        <span>{initial}</span>
      ) : (
        <UserRound className="h-1/2 w-1/2" />
      )}
    </span>
  );
};

export default Avatar;
