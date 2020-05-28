const { db } = require("../../models");
const { validatePostSearchParameters } = require("../../validations");
const { Op } = require("sequelize");
const { DateTime } = require("luxon");
const {
  AuthenticationError,
  ForbiddenError,
  ApolloError,
} = require("apollo-server");

module.exports = {
  Subscription: {},

  Query: {
    getAllPosts: async (_, params, ctx) => {
      validatePostSearchParameters(params);
      const {
        text,
        fromDate,
        toDate,
        ownerId,
        fromApplicantLimit,
        toApplicantLimit,
      } = params;

      const filter = { where: {} };

      if (text) {
        Object.assign(filter.where, {
          [Op.or]: {
            name: { [Op.iLike]: "%" + text + "%" },
            description: { [Op.iLike]: "%" + text + "%" },
          },
        });
      }

      if (fromDate && toDate) {
        filter.where.createdAt = {
          [Op.between]: [
            DateTime.fromISO(fromDate, { zone: "UTC" }).toISO(),
            DateTime.fromISO(toDate, { zone: "UTC" }).toISO(),
          ],
        };
      } else if (fromDate) {
        filter.where.createdAt = {
          [Op.gte]: DateTime.fromISO(fromDate, { zone: "UTC" }).toISO(),
        };
      } else if (toDate) {
        filter.where.createdAt = {
          [Op.lte]: DateTime.fromISO(toDate, { zone: "UTC" }).toISO(),
        };
      }

      if (ownerId) {
        filter.where.ownerId = ownerId;
      }

      if (fromApplicantLimit && toApplicantLimit) {
        filter.where.applicantLimit = {
          [Op.between]: [fromApplicantLimit, toApplicantLimit],
        };
      } else if (fromApplicantLimit) {
        filter.where.applicantLimit = { [Op.gte]: fromApplicantLimit };
      } else if (toApplicantLimit) {
        filter.where.applicantLimit = { [Op.lte]: toApplicantLimit };
      }

      console.log(filter);

      return await db.post.findAll(filter);
    },
  },

  Mutation: {
    createPost: async (_, params, ctx) => {
      if (!ctx.auth) {
        throw new AuthenticationError("Not authenticated");
      }
      if (!ctx.ability.can(db.post, "create")) {
        throw new ForbiddenError("Not authorized");
      }
      try {
        params["stateId"] = 1;
        const newPost = await db.post.create(params);
        return newPost;
      } catch (error) {
        throw new ApolloError("Unexpected error", 500);
      }
    },
  },

  Post: {
    owner: async (post) => {
      return await post.getOwner();
    },
    state: async (post) => {
      return await post.getState();
    },
  },
};
