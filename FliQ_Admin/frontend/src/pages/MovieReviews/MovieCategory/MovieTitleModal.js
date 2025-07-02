    import axiosInstance from '../../../services/axiosInstance';
    import { uploadToS3 } from '../../../utils/s3Upload';
    import styles from './MovieTitleModal.module.scss';
    import { useRef, useState } from "react";
    import { MdOutlineImage } from "react-icons/md";

    function MovieTitlesModal({isOpen, onClose, sectionId}){
        const [title, setTitle] = useState("");
        const [imageFile, setImageFile] = useState(null);
        //const [imageUrl, setImageUrl] = useState("");
        const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });
        const fileInputRef = useRef(null);

        if (!isOpen) return null;

        const handleIconClick = () => {
            fileInputRef.current.click();
        };

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

            //setIsUploading(true);

        try {
        // Resize to 3 sizes
        const landscape = await resizeImage(file, 251, 147);
        const portrait = await resizeImage(file, 600, 800);
        const thumbnail = await resizeImage(file, 300, 300);

        // Upload all
        const [landscapeUrl, portraitUrl, thumbnailUrl] = await Promise.all([
            uploadToS3(landscape),
            uploadToS3(portrait),
            uploadToS3(thumbnail),
        ]);

        // Save all image URLs
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
                alert("Please enter movie title");
                return;
            }

            if (!imageUrls.landscape || !imageUrls.portrait || !imageUrls.thumbnail) {
                alert("Please upload image to generate all formats");
                return;
            }
            console.log("section ID: ",sectionId);
            
            try{
                const response = await axiosInstance.post(`/title/addTitle/${sectionId}`,{
                    // headers: {"Content-Type": "multipart/form-data"},
                    title: title.trim(),
                    imageUrl: imageUrls,
                });

                if(response.status === 200) {
                    alert("Movie title for reviews added successfully");
                    // onReviewAdded();
                    onClose();
                    setTitle("");
                    setImageFile(null);
                    //setImageUrl("");
                    fileInputRef.current.value = "";
                }
            } catch (error) {
                console.error("Error Details:", error);
                if (error.response) {
                    if (error.response.status === 500) {
                        alert("Movie title already exists! Please choose a different name.");
                    } else {
                        alert(error.response.data.message || "Failed to add Movie Title!");
                    }
                } else {
                    alert("Network error! Please try again.");
                }
            }
        }


        return(
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <button onClick={onClose} className={styles.cancel}>X</button>
                    <label>Movie Title</label>
                    <div className={styles.inputContainer}>
                        <input 
                            type="text"
                            placeholder="Enter Movie title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
            
                    <label>Movie title Thumbnail Image</label>
                    <div className={styles.inputContainer}>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
                        <input
                            type="text"
                            placeholder="Select Image"
                            value={imageUrls.portrait}
                            onChange={() => setImageUrls(null)}
                            disabled={imageFile !== null} 
                        />
                        <MdOutlineImage className={styles.icon} onClick={handleIconClick} />
                    </div>

                    <div className={styles.modalActions}>
                        <button onClick={handleUpload} className={styles.add}>Submit</button>
                    </div>
                </div>
            </div>
        )
    }

    export default MovieTitlesModal;