import { useRef, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { uploadToS3 } from '../../utils/s3Upload';
import { MdOutlineImage } from "react-icons/md";
import styles from './BannersModal.module.scss';

function BannersModal ({isOpen, onClose}) {
    const [title, setTitle] = useState("");
    const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });

    const fileInputRef = useRef([]);

    if (!isOpen) return null;

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
            const portrait = await resizeImage(file, 600, 800);
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
    };

    const handleUpload = async () => {
        if(!title.trim()) {
            alert("Please enter Banner title");
            return;
        }

        if (!imageUrls.landscape || !imageUrls.portrait || !imageUrls.thumbnail) {
            alert("Please upload image to generate all formats");
            return;
        }


        try{
            const response = await axiosInstance.post("/api/ides/banners", {
                // headers: {"Content-Type": "multipart/form-data"},
                bannerType: title.trim(),
                imageUrl: imageUrls,
            });

            if(response.status === 200) {
                alert("Banners added successfully");
                //onCategoryAdded();
                onClose();
                setTitle("");
                //setImageFile(null);
                setImageUrls({ landscape: "", portrait: "", thumbnail: "" });
                fileInputRef.current.value = "";
            }
        } catch (error) {
            console.error("Error Details:", error);
            if (error.response) {
                if (error.response.status === 500) {
                    alert("Banner name already exists! Please choose a different name.");
                } else {
                    alert(error.response.data.message || "Choose correct Banner type. Please follow the above Banner Type");
                }
            } else {
                alert("Network error! Please try again.");
            }
        }

    };

    return(
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>✖</button>
                <h2>Add Banners</h2>
        
                <div className={styles.modalBody}>
                    <label>Banner Type ( MovieNews, MovieReviews, Categories )</label>
                    <div className={styles.inputContainer}>
                            
                        <input 
                            type="text"
                            placeholder="Enter movie title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.inputField}
                        />
                    </div>
                    <label>Banner ImageUrl</label>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="Uploaded Image URL"
                            value={imageUrls.landscape}
                            readOnly
                          />
                        <MdOutlineImage className={styles.icon} onClick={() => fileInputRef.current.click()} />
        
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            //hidden
                        />
                    </div> 
                </div>       
                <div className={styles.modalActions}>
                    <button onClick={handleUpload} className={styles.add}>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default BannersModal;