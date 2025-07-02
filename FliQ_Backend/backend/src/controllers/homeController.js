

const movieNewsmodel=require('../models/movienewsModel')

const categoryModel=require('../models/CategeoryModel')

const subcategoryModel=require('../models/subcategoryModel');
const titleModel = require('../models/titleModel');
const sectionModel = require('../models/sectionModel');
const BannerModel = require('../models/BannerModel');
const QuizModel= require('../models/QuizModel')
const buildRegex = (query) => new RegExp(`^${query}`, 'i');
// const buildRegex = (query) => new RegExp(`^${query}`, 'i');



exports.gethome = async (req, res) => {
  try {
    // Fetch the latest Movie News for banners, including imageUrl and images
    const latestMovieNews = await movieNewsmodel
      .findOne()
      .sort({ createdAt: -1 })
      .select("_id title description imageUrl images createdAt");  // Make sure to select imageUrl and images

    // Fetch the latest Movie Reviews for banners
    const latestMovieReview = await sectionModel
      .findOne()
      .sort({ createdAt: -1 })
      .select("_id title imageUrl images rating createdAt");

    // Fetch the latest Category for banners
    const latestCategory = await categoryModel
      .findOne()
      .sort({ createdAt: -1 })
      .select("_id title imageUrl images subcategories createdAt");

    // Fetch the latest 10 movie news
    const movieNews = await movieNewsmodel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id title description images imageUrl createdAt");

    // Fetch the latest 10 movie reviews
    const movieReviews = await sectionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id title rating reviewText imageUrl images createdAt");
       // 3. Fetch All Categories
       const allQuizzes = await QuizModel.find()
       .sort({ updatedAt: -1 })
       .select('subcategory category updatedAt');

       const subcategoryActivityMap = new Map(); // subcatId => latestUpdatedAt
    const categoryActivityMap = new Map(); // catId => latestUpdatedAt
    allQuizzes.forEach((quiz) => {
      const subcatId = quiz.subcategory?.toString();
      const catId = quiz.category?.toString();
      const quizTime = new Date(quiz.updatedAt);

      if (subcatId) {
        const existing = subcategoryActivityMap.get(subcatId);
        if (!existing || quizTime > existing) {
          subcategoryActivityMap.set(subcatId, quizTime);
        }
      } if (catId) {
        const existing = categoryActivityMap.get(catId);
        if (!existing || quizTime > existing) {
          categoryActivityMap.set(catId, quizTime);
        }
      }
    });
    const allSubcategories = await subcategoryModel
    .find()
    .populate('category')
    .select('_id title imageUrl images category');

  //  Group subcategories under categories
  const categoryMap = new Map();



  allSubcategories.forEach((subcat) => {
    const cat = subcat.category;
    const catId = cat._id.toString();
    const subcatId = subcat._id.toString();
    const subcatTime = subcategoryActivityMap.get(subcatId) || new Date(0);

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        type: cat.title,
        _id: cat._id,
        latestActivity: categoryActivityMap.get(catId) || new Date(0),
        data: []
      });
    }

    categoryMap.get(catId).data.push({
      _id: subcat._id,
      title: subcat.title,
      imageUrl: subcat.imageUrl || {},
      images: subcat.images || [],
      quizUpdatedAt: subcatTime,
    });
  });

  for (const category of categoryMap.values()) {
    category.data.sort((a, b) => new Date(b.quizUpdatedAt) - new Date(a.quizUpdatedAt));
  }
  const sortedCategories = Array.from(categoryMap.values()).sort(
    (a, b) => new Date(b.latestActivity) - new Date(a.latestActivity)
  );
  const cleanedCategories = sortedCategories.map(cat => ({
    type: cat.type,
    _id: cat._id,
    data: cat.data.map(subcat => ({
      _id: subcat._id,
      title: subcat.title,
      imageUrl: subcat.imageUrl,
      images: subcat.images,
      createdAt: subcat.quizUpdatedAt
    }))
  }));
  

   
const staticmovinews = await BannerModel.findOne({ bannerType: 'movieNews' }).select('_id title description imageUrl createdAt');
const staticmoviereview = await BannerModel.findOne({ bannerType: 'movieReviews' }).select('_id title imageUrl createdAt');
const staticcategories = await BannerModel.findOne({ bannerType: 'Categories' }).select('_id title imageUrl createdAt');

