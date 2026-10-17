/**
 * Propósito:
 * Componente visual para renderizar las iniciales de una persona o paciente en un círculo tipo avatar.
 * Asigna un gradiente cromático determinista basado en el código de caracteres de las iniciales
 * para brindar variedad visual coherente en listas de pacientes o usuarios, o muestra un tono neutro
 * si se encuentra marcado como inactivo.
 *
 * Ubicación y Rol:
 * Ubicado en 'src/components/ui/AvatarBadge.jsx'. Elemento de presentación en la capa
 * de componentes de interfaz atómicos.
 *
 * Trazabilidad (Referencias):
 * - Invocado desde:
 *   - 'src/components/AppointmentCard.jsx'
 *   - 'src/views/PatientManagementPage.jsx'
 *   - 'src/views/UserManagementPage.jsx'
 * - Consume:
 *   - React.
 *
 * Parámetros y Retornos:
 * @param {Object} props - Propiedades del avatar.
 * @param {string} [props.initials='?'] - Cadena con las iniciales a mostrar (se toman hasta 2 caracteres).
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md'] - Tamaño geométrico y tipográfico del contenedor.
 * @param {boolean} [props.inactive=false] - Si es true, suprime el degradado de color y aplica tonalidad gris inactiva.
 * @param {string} [props.className=''] - Clases utilitarias adicionales de Tailwind.
 * @returns {JSX.Element} Avatar circular estilizado con iniciales mayúsculas.
 */

import React from 'react';

// Escala de dimensiones y tipografías para mantener consistencia proporcional
const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

// Paleta de gradientes para asignar identidad cromática diferenciada
const GRADIENTS = [
  'from-sky-600 to-blue-700 text-white',
  'from-teal-500 to-emerald-600 text-white',
  'from-indigo-600 to-purple-700 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-cyan-500 to-primary-600 text-white',
];

const AvatarBadge = ({ initials = '?', size = 'md', inactive = false, className = '' }) => {
  // Función hash simple basada en el valor ASCII del primer carácter para consistencia cromática
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
      {/* Recorte a máximo dos letras en mayúsculas para encajar adecuadamente en el contenedor */}
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default AvatarBadge;
