import React from "react";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>Copyright ⓒ {year} SplitEqual</p>
    </footer>
  );
}

export default Footer;