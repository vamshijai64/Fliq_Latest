import { useState, useEffect } from "react";
import Header from "../Header/Header";
import Main from "../Main/Main";
import SideMenu from "../SideNav/SideNav";

function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div>
            <Header />
            <SideMenu isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <Main isSidebarOpen={isSidebarOpen} />
        </div>
    );
}

export default Home;
