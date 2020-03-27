import { DocumentQuery } from 'mongoose';

export default class APIFeatures {
  private paginationLinks?: PaginationLink;

  constructor(
    public query: DocumentQuery<any[], any, {}>,
    public queryString: any
  ) {
    this.query = query;
    this.queryString = queryString;
  }

  public filter() {
    // Basic filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      matched => `$${matched}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  public sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  public limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }

    return this;
  }

  public paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;

    if (this.queryString.page && page <= 0) {
      throw new Error('Cannot request negative pages');
    }

    this.query = this.query.skip(skip).limit(limit);
    this.paginationLinks = { page, limit };

    return this;
  }

  public createPaginationLinks(total: number): Pagination {
    if (!this.paginationLinks)
      throw new Error('No pagination information provided');

    const { page, limit } = this.paginationLinks;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination: Pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    return pagination;
  }
}

interface PaginationLink {
  page: number;
  limit: number;
}

interface Pagination {
  next?: PaginationLink;
  prev?: PaginationLink;
}
