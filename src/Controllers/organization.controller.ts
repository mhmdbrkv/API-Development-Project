import { Request, Response, NextFunction } from "express";
import Organization from "../Models/organization.model.js";
import ApiError from "../Utils/apiError";
import User from "../Models/user.model.js";

export const createOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    const organization = await Organization.create({ name, description });

    res.status(201).json({
      organization_id: organization._id,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`${error}`, 400));
    return;
  }
};

export const getOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_id } = req.params;
    const organization = await Organization.findById(organization_id);

    if (!organization_id) {
      next(new ApiError(`No doc found with id: ${organization_id}`, 400));
      return;
    }

    res.status(200).json(organization);
  } catch (error) {
    console.error(error);
    next(new ApiError(`${error}`, 400));
    return;
  }
};

export const getMany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const organization = await Organization.find();

    res.status(200).json(organization);
  } catch (error) {
    console.error(error);
    next(new ApiError(`${error}`, 400));
    return;
  }
};

export const updateOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_id } = req.params;
    const { name, description } = req.body;

    if (!organization_id) {
      next(new ApiError(`No doc found with id: ${organization_id}`, 400));
      return;
    }

    const organization = await Organization.findByIdAndUpdate(
      organization_id,
      { name, description },
      {
        new: true,
      }
    );

    res.status(200).json({
      organization_id: organization_id,
      name: organization?.name,
      description: organization?.description,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`${error}`, 400));
    return;
  }
};

export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_id } = req.params;

    if (!organization_id) {
      next(new ApiError(`No doc found with id: ${organization_id}`, 400));
      return;
    }

    await Organization.findByIdAndDelete(organization_id);

    res.status(200).json({
      message: "Doc has been deleted",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`${error}`, 400));
    return;
  }
};

export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organization_id } = req.params;
    const { user_email } = req.body;

    if (!organization_id) {
      next(new ApiError(`No doc found with id: ${organization_id}`, 400));
      return;
    }
    const user = await User.findOne({ email: user_email });

    if (!user) {
      next(new ApiError(`No user found with email: ${user_email}`, 400));
      return;
    }

    const organization = await Organization.findByIdAndUpdate(
      organization_id,
      { $addToSet: { organization_members: user._id } },
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "User has been invited to the organization",
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`${error}`, 400));
    return;
  }
};