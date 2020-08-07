import { validationResult, matchedData } from "express-validator"

// return response from validations of express validator 
export function checkValidations(req) {

    const validationErrors = validationResult(req).array({ onlyFirstError: true });

    if (validationErrors.length > 0) {
        throw new apiError(422, validationErrors)
    }

    return matchedData(req);
}

// return error message with status 
export function apiError(status, message) {
    const error = new Error()
    error.status = status
    error.message = message
    return error
}

export const checkExistThenGet = async (id, Model, findQuery = { populate: '', select: '' }, errorMessage = '') => {
    let populateQuery = findQuery.populate || '', selectQuery = findQuery.select || '';

    if (typeof findQuery != 'object') {
        errorMessage = findQuery;
        findQuery = {};
    } else {
        delete findQuery.populate;
        delete findQuery.select;
    }

    let model = await Model.findOne({ _id: id, ...findQuery })
        .populate(populateQuery).select(selectQuery);
    if (model)
        return model;

    throw new apiError(404, errorMessage || `${Model.modelName} not found`);
};

export const checkExist = async (id, Model, extraQuery = {}, errorMessage = '') => {
    if (typeof extraQuery != 'object') {
        errorMessage = extraQuery;
        extraQuery = {};
    }
    let model = await Model.findOne({ _id: id, ...extraQuery }).lean();
    if (model)
        return;
    throw new apiError(404, errorMessage || `${Model.modelName} not found`);
};