import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Upload,
  CheckCircle,
  Package,
  Tag,
  FileText,
  RotateCcw,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

const CLOUDINARY_CLOUD_NAME = "jhzszqrd";
const CLOUDINARY_UPLOAD_PRESET = "thrift_by_njeri";

function AddProduct() {
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(imageUrl);

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropper(true);
  };

  const onCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const createCroppedImage = async () => {
    if (!previewUrl || !croppedAreaPixels) {
      return null;
    }

    const image = new Image();

    image.src = previewUrl;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create image canvas.");
    }

    const {
      width,
      height,
      x,
      y,
    } = croppedAreaPixels;

    canvas.width = width;
    canvas.height = height;

    context.drawImage(
      image,
      x,
      y,
      width,
      height,
      0,
      0,
      width,
      height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error("Could not create cropped image.")
            );
            return;
          }

          const croppedFile = new File(
            [blob],
            selectedFile?.name || "dress-photo.jpg",
            {
              type: "image/jpeg",
            }
          );

          resolve(croppedFile);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleCropConfirm = async () => {
    try {
      const croppedFile = await createCroppedImage();

      if (!croppedFile) {
        alert("Please crop the image first.");
        return;
      }

      const croppedUrl =
        URL.createObjectURL(croppedFile);

      setSelectedFile(croppedFile);
      setPreviewUrl(croppedUrl);
      setShowCropper(false);
    } catch (error) {
      console.error("Error cropping image:", error);

      alert("Something went wrong while cropping the image.");
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);

    setSelectedFile(null);
    setPreviewUrl("");

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleEditCrop = () => {
    if (!previewUrl) {
      return;
    }

    setCrop({
      x: 0,
      y: 0,
    });

    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropper(true);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log("Cloudinary response:", data);

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          "Cloudinary image upload failed."
      );
    }

    if (!data.secure_url) {
      throw new Error(
        "Cloudinary did not return an image URL."
      );
    }

    return data.secure_url;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.target;

    const name = form.name.value.trim();
    const price = Number(form.price.value);
    const quantity = Number(form.quantity.value);
    const description = form.description.value.trim();

    if (!selectedFile) {
      alert("Please choose a photo of the dress.");
      return;
    }

    try {
      setUploading(true);

      const imageUrl =
        await uploadToCloudinary(selectedFile);

      await addDoc(collection(db, "products"), {
        name,
        category: "Dresses",
        price,
        quantity,
        description,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("Dress added successfully!");

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error adding dress:", error);

      alert(
        `Something went wrong: ${error.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="admin-page add-product-page">
        <div className="add-product-container">

          <Link
            to="/admin/dashboard"
            className="add-product-back"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <section className="add-product-header">
            <div>
              <p className="section-label">
                INVENTORY MANAGEMENT
              </p>

              <h1>Add New Dress</h1>

              <p>
                Add a new piece to your Thrift by Njeri
                collection.
              </p>
            </div>

            <div className="add-product-header-icon">
              <Plus size={28} />
            </div>
          </section>

          <form
            className="add-product-form"
            onSubmit={handleSubmit}
          >

            <div className="add-product-form-main">

              {/* BASIC INFORMATION */}

              <section className="add-product-card">

                <div className="add-product-card-heading">
                  <div className="add-product-card-icon">
                    <Tag size={19} />
                  </div>

                  <div>
                    <h2>Dress Information</h2>

                    <p>
                      Enter the basic details of this dress.
                    </p>
                  </div>
                </div>

                <div className="add-product-fields">

                  <div className="form-group">
                    <label htmlFor="name">
                      Dress Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Black Bodycon Dress"
                      required
                    />
                  </div>

                  <div className="add-product-two-columns">

                    <div className="form-group">
                      <label htmlFor="price">
                        Price
                      </label>

                      <div className="input-with-prefix">
                        <span>KSh</span>

                        <input
                          id="price"
                          name="price"
                          type="number"
                          placeholder="Enter price"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="quantity">
                        Quantity
                      </label>

                      <div className="input-with-icon">
                        <Package size={17} />

                        <input
                          id="quantity"
                          name="quantity"
                          type="number"
                          placeholder="Enter quantity"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                  </div>

                  <div className="form-group">
                    <label htmlFor="description">
                      Description
                    </label>

                    <div className="textarea-wrapper">
                      <FileText size={17} />

                      <textarea
                        id="description"
                        name="description"
                        rows="5"
                        placeholder="Describe the dress, size, colour, material or anything customers should know..."
                        required
                      />
                    </div>
                  </div>

                </div>
              </section>

              {/* PHOTO */}

              <section className="add-product-card">

                <div className="add-product-card-heading">
                  <div className="add-product-card-icon">
                    <ImagePlus size={19} />
                  </div>

                  <div>
                    <h2>Dress Photo</h2>

                    <p>
                      Upload and crop a clear photo of
                      the dress.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="image"
                  className={
                    selectedFile
                      ? "dress-upload-area has-image"
                      : "dress-upload-area"
                  }
                >

                  {previewUrl ? (
                    <div className="dress-image-preview">

                      <img
                        src={previewUrl}
                        alt="Dress preview"
                      />

                      <div className="dress-image-overlay">
                        <ImagePlus size={24} />

                        <span>
                          Change Photo
                        </span>
                      </div>

                    </div>
                  ) : (
                    <div className="upload-empty-state">

                      <div className="upload-icon-circle">
                        <ImagePlus size={28} />
                      </div>

                      <h3>
                        Choose a dress photo
                      </h3>

                      <p>
                        Click here to upload your
                        product image
                      </p>

                      <span>
                        PNG, JPG, JPEG or WEBP
                      </span>

                    </div>
                  )}

                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    required={!selectedFile}
                  />

                </label>

                {selectedFile && (
                  <>
                    <div className="selected-file-info">
                      <CheckCircle size={17} />

                      <span>
                        {selectedFile.name}
                      </span>

                      <small>
                        Ready to upload
                      </small>
                    </div>

                    <button
                      type="button"
                      className="crop-again-button"
                      onClick={handleEditCrop}
                    >
                      <RotateCcw size={16} />
                      Crop Photo Again
                    </button>
                  </>
                )}

              </section>

            </div>

            {/* SIDE SUMMARY */}

            <aside className="add-product-sidebar">

              <div className="add-product-summary">

                <p className="section-label">
                  READY TO ADD?
                </p>

                <h2>
                  Publish this dress
                </h2>

                <p>
                  Once added, the dress will appear
                  automatically in your Shop and New
                  Arrivals sections.
                </p>

                <div className="summary-feature">
                  <CheckCircle size={17} />

                  <span>
                    Visible in your store
                  </span>
                </div>

                <div className="summary-feature">
                  <CheckCircle size={17} />

                  <span>
                    Stock can be managed later
                  </span>
                </div>

                <div className="summary-feature">
                  <CheckCircle size={17} />

                  <span>
                    Customers can order through
                    WhatsApp
                  </span>
                </div>

                <button
                  type="submit"
                  className="primary-button add-product-submit"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Upload size={18} />
                      Uploading Dress...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Dress
                    </>
                  )}
                </button>

                <Link
                  to="/admin/dashboard"
                  className="cancel-add-product"
                >
                  Cancel
                </Link>

              </div>

              <div className="add-product-tip">
                <strong>💡 Quick tip</strong>

                <p>
                  Use a clear, well-lit photo so customers
                  can easily see the dress.
                </p>
              </div>

            </aside>

          </form>

        </div>
      </main>

      {/* IMAGE CROPPER */}

      {showCropper && previewUrl && (
        <div className="cropper-modal">

          <div className="cropper-container">

            <div className="cropper-header">
              <div>
                <p className="section-label">
                  PHOTO EDITOR
                </p>

                <h2>Crop Dress Photo</h2>

                <p>
                  Adjust the photo so the dress is
                  positioned nicely.
                </p>
              </div>
            </div>

            <div className="cropper-area">
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="cropper-controls">

              <label htmlFor="zoom">
                Zoom
              </label>

              <input
                id="zoom"
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(event) =>
                  setZoom(Number(event.target.value))
                }
              />

              <span>
                {zoom.toFixed(1)}x
              </span>

            </div>

            <div className="cropper-actions">

              <button
                type="button"
                className="cancel-add-product"
                onClick={handleCropCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleCropConfirm}
              >
                <CheckCircle size={18} />
                Use This Crop
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}