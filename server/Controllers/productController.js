import Product from "../models/Product.js";

// GET /api/products  (public – list all)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("getProducts error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch products",
    });
  }
};

// (optional) ADMIN – create product manually
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created",
      data: product,
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create product",
    });
  }
};

// (optional) ADMIN – update product
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: updated,
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update product",
    });
  }
};

// (optional) ADMIN – delete product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete product",
    });
  }
};

// Seed initial products (call once)
export const seedProducts = async (req, res) => {
  try {
    const data = [
      {
        name: "LED String Lights & Spot Lights",
        category: "Decoration Products",
        price: 800,
        type: "rent",
        photo: "/product-images/led-lights.png",
        stock: 50,
        description: "Warm LED string and spot lights for stage and decor.",
      },
      {
        name: "Flower Bunches / Garlands",
        category: "Decoration Products",
        price: 1200,
        type: "buy",
        photo: "/product-images/flower-garlands.png",
        stock: 40,
        description: "Fresh-looking artificial flower garlands for events.",
      },
      {
        name: "Decorative Pillars & Stands",
        category: "Decoration Products",
        price: 1500,
        type: "rent",
        photo: "/product-images/pillars.png",
        stock: 20,
        description: "Elegant pillars & stands for stage and entry gate.",
      },
      {
        name: "Chafing Dishes & Serving Bowls",
        category: "Food & Catering",
        price: 1000,
        type: "rent",
        photo: "/product-images/chafing-dishes.png",
        stock: 30,
        description: "Standard buffet chafing dishes set.",
      },
      {
        name: "Disposable Plates / Cups / Cutlery",
        category: "Food & Catering",
        price: 600,
        type: "buy",
        photo: "/product-images/disposables.png",
        stock: 200,
        description: "High-quality disposable plates, cups and cutlery set.",
      },
      {
        name: "Serving Trolleys / Tables",
        category: "Kitchen Essentials",
        price: 1300,
        type: "rent",
        photo: "/product-images/serving-trolley.png",
        stock: 10,
        description: "Stainless steel serving trolleys and tables.",
      },
      {
        name: "Coolers / Refrigerators For Drinks",
        category: "Kitchen Essentials",
        price: 2000,
        type: "rent",
        photo: "/product-images/drink-cooler.png",
        stock: 8,
        description: "Coolers/refrigerators for keeping drinks chilled.",
      },
    ];

    await Product.deleteMany({});
    const created = await Product.insertMany(data);

    return res.status(201).json({
      success: true,
      message: "Sample products seeded",
      count: created.length,
      data: created,
    });
  } catch (err) {
    console.error("seedProducts error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to seed products",
    });
  }
};
