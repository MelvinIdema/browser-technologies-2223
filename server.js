import express from 'express';
import {engine} from 'express-handlebars';
import path from 'path';
import {body, validationResult} from "express-validator";

const port = process.env.PORT || 3000;

const app = express();

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: false,
    helpers: {
        replace: (str, find, replace) => str.replaceAll(find, replace),
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'))

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    const {studentNumber, studentName} = req.query;

    const courses = [
        {
            courseName: 'Web App from Scratch',
            teacherName: 'Robert & Joost',
            courseWeeks: 'Week 1 t/m Week 3'
        },
        {
            courseName: 'CSS to the Rescue',
            teacherName: 'Sanne & Vasilis',
            courseWeeks: 'Week 1 t/m Week 3'
        },
        {
            courseName: 'Progressive Web Apps',
            teacherName: 'Janno & Declan',
            courseWeeks: 'Week 5 t/m Week 8'
        },
        {
            courseName: 'Browser Technologies',
            teacherName: 'Vasilis & Peter-Paul',
            courseWeeks: 'Week 5 t/m Week 8"'
        },
        {
            courseName: 'Real-Time Web',
            teacherName: 'Joost & Koop',
            courseWeeks: 'Week 10 t/m Week 13'
        },
        {
            courseName: 'Human-Centered Design',
            teacherName: 'Koop & Vasilis',
            courseWeeks: 'Week 10 t/m Week 13'
        }
    ]

    res.render('index', {studentNumber, studentName, courses});
});

app.post('/',
    body('student_name')
        .isLength({min: 2})
        .withMessage('Please enter a valid name')
        .escape(),
    body('student_number')
        .isNumeric()
        .withMessage('Please enter a valid student number')
        .isLength({min: 9, max: 79})
        .withMessage('Please enter a valid student number')
        .escape(),
    body('course_name')
        .notEmpty()
        .withMessage('Please enter all course names'),
    body('teacher_name')
        .notEmpty()
        .withMessage('Please enter all teacher names')
        .isLength({min: 2})
        .withMessage('Please enter a valid teacher name'),
    body('course_weeks')
        .notEmpty()
        .withMessage('Please enter all course weeks'),
    body('rating_lesstof')
        .notEmpty()
        .withMessage('Please enter all ratings for the lesson'),
    body('rating_uitleg')
        .notEmpty()
        .withMessage('Please enter all ratings for the explanation'),
    body('rating_eigen_inzicht')
        .notEmpty()
        .withMessage('Please enter all ratings for your own insight'),
    (req, res) => {
        const {student_name: studentName, student_number: studentNumber, course_name: course_names, ...rest} = req.body;
        console.log(req.body)

        const courses = course_names.map((courseName, index) => ({
            courseName: courseName,
            teacherName: rest.teacher_name[index],
            courseWeeks: rest.course_weeks[index],
            ratingLesstof: rest.rating_lesstof[index],
            ratingUitleg: rest.rating_uitleg[index],
            ratingEigenInzicht: rest.rating_eigen_inzicht[index]
        }));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('index', {studentName, studentNumber, courses, errors: errors.array()});
        }

        res.render('overview', {studentName, studentNumber, courses});
    });

app.listen(port, () => {
    console.log('Server listening on port 3000');
});