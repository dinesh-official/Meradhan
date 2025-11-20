import React from "react";
import Footer from "../footer/Footer";
import NewsLetter from "../footer/NewsLetter";
import NavBar from "../navbar/NavBar";
import { getSession } from "../../../core/auth/_server/getSession";

export const revalidate = 0;
export async function ViewPort({
  children,
  headerOnly,
}: {
  children?: React.ReactNode;
  headerOnly?: boolean;
}) {
  const session = await getSession();

  return (
    <div id="mainpage">
      <NavBar session={session} />
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
