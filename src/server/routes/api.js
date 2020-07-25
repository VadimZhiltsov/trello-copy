import { Router } from "express";
import { ObjectId } from 'mongodb'

const api = db => {
  const router = Router();
  const boards = db.collection("boards");

  // Replace the entire board every time the users modifies it in any way.
  // This solution sends more data than necessary, but cuts down on code and
  // effectively prevents the db and client from ever getting out of sync
  router.put("/board", (req, res) => {
    const board = req.body;
    const id = board._id

    delete board._id
    boards
      .replaceOne(
        { 
          _id: new ObjectId(id), 
          //users: req.user._id 
        },
        board, 
        {
          upsert: true
        }
      )
      .then(result => {
        res.send(result);
      }).catch((e) => {
        console.error(e)
      });
  });

  router.delete("/board", (req, res) => {
    const { boardId } = req.body;
    boards.deleteOne({ _id: boardId }).then(result => {
      res.send(result);
    });
  });

  return router;
};

export default api;
