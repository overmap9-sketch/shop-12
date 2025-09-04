import React from 'react';

interface FlagIconProps {
  className?: string;
  size?: number;
}

export const USFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#B22234"/>
    <rect width="24" height="1.85" y="1.85" fill="white"/>
    <rect width="24" height="1.85" y="5.54" fill="white"/>
    <rect width="24" height="1.85" y="9.23" fill="white"/>
    <rect width="24" height="1.85" y="12.92" fill="white"/>
    <rect width="24" height="1.85" y="16.62" fill="white"/>
    <rect width="24" height="1.85" y="20.31" fill="white"/>
    <rect width="9.6" height="12.92" fill="#3C3B6E"/>
    <g fill="white">
      <circle cx="2" cy="2.5" r="0.5"/>
      <circle cx="4" cy="2.5" r="0.5"/>
      <circle cx="6" cy="2.5" r="0.5"/>
      <circle cx="8" cy="2.5" r="0.5"/>
      <circle cx="3" cy="4" r="0.5"/>
      <circle cx="5" cy="4" r="0.5"/>
      <circle cx="7" cy="4" r="0.5"/>
      <circle cx="2" cy="5.5" r="0.5"/>
      <circle cx="4" cy="5.5" r="0.5"/>
      <circle cx="6" cy="5.5" r="0.5"/>
      <circle cx="8" cy="5.5" r="0.5"/>
      <circle cx="3" cy="7" r="0.5"/>
      <circle cx="5" cy="7" r="0.5"/>
      <circle cx="7" cy="7" r="0.5"/>
      <circle cx="2" cy="8.5" r="0.5"/>
      <circle cx="4" cy="8.5" r="0.5"/>
      <circle cx="6" cy="8.5" r="0.5"/>
      <circle cx="8" cy="8.5" r="0.5"/>
      <circle cx="3" cy="10" r="0.5"/>
      <circle cx="5" cy="10" r="0.5"/>
      <circle cx="7" cy="10" r="0.5"/>
      <circle cx="2" cy="11.5" r="0.5"/>
      <circle cx="4" cy="11.5" r="0.5"/>
      <circle cx="6" cy="11.5" r="0.5"/>
      <circle cx="8" cy="11.5" r="0.5"/>
    </g>
  </svg>
);

export const EUFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#003399"/>
    <g fill="#FFCC00">
      <circle cx="12" cy="4" r="0.8"/>
      <circle cx="16.24" cy="5.76" r="0.8"/>
      <circle cx="19.06" cy="9.53" r="0.8"/>
      <circle cx="19.06" cy="14.47" r="0.8"/>
      <circle cx="16.24" cy="18.24" r="0.8"/>
      <circle cx="12" cy="20" r="0.8"/>
      <circle cx="7.76" cy="18.24" r="0.8"/>
      <circle cx="4.94" cy="14.47" r="0.8"/>
      <circle cx="4.94" cy="9.53" r="0.8"/>
      <circle cx="7.76" cy="5.76" r="0.8"/>
      <circle cx="12" cy="8" r="0.8"/>
      <circle cx="12" cy="16" r="0.8"/>
    </g>
  </svg>
);

export const GBFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#012169"/>
    <path d="M0 0L24 0L24 24L0 24Z" fill="#012169"/>
    <path d="M0 0L24 24M24 0L0 24" stroke="white" strokeWidth="2.4"/>
    <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="1.6"/>
    <path d="M12 0L12 24M0 12L24 12" stroke="white" strokeWidth="4"/>
    <path d="M12 0L12 24M0 12L24 12" stroke="#C8102E" strokeWidth="2.4"/>
  </svg>
);

export const CAFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="white"/>
    <rect width="6" height="24" fill="#FF0000"/>
    <rect width="6" height="24" x="18" fill="#FF0000"/>
    <path d="M12 6L13.5 9H16.5L14.25 11L15 14L12 12L9 14L9.75 11L7.5 9H10.5L12 6Z" fill="#FF0000"/>
  </svg>
);

export const AUFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#012169"/>
    <rect width="12" height="12" fill="#012169"/>
    <path d="M0 0L12 0L12 12L0 12Z" fill="#012169"/>
    <path d="M0 0L12 12M12 0L0 12" stroke="white" strokeWidth="1.2"/>
    <path d="M0 0L12 12M12 0L0 12" stroke="#C8102E" strokeWidth="0.8"/>
    <path d="M6 0L6 12M0 6L12 6" stroke="white" strokeWidth="2"/>
    <path d="M6 0L6 12M0 6L12 6" stroke="#C8102E" strokeWidth="1.2"/>
    <g fill="white">
      <circle cx="18" cy="6" r="0.5"/>
      <circle cx="20" cy="8" r="0.5"/>
      <circle cx="16" cy="10" r="0.5"/>
      <circle cx="18" cy="12" r="0.5"/>
      <circle cx="20" cy="14" r="0.5"/>
      <circle cx="18" cy="16" r="0.5"/>
      <circle cx="16" cy="18" r="0.5"/>
    </g>
  </svg>
);

export const JPFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="white"/>
    <circle cx="12" cy="12" r="6" fill="#BC002D"/>
  </svg>
);

export const CHFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#FF0000"/>
    <path d="M10 8H14V16H10ZM8 10H16V14H8Z" fill="white"/>
  </svg>
);

export const CNFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#DE2910"/>
    <g fill="#FFDE00">
      <path d="M4 4L6 7L3 6L6 6L4 9Z"/>
      <circle cx="8" cy="3" r="0.5"/>
      <circle cx="10" cy="5" r="0.5"/>
      <circle cx="10" cy="7" r="0.5"/>
      <circle cx="8" cy="9" r="0.5"/>
    </g>
  </svg>
);

export const DefaultCurrencyFlag: React.FC<FlagIconProps> = ({ className = '', size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="2" fill="#6B7280"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">$</text>
  </svg>
);

interface CurrencyFlagProps {
  currencyCode: string;
  className?: string;
  size?: number;
}

export const CurrencyFlag: React.FC<CurrencyFlagProps> = ({ currencyCode, className, size }) => {
  const flagComponents = {
    USD: USFlag,
    EUR: EUFlag,
    GBP: GBFlag,
    CAD: CAFlag,
    AUD: AUFlag,
    JPY: JPFlag,
    CHF: CHFlag,
    CNY: CNFlag,
  };

  const FlagComponent = flagComponents[currencyCode as keyof typeof flagComponents] || DefaultCurrencyFlag;
  
  return <FlagComponent className={className} size={size} />;
};
