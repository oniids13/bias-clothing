import { getGallery } from "../model/galleryQueries.js";

const getGalleryController = async (req, res) => {
  try {
    const gallery = await getGallery();
    res.status(200).json(gallery);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gallery" });
  }
};

export { getGalleryController };
