const express = require("express")
const bodyParser=require("body-parser")
//const date=require(__dirname+"/date.js")
//node.js connect to MongoDB 
const mongoose=require("mongoose");
const _=require("lodash");

let app = express()
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))



// connect to url, database, if database（todolistDB) doesn't exist, it will create one.
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false

});

//schema for items
const itemSchema=new mongoose.Schema({
    name:String
});
const listSchema= new mongoose.Schema({
    name:String,
    itemlist:[itemSchema]
});
//create model
const Item = mongoose.model("Item",itemSchema);
const List=mongoose.model("List",listSchema);

//create default items
const buy=new Item({
    name:"Buy Food"
});
const cook =new Item({
    name:"Cook Food"
});
const eat=new Item({
    name:"Eat Food"
});
const defaultItems=[buy,cook,eat];
// Item.insertMany([buy,cook,eat],(err)=>{
//     if (err){
//         console.log(err);
//     }else{
//         console.log("Successfully saved all the items to todoListDB");
//     }
// });





app.get ("/",(req,res)=>{
    //let day=date.getDate()
//render views/todolist.ejs 
//passing values in a dictionary to todolist.ejs , key:value   variable in html: variable in js 

    Item.find({},(err,items)=>{
        if(err){
            console.log(err);
        }else{
            res.render('todolist',{listTitle:"Today",newItems:items})     

        }
    });

});

app.post("/",(req,res)=>{
    //console.log(req.body)
    const listName=req.body.list;
    let itemName=req.body.newItem
   
    if (itemName.length>0){
        const newItem= new Item({
            name:itemName
        });
        if (listName=="Today"){
        newItem.save();
        res.redirect("/");
        }else{
            List.findOne({name:listName}, (err, foundList)=>{
                foundList.itemlist.push(newItem);
                foundList.save();
                res.redirect("/"+listName);
            });   
        }
    }

});
app.post("/delete",(req,res)=>{
    const listName=req.body.title;
    const checkedItem=req.body.checkbox;
    if (listName==="Today"){
        Item.deleteOne({_id:checkedItem},(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("Successfully deleted one document !")
            }
    
            res.redirect("/");
        });
    }else{
        List.findOneAndUpdate(
            {name:listName},
            {$pull:{itemlist:{_id:checkedItem}}},
            (err,results)=>{
                if (!err){
                    res.redirect("/"+listName);
                }
            }
        )

    }

    
});

 

app.get("/:listName",(req,res)=>{

    const listName=_.capitalize(req.params.listName);

    List.findOne({name:listName},(err,result)=>{
        if (result){
           
            res.render('todolist',{listTitle:listName,newItems:result.itemlist})
        }else{  
            const list=new List({
            name:listName,
            itemlist:defaultItems
            });
            list.save();
            res.render('todolist',{listTitle:listName,newItems:list.itemlist})
        }
    });
});





app.get("/about",(req,res)=>{
    res.render('about');
});


app.listen(3000, (req,res)=>{
    console.log("listen on http://localhost:3000");
});