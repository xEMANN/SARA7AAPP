import mongoose from "mongoose";


export const findOne = async ({
    model,
    filter = {},
    select = "",
    populate = [],
}= {} ) => {
    return await model.findOne(filter).select(select).populate(populate);
};

export const find = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.find(filter).select(select).populate(populate);
};


export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => {
  if (!id || (typeof id !== "string" && !(id instanceof mongoose.Types.ObjectId))) {
    throw new Error("Invalid or missing ID in findById");
  }

  return await model.findById(id).select(select).populate(populate);
};


export const create = async ({
    model,
    data = [{}],
    options  = {validateBeforeSave : true},
}= {} ) => {
    return await model.create(data, options);
};

export const updateOne= async ({
    model,
    filter = {},
    data = {},
    options = {runValidators : true},
}= {} ) => {
    return await model.updateOne(filter,data,options);
    
};

export const findByIdAndUpdate = async ({
    model,
    id = "",
    data = {},
    options = {new : true , runValidators:true},
}= {} ) => {
    return await model.findByIdAndUpdate(id,data,options);
    
};

export const findOneAndUpdate= async ({
    model,
    filter = {},
    data = {},
    options = {new: true, runValidators : true},
}= {} ) => {
    return await model.findOneAndUpdate(filter,data,options);
    
};
