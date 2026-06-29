require('dotenv').config();
const mongoose = require('mongoose');
const Class = require('./models/Class');
const connectDB = require('./config/db');

connectDB();

const importData = async () => {
    try {
        await Class.deleteMany();

        const classLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
        
        let classesToInsert = [];
        
        // Semantic: we loop semesters first, but Class names should be distinct, or it's Sem 1 Class A and Sem 2 Class A?
        // Usually, a class name is unique in DB if we enforced `unique: true` in schema.
        // Let's make the name unique like 'Class A - Semester 1' or simply change the schema to not strict unique on name.
        // Wait, schema has `name: { type: String, required: true, unique: true }`. So it must be globally unique.
        
        [1, 2].forEach(semester => {
            classLetters.forEach((letter, index) => {
                classesToInsert.push({
                    name: `Class ${letter} - Sem ${semester}`,
                    capacity: 60,
                    enrolledCount: 0,
                    semester: semester,
                    order: index + 1 // 1 to 18
                });
            });
        });

        await Class.insertMany(classesToInsert);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
