import { useEffect, useState } from 'react';
import styles from './Banners.module.scss';
import BannersModal from './BannersModal';
import axiosInstance from '../../services/axiosInstance';
import { MdEdit } from "react-icons/md";
import EditBanners from './Edit/EditBanners';

function Banners() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBannerId, setSelectedBannerId] = useState(null);
    const [selectedBannerType, setSelectedBannerType] = useState(null);
    const [selectedBannerImageUrl, setSelectedBannerImageUrl] = useState("");
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try{
            const response = await axiosInstance.get("/api/banners/");
            //console.log("Fetched Movie news:", response.data);
            if (Array.isArray(response.data.banners)) {
                setBanners(response.data.banners);
            }

        } catch (error) {
            console.error("Error fetching Banners:", error);
        }
    }

     const getImageUrl = (imageObj) => {
        if (!imageObj || typeof imageObj !== "object") return "";
    
        const url = imageObj.landscape; 
    
        if (!url || typeof url !== "string") return "";
    
        return url.startsWith("http") ? url : `${axiosInstance.defaults.baseURL}${url}`;
    };

    const openEditBannerModal = (banner) => {
        setSelectedBannerId(banner._id);
        setIsEditModalOpen(true);
        setSelectedBannerType(banner.bannerType);
        setSelectedBannerImageUrl(banner.imageUrl);
    }

    return(
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.heading}>Banners List</h2>
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                        + Add Banners
                    </button>
            </div>

            <div className={styles.bannersGrid}>
                {banners.length > 0 ? (
                    banners.map((item) => (
                        <div key={item._id} className={styles.titleCard}>
                            <img src={getImageUrl(item.imageUrl)} alt={item.name} className={styles.titleImage} />
            
                                <button className={styles.editButton} onClick={() => openEditBannerModal(item)}>
                                    <MdEdit /> 
                                </button>
                                <p className={styles.itemTitle}>{item.bannerType}</p>
                                {/* <button className={styles.showMovies} onClick={() => openMoviesPage(item._id)}>
                                    Show Movies
                                </button> */}
                        </div>
                    ))
                ) : (
                    <p className={styles.noBanners}>No Banners found</p>
                )}
            </div>

            <BannersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>

            <EditBanners 
                isOpen={isEditModalOpen}
                bannerId={selectedBannerId}
                onClose={() => setIsEditModalOpen(false)}  
                bannerName={selectedBannerType}  
                imageUrl={selectedBannerImageUrl} 
                onEditBanner={fetchBanners} 
            />
        </div>
    )
}

export default Banners;