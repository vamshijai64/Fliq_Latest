import { useEffect, useRef, useState } from 'react';
import styles from './EditBanners.module.scss';
import { MdOutlineImage } from "react-icons/md";
import axiosInstance from '../../../services/axiosInstance';
import { uploadToS3 } from '../../../utils/s3Upload';


function EditBanners({isOpen,bannerId, onClose, bannerName, imageUrl, onEditBanner}) {

    const [bannerNewName, setBannerNewName] = useState("");
    const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });

    useEffect(() => {
        setBannerNewName(bannerName || "");
        setImageUrls(imageUrl || "");
    }, [bannerName,imageUrl]);

    const fileInputRef = useRef([]);

    if(!isOpen) return null;

    const resizeImage = (file, width, height) => {
        return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(resizedFile);
            }, "image/jpeg");
        };
        reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        try {
            const landscape = await resizeImage(file, 310, 150);
            const portrait = await resizeImage(file, 131, 170);
            const thumbnail = await resizeImage(file, 300, 300);
    
            const [landscapeUrl, portraitUrl, thumbnailUrl] = await Promise.all([
                uploadToS3(landscape),
                uploadToS3(portrait),
                uploadToS3(thumbnail),
            ]);
    
            setImageUrls({
                landscape: landscapeUrl,
                portrait: portraitUrl,
                thumbnail: thumbnailUrl,
            });
        } catch (err) {
            console.error(err);
            alert("Failed to process/upload image");
        } 
    }

    const handleIconClick = () => {
        fileInputRef.current.click();
    }

    const handleEdit = async () => {
        if(!bannerNewName.trim()){
            alert("Please enter movie category name");
            return;
        }

        //console.log("Name: ", imageUrls.landscape);
            
        try{
            const response = await axiosInstance.patch(`/api/banners/${bannerId}/image`, {
                // headers: {"Content-Type": "multipart/form-data"},
                bannerType: bannerNewName,
                imageUrl: imageUrls,
        });

        if(response.status === 200) {
            alert("Banners updated successfully");
            setBannerNewName("");
            //setNewImageUrl("");
            //setImageFile(null);
            onEditBanner();
            onClose(); 
        }
            } catch(error){
                console.error("Error updating Banners:", error?.response?.data || error.message);
                alert("Failed to edit Banners");
            }
        }
    return(
        <div className={styles.modalOverlay} >
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.cancel}>✖</button>
                <h2>Add Banners</h2>
                <label>Banner Type ( MovieNews, MovieReviews, Categories )</label>
                    {/* <div className={styles.modalBody}> */}
                        
                    <div className={styles.inputContainer}>           
                        <input 
                            type="text"
                            placeholder="Enter banner"
                            value={bannerNewName || ""}
                            onChange={(e) => setBannerNewName(e.target.value)}
                            className={styles.inputField}
                        />
                    </div>
                    <label>Banner ImageUrl</label>
                    
                        <div className={styles.inputContainer}>
                            <input type='file' ref={fileInputRef} onChange={handleFileChange} hidden />
                            <input
                                type='text'
                                placeholder='Enter image URL'
                                // value={newImageUrl.portrait}
                                value={imageUrls.portrait || ""}
                                //onChange={(e) => setNewImageUrl(e.target.value)}
                                //disabled={imageFile !== null}
                                readOnly
                            />
                            <MdOutlineImage className={styles.icon}  onClick={handleIconClick}/>
                        </div>   
                    {/* </div>        */}
                <div className={styles.modalActions}>
                    <button onClick={handleEdit} className={styles.edit}>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default EditBanners;