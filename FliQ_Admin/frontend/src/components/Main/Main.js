import { Outlet } from "react-router-dom";
import styles from "./Main.module.scss";

function Main({ isSidebarOpen }) {
    return (
        <div className={styles.container}>
           
            <div className={`${styles.main} ${isSidebarOpen ? styles.withSidebar : styles.fullWidth}`}>
                <Outlet />
            </div>
        </div>
    );
}

export default Main;
