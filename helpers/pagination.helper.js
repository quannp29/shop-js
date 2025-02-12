module.exports = (req, countRecords, limit) => {
  const objectPagination = {
    currentPage: 1,
    limitItems: limit ?? 4
  }
  if(req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page);
  }

  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
  objectPagination.totalPage = Math.ceil(countRecords/objectPagination.limitItems);
  
  return objectPagination;
}