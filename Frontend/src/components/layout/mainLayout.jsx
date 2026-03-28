import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./navBar";
import SideBar from "./sideBar";
import Footer from "./footer"; 

export default function MainLayout() {

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <SideBar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NavBar />

        <main id="main-scroll-container" className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 flex flex-col">
          <div className="flex-1">
            <div className="h-full w-full">
              <Outlet />
            </div>
          </div>
          <Footer  />
        </main>
      </div>
    </div>
  );
}
