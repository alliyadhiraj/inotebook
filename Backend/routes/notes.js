const express = require('express');
const Router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Route 1: Get all the notes using : GET "/api/auth/getuser". Login required
Router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }


});

// Route 2: Add a new note using:Post "/api/auth/addnote". Login required
Router.post('/addnote', fetchuser, [
    body('title', "Enter valid title").isLength({ min: 3 }),
    body('description', "Description must be atleast 5 character").isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // if there are errors, return bad request and the errors 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }
});

// Route 3: update an exesting Note using:Put "/api/auth/updatenote". Login required

Router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        // crete a newnote object
        const newNote = {}
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }

});

// Route 4: delete an exesting Note using:Delete "/api/notes/deletenote". Login required

Router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        // Allow deletion only if user owns this Note 
        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });



    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal server error");
    }

});
module.exports = Router