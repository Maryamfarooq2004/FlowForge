import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project.model';
import { sendSuccess, sendError } from '../utils/response.utils';

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const projects = await Project.find({ userId, isArchived: false }).sort({ createdAt: -1 });
    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
};

export const listArchivedProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const projects = await Project.find({ userId, isArchived: true }).sort({ updatedAt: -1 });
    sendSuccess(res, projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const project = await Project.create({
      ...req.body,
      userId,
    });
    sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const project = await Project.findOne({ _id: req.params.id, userId });
    
    if (!project) return sendError(res, 'Project not found', 404);
    
    sendSuccess(res, project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) return sendError(res, 'Project not found', 404);

    sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const archiveProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isArchived: true, status: 'archived' },
      { new: true }
    );

    if (!project) return sendError(res, 'Project not found', 404);

    sendSuccess(res, project, 'Project archived successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const result = await Project.findOneAndDelete({ _id: req.params.id, userId });

    if (!result) return sendError(res, 'Project not found', 404);

    sendSuccess(res, null, 'Project permanently deleted');
  } catch (error) {
    next(error);
  }
};

export const duplicateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const originalProject = await Project.findOne({ _id: req.params.id, userId });

    if (!originalProject) return sendError(res, 'Project not found', 404);

    const duplicatedProject = await Project.create({
      name: `${originalProject.name} (Copy)`,
      userId,
      category: originalProject.category,
      organizationName: originalProject.organizationName,
      status: 'intake', // Reset status for the new copy
    });

    sendSuccess(res, duplicatedProject, 'Project duplicated successfully', 201);
  } catch (error) {
    next(error);
  }
};
