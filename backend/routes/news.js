const express = require('express');
const router = express.Router();

module.exports = () => {
    router.get('/', (req, res) => {
        const olympicNews = [
            { 
                id: 1, 
                title: "Alpine Skiing: Qualification Starts", 
                url: "https://olympics.com/en/sports/alpine-skiing", 
                category: "Alpine", 
                image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600" 
            },
            { 
                id: 2, 
                title: "Ice Hockey: Tournament Groups", 
                url: "https://olympics.com/en/sports/ice-hockey/", 
                category: "Hockey", 
                image: "/images/picture3.jpg" 
            },
            { 
                id: 3, 
                title: "Figure Skating Performance Hub", 
                url: "https://olympics.com/en/news/figure-skating", 
                category: "Skating", 
                image: "/images/picture2.jpg" 
            },
            { 
                id: 4, 
                title: "Snowboarding: Global Competitions", 
                url: "https://www.olympics.com/en/sports/snowboard/", 
                category: "Snowboard", 
                image: "https://images.unsplash.com/photo-1522056615691-da7b8106c665?auto=format&fit=crop&w=600&q=80" 
            },
            { 
                id: 5, 
                title: "Ski Jumping: Road to Milano Cortina", 
                url: "https://olympics.com/en/sports/ski-jumping/", 
                category: "Ski Jumping", 
                image: "/images/picture1.jpg" 
            },
            { 
                id: 6, 
                title: "Milano Cortina 2026: Official Venues", 
                url: "https://milanocortina2026.olympics.com/en/news/", 
                category: "Official Hub", 
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" 
            }
        ];
        res.json(olympicNews);
    });
    return router;
};