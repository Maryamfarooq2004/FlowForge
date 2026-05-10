import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project.model';
import { sendSuccess, sendError } from '../utils/response.utils';

export const saveIntakeForm = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user._id;

    // SECURITY: verify ownership
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) return sendError(res, 'Project not found', 404);

    // Save logic: we can store this in a separate collection or inside the project document
    // For simplicity in this FYP phase, we'll use an 'intakeData' field in the Project model
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { 
        $set: { 
          intakeData: req.body,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    sendSuccess(res, {
      saved: true,
      savedAt: new Date(),
    }, 'Intake form saved successfully');
  } catch (error) {
    next(error);
  }
};
