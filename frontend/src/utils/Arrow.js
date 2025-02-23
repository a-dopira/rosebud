const Arrow = ({ direction }) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points={direction} />
    </svg>
);

export default Arrow