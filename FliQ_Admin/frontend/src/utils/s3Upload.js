import axiosInstance from "../services/axiosInstance";


export const uploadToS3 = async (file) => {
  try {
    const response = await axiosInstance.post("/api/s3/generate-upload-url", {
      fileName: file.name,
      fileType: file.type,
    });

    const { signedUrl, finalUrl } = response.data;

    const s3UploadResponse = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type, 
      },
    });


    if (!s3UploadResponse.ok) {
      throw new Error("Failed to upload file to S3");
    }

    return finalUrl; // This is the public URL to access the file
  } catch (error) {
    console.error("uploadToS3 error:", error);
    throw error;
  }
};