const static = [];

if (staticmovinews) static.push({
  type: 'movieNews',
  data: {
    _id: staticmovinews._id,
    title: staticmovinews.title,
    description: staticmovinews.description,
    imageUrl: staticmovinews.imageUrl || {},
    images: staticmovinews.images || [],  // Ensure images is an array
    createdAt: staticmovinews.createdAt,
  }
});

if (staticmoviereview) static.push({
  type: 'movieReviews',
  data: {
    _id: staticmoviereview._id,
    title: staticmoviereview.title,
    imageUrl: staticmoviereview.imageUrl || {},
    images: staticmoviereview.images || [],  // Ensure images is an array
    createdAt: staticmoviereview.createdAt,
  }
});

if (staticcategories) static.push({
  type: 'Categories',
  data: {
    _id: staticcategories._id,
    title: staticcategories.title,
    imageUrl: staticcategories.imageUrl || {},
    images: staticcategories.images || [],  // Ensure images is an array
    createdAt: staticcategories.createdAt,
  }
});
 // Set banners with movie news, including imageUrl and images
    const banners = [];
    if (latestMovieNews) banners.push({ 
      type: "movieNews", 
      data: {
        _id: latestMovieNews._id,
        title: latestMovieNews.title,
        description: latestMovieNews.description,
        imageUrl: latestMovieNews.imageUrl || {},  // Ensure imageUrl is an object
        images: latestMovieNews.images || [],     // Ensure images is an array
        createdAt: latestMovieNews.createdAt,
      }
    });

    if (latestMovieReview) banners.push({ 
      type: "MovieReviews", 
      data: {
        _id: latestMovieReview._id,
        title: latestMovieReview.title,
        description: latestMovieReview.description,
        imageUrl: latestMovieReview.imageUrl || {},  // Ensure imageUrl is an object
        images: latestMovieReview.images || [],     // Ensure images is an array
        createdAt: latestMovieReview.createdAt,
      }
    });
    if (latestCategory) banners.push({ 
      type: "Categories", 
      data: {
        _id: latestCategory._id,
        title: latestCategory.title,
        description: latestCategory.description,
        imageUrl: latestCategory.imageUrl || {},  // Ensure imageUrl is an object
        images: latestCategory.images || [],     // Ensure images is an array
        createdAt: latestCategory.createdAt,
      }
    });
    // Prepare the response with both images[] and imageUrl
    const response = [
      { 
        type: "News", 
        _id: "", 
        data: movieNews.map(news => ({
          ...news.toObject(),
          imageUrl: news.imageUrl || {},  // Default empty object for imageUrl
          images: news.images || []      // Default empty array for images
        }))
      },
      { 
        type: "Reviews", 
        _id: "", 
        data: movieReviews.map(review => ({
          ...review.toObject(),
          imageUrl: review.imageUrl || {},  // Default empty object for imageUrl
          images: review.images || []      // Default empty array for images
        }))
      },
      ...cleanedCategories
    ]

    res.json({ static,banners, response});
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    res.status(500).json({ error: "Failed to load homepage data" });
  }
};

