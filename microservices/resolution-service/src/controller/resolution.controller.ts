import { Response } from "express";

import { updateResolution } from "../utils/ffmpegHelper";

export const handleResolutionUpdate = async (req: any, res: Response) => {
    const { fileName, resolution } = req.body;

    console.log('body', req.body)

    try {
        const result = await updateResolution(fileName, resolution);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating video resolution:', error);
        res.status(500).json({ message: 'Failed to update resolution', error });
    }
};


