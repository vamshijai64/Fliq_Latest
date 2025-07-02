    import { useRef, useState } from "react";
    import styles from "./SubCategories.module.scss";
    import { MdOutlineImage } from "react-icons/md";
    import axiosInstance from "../../services/axiosInstance";
    import { uploadToS3 } from "../../utils/s3Upload";

    function SubCategories({ isOpen, onClose, categoryId }) {
        const [subcategoryName, setSubcategoryName] = useState("");
        //const [imageUrl, setImageUrl] = useState("");
        const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });
        //const [imageFile, setImageFile] = useState(null);
        const fileInputRef = useRef(null);

        // console.log("Image: ",imageFile);
        
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

        try {
        // Resize to 3 sizes
        const landscape = await resizeImage(file, 260, 150);
        const portrait = await resizeImage(file, 131, 170);
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

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!categoryId) {
                alert("Category ID is missing!");
                return;
            }

            if(!subcategoryName.trim()) {
                alert("Subcategory name is required");
                return;
            }

            if (!imageUrls) {
                alert("Please select an image");
                return;
            }

            try {
                await axiosInstance.post("/subcategories/create", {
                    // headers: {
                    //     "Content-Type": "multipart/form-data",
                    // },
                    title: subcategoryName.trim(),
                    imageUrl: imageUrls,
                    category: categoryId,
                });

                alert("Subcategory added successfully!");
                setSubcategoryName("");
                setImageUrls("");
                //setImageFile(null);
                fileInputRef.current.value = null;
                onClose();
            } catch (error) {
                console.error("Error adding subcategory:", error);

            if (error.response) {
                if (error.response.status === 500) {
                    alert("Subcategory name already exists! Please choose a different name.");
                } else {
                    alert(error.response.data.message || "Failed to add subcategory!");
                }
            } else {
                alert("Network error! Please try again.");
            }
            }
        };

        if (!isOpen) return null;

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <button onClick={onClose} className={styles.cancel}>X</button>
                    <h2>Uploading Subcategory</h2>
                    
                    <label>Sub-Category Name</label>
                    <div className={styles.inputContainer}>
                        <input 
                            type="text" 
                            placeholder="Enter subcategory name"
                            value={subcategoryName}
                            onChange={(e) => setSubcategoryName(e.target.value)}
                            required
                        />
                    </div>

                    <label>Sub-Category Thumbnail Image</label>
                    <div className={styles.inputContainer}>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
                        <input
                            type="text"
                            placeholder="Enter Image URL or Select Image"
                            value={imageUrls.portrait}
                            onChange={(e) => setImageUrls({ ...imageUrls, portrait: e.target.value })}
    
                            //disabled={imageFile !== null} // Disable if file is selected
                        />
                        <MdOutlineImage className={styles.icon} onClick={handleIconClick} />
                    </div>

                    <div className={styles.modalActions}>
                        <button onClick={handleSubmit} className={styles.add}>Submit</button>
                    </div>
                </div>
            </div>
        );
    }

    export default SubCategories;
