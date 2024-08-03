import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: 'dpaajzngl',
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY as string,
    secure: true
});

export {cloudinary};