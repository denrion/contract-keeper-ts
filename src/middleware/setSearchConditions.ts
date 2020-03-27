import { Request, RequestHandler } from 'express';

export const setUserBodyField: RequestHandler = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const setSearchConditionToUser: RequestHandler = (req, res, next) => {
  req.conditions = req.user._id ? { user: req.user._id } : {};
  next();
};

export const setSearchConditionFromParam = (param: string): RequestHandler => (
  req,
  res,
  next
) => {
  const [key, value] = getKeyAndValueFromParam(req, param);

  req.conditions = value ? { [key]: value } : {};

  next();
};

export const setBodyFieldFromParam = (...params: string[]): RequestHandler => (
  req,
  res,
  next
) => {
  params.forEach((param) => {
    const [key, value] = getKeyAndValueFromParam(req, param);

    if (!req.body[key]) req.body[key] = value;
  });

  next();
};

const getKeyAndValueFromParam = (req: Request, param: string) => {
  const key = param.replace('Id', '');
  const value = req.params[param];

  return [key, value];
};
