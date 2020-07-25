import { normalize, schema } from "normalizr";
import createWelcomeBoard from "./createWelcomeBoard";
import { ObjectId } from 'mongodb'

// Boards are stored in a tree structure inside mongoDB.
// This function takes the tree shaped boards and returns a flat structure more suitable to a redux store.
const normalizeBoards = boards => {
  const card = new schema.Entity("cardsById", {}, { idAttribute: "_id" });
  const list = new schema.Entity(
    "listsById",
    { cards: [card] },
    { idAttribute: "_id" }
  );
  const board = new schema.Entity(
    "boardsById",
    { lists: [list] },
    { idAttribute: "_id" }
  );
  const { entities } = normalize(boards, [board]);
  return entities;
};

function getUserBoards(db, userId) {
  const boards = db.collection("boards");
  
  return boards
    .find({ 
      $or: [
        { 
          users: {
            $elemMatch: {
              $eq: userId
            }
          }
        }, 
        { isPublic: true }
      ] 
    })
    .toArray()
}

function getUsersList(db) {
  const users = db.collection('users')
  
  return users.find({})
    .toArray()
    .then(userList => {

      console.log('userList', userList)
      return userList.map(user => ({ username: user.username, _id: user._id }))
    }) 
}

// Fetch board data and append to req object as intialState which will be put inside redux store on the client
const fetchBoardData = db => (req, res, next) => {
  // Fetch a user's private boards from db if a user is logged in
  if (req.user) {
      Promise.all([
        getUserBoards(db, req.user.userId.toString()),
        getUsersList(db)
      ])
      .then(([boards, users]) => {
        req.initialState = { 
          ...normalizeBoards(boards), 
          users: users,
          user: req.user 
        };
        console.log('req.initialState >>>')
        console.dir(req.initialState, {depth: null})
        next();
      }).catch((e) => {
        console.error(e)
      });
    // Just create the welcome board if no user is logged in
  } else {
    req.initialState = normalizeBoards([createWelcomeBoard()]);
    next();
  }
};

export default fetchBoardData;
