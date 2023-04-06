const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

const date = require(__dirname+"/date.js");

mongoose.connect("mongodb+srv://admin-rishuy007:Database-321@cluster0.oq9q5ea.mongodb.net/todolistDB", {useNewUrlParser:true});

const itemsSchema =  mongoose.Schema({
    name:String
});
const routineSchema = mongoose.Schema({
    name:String
});
const listSchema = mongoose.Schema({
    name:String,
    listItem:[itemsSchema]
});

const Routine = mongoose.model("Routine" , routineSchema);
const Item = mongoose.model("Item" , itemsSchema);

const routine1 = new Routine({
    task:String
});

const List = mongoose.model("List" , listSchema);

const item1 = new Item({
    name:"welcome to todolist v1"
});

const item2 = new Item({
    name:"input your todo"
});

const item3 = new Item({
    name:"add it"
});

const defaultItems = [item1 , item2 , item3];   






app.set('view engine' , 'ejs' );
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public")); 

app.get("/" , async function(req , res){
    
  const day = date.getDate();
   await Item.find({})
    .then(function(foundItem){

        if(foundItem.length===0)
        {
            Item.insertMany(defaultItems)
            .then(function(){
                console.log("successfully");
            })
            .catch (function(err){
                console.log(err);
            });
            res.redirect("/");
        }
        else{

            res.render('list' , {NewList:day , newItem:foundItem });
        }
    });
    
});


app.get("/:customListName" , function(req , res){
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name:customListName}).then(function(foundList){
        
            if(!foundList)
            {
                const list = new List({
                    name:customListName,
                    listItem:defaultItems
                });
     
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                res.render("list" , {NewList:foundList.name , newItem:foundList.listItem})
            }
        
    });
    
});






app.post("/" , function(req , res){
    const itemName = req.body.getItem;
    const listName = req.body.list;
    const day = date.getDate();

        const item = new Item({
            name:itemName
        })

        if(listName === day)
        {
            item.save();
            res.redirect("/");
        }
        else
        {
            List.findOne({name:listName})
            .then(function(foundList){
                 
                if(foundList)
                {
                    foundList.listItem.push(item);
                    foundList.save();
                    res.redirect("/"+listName);
                }
                else{
                    res.redirect("/"+listName);
                }
                    

                
            });
        }
    
});


app.post("/delete" ,  function(req , res){
   const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    const day = date.getDate();
    if(listName===day)
    {
        Item.findByIdAndRemove(checkedItem)
         .then ( function (){
        console.log("hurray!!")
         res.redirect("/");
        })
        
    }
    else{
       List.findOneAndUpdate({name:listName} , {$pull : {listItem:{_id:checkedItem}}}) 
       .then(function(){
        
            res.redirect("/"+listName);
       
       })
    }
});




app.listen(3000 , function(){
    console.log("server started at port 3000");
})