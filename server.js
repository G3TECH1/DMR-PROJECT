const express = require("express")
const ejs = require("ejs")
const mongoose = require("mongoose")
const mail = require("nodemailer")
const session = require("express-session")
const flash = require("connect-flash")



const app = express()
app.use(express.static("public"))
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge : 60000}
}))
app.use(flash())
app.use(express.urlencoded({extended:true}))


const mailTrain = mail.createTransport({
        service: "gmail",
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })

const connectionString = process.env.MONGO_URI;

mongoose.connect(connectionString )
try{
    console.log("DB connected")
}catch(error){
    console.error(error.message)
}

let DMROrderSchema = mongoose.Schema({
    Person: String,
    PHN: Number,
    Product: String,
    OrderLevel: String,
    Quantity: String,
    ModeOfPayment: String,
    Email: String,
    OrderDate: String,
    Location: String
})

let DMRMessageSchema = mongoose.Schema({
    Name: String,
    Email: String,
    Date: String,
    Message: String
})


const DMROrderModel = mongoose.model("Order", DMROrderSchema)
const DMRMessageModel = mongoose.model("Emails", DMRMessageSchema)


app.get("/", (req, res)=>{
    res.render("index.ejs")
})

app.get("/about", (req,res)=>{
    res.render("about.ejs")
})

app.get("/order", (req,res)=>{
    let successMessage = req.flash("success")
    let errorMessage = req.flash("error")
    res.render("order.ejs", {err: errorMessage, success:successMessage})
})
app.post("/order", async(req, res)=>{
    const time = new Date()
    const orderdate = time.toLocaleString()
    const{products, priority, quantity, locat, pay, person, phone, email} = req.body
    const fields = [products, priority, quantity, locat, pay, person, phone, email]
    try{
        
        if (![products, priority, quantity, locat, pay, person, phone, email].every(fields => fields && String(fields).trim())){
            req.flash("error", "Fill the form complete")
        }else{
            let newOrder = new DMROrderModel({
                    Person: person,
                    PHN: phone,
                    Product: products,
                    OrderLevel: priority,
                    Quantity: quantity,
                    ModeOfPayment: pay,
                    Email: email,
                    OrderDate: orderdate,
                    Location: locat
            })
            req.flash("success", "Order has been sent")
            await newOrder.save()

            const orderMessage = {
                from: email,
                to: "goodnessmyfolio@gmail.com",
                subject: 'New Order Placed importance '+ priority,
                text: `
                    Product : ${products}
                    Order Level Status: ${priority}
                    Quantity: ${quantity}
                    Mode of Payment: ${pay}
                    Person: ${person}
                    Delivery Address: ${locat}
                    Phone Number: ${phone}
                    Email: ${email}
                ` 
            }
            const orderMessageToClient = {
                from: email,
                to: newOrder.Email,
                subject: 'New Order Placed importance '+ priority,
                text: `
                    Product : ${products}
                    Order Level Status: ${priority}
                    Quantity: ${quantity}
                    Mode of Payment: ${pay}
                    Person: ${person}
                    Delivery Address: ${locat}
                    Phone Number: ${phone}
                    Email: ${email}
                ` 
            }
            mailTrain.sendMail(orderMessage, (error, info)=>{
                    if(error){
                    console.error(error.message)
                    }else{
                    console.log("Email Sent: "+ info.response)
                }
            })
            mailTrain.sendMail(orderMessageToClient, (error, info)=>{
                    if(error){
                    console.error(error.message)
                    }else{
                    console.log("Email Sent: "+ info.response)
                }
            })
        }
        res.redirect("/order")
    }catch(error){
        console.error(error.message)
    }
})


app.get("/contact", (req,res)=>{
    let successMessage = req.flash("success")
    let errorMessage = req.flash("error")
    res.render("contact.ejs", {err: errorMessage, success:successMessage})
})
app.post("/contact", async(req,res)=>{
    const {name, email, msg} = req.body
    let time = new Date()
    const date = time.toLocaleString()

    try{
        if (![name, email, msg].every(fields => fields && String(fields).trim())){
            req.flash("error", "Fill the name field, email field and message field. !!!Compulsory")
        }else{
            let newMail = new DMRMessageModel({
                Name: name,
                Email: email,
                Date: date,
                Message: msg
            })
            await newMail.save()

            const mailOptions = {
                from: newMail.Email+ ' goodnessmyfolio@gmail.com',
                to: "goodnessmyfolio@gmail.com",
                subject: `New contact from ${name}`,
                text: `You have received a new message from ${name} (${email}):\n\n${newMail.Message}`,
            };

            // Automated reply to user
             const replyOptions = {
                from: '"DIESEL MOBILE REFILL" goodnessmyfolio@gmail.com',
                to: email,
                subject: "Thank you for contacting us",
                text: `Hi ${name},\n\nThank you for reaching out. We have received your message and will get back to you shortly.\n\nBest regards,\nDIESEL MOBILE REFILL`
                
            }
            mailTrain.sendMail(replyOptions, (error, info)=>{
                    if(error){
                    console.error(error.message)
                    req.flash("error", "Failed to send confirmation email to you.");
                    return res.redirect("/contact");
                    }else{
                    console.log("Email Sent: "+ info.response)
                }
            })
            mailTrain.sendMail(mailOptions, (error, info)=>{
                    if(error){
                    console.error(error.message)
                    req.flash("error", "Failed to send your message email.");
                    return res.redirect("/contact");
                    }else{
                    console.log("Email Sent: "+ info.response)
                }
            })
            req.flash("success", "Mail sent")
            res.redirect("/contact")
        }
    }catch(error){
        console.error(error.message)
        req.flash("error", "Mail Error 0045: Mail Not sent")
    }
})
app.get("/mission", (req,res)=>{
    res.render("mission.ejs")
})











const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("Server is running")
})


