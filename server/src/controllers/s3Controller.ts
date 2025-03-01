import express from 'express';
import { uploadImage, getImages, updateImage, deleteImage } from '../services/s3';
import multer from 'multer';

const imageRouter = express.Router();
const upload = multer();

imageRouter.post('/:projectId/images', upload.single('image'), uploadImage);
imageRouter.get('/:projectId/images', getImages);
imageRouter.put('/:projectId/images/:imageUrl', upload.single('image'), updateImage);
imageRouter.delete('/:projectId/images/:imageUrl', deleteImage);

export default imageRouter;