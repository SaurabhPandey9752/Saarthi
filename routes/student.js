// Imports
const express = require("express"); // To create router
const mysql = require("mysql2"); // To connect to the DB
const auth = require("../middleware/auth"); // Middleware
const readXlsxFile = require('read-excel-file/node');
const { check, validationResult } = require("express-validator"); // To check and validate the inputs

// Init router
const router = express.Router();

// Create the pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "student_counselling",
});

// Get a Promise wrapped instance of that pool
const promisePool = pool.promise();

// Endpoints
/**
 * Get all questions and answersw without responses
 * Get all approved counsellors
 * Submit quiz
 */

// @route   GET api/student/quesans
// @desc    Get all questions and answers without responses
// @access  Private
router.get("/quesans", auth, async(req, res) => {
    // Extract user id from req
    const user_id = req.user_id;

    try {
        // Get role of the user from DB
        const [rows] = await promisePool.query(
            `SELECT role from logins WHERE user_id='${user_id}'`
        );

        // Extract role from rows
        const { role } = rows[0];

        // Check if the user is counsellor
        if (role === "student") {
            // Get all questions from the DB
            const [ques] = await promisePool.query(
                `SELECT * from questions`
            );

            // Get all answers from the DB
            const [ans] = await promisePool.query(
                `SELECT ans_id, ques_id, ans_no, ans_desc from answers`
            );

            // Init array to be sent to the client
            let quesAns = [];

            // Element of quesAns
            let quesItem = {
                ques_id: null,
                ques_desc: null,
                ques_no: null,
                answers: []
            };

            // Element of quesItem
            let ansItem = {
                ans_id: null,
                ans_no: null,
                ans_desc: null,
            };

            // Loop through all the questions
            for (let i = 0; i < ques.length; i++) {
                // Store question details in quesItem
                quesItem = {
                    ques_id: ques[i].ques_id,
                    ques_desc: ques[i].ques_desc,
                    ques_no: ques[i].ques_no,
                    answers: []
                };

                // Loop through all the answers
                for (let j = 0; j < ans.length; j++) {
                    // Add answer of this question to ansItem
                    if (ans[j].ques_id === ques[i].ques_id) {
                        ansItem = {
                            ans_id: ans[j].ans_id,
                            ans_no: ans[j].ans_no,
                            ans_desc: ans[j].ans_desc,
                        };

                        // Append ansItem to quesItem.answers
                        quesItem.answers.push(ansItem);
                    }
                }

                // Append quesItem to quesAns
                quesAns.push(quesItem);
            }

            // Send data to the client
            res.send(quesAns);
        } else {
            // Unauthorized
            res.status(401).json({ msg: "Only students can access this portal" });
        }
    } catch (err) {
        // Catch errors
        throw err;
    }
});

// @route   GET api/student/counsellors
// @desc    Get all approved counsellors
// @access  Private
router.get("/counsellors", auth, async(req, res) => {
    // Extract user id from req
    const user_id = req.user_id;

    try {
        // Get role of the user from DB
        const [rows] = await promisePool.query(
            `SELECT role from logins WHERE user_id='${user_id}'`
        );

        // Extract role from rows
        const { role } = rows[0];

        // Check if the user is student
        if (role === "student") {
            // Get counsellors with coun_status=Approved from the DB
            const [rows] = await promisePool.query(
                `SELECT coun_id, coun_name, coun_gender, coun_phone, coun_dept from counsellors WHERE coun_status="Approved"`
            );

            // Send data to the client
            res.json(rows);
        } else {
            // Unauthorized
            res.status(401).json({ msg: "Only students can access this portal" });
        }
    } catch (err) {
        // Catch errors
        throw err;
    }
});

// @route   POST api/student/submitQuiz
// @desc    Submit quiz
// @access  Public
router.post(
    "/submitQuiz", [auth,
        check("quesAns", "Question answer is required").exists(), // Check quesAns
    ],
    async(req, res) => {
        // Extract user id from req
        const user_id = req.user_id;

        try {
            // Get role of the user from DB
            const [rows] = await promisePool.query(
                `SELECT role from logins WHERE user_id='${user_id}'`
            );

            // Extract role from rows
            const { role } = rows[0];

            // Check if the user is student
            if (role === "student") {
                const quesAns = req.body.quesAns;
                const stud_id = req.body.stud_id;
                const res_date = req.body.date.toString();

                await promisePool.query(
                    `INSERT INTO response (stud_id, res_date) VALUES (${stud_id}, "${res_date}")`
                );

                const [resp] = await promisePool.query(
                    `SELECT res_id FROM response WHERE res_date="${res_date}"`
                );
                res_id = resp[0].res_id;

                for (var ques in quesAns) {
                    await promisePool.query(
                        `INSERT INTO response_list (res_id, ques_id, ans_id) VALUES (${res_id}, ${parseInt( ques )}, ${quesAns[ques]})`
                    );
                }

                res.send("Submitted Successfully");
            } else {
                // Unauthorized
                res.status(401).json({ msg: "Only students can access this portal" });
            }
        } catch (err) {
            // Catch errors
            throw err;
        }
    }
);

// @route   POST api/student/submitFeed
// @desc    Submit feedback for students
// @access  Private
router.post(
    "/submitFeed", auth,
    async(req, res) => {
        // Extract user id from req
        const user_id = req.user_id;

        try {
            // Get role of the user from DB
            const [rows] = await promisePool.query(
                `SELECT role from logins WHERE user_id='${user_id}'`
            );

            // Extract role from rows
            const { role } = rows[0];

            // Check if the user is counsellor
            if (role === "student") {
                // Insert feedback in DB
                await promisePool.query(
                    `INSERT INTO stud_feedback (stud_id, feed_desc) VALUES (${user_id}, "${req.body.desc}")`
                );

                // Send data to the client
                res.send("Submitted Successfully");
            } else {
                // Unauthorized
                res.status(401).json({ msg: "Only students can access this portal" });
            }
        } catch (err) {
            // Catch errors
            throw err;
        }
    }
);

module.exports = router;