import React from "react";
import PropTypes from "prop-types";

// eslint-disable-next-line react/display-name
const CustomDropdownToggle = React.forwardRef(({ children, onClick }, ref) => (
  <div
    href=""
    ref={ref}
    onClick={e => {
      e.preventDefault();
      onClick(e);
    }}
  >
    {children}
  </div>
));

CustomDropdownToggle.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  disableOnClick: PropTypes.bool
};

export default CustomDropdownToggle;
