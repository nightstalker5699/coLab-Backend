import prisma from "../middlewares/prisma/user.middleware";
import { QueryParams } from "../types/generalTypes";
import { queryParamsType } from "../types/taskTypes";
import AppError from "./appError";

export const querybuilder = async (
  model: any,
  query: queryParamsType,
  disabledFields: Array<string>
) => {
  let dbQuery = { where: {}, orderBy: {}, take: 0, skip: 0 };

  dbQuery.where = filter({}, query, disabledFields);

  dbQuery.orderBy = sort({}, query);

  let result = await pagination(dbQuery, query, model, dbQuery.where);
  return result;
};
const filter = (
  where: any,
  query: queryParamsType,
  disabledFields: Array<string>
) => {
  if (!query.filter) return {};

  let filters = query.filter.split("|") as Array<string>;

  filters.forEach((row) => {
    let [column, operator, value] = row.split(",");

    if (disabledFields.includes(column)) return;
    let parsedValue: string | number = value;

    if (!isNaN(Number(value))) parsedValue = Number(value);

    switch (operator) {
      case "equals":
        where[column] = parsedValue;
        break;

      default:
        where[column] = { [operator]: parsedValue };
    }
  });

  return where;
};

const sort = (orderBy: any, query: queryParamsType) => {
  if (!query.sort) return {};

  let sorts = query.sort.split("|") as Array<string>;

  sorts.forEach((row) => {
    const [column, value] = row.split(",");
    orderBy[column] = value;
  });
  return orderBy;
};
const pagination = async (
  dbQuery: any,
  query: queryParamsType,
  model: any,
  where: any
) => {
  const page = query.page || 1;
  const size = query.size || 10000;
  const skip = (page - 1) * size;
  const count = await (prisma[model] as any).count({ where: where });
  if (skip >= count) {
    throw new AppError("end of pages", 400);
  }
  dbQuery["take"] = size;
  dbQuery["skip"] = skip;
  return { dbQuery, maxPage: Math.ceil(size / parseFloat(count)) };
};
