import React from 'react';

// SIZES: define el tamaño del círculo y el tamaño de fuente según el prop `size`.
const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

// COLORS: degradados sutiles para avatares
const GRADIENTS = [
  'from-sky-600 to-blue-700 text-white',
  'from-teal-500 to-emerald-600 text-white',
  'from-indigo-600 to-purple-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-cyan-500 to-primary-600 text-white',
];

const AvatarBadge = ({ initials = '?', size = 'md', inactive = false, className = '' }) => {
  const charCode = initials?.charCodeAt(0) || 0;
  const colorIdx = charCode % GRADIENTS.length;
  const gradient = inactive ? 'bg-slate-300 text-slate-600' : `bg-gradient-to-br ${GRADIENTS[colorIdx]}`;

  return (
    <div className={`
      ${SIZES[size] ?? SIZES.md} ${gradient}
      rounded-full flex items-center justify-center font-bold tracking-tight
      flex-shrink-0 select-none shadow-xs ring-2 ring-white
      ${className}
    `}>
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default AvatarBadge;
