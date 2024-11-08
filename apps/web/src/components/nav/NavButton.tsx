export function NavButton({
  className = '',
  icon,
  onClick,
  hidden,
}: {
  className?: string;
  hidden?: boolean;
  icon: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={hidden ? undefined : onClick}
      className={`btn btn-light d-flex justify-content-center align-items-center p-2 ${hidden ? 'invisible' : ''} ${className}`}
      style={{
        border: '1px solid #CCCCCC',
        borderRadius: '50%',
        boxShadow: 'rgba(0, 0, 0, 0.4) 0px 6px 16px',
        width: '42px',
        height: '42px',
      }}
    >
      <img src={icon} />
    </button>
  );
}
