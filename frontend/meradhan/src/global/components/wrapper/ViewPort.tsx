import React from "react";
import NavBar from "../navbar/NavBar";
import NewsLetter from "../footer/NewsLetter";
import Footer from "../footer/Footer";

function ViewPort({
  children,
  headerOnly,
}: {
  children?: React.ReactNode;
  headerOnly?: boolean;
}) {
  return (
    <div className="" >
      <NavBar />
      {children}
      {!headerOnly && (
        <>
          <NewsLetter />
          <Footer />
        </>
      )}
    </div>
  );
}

export default ViewPort;
