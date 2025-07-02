        import { useEffect, useRef, useState } from 'react';
        import styles from './EditCategory.module.scss'
        import { MdOutlineImage } from "react-icons/md";
        import axiosInstance from '../../../services/axiosInstance';
        import { uploadToS3 } from '../../../utils/s3Upload';


        function EditCategory({isOpen, onClose, categoryName, categoryId, imageUrl, onEditCategory}) {
            const [categoryNewName, setCategoryNewName] = useState("");
            const [newImageUrl, setNewImageUrl] = useState("");
            const [imageFile, setImageFile] = useState(null);
            const [imageUrls, setImageUrls] = useState({ landscape: "", portrait: "", thumbnail: "" });
            const fileInputRef = useRef(null);

            useEffect(() => {
            setCategoryNewName(categoryName || "");

            if (imageUrl && typeof imageUrl === "object" && imageUrl.landscape) {
                setNewImageUrl(imageUrl.landscape);
                setImageUrls(imageUrl);  // So the edit works even without uploading new image
            } else if (typeof imageUrl === "string") {
                setNewImageUrl(imageUrl);
            } else {
                setNewImageUrl("");
            }
        }, [categoryName, imageUrl]);


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
                    setImageFile(file);


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
            }

            const handleIconClick = () => {
                fileInputRef.current.click();
            }

            const handleEdit = async () => {
            if(!categoryNewName.trim()){
                alert("Please enter category name");
                return;
            }

            try {
                const response = await axiosInstance.put(`/categories/${categoryId}`, {
                    title: categoryNewName,
                    imageUrl: Object.values(imageUrls).some(Boolean) ? imageUrls : newImageUrl,
                });

                if(response.status === 200) {
                    alert("Category updated successfully");
                    setCategoryNewName("");
                    setNewImageUrl("");
                    setImageFile(null);
                    setImageUrls({ landscape: "", portrait: "", thumbnail: "" });
                    onEditCategory();
                    onClose(); 
                }
            } catch(error){
                console.error("Error updating category:", error?.response?.data || error.message);
                alert("Failed to edit category");
            }
        }

            return(
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button onClick={onClose} className={styles.cancel}>X</button>
                        <h2>Edit Category</h2>
                        
                        <label>Category Name</label>
                        <div className={styles.inputContainer}>
                            <input type='text' 
                                value={categoryNewName || ""}
                                onChange={(e) => setCategoryNewName(e.target.value)}
                            />
                        </div>

                        <label>Category Url</label>
                        <div className={styles.inputContainer}>
                            <input type='file' ref={fileInputRef} onChange={handleFileChange} hidden />
                            <input type='text' 
                                placeholder='Enter image URL'
                                value={imageUrls.landscape || newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)} 
                                disabled={imageFile!==null}
                            />
                            <MdOutlineImage className={styles.icon}  onClick={handleIconClick}/>
                        </div>  

                        <div className={styles.modalActions}>
                            <button type='submit' onClick={handleEdit} className={styles.edit}>Submit</button>
                        </div>
                    </div>
                </div>
            )
        }

        export default EditCategory;
