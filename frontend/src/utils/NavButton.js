import { NavLink } from "react-router-dom";

const NavButton = ({ to, children }) => {
    const btnClass = "btn-red text-lg h-12 mx-1/2 min-w-[100px] truncate";
    return (
      <NavLink end to={to}>
        {({ isActive }) => (
          <button className={isActive ? `bg-rose-800 translate-y-[-2px] shadow-3xl ${btnClass}` : btnClass}>
            {children}
          </button>
        )}
      </NavLink>
    );
  };

export default NavButton