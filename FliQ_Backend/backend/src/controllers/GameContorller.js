
const categoryModel = require("../models/CategeoryModel");
const subcategoryModel = require("../models/subcategoryModel");
const IncompleteQuizModel = require("../models/IncompleteQuiz");
const QuizModel = require("../models/QuizModel");


exports.getGameApiDashboards = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Step 1: Fetch all quizzes to track activity
        const allQuizzes = await QuizModel.find().select("subcategory category updatedAt");

        // Track latest activity
        const subcatActivityMap = new Map();
        const catActivityMap = new Map();

        for (const quiz of allQuizzes) {
            const subcatId = quiz.subcategory?.toString();
            const catId = quiz.category?.toString();
            const updatedAt = new Date(quiz.updatedAt);

            if (subcatId) {
                const prev = subcatActivityMap.get(subcatId);
                if (!prev || updatedAt > prev) {
                    subcatActivityMap.set(subcatId, updatedAt);
                }
            }

            if (catId) {
                const prev = catActivityMap.get(catId);
                if (!prev || updatedAt > prev) {
                    catActivityMap.set(catId, updatedAt);
                }
            }
        }

        // Step 2: Get all categories
        const allCategories = await categoryModel.find().select("_id title imageUrl");

        // Step 3: Get all subcategories
        const allSubcategories = await subcategoryModel.find().populate("category").select("_id title imageUrl category");

        // Step 4: Build categories with subcategories (sorted by quiz activity)
        const categoryMap = new Map();

        allSubcategories.forEach(sub => {
            const cat = sub.category;
            const catId = cat._id.toString();
            const subcatId = sub._id.toString();

            const quizUpdatedAt = subcatActivityMap.get(subcatId) || new Date(0);

            if (!categoryMap.has(catId)) {
                categoryMap.set(catId, {
                    type: cat.title,
                    _id: cat._id,
                    imageUrl: cat.imageUrl,
                    latestActivity: catActivityMap.get(catId) || new Date(0),
                    data: []
                });
            }

            categoryMap.get(catId).data.push({
                _id: sub._id,
                title: sub.title,
                imageUrl: sub.imageUrl,
                quizUpdatedAt
            });
        });

        // Sort subcategories inside each category
        for (const cat of categoryMap.values()) {
            cat.data.sort((a, b) => b.quizUpdatedAt - a.quizUpdatedAt);
        }

        // Sort categories by latest quiz update
        const sortedCategories = Array.from(categoryMap.values()).sort(
            (a, b) => b.latestActivity - a.latestActivity
        );

        // Remove quizUpdatedAt field from final response
        const cleanedCategories = sortedCategories.map(cat => ({
            type: cat.type,
            _id: cat._id,
            data: cat.data.map(sub => ({
                _id: sub._id,
                title: sub.title,
                imageUrl: sub.imageUrl
            }))
        }));

        // Step 5: Get Incomplete Quizzes
        const userIncompleteQuizzes = await IncompleteQuizModel.find({ userId }).distinct("subcategoryId");

        const incompleteSubcategories = await subcategoryModel.find({
            _id: { $in: userIncompleteQuizzes }
        }).select("_id title imageUrl createdAt");

        const incompleteQuizz = {
            type: "IncompleteQuizzes",
            _id: userId,
            data: incompleteSubcategories.map(sub => ({
                _id: sub._id,
                title: sub.title,
                imageUrl: sub.imageUrl
            }))
        };

        // Step 6: Prepare banners
        const banners = [];
        banners.push({ type: "Categories", data: allCategories });

        // Final response
        res.json({
            banners,
            response: [incompleteQuizz, ...cleanedCategories]
        });

    } catch (error) {
        console.error("Error in getGameApiDashboard:", error);
        res.status(500).send({ message: error.message });
    }
};


exports.getGameApiDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Get latest categories
        const latestCategories = await categoryModel
            .find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title imageUrl createdAt");

       
        const userIncompleteQuizzes = await IncompleteQuizModel.find({ userId })
            .distinct("subcategoryId"); 

       
        const incompleteSubcategories = await subcategoryModel.find({
            _id: { $in: userIncompleteQuizzes }
        }).select("_id title imageUrl createdAt");

        console.log("Fetched incomplete subcategories: ", incompleteSubcategories);

      
        let incompleteQuizz = [{
            type: "IncompleteQuizzes",
            _id: userId, 
            data: incompleteSubcategories.map(sub => ({
                _id: sub._id,
                title: sub.title,
                imageUrl: sub.imageUrl,
                createdAt: sub.createdAt
            }))
        }];

    
        const categoriesWithSubcategories = await Promise.all(
            latestCategories.map(async (category) => {
                const subcategories = await subcategoryModel
                    .find({ category: category._id })
                    .sort({ createdAt: -1 })
                    .select("_id title imageUrl createdAt");

                return {
                    type: category.title,
                    _id: category._id,
                    data: subcategories
                };
            })
        );

        // Prepare banners
        const banners = [];
        if (latestCategories.length > 0) {
            banners.push({ type: "Categories", data: latestCategories });
        }

        // Send final response
        res.json({ banners, incompleteQuizz, response: categoriesWithSubcategories });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


