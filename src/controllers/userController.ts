import User from '../models/User';
import * as factory from './handlerFactory';

// @desc      Get All Users
// @route     GET /api/v1/users
// @access    Private
export const getAllUsers = factory.getAll(User);

// @desc      Get One User
// @route     GET /api/v1/users/:userId
// @access    Private
export const getUser = factory.getOne(User);

// @desc      Create New User
// @route     POST /api/v1/users
// @access    Private
export const createUser = factory.createOne(User);

// @desc      Update User
// @route     PATCH /api/v1/users/:userId
// @access    Private
export const updateUser = factory.updateOne(User);

// @desc      Delete User
// @route     DELETE /api/v1/users/:userId
// @access    Private
export const deleteUser = factory.deleteOne(User);