exports.getAllData = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type || !type.trim()) {
      return res.status(400).json({ error: "Type parameter is required" });
    }

    const trimmedType = type.trim().toLowerCase();
    let responseData = {};

    if (trimmedType === "movienews") {
      responseData = {
        type: "movieNews",
        data: await movieNewsmodel
          .find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select("_id title description imageUrl createdAt"),
      };
    } else if (trimmedType === "moviereviews") {
      responseData = {
        type: "movieReviews",
        data: await titleModel
          .find()
          .sort({ createdAt: -1 })
          .limit(10)
          .select("_id title imageUrl rating createdAt"),
      };
    } else {
      // Flexible category match
      const category = await categoryModel
        .findOne({ title: { $regex: new RegExp(trimmedType, "i") } })
        .select("_id title imageUrl createdAt");

      if (!category) {
        return res.status(404).json({ error: "Invalid type provided" });
      }

      const subcategories = await subcategoryModel
        .find({ category: category._id })
        .select("_id title imageUrl createdAt");

      responseData = {
        type: category.title,
        _id: category._id,
        data: subcategories,
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

// exports.getAllData = async (req, res) => {
//   try {
//     const { type } = req.query;

//     if (!type) {
//       return res.status(400).json({ error: "Type parameter is required" });
//     }

//     // Convert type to lowercase for case insensitivity
//     const lowerCaseType = type.toLowerCase();

//     let responseData = {};

//     // Fetch movie news
//     if (lowerCaseType === "movienews") {
//       responseData = {
//         type: "movieNews",
     
//         data: await movieNewsmodel
//           .find()
//           .sort({ createdAt: -1 })
//           .limit(10)
//           .select("_id title description imageUrl createdAt"),
//       };
//     } 
    
//     // Fetch movie reviews
//     else if (lowerCaseType === "moviereviews") {
//       responseData = {
//         type: "movieReviews",
      
//         data: await titleModel
//           .find()
//           .sort({ createdAt: -1 })
//           .limit(10)
//           .select("_id title imageUrl rating createdAt"),
//       };
//     } 
//       // Fetch categories with subcategories
//     else {
//       // Find category by title (case-insensitive)
//       const category = await categoryModel
//         .findOne({ title: { $regex: new RegExp(`^${type}$`, "i") } }) // Case-insensitive search
//         .select("_id title imageUrl createdAt");

//       if (!category) {
//         return res.status(404).json({ error: "Invalid type provided" });
//       }
//       // Fetch subcategories under this category
//       const subcategories = await subcategoryModel
//         .find({ category: category._id })
//         .select("_id title imageUrl createdAt");

//       responseData = {
//         type: category.title,
//         _id: category._id,
//         data: subcategories,
//       };
//     }

//     res.json(responseData);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// };

exports.getBySearch=async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ success: false, message: 'Query string "q" is required.' });
  }
//use this for below code for search
   const regex = buildRegex(query);

  try {

    //if he crct spee like kohl one by one letter search user it will suaggest all realted data
    const [
      categories,
      subcategories,
      sections,
      titles,
      movieNews
    ] = await Promise.all([
      categoryModel.find({ title: regex }, 'title imageUrl').limit(10),
      subcategoryModel.find({ title: regex }, 'title imageUrl').limit(10),
      sectionModel.find({ name: regex }, 'title imageUrl').limit(10),
      titleModel.find({ name: regex }, 'title imageUrl').limit(10),
      movieNewsmodel.find({ title: regex }, 'title imageUrl description images ').limit(10)
    ]);
    const results = [
      ...categories.map(c => ({ type: 'Category', ...c._doc})),
      ...subcategories.map(sc => ({ type: 'Subcategory', ...sc._doc })),
      ...sections.map(s => ({ type: 'Section', value: s.name })),
      ...titles.map(t => ({ type: 'Title', value: t.name })),
      ...movieNews.map(mn => ({ type: 'News',  ...mn._doc }))
    ];

    res.json({ success: true, query, results });
  } catch (err) {
    console.error('Search Error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
}

exports.getBySearchWrong = async (req, res) => {
  const rawQuery = req.query.q || '';
  const query = rawQuery.trim().replace(/\s+/g, ' ');

  const regex = buildRegex(query);
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query string "q" is required.' });
  }

  try {
    const [categories, subcategories, sectionModel,titleModel,movieNews] = await Promise.all([
      categoryModel.find({ title: regex }, 'title imageUrl').limit(10),
      subcategoryModel.find({ title: regex }, 'title imageUrl').limit(10),
      sectionModel.find({ name: regex }, 'title imageUrl').limit(10),
      titleModel.find({ name: regex }, 'title imageUrl').limit(10),
      movieNewsmodel.find({ title: regex }, 'title imageUrl images description').limit(10)
    ]);
    
    const combinedResults = [
      ...categories.map(c => ({ type: 'Category', ...c._doc })),
      ...subcategories.map(sc => ({ type: 'Subcategory', ...sc._doc })),
      ...sections.map(s => ({ type: 'Section', value: s.name })),
      ...titles.map(t => ({ type: 'Title', value: t.name })),
      ...movieNews.map(mn => ({ type: 'CricketNews', ...mn._doc }))
    ];
    
    const fuse = new Fuse(combinedResults, {
      keys: ['title'], // depends on fields used
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1
    });

    const results = fuse.search(query).slice(0, 15).map(r => r.item);

    res.json({ success: true, query, results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }

}