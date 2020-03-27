import mongoose, { Schema } from 'mongoose';

export const sanitizeMongoFields = (schema: Schema) => {
  const toJSON = schema.methods.toJSON || mongoose.Document.prototype.toJSON;

  schema.set('toJSON', {
    virtuals: true,
  });

  schema.methods.toJSON = function () {
    const json = toJSON.apply(this, arguments);

    delete json._id;
    delete json.__v;
    delete json.updatedAt;
    delete json.createdAt;

    return json;
  };
};

export const sanitizeSpecifiedFields = (
  schema: Schema,
  fieldsToExclude: string[]
) => {
  const toJSON = schema.methods.toJSON || mongoose.Document.prototype.toJSON;

  schema.set('toJSON', {
    virtuals: true,
  });

  schema.methods.toJSON = function () {
    const json = toJSON.apply(this, arguments);

    fieldsToExclude.forEach((el) => delete json[el]);

    return json;
  };
};
