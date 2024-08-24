import React from "react";
import PropTypes from "prop-types";

// eslint-disable-next-line react/display-name
const CustomDropdownItem = React.forwardRef(({ children, onClick }, ref) => (
  <div
    className="dropdown-item cursor-pointer"
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </div>
));

CustomDropdownItem.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func
};

export default CustomDropdownItem;
