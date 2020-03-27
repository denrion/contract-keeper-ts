import status from 'http-status';
import { Model, ModelPopulateOptions } from 'mongoose';
import ResponseStatus from '../@types/ResponseStatus';
import APIFeatures from '../utils/APIFeatures';
import catchAsync from '../utils/catchAsync';
import InternalServerError from '../utils/errors/InternalServerError';
import NotFoundError from '../utils/errors/NotFoundError';
import lowercaseFirstLetter from '../utils/helpers/lowercaseFirstLetter';

export const getAll = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(req.conditions), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documents = await features.query;

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      results: documents.length,
      pagination: features.createPaginationLinks(await Model.countDocuments()),
      data: { [`${lowercaseFirstLetter(Model.modelName)}s`]: documents },
    });
  });

export const getOne = (
  Model: Model<any>,
  populateOptions?: ModelPopulateOptions
) =>
  catchAsync<{ id: string }>(async (req, res, next) => {
    const query = Model.findById(req.params.id);

    if (populateOptions) query.populate(populateOptions);

    const document = await query;

    if (!document)
      return next(new NotFoundError('No document found with that ID'));

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      data: { [lowercaseFirstLetter(Model.modelName)]: document },
    });
  });

export const createOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    if (!document)
      return next(
        new InternalServerError(
          'Error occured while creating a document. Please, try again.'
        )
      );

    res.status(status.CREATED).json({
      status: ResponseStatus.SUCCESS,
      data: { [lowercaseFirstLetter(Model.modelName)]: document },
    });
  });

export const updateOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document)
      return next(new NotFoundError('No document found with that ID'));

    res.status(status.OK).json({
      status: ResponseStatus.SUCCESS,
      data: { [lowercaseFirstLetter(Model.modelName)]: document },
    });
  });

export const deleteOne = (Model: Model<any>) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document)
      return next(new NotFoundError('No document found with that ID'));

    res
      .status(status.NO_CONTENT)
      .json({ status: ResponseStatus.SUCCESS, data: null });
  });
