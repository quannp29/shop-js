const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const systemConfig = require("../../config/system");
const mongoose = require("mongoose");

// [GET] /admin/orders
module.exports.index = async (req, res) => {
  const basePipeline = [
    {
      $lookup: {
        from: "users",
        let: { userId: { $toObjectId: "$user_id"}},
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$userId"]}}},
          { $project: { _id: 1, fullName: 1}}
        ],
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $addFields: {
        totalPrice: {
          $sum: {
            $map: {
              input: "$products",
              as: "item",
              in: {
                $multiply: [
                  "$$item.price",
                  "$$item.quantity",
                  { $subtract: [1, { $divide: ["$$item.discountPercentage", 100] }] }
                ]
              }
            }
          }
        }
      }
    },
  ];

  // Filter Status
  if(req.query.status) {
    basePipeline.push({ $match: { status: req.query.status } })
  }
  // End Filter Status
  
  // Search by user.fullName
  if(req.query.keyword) {
    basePipeline.push({ $match: { "user.fullName": { $regex: req.query.keyword, $options: "i" } } });
  }
  // End Search by user.fullName

  const paginatedPipeline = [...basePipeline];

  // Sort
  let sort = {
    sortKey: "createdAt",
    sortValue: -1
  };

  if(req.query.sortKey && req.query.sortValue) {
    sort.sortKey = req.query.sortKey;
    sort.sortValue = req.query.sortValue === "desc" ? -1 : 1;
  }
  paginatedPipeline.push({ $sort: { [sort.sortKey]: sort.sortValue}});
  // End Sort

  // Pagination
  const objectPagination = {
    currentPage: 1,
    limitItems: 4
  }
  
  if(req.query.page) {
    objectPagination.currentPage = parseInt(req.query.page);
  }
  
  objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems;
  paginatedPipeline.push(
    { $skip: objectPagination.skip},
    { $limit: objectPagination.limitItems}
  )
  // End Pagination

  const countPipeline = [...basePipeline, { $count: "totalOrders" }];

  const [orders, countResult] = await Promise.all([
    Order.aggregate(paginatedPipeline), // Lấy danh sách đơn hàng
    Order.aggregate(countPipeline) // Đếm số lượng đơn hàng theo bộ lọc
  ]);

  objectPagination.totalPage = countResult.length > 0 ? Math.ceil(countResult[0].totalOrders / objectPagination.limitItems) : 0;

  res.render("admin/pages/order/index",{
    pageTitle: "Quản lý đơn hàng",
    orders: orders,
    objectPagination: objectPagination,
    keyword: req.query.keyword
  })
};

// [GET] /admin/order/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({
      _id: id
    });

    order.totalPrice = 0;

    const user = await User.findOne({
      _id: order.user_id
    }).select("fullName email avatar");

    order.user = user;

    for (const product of order.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id
      });

      product.title = productInfo.title;
      product.thumbnail = productInfo.thumbnail;
      product.priceNew = (product.price * (100 - product.discountPercentage)/100).toFixed(0);
      product.totalPrice = product.priceNew * product.quantity;

      order.totalPrice += product.totalPrice;
    }

    res.render("admin/pages/order/detail", {
      pageTitle: "Chi tiết đơn hàng",
      order: order
    });
  } catch (error) {
    res.redirect(`/${systemConfig.prefixAdmin}/orders`);
  }
}

// [GET] /admin/orders/change-status/:id 
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;

    const orderDetail = await Order.aggregate([
      // Lọc đơn hàng theo _id
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
  
      // Join với collection "users" để lấy thông tin người đặt hàng
      {
        $lookup: {
          from: "users",
          let: { userId: { $toObjectId: "$user_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { _id: 1, fullName: 1, email: 1 } }
          ],
          as: "user"
        }
      },
      { $unwind: "$user" }, // Nếu muốn lấy luôn user (không cần mảng)
  
      // Join với collection "products" để lấy thông tin sản phẩm
      {
        $lookup: {
          from: "products",
          let: { productIds: "$products.product_id" },
          pipeline: [
            { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$productIds"] } } },
            { $project: { _id: 1, title: 1, price: 1, thumbnail: 1 } }
          ],
          as: "productDetails"
        }
      },
  
      // Ghép thông tin sản phẩm vào từng mục trong mảng `products`
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "p",
              in: {
                product_id: "$$p.product_id",
                quantity: "$$p.quantity",
                discountPercentage: "$$p.discountPercentage",
                price: "$$p.price",
                productInfo: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$productDetails",
                        as: "prod",
                        cond: { $eq: [{ $toString: "$$prod._id" }, "$$p.product_id"] }
                      }
                    },
                    0
                  ]
                },
                priceNew: {
                  $multiply: [
                    "$$p.price",
                    { $subtract: [1, { $divide: ["$$p.discountPercentage", 100] }] }
                  ]
                },
                total: {
                  $multiply: [
                    {
                      $multiply: [
                        "$$p.price",
                        { $subtract: [1, { $divide: ["$$p.discountPercentage", 100] }] }
                      ]
                    },
                    "$$p.quantity"
                  ]
                }
              }
            }
          },
          totalPrice: {
            $sum: {
              $map: {
                input: "$products",
                as: "item",
                in: {
                  $multiply: [
                    "$$item.price",
                    "$$item.quantity",
                    { $subtract: [1, { $divide: ["$$item.discountPercentage", 100] }] }
                  ]
                }
              }
            }
          }
        }
      },
  
      // Ẩn mảng productDetails đã join
      { $unset: "productDetails" }
    ]);

    const listStatus = ["initial", "processing", "delivering", "completed"];


    res.render("admin/pages/order/change-status", {
      pageTitle: "Cập nhật trạng thái đơn hàng",
      order: orderDetail[0],
      listStatus: listStatus
    })
  } catch (error) {
    console.log(error);
    res.redirect(`/${systemConfig.prefixAdmin}/orders`);
  }
}

// [PATCH] /admin/orders/change-status/:id
module.exports.changeStatusPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Order.updateOne({
      _id: id
    }, req.body);

    res.redirect("back");
  } catch (error) {
    console.log(error);
    res.redirect(`/${systemConfig.prefixAdmin}/orders`);
  }
}