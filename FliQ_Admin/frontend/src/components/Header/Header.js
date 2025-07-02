import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Header.module.scss';
import { RiAdminFill } from "react-icons/ri";

function Header() {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");  
        sessionStorage.clear();
        navigate("/", { replace: true });  
    
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const toggleSubmenu = () => {
        setIsSubmenuOpen((prev) => !prev);
    }

    return(
        <div className={styles.header}>
            <p>FliQ - Admin Panel</p>
            <div
                className={styles.icon}
                onClick={toggleSubmenu}
            >
                <RiAdminFill />
                Admin
                {isSubmenuOpen && (
                    <div className={styles.submenu}>
                        <div className={styles.submenuItem} onClick={handleLogout}>
                            Logout
                        </div>
                    </div>
                )}
            </div>
        </div>  
    )
}

export default Header;