const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://www.teenvogue.com/story/20-questions-ask-best-friend-become-closer-relationships";
let questions = [];

axios.get(url)
    .then(response => {
        const extract = cheerio.load(response.data);
        const title = extract("title").text();
        const paragraphs = extract("p").map((i, el) => extract(el).text()).get();
        paragraphs.forEach(str => {
            if (str[str.length - 1] == "?") {
                let index = 0;
                while (str[index] != " ") { ++index; }
                questions.push(str.substring(index));
            }
        })
        for (let i = 0; i < questions.length; ++i) {
            console.log(questions[i]);
        }
    })
    .catch(error => {
        console.error("Error fetching the page:", error);
    });

exports.questionList = questions;